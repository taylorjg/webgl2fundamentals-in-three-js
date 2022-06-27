varying vec2 vUv;

uniform sampler2D tDiffuse;

void main() {
  vec3 diffuse = texture2D(tDiffuse, vUv).rgb;
  gl_FragColor = vec4(diffuse, 1.0);
}
