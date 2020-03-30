#version 300 es
precision highp float;

//out vec2 o_velocity;
out vec4 o_velocity;

void main(void) {
    //o_velocity = vec2(0.0);
    o_velocity = vec4(0.0, 1.0, 0.0, 1.0);
}