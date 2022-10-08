import * as THREE from 'three';
import { OrbitControls } from 'orbitControls';
import { OBJLoader } from 'OBJLoader';
// import { FirstPersonControls } from 'FirstPersonControls';
import Stats from 'stats';

var scene = new THREE.Scene();
{
    const color = 0x0a0a0a;  
    const near = 15;
    const far = 25;
    const density = 0.02;
    scene.fog = new THREE.FogExp2(color, density);
//     scene.fog = new THREE.Fog(color, near, far);
}
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 20;

var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setClearColor("#0a0a0a");
renderer.setSize(window.innerWidth,window.innerHeight);

document.body.appendChild(renderer.domElement);

const controls = new OrbitControls( camera, renderer.domElement );
// const controls = new FirstPersonControls( camera, renderer.domElement );
// controls.movementSpeed = 150;
// controls.lookSpeed = 0.1;
const bar = document.querySelector(".progress-bar");
let loadingVal1 = 0;
let loadingVal2 = 0;

var updateLoading = function() {
    bar.style.width = Math.floor(loadingVal1 + loadingVal2) + "%";
    bar.innerText = Math.floor(loadingVal1 + loadingVal2) + "%";
    if((loadingVal1 + loadingVal2) >= 100){
        document.querySelector("#loading").style.display = "none";
    }
}

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth,window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();
})

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshLambertMaterial({color: 0xF7F7F7});
//var mesh = new THREE.Mesh(geometry, material);

//scene.add(mesh);

const loader = new OBJLoader();
loader.load('assets/KalemegdanFortress.obj',
(obj) => {
    // the request was successfull
    const sprite = new THREE.TextureLoader().load( 'images/disc.png' );
    let material = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.05, sizeAttenuation: true, map: sprite, alphaTest: 0.5, transparent: true })
    const mesh = new THREE.Points(obj.children[0].geometry, material)
    // mesh.position.y = -15 //this model is not exactly in the middle by default so I moved it myself
    mesh.position.x = -3;
    scene.add(mesh)
},
(xhr) => {
    // the request is in progress
    console.log((xhr.loaded / xhr.total) * 100);
    loadingVal1 = (xhr.loaded / xhr.total) * 100;
    updateLoading();
},
(err) => {
    // something went wrong
    console.error("loading pointcloud3.obj went wrong, ", err)
})

// loader.load('assets/pointcloud33.obj',
// (obj) => {
//     // the request was successfull
//     let material = new THREE.PointsMaterial({ color: 0xeeff00, size: 0.03 })
//     const mesh = new THREE.Points(obj.children[0].geometry, material)
//     mesh.position.y = 0;
//     mesh.position.x = 8;
//     mesh.rotation.y = Math.PI / 2;
//     scene.add(mesh)
// },
// (xhr) => {
//     // the request is in progress
//     console.log((xhr.loaded / xhr.total) * 100);
//     loadingVal2 = (xhr.loaded / xhr.total) * 50;
//     updateLoading();
// },
// (err) => {
//     // something went wrong
//     console.error("loading pointcloud33.obj went wrong, ", err)
// })


// let meshX = -10;
// for(var i = 0; i<15;i++) {
//     var mesh = new THREE.Mesh(geometry, material);
//     mesh.position.x = (Math.random() - 0.5) * 10;
//     mesh.position.y = (Math.random() - 0.5) * 10;
//     mesh.position.z = (Math.random() - 0.5) * 10;
//     scene.add(mesh);
//     meshX+=1;
// }


var light = new THREE.PointLight(0xFFFFFF, 1, 1000)
light.position.set(0,0,0);
scene.add(light);

var light = new THREE.PointLight(0xFFFFFF, 2, 1000)
light.position.set(0,0,25);
scene.add(light);

const stats = Stats()
document.body.appendChild(stats.dom)

var render = function() {
    requestAnimationFrame(render);


    renderer.render(scene, camera);
    stats.update()
}

// function onMouseMove(event) {
//     event.preventDefault();

//     mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
//     mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

//     raycaster.setFromCamera(mouse, camera);

//     var intersects = raycaster.intersectObjects(scene.children, true);
//     // for (var i = 0; i < intersects.length; i++) {
//     //     this.tl = new TimelineMax();
//     //     this.tl.to(intersects[i].object.scale, 1, {x: 2, ease: Expo.easeOut})
//     //     this.tl.to(intersects[i].object.scale, .5, {x: .5, ease: Expo.easeOut})
//     //     this.tl.to(intersects[i].object.position, .5, {x: 2, ease: Expo.easeOut})
//     //     this.tl.to(intersects[i].object.rotation, .5, {y: Math.PI*.5, ease: Expo.easeOut}, "=-1.5")
//     // }
// }



// window.addEventListener('mousemove', onMouseMove);
render();




console.log("asd");
