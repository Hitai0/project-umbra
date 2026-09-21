import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

// Signature HD-2D Tilt-Shift & Color Grading Shader
const TiltShiftShader = {
  uniforms: {
    tDiffuse: { value: null },
    vFocusPos: { value: 0.5 },    // Vertical center of focus
    vFocusRange: { value: 0.35 },  // Width of in-focus band
    blurAmount: { value: 0.0035 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float vFocusPos;
    uniform float vFocusRange;
    uniform float blurAmount;
    varying vec2 vUv;

    void main() {
      // Calculate distance from focus line
      float dist = abs(vUv.y - vFocusPos);
      float blurFactor = smoothstep(vFocusRange * 0.5, vFocusRange, dist);
      float offset = blurFactor * blurAmount;

      // 9-tap blur sampling
      vec4 sum = vec4(0.0);
      sum += texture2D(tDiffuse, vUv + vec2(-offset, -offset)) * 0.075;
      sum += texture2D(tDiffuse, vUv + vec2( 0.0,    -offset)) * 0.125;
      sum += texture2D(tDiffuse, vUv + vec2( offset, -offset)) * 0.075;
      sum += texture2D(tDiffuse, vUv + vec2(-offset,  0.0   )) * 0.125;
      sum += texture2D(tDiffuse, vUv + vec2( 0.0,     0.0   )) * 0.200;
      sum += texture2D(tDiffuse, vUv + vec2( offset,  0.0   )) * 0.125;
      sum += texture2D(tDiffuse, vUv + vec2(-offset,  offset)) * 0.075;
      sum += texture2D(tDiffuse, vUv + vec2( 0.0,     offset)) * 0.125;
      sum += texture2D(tDiffuse, vUv + vec2( offset,  offset)) * 0.075;

      // Octopath Style Warm Vignette & Saturation boost
      vec2 center = vUv - vec2(0.5);
      float vignette = 1.0 - dot(center, center) * 0.85;
      sum.rgb *= vignette;

      // Slight contrast & warmth
      sum.rgb = pow(sum.rgb, vec3(0.95)); // Contrast
      sum.r *= 1.03; // Warm tint
      sum.b *= 0.98;

      gl_FragColor = sum;
    }
  `
};

export class HD2DPostProcessing {
  public composer: EffectComposer;
  private tiltShiftPass: ShaderPass;

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    this.composer = new EffectComposer(renderer);

    const renderPass = new RenderPass(scene, camera);
    this.composer.addPass(renderPass);

    this.tiltShiftPass = new ShaderPass(TiltShiftShader);
    this.composer.addPass(this.tiltShiftPass);

    window.addEventListener('resize', () => {
      this.composer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  public render(renderer?: THREE.WebGLRenderer, scene?: THREE.Scene, camera?: THREE.Camera) {
    try {
      this.composer.render();
    } catch (err) {
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    }
  }
}
