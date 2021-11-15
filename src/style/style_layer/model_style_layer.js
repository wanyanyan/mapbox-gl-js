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
        const origin = [113.457765, 34.146185];
        let _altitude = 0;
        let _rotation = [0, 0, 0];
        let _scale = 3.046118656067796e-8;
        let coord = MercatorCoordinate.fromLngLat(origin, _altitude);
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
        const gl = map.painter.context.gl;
        this.camera = new THREE.Camera();
        this.scene = new THREE.Scene();
        window.scene = this.scene;

        var directionalLight = new THREE.DirectionalLight(0xffffff);
        directionalLight.position.set(0, -70, 100).normalize();
        this.scene.add(directionalLight);

        var directionalLight2 = new THREE.DirectionalLight(0xffffff);
        directionalLight2.position.set(0, 70, 100).normalize();
        this.scene.add(directionalLight2);
        this.map = map;

        this.renderer = new THREE.WebGLRenderer({
            canvas: map.getCanvas(),
            context: gl,
        });
        this.renderer.autoClear = false;
    }

    onRemove(map: Map) {
        console.log("onRemove");
    }

    updateModels(coveredModels) {
        this.scene.children.forEach(item => {
            if (!item.isGroup) {
                return
            }
            let isInCoveredModels = coveredModels.findIndex(d => d.uuid === item.uuid)
            if (isInCoveredModels >= 0) {
                coveredModels.splice(isInCoveredModels, 1)
            } else {
                item.removeFromParent();
            }
        })
        coveredModels.forEach(item => {
            this.scene.add(item)
        })
    }

    render(gl, matrix) {
        var rotationX = new THREE.Matrix4().makeRotationAxis(
            new THREE.Vector3(1, 0, 0),
            this.transform.rotateX
        );
        var rotationY = new THREE.Matrix4().makeRotationAxis(
            new THREE.Vector3(0, 1, 0),
            this.transform.rotateY
        );
        var rotationZ = new THREE.Matrix4().makeRotationAxis(
            new THREE.Vector3(0, 0, 1),
            this.transform.rotateZ
        );

        var m = new THREE.Matrix4().fromArray(matrix);
        var l = new THREE.Matrix4()
            .makeTranslation(
                this.transform.translateX,
                this.transform.translateY,
                this.transform.translateZ
            )
            .scale(
                new THREE.Vector3(
                    this.transform.scale,
                    -this.transform.scale,
                    this.transform.scale
                )
            )
            .multiply(rotationX)
            .multiply(rotationY)
            .multiply(rotationZ);

        this.camera.projectionMatrix.elements = matrix;
        this.camera.projectionMatrix = m.multiply(l);
        this.renderer.state.reset();
        this.renderer.render(this.scene, this.camera);
    }
}

export default ModelStyleLayer;
