// src/renderers/shaders/ShaderChunk/packing.glsl.js
#include <packing>

varying vec2 vUv;

uniform sampler2D tDepth;
uniform float cameraNear;
uniform float cameraFar;
      
void main() {
  float fragCoordZ = texture2D(tDepth, vUv).x;
  float viewZ = perspectiveDepthToViewZ(fragCoordZ, cameraNear, cameraFar);
  float depth = viewZToOrthographicDepth(viewZ, cameraNear, cameraFar);
  gl_FragColor.rgb = vec3(depth);
  gl_FragColor.a = 1.0;
}
