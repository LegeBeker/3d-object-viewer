import * as THREE from "./libs/three.module.js";

import { GLTFLoader } from "./libs/GLTFLoader.js";
import { OrbitControls } from "./libs/OrbitControls.js";
import { TWEEN } from './libs/tween.module.min.js'

// 3D model that gets loaded in (glTF or glb)
var object = '../models/cube.glb';

var checkEnd = 0;
var checkStart = 0;


const loader = new GLTFLoader();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

window.onresize = function (e) {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};

loader.load(object, function (glb) {
  document.getElementById("loading").className += "loaded";
  var mroot = glb.scene;
  var bbox = new THREE.Box3().setFromObject(mroot);
  var cent = bbox.getCenter(new THREE.Vector3());
  var size = bbox.getSize(new THREE.Vector3());

  var maxAxis = Math.max(size.x, size.y, size.z);
  mroot.scale.multiplyScalar(5.0 / maxAxis);
  bbox.setFromObject(mroot);
  bbox.getCenter(cent);
  bbox.getSize(size);
  mroot.position.copy(cent).multiplyScalar(-1);

  scene.add(glb.scene);
  animate();
},
  function (xhr) {
    document.getElementById("loadingbar").style.width = (xhr.loaded / xhr.total * 19.75) + "rem";
  }, undefined, function (error) {
    console.error(error);
  });

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.4);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(-3, 50, 0);
camera.add(dirLight);

const light2 = new THREE.DirectionalLight(0x4c00b6, 0.25);
light2.position.set(0, -50, -20);
light2.castShadow = true;
camera.add(light2);

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.addEventListener('start', startControl);
controls.addEventListener('end', endControl);

controls.minDistance = 7;
controls.maxDistance = 20;
controls.update();

controls.enableDamping = true;
controls.enablePan = false;
controls.autoRotate = true;
controls.autoRotateSpeed = -1; // Rotate clockewise

camera.position.set(10, 5, 10);

function animate() {
  requestAnimationFrame(animate);
  scene.add(camera);
  controls.update();
  TWEEN.update()
  renderer.render(scene, camera);
}

function startControl() {
  controls.autoRotate = false;
  checkStart = 1;
}

function endControl() {
  checkStart = 0;
  if (checkEnd != 1) {
    checkEnd = 1;
    setTimeout(function () {
      if (checkStart != 1) {
        new TWEEN.Tween(camera.position)
          .to({ x: 10, y: 5, z: 10 }, 1500)
          .easing(TWEEN.Easing.Quadratic.InOut)
          .start();
        controls.autoRotate = true;
        checkEnd = 0;
      } else {
        endControl();
      }
    }, 2000);
  }
}
