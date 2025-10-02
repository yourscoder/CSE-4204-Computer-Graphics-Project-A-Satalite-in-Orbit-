
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


const earthTexture = createEarthCanvasTexture(1024);
earthTexture.needsUpdate = true;

const earthMat = new THREE.MeshPhongMaterial({
  map: earthTexture,
  shininess: 8,
  specular: new THREE.Color(0x222222)
});
const earth = new THREE.Mesh(earthGeo, earthMat);
earth.rotation.y = 0.5;
scene.add(earth);


const atmMaterial = new THREE.ShaderMaterial({
  vertexShader: atmosphereVertexShader,
  fragmentShader: atmosphereFragmentShader,
  uniforms: {
    glowColor: { value: new THREE.Color(0x66b3ff) }
  },
  transparent: true,
  blending: THREE.AdditiveBlending,
  side: THREE.BackSide,
  depthWrite: false
});
const atm = new THREE.Mesh(
  new THREE.SphereGeometry(EARTH_RADIUS * 1.04, 64, 64),
  atmMaterial
);
scene.add(atm);


const satelliteGroup = new THREE.Group();

// satellite body
const bodyGeo = new THREE.BoxGeometry(0.6, 0.45, 0.45);
const satMaterial = new THREE.MeshStandardMaterial({ metalness: 0.6, roughness: 0.4 });
const satBody = new THREE.Mesh(bodyGeo, satMaterial);
satBody.castShadow = true;
satBody.receiveShadow = true;
satelliteGroup.add(satBody);

// simple antenna/cylinder
/*const cyl = new THREE.CylinderGeometry(0.02, 0.02, 0.9, 10);
const antenna = new THREE.Mesh(cyl, new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9, roughness: 0.2 }));
antenna.rotation.z = 1.2;
antenna.position.set(0.55, 0.0, 0.0);
satelliteGroup.add(antenna);*/   

// solar panels (two rectangular boxes)
function makeSolarPanel(w = 1.0, h = 0.46) {
  const g = new THREE.BoxGeometry(w, h, 0.04);
  const m = new THREE.MeshStandardMaterial({ metalness: 0.2, roughness: 0.3 });
  const mesh = new THREE.Mesh(g, m);
  return mesh;
}
const leftPanel = makeSolarPanel(1.2);
leftPanel.position.set(-0.9, 0.0, 0.0);
leftPanel.rotation.y = 0.02;
satelliteGroup.add(leftPanel);

const rightPanel = makeSolarPanel(1.2);
rightPanel.position.set(0.9, 0.0, 0.0);
satelliteGroup.add(rightPanel);


function createSatelliteTextures(size = 512) {
  const list = [];

  // 1) metal brushed texture
  const c1 = document.createElement('canvas'); c1.width = c1.height = size;
  const ctx1 = c1.getContext('2d');
  // base
  ctx1.fillStyle = '#a6a6a6';
  ctx1.fillRect(0,0,size,size);
  // brushed lines
  ctx1.globalAlpha = 0.06;
  for (let i=0;i<200;i++){
    ctx1.fillStyle = `rgba(255,255,255,${0.02+Math.random()*0.02})`;
    const y = Math.random()*size;
    ctx1.fillRect(0,y, size, 1);
  }
  ctx1.globalAlpha = 1.0;
  // thin stripes
  ctx1.fillStyle = 'rgba(40,40,40,0.08)';
  ctx1.fillRect(0,size*0.66, size, size*0.08);

  list.push(new THREE.CanvasTexture(c1));

  // 2) solar-panel style (grid)
  const c2 = document.createElement('canvas'); c2.width = c2.height = size;
  const ctx2 = c2.getContext('2d');
  ctx2.fillStyle = '#052a4a';
  ctx2.fillRect(0,0,size,size);
  ctx2.strokeStyle = 'rgba(0,0,0,0.6)';
  ctx2.lineWidth = 3;
  // vertical grid
  const cols = 8, rows = 5;
  const cw = size/cols, ch = size/rows;
  ctx2.globalAlpha = 0.7;
  for (let i=1;i<cols;i++) {
    ctx2.beginPath();
    ctx2.moveTo(i*cw,0);
    ctx2.lineTo(i*cw,size);
    ctx2.stroke();
  }
  for (let j=1;j<rows;j++) {
    ctx2.beginPath();
    ctx2.moveTo(0,j*ch);
    ctx2.lineTo(size,j*ch);
    ctx2.stroke();
  } 

  


  // small lighter sheen squares
  for (let i=0;i<cols;i++){
    for (let j=0;j<rows;j++){
      if (Math.random() > 0.85) {
        ctx2.fillStyle = 'rgba(90,150,220,0.06)';
        ctx2.fillRect(i*cw + 6, j*ch + 6, cw - 12, ch - 12);
      }
    }
  }
  ctx2.globalAlpha = 1.0;
  list.push(new THREE.CanvasTexture(c2));

  // 3) colored pattern
  const c3 = document.createElement('canvas'); c3.width = c3.height = size;
  const ctx3 = c3.getContext('2d');
  ctx3.fillStyle = '#7d6a3d';
  ctx3.fillRect(0,0,size,size);
  const patches = ['#6e8b3d','#525b2d','#a37b4c','#3a3a2f'];
  for (let i=0;i<40;i++){
    ctx3.fillStyle = patches[Math.floor(Math.random()*patches.length)];
    ctx3.beginPath();
    ctx3.ellipse(Math.random()*size, Math.random()*size, size*0.08 + Math.random()*size*0.06, size*0.04 + Math.random()*size*0.06, Math.random()*Math.PI, 0, Math.PI*2);
    ctx3.fill();
  }
  list.push(new THREE.CanvasTexture(c3));

  list.forEach(t => { t.encoding = THREE.sRGBEncoding; t.needsUpdate = true; });
  return list;
}
const satTextures = createSatelliteTextures(1024);
let satTextureIndex = 0;
satMaterial.map = satTextures[satTextureIndex];
satMaterial.needsUpdate = true;


const panelMatLeft = satelliteGroup.children.find(c => c === leftPanel).material;
panelMatLeft.map = createSolarPanelTexture(512);
panelMatLeft.needsUpdate = true;
const panelMatRight = satelliteGroup.children.find(c => c === rightPanel).material;
panelMatRight.map = createSolarPanelTexture(512);
panelMatRight.needsUpdate = true;


function createSolarPanelTexture(size=512) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#052a4a';
  ctx.fillRect(0,0,size,size);
  ctx.strokeStyle = 'rgba(0,0,0,0.8)';
  ctx.lineWidth = 4;
  for (let i=0;i<8;i++){
    ctx.beginPath();
    ctx.moveTo((i+1)*(size/9), 0);
    ctx.lineTo((i+1)*(size/9), size);
    ctx.stroke();
  }
  return new THREE.CanvasTexture(c);
}

// ---------- Orbit pivot ----------
const orbitPivot = new THREE.Object3D();
scene.add(orbitPivot);

// place satellite at orbit radius
const ORBIT_RADIUS = 5.5;
satelliteGroup.position.set(ORBIT_RADIUS, 0.0, 0.0);
orbitPivot.add(satelliteGroup);


orbitPivot.rotation.x = 0.12;


let camSpherical = { radius: 8.5, theta: 1.0, phi: 0.6 }; // spherical coords around satellite
function updateCamera() {

  const satWorld = new THREE.Vector3();
  satelliteGroup.getWorldPosition(satWorld);

 
  const r = camSpherical.radius;
  const x = satWorld.x + r * Math.cos(camSpherical.phi) * Math.sin(camSpherical.theta);
  const y = satWorld.y + r * Math.sin(camSpherical.phi);
  const z = satWorld.z + r * Math.cos(camSpherical.phi) * Math.cos(camSpherical.theta);

  camera.position.set(x,y,z);
  camera.lookAt(satWorld);
}
updateCamera();

const keys = {};
window.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

function handleKeys(delta) {
  const rotSpeed = 0.9 * delta;
  const zoomSpeed = 4.0 * delta;

  if (keys['a'] || keys['arrowleft']) camSpherical.theta -= rotSpeed;
  if (keys['d'] || keys['arrowright']) camSpherical.theta += rotSpeed;
  if (keys['w'] || keys['arrowup']) camSpherical.phi = Math.max(-Math.PI/2 + 0.05, camSpherical.phi - rotSpeed);
  if (keys['s'] || keys['arrowdown']) camSpherical.phi = Math.min(Math.PI/2 - 0.05, camSpherical.phi + rotSpeed);

  if (keys['+'] || keys['=']) camSpherical.radius = Math.max(2.2, camSpherical.radius - zoomSpeed * 0.1);
  if (keys['-'] || keys['_']) camSpherical.radius = Math.min(40, camSpherical.radius + zoomSpeed * 0.1);

  if (keys[' ']) { 
    camSpherical = { radius: 8.5, theta: 1.0, phi: 0.6 };
  }
}


const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// click handler
renderer.domElement.addEventListener('pointerdown', (ev) => {
  
  mouse.x = (ev.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = - (ev.clientY / renderer.domElement.clientHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  
  const intersects = raycaster.intersectObject(satBody, true);
  if (intersects.length > 0) {
    
    satTextureIndex = (satTextureIndex + 1) % satTextures.length;
    satMaterial.map = satTextures[satTextureIndex];
    satMaterial.needsUpdate = true;
  }
}, false);

// Animation
let lastTime = performance.now() / 1000;
let orbitSpeed = 0.25; // radians per second
function animate() {
  requestAnimationFrame(animate);
  const t = performance.now() / 1000;
  const dt = Math.min(0.05, t - lastTime); 
  lastTime = t;

  // keyboard camera
  handleKeys(dt);
  updateCamera();

  orbitPivot.rotation.y += orbitSpeed * dt;


  satelliteGroup.rotation.y += 1.2 * dt;

 
  satelliteGroup.rotation.x = Math.sin(t * 0.4) * 0.08;


  earth.rotation.y += 0.02 * dt;

  renderer.render(scene, camera);
}
animate();


window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});




  





