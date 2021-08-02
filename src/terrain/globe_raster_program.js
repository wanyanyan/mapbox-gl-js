// @flow

import {
    Uniform1i,
    Uniform2f,
    Uniform3f,
    UniformMatrix4f,
    Uniform1f,
    Uniform4f
} from '../render/uniform_binding.js';

import type Context from '../gl/context.js';
import type {UniformValues, UniformLocations} from '../render/uniform_binding.js';

export type GlobeRasterUniformsType = {|
    'u_globe_matrix': UniformMatrix4f,
    'u_image0': Uniform1i
|};

export type AtmosphereUniformsType = {|
    'u_center': Uniform2f,
    'u_radius': Uniform1f,
    'u_screen_size': Uniform2f,
    'u_opacity': Uniform1f,
    'u_fadeout_range': Uniform1f,
    'u_start_color': Uniform3f,
    'u_end_color': Uniform3f
|};

const globeRasterUniforms = (context: Context, locations: UniformLocations): GlobeRasterUniformsType => ({
    'u_globe_matrix': new UniformMatrix4f(context, locations.u_globe_matrix),
    'u_image0': new Uniform1i(context, locations.u_image0)
});

const atmosphereUniforms = (context: Context, locations: UniformLocations): AtmosphereUniformsType => ({
    'u_center': new Uniform2f(context, locations.u_center),
    'u_radius': new Uniform1f(context, locations.u_radius),
    'u_screen_size': new Uniform2f(context, locations.u_screen_size),
    'u_opacity': new Uniform1f(context, locations.u_opacity),
    'u_fadeout_range': new Uniform1f(context, locations.u_fadeout_range),
    'u_start_color': new Uniform3f(context, locations.u_start_color),
    'u_end_color': new Uniform3f(context, locations.u_end_color)
});

const globeRasterUniformValues = (
    globeMatrix: Float32Array
): UniformValues<GlobeRasterUniformsType> => ({
    'u_globe_matrix': globeMatrix,
    'u_image0': 0
});

const atmosphereUniformValues = (
    center,
    radius,
    screenSize,
    opacity,
    fadeoutRange,
    startColor,
    endColor
): UniformValues<AtmosphereUniformsType> => ({
    'u_center': center,
    'u_radius': radius,
    'u_screen_size': screenSize,
    'u_opacity': opacity,
    'u_fadeout_range': fadeoutRange,
    'u_start_color': startColor,
    'u_end_color': endColor,
});

export {globeRasterUniforms, globeRasterUniformValues, atmosphereUniforms, atmosphereUniformValues};
