// @flow

import StyleLayer from '../style_layer.js';

import properties from './model_style_layer_properties.js';
import {Transitionable, Transitioning, PossiblyEvaluated} from '../properties.js';
import MercatorCoordinate from '../../geo/mercator_coordinate.js'
import * as THREE from 'three'

import type {PaintProps} from './model_style_layer_properties.js';
import type {LayerSpecification} from '../../style-spec/types.js';

class ModelStyleLayer extends StyleLayer {
    _transitionablePaint: Transitionable<PaintProps>;
    _transitioningPaint: Transitioning<PaintProps>;
    paint: PossiblyEvaluated<PaintProps>;

    constructor(layer: LayerSpecification) {
        super(layer, properties);
        const origin = [ 113.45896844942067, 34.146198405934076 ];
        let _altitude = 0;
        let _rotation = [0, 0, 0];
        let coord = MercatorCoordinate.fromLngLat(origin, _altitude);
        let _scale = coord.meterInMercatorCoordinateUnits();
        this.transform = {
            translateX: coord.x,
            translateY: coord.y,
            translateZ: coord.z,
            rotateX: _rotation[0],
            rotateY: _rotation[1],
            rotateZ: _rotation[2],
            scale: _scale,
        };
    }

    is3D() {
        return true;
    }

    hasOffscreenPass() {
        return this.prerender !== undefined;
    }

    recalculate() {}
    updateTransitions() {}
    hasTransition() {}

    onAdd(map: Map) {
        this.map = map
    }

    onRemove(map: Map) {
        console.log("onRemove");
    }

    updateModels(coveredModels) {
        let scene = this.map._scene3
        scene.children.forEach(item => {
            if (!item.isGroup) {
                return
            }
            let isInCoveredModels = coveredModels.findIndex(d => d.uuid === item.uuid)
            if (isInCoveredModels >= 0) {
                coveredModels.splice(isInCoveredModels, 1)
            } else {
                this._removeObject(item)
            }
        })
        coveredModels.forEach(item => {
            scene.add(item)
        })
    }

    _track(resource) {
        if (!resource) {
            return resource;
        }
        // handle children and when material is an array of materials or
        // uniform is array of textures
        if (Array.isArray(resource)) {
            resource.forEach(item => this._track(item));
            return resource;
        }
 
        if (resource.dispose || resource instanceof THREE.Object3D) {
            this.resources.add(resource);
        }
        if (resource instanceof THREE.Object3D) {
            this._track(resource.geometry);
            this._track(resource.material);
            this._track(resource.children);
        } else if (resource instanceof THREE.Material) {
            // We have to check if there are any textures on the material
            for (const value of Object.values(resource)) {
                if (value instanceof THREE.Texture) {
                    this._track(value);
                }
            }
            // We also have to check if any uniforms reference textures or arrays of textures
            if (resource.uniforms) {
                for (const value of Object.values(resource.uniforms)) {
                    if (value) {
                        const uniformValue = value.value;
                        if (uniformValue instanceof THREE.Texture ||
                            Array.isArray(uniformValue)) {
                            this._track(uniformValue);
                        }
                    }
                }
            }
        }
        
    }

    _removeObject(item) {
        this.resources = new Set();
        this._track(item)
        for (const resource of this.resources) {
            if (resource instanceof THREE.Object3D) {
                if (resource.parent) {
                    resource.parent.remove(resource);
                }
            }
            if (resource.dispose) {
                resource.dispose();
            }
        }
        this.resources.clear();
    }

    render(gl, matrix) {
        let renderer = this.map._renderer3
        let scene = this.map._scene3
        let camera = this.map._camera3
        var rotationX = new THREE.Matrix4().makeRotationAxis( new THREE.Vector3(1, 0, 0), this.transform.rotateX );
        var rotationY = new THREE.Matrix4().makeRotationAxis( new THREE.Vector3(0, 1, 0), this.transform.rotateY );
        var rotationZ = new THREE.Matrix4().makeRotationAxis( new THREE.Vector3(0, 0, 1), this.transform.rotateZ );

        var m = new THREE.Matrix4().fromArray(matrix);
        var l = new THREE.Matrix4()
            .makeTranslation(this.transform.translateX, this.transform.translateY, this.transform.translateZ)
            .scale(new THREE.Vector3( this.transform.scale, -this.transform.scale, this.transform.scale))
            .multiply(rotationX)
            .multiply(rotationY)
            .multiply(rotationZ);
        camera.projectionMatrix.elements = matrix;
        camera.projectionMatrix = m.multiply(l);
        
        renderer.state.reset();
        renderer.render(scene, camera);
    }
}

export default ModelStyleLayer;
