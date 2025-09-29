
import * as THREE from 'https://unpkg.com/three@0.162.0/build/three.module.js';
import { atmosphereVertexShader, atmosphereFragmentShader } from './shaders.js';

const container = document.getElementById('canvas-container');


const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;
container.appendChild(renderer.domElement);


const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.0007);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(8, 3, 8);


const ambient = new THREE.AmbientLight(0x777777, 0.6);
scene.add(ambient);

const sun = new THREE.DirectionalLight(0xfff6e6, 1.2);
sun.position.set(10, 6, 8);
sun.castShadow = false;
scene.add(sun);

const backLight = new THREE.DirectionalLight(0x99ccff, 0.15);
backLight.position.set(-6, -4, -8);
scene.add(backLight);


function makeStarfield(count = 1000, spread=120) {
  const pts = new Float32Array(count * 3);
  for (let i=0; i<count*3; i++) {
    pts[i] = (Math.random() - 0.5) * spread;
 
    if (Math.random() > 0.8) pts[i] *= 2.5;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pts, 3));
  const mat = new THREE.PointsMaterial({ size: 0.7, sizeAttenuation: true, transparent: true });
  mat.color = new THREE.Color(0xffffff);
  mat.depthWrite = false;
  return new THREE.Points(g, mat);
