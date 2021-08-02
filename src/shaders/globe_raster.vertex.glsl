uniform mat4 u_globe_matrix;
uniform float u_skirt_height;

uniform vec3 u_tl_normal;
uniform vec3 u_tr_normal;
uniform vec3 u_br_normal;
uniform vec3 u_bl_normal;

attribute vec3 a_globe_pos;
attribute vec2 a_uv;
attribute vec2 a_pos;           // Mercator
attribute vec2 a_texture_pos;

varying vec2 v_pos0;

#ifdef FOG
varying float v_fog_opacity;
#endif

const float skirtOffset = 24575.0;
const float wireframeOffset = 0.00015;

void main() {
    v_pos0 = a_uv;

    // Bilinear interpolation over normals of corner points
    float topLen = length(u_tl_normal);
    float bottomLen = length(u_bl_normal);

    vec3 normal = normalize(mix(
        mix(u_tl_normal, u_tr_normal, a_uv.xxx),
        mix(u_bl_normal, u_br_normal, a_uv.xxx),
        a_uv.yyy));

    normal = tileUpVector(a_uv);// normal * mix(topLen, bottomLen, a_uv.y);

    gl_Position = u_globe_matrix * vec4(a_globe_pos + normal * elevation(a_uv * 8192.0), 1.0);
}
