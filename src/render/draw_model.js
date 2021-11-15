// @flow

export default drawModel;

import DepthMode from "../gl/depth_mode.js";
import StencilMode from "../gl/stencil_mode.js";

import type Painter from "./painter.js";
import type SourceCache from "../source/source_cache.js";
import type ModelStyleLayer from "../style/style_layer/model_style_layer.js";

function drawModel(painter: Painter, sourceCache: SourceCache, layer: ModelStyleLayer, tileIDs: Array<OverscaledTileID>) {
    const context = painter.context;

    if (painter.renderPass === "offscreen") {
        if (layer.prerender) {
        }
    } else if (painter.renderPass === "translucent") {
        painter.setCustomLayerDefaults();

        context.setColorMode(painter.colorModeForRenderPass());
        context.setStencilMode(StencilMode.disabled);

        // const depthMode = new DepthMode(
        //     painter.context.gl.LEQUAL,
        //     DepthMode.ReadWrite,
        //     painter.depthRangeFor3D
        // );

        // context.setDepthMode(depthMode);
        
        const coords = painter.stencilConfigForOverlap(tileIDs)[1];
        let coveredModels = []
        for (const coord of coords) {
            const tile = sourceCache.getTile(coord);
            if (tile && tile.model) {
                coveredModels.push(tile.model);
            }
        }
        console.log(coords)
        layer.updateModels(coveredModels);

        layer.render(context.gl, painter.transform.customLayerMatrix());

        context.setDirty();
        painter.setBaseState();
        context.bindFramebuffer.set(null);
    }
}
