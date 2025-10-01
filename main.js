
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

  }
scene.add(makeStarfield());


const EARTH_RADIUS = 3.0;
const earthGeo = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64);


function createEarthCanvasTexture(size=1024) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');


  const g = ctx.createRadialGradient(size*0.35, size*0.3, size*0.05, size/2, size/2, size*0.85);
  g.addColorStop(0, '#5fb0ff');
  g.addColorStop(0.5, '#1d6fb3');
  g.addColorStop(1, '#032b4f');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,size,size);

 
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(size*0.68, size*0.32, size*0.48, size*0.18, -0.7, 0, Math.PI*2);
  ctx.fill();
  ctx.globalAlpha = 1.0;


  ctx.fillStyle = '#2b9e4a';
  const continents = [

    [0.36, 0.40, 0.26, 0.18, -0.3],
    [0.60, 0.58, 0.22, 0.14, 0.2],
    [0.20, 0.66, 0.18, 0.12, -0.2],
    [0.46, 0.78, 0.30, 0.18, 0.5]
  ];
  continents.forEach(([x,y,w,h,r]) => {
    ctx.save();
    ctx.translate(size*x, size*y);
    ctx.rotate(r);
    ctx.beginPath();
    ctx.ellipse(0,0, size*w, size*h, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  });


  ctx.fillStyle = '#2fbf6b';
  for (let i=0; i<20; i++){
    const s = size * (Math.random()*0.02 + 0.006);
    ctx.beginPath();
    ctx.ellipse(
      Math.random()*size,
      Math.random()*size,
      s, s*0.7, 0, 0, Math.PI*2
    );
    ctx.fill();
  }


  ctx.globalAlpha = 0.12;
  ctx.fillStyle = '#ffffff';
  for (let i=0; i<10; i++){
    const rx = Math.random()*size;
    const ry = Math.random()*size;
    ctx.beginPath();
    ctx.ellipse(rx, ry, size*0.08 + Math.random()*size*0.06, size*0.04 + Math.random()*size*0.03, Math.random()*Math.PI, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;

  
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  for (let i=0; i<16; i++){
    const x = (i/16 - 0.5) * size;
    ctx.beginPath();
    ctx.ellipse(size/2 - x*0.8, size/2, size*0.48, size*0.48*(1 - Math.abs(i-8)/20), 0, 0, Math.PI*2);
    ctx.stroke();
  }

  return new THREE.CanvasTexture(c);
}
