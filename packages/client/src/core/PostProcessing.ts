import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

// Signature HD-2D Tilt-Shift & Color Grading Shader (Cross-Platform Mobile-Ready)
const TiltShiftShader = {
  uniforms: {
    tDiffuse: { value: null },
    vFocusPos: { value: 0.5 },
    vFocusRange: { value: 0.35 },
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
    precision highp float;
    uniform sampler2D tDiffuse;
    uniform float vFocusPos;
    uniform float vFocusRange;
    uniform float blurAmount;
    varying vec2 vUv;

    void main() {
      float dist = abs(vUv.y - vFocusPos);
      float blurFactor = smoothstep(vFocusRange * 0.5, vFocusRange, dist);
      float offset = blurFactor * blurAmount;

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

      // Warm Vignette & Saturation
      vec2 center = vUv - vec2(0.5);
      float vignette = 1.0 - dot(center, center) * 0.85;
      sum.rgb *= vignette;

      sum.rgb = pow(sum.rgb, vec3(0.95));
      sum.r *= 1.03;
      sum.b *= 0.98;

      gl_FragColor = sum;
    }
  `
};

export class HD2DPostProcessing {
  public composer: EffectComposer | null = null;

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    try {
      this.composer = new EffectComposer(renderer);

      const renderPass = new RenderPass(scene, camera);
      this.composer.addPass(renderPass);

      const tiltShiftPass = new ShaderPass(TiltShiftShader);
      this.composer.addPass(tiltShiftPass);

      window.addEventListener('resize', () => {
        if (this.composer) {
          this.composer.setSize(window.innerWidth, window.innerHeight);
        }
      });
    } catch (err) {
      console.warn('EffectComposer unavailable on this device, using standard rendering:', err);
      this.composer = null;
    }
  }

  public render(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
    if (this.composer) {
      try {
        this.composer.render();
        return;
      } catch (err) {
        console.warn('PostProcessing render error, fallback to direct renderer:', err);
      }
    }
    renderer.render(scene, camera);
  }
}
