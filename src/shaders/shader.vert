// uniform mat4 modelViewMatrix;
// uniform mat4 projectionMatrix;
uniform mat4 modelViewProjectMatrixInverse;
varying vec3 rayDir;

void main() {
    gl_Position = vec4(position,1);
    vec4 WPpos = modelViewProjectMatrixInverse * gl_Position;
    WPpos /= WPpos.w;
    rayDir = WPpos.xyz - cameraPosition;
}



// // OLD CODE!
// varying vec2 pos;

// void main() {
//     gl_Position = vec4(position,1);

//     // x & y can be: -0.5, 0.5, 1.5
//     // pos = vec2(position.x+0.5, position.y+0.5);

//     // x & y can be:    0, 0.5, 1.0
//     pos = vec2((position.x + 1.0) / 2.0, (position.y + 1.0) / 2.0);
// }
