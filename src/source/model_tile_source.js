// @flow

import { getArrayBuffer, ResourceType } from "../util/ajax.js";
import {extend, prevPowerOfTwo} from '../util/util.js';
import {Evented} from '../util/evented.js';
import {OverscaledTileID} from './tile_id.js';
import RasterTileSource from './raster_tile_source.js';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import type {Source} from './source.js';
import type Dispatcher from '../util/dispatcher.js';
import type Tile from './tile.js';
import type {Callback} from '../types/callback.js';
import type {ModelSourceSpecification} from '../style-spec/types.js';

class ModelTileSource extends RasterTileSource implements Source {
    encoding: "mapbox" | "terrarium";

    constructor(id: string, options: ModelSourceSpecification, dispatcher: Dispatcher, eventedParent: Evented) {
        super(id, options, dispatcher, eventedParent);
        this.type = 'model';
        this.maxzoom = 22;
        this._options = extend({type: 'model'}, options);
    }

    loadTile(tile: Tile, callback: Callback<void>) {
        let url = this.map._requestManager.normalizeTileURL(tile.tileID.canonical.url(this.tiles, this.scheme), false, this.tileSize);
        url = this.map._requestManager.transformRequest(url, ResourceType.Tile);
        tile.request = getArrayBuffer(url, modelLoaded.bind(this));

        function modelLoaded(err, data, cacheControl, expires) {
            delete tile.request;
            if (tile.aborted) {
                tile.state = 'unloaded';
                callback(null);
            } else if (err) {
                tile.state = 'errored';
                callback(err);
            } else if (data) {
                if (this.map._refreshExpiredTiles) tile.setExpiryData({cacheControl, expires});
                const params = {
                    uid: tile.uid,
                    coord: tile.tileID,
                    source: this.id,
                    rawData: data
                };

                new GLTFLoader().parse(data, "", (gltf) => {
                    done(null, gltf.scene);
                });
            }
        }

        function done(err, model) {
            if (err) {
                tile.state = 'errored';
                callback(err);
            }

            if (model) {
                tile.model = model;
                tile.state = "loaded";
                callback(null);
            }
        }
    }

    _getNeighboringTiles(tileID: OverscaledTileID) {
        const canonical = tileID.canonical;
        const dim = Math.pow(2, canonical.z);

        const px = (canonical.x - 1 + dim) % dim;
        const pxw = canonical.x === 0 ? tileID.wrap - 1 : tileID.wrap;
        const nx = (canonical.x + 1 + dim) % dim;
        const nxw = canonical.x + 1 === dim ? tileID.wrap + 1 : tileID.wrap;

        const neighboringTiles = {};
        // add adjacent tiles
        neighboringTiles[new OverscaledTileID(tileID.overscaledZ, pxw, canonical.z, px, canonical.y).key] = {backfilled: false};
        neighboringTiles[new OverscaledTileID(tileID.overscaledZ, nxw, canonical.z, nx, canonical.y).key] = {backfilled: false};

        // Add upper neighboringTiles
        if (canonical.y > 0) {
            neighboringTiles[new OverscaledTileID(tileID.overscaledZ, pxw, canonical.z, px, canonical.y - 1).key] = {backfilled: false};
            neighboringTiles[new OverscaledTileID(tileID.overscaledZ, tileID.wrap, canonical.z, canonical.x, canonical.y - 1).key] = {backfilled: false};
            neighboringTiles[new OverscaledTileID(tileID.overscaledZ, nxw, canonical.z, nx, canonical.y - 1).key] = {backfilled: false};
        }
        // Add lower neighboringTiles
        if (canonical.y + 1 < dim) {
            neighboringTiles[new OverscaledTileID(tileID.overscaledZ, pxw, canonical.z, px, canonical.y + 1).key] = {backfilled: false};
            neighboringTiles[new OverscaledTileID(tileID.overscaledZ, tileID.wrap, canonical.z, canonical.x, canonical.y + 1).key] = {backfilled: false};
            neighboringTiles[new OverscaledTileID(tileID.overscaledZ, nxw, canonical.z, nx, canonical.y + 1).key] = {backfilled: false};
        }

        return neighboringTiles;
    }

    unloadTile(tile: Tile) {
        if (tile.demTexture) this.map.painter.saveTileTexture(tile.demTexture);
        if (tile.fbo) {
            tile.fbo.destroy();
            delete tile.fbo;
        }
        if (tile.model) delete tile.model;
        delete tile.neighboringTiles;

        tile.state = 'unloaded';
    }

}

export default ModelTileSource;
