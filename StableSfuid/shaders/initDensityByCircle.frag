#version 300 es

precision highp float;

out vec3 o_density;

uniform vec2 u_resolution;

void main(void) {
  vec2 st = (2.0 * gl_FragCoord.xy - u_resolution) / min(u_resolution.x, u_resolution.y);
  float density = smoothstep(0.51, 0.50, length(st));
  o_density = vec3(density);
}
