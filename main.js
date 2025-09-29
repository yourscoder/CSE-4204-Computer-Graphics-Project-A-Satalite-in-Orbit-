
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
