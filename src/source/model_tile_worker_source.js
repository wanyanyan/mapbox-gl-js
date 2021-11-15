// @flow

import type Actor from "../util/actor.js";
import type {
    WorkerModelTileParameters,
    WorkerModelTileCallback,
} from "./worker_source.js";
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'

class ModelTileWorkerSource {
    actor: Actor;
    offscreenCanvas: OffscreenCanvas;
    offscreenCanvasContext: CanvasRenderingContext2D;

    loadTile(params: WorkerModelTileParameters, callback: WorkerModelTileCallback) {
        const { uid, rawData } = params;
        // Main thread will transfer ImageBitmap if offscreen decode with OffscreenCanvas is supported, else it will transfer an already decoded image.
        new GLTFLoader().parse(rawData, "", (gltf) => {
            callback(null, gltf.scene);
        });
    }
}

export default ModelTileWorkerSource;
