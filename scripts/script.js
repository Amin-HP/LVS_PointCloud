import * as THREE from 'three';
import { OrbitControls } from 'orbitControls';
import { OBJLoader } from 'OBJLoader';
// import { FirstPersonControls } from 'FirstPersonControls';
import Stats from 'stats';

const distTh = 10;
var scene = new THREE.Scene();
// {
//     const color = 0x23232b;  
//     const near = 15;
//     const far = 25;
//     const density = 0.02;
//     scene.fog = new THREE.FogExp2(color, density);
// //     scene.fog = new THREE.Fog(color, near, far);
// }
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 20;
// camera.position.y = 10;
// camera.position.x = 50;
var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setClearColor("#23232b");
renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls( camera, renderer.domElement );
const bar = document.querySelector(".progress-bar");
let loadingVal = 0;
let isLoaded = false;
var updateLoading = function() {
    bar.style.width = Math.floor(loadingVal) + "%";
    bar.innerText = Math.floor(loadingVal) + "%";
    if((loadingVal) >= 100){
        document.querySelector("#loading").style.display = "none";
    }
}

window.addEventListener('mousemove', onMouseMove);
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth,window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();
})

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var plane = new THREE.Plane();
var planeNormal = new THREE.Vector3();
// var geometry = new THREE.BoxGeometry(1, 1, 1);
// var material = new THREE.MeshLambertMaterial({color: 0xF7F7F7});
//var mesh = new THREE.Mesh(geometry, material);
let baseMesh, meshColider;

const baseGeo = new THREE.BufferGeometry();
const deformedGeo = new THREE.BufferGeometry();
const targetGeo = new THREE.BufferGeometry();

const mouseVec = new THREE.Vector3(0, 0, 0);
//scene.add(mesh);

const deformGeo = (geometry, baseGeometry, amp, size) => {
    const verts = geometry.attributes.position;
    const baseVerts = baseGeometry.attributes.position;
    const baseNorms = baseGeometry.attributes.normal;

    let x0, y0, z0, index ,ix ,iy, iz, value, nx, ny, nz;
    index = 0;
    // var time = new Date() / 2000 ;

    for(let i = 0; i < verts.count; i++){
        ix = index ++;
        iy = index ++;
        iz = index ++;
        // const p = new THREE.Vector3(verts.array[ix], verts.array[iy], verts.array[iz]);
        
        // const dist = Math.abs(p.distanceTo(mouseVec));
        // if(dist < distTh){
            x0 = baseVerts.array[ix];
            y0 = baseVerts.array[iy];
            z0 = baseVerts.array[iz];

            nx = baseNorms.array[ix];
            ny = baseNorms.array[iy];
            nz = baseNorms.array[iz];

            value = noise.perlin3(x0 * size, y0 * size, z0 * size) * amp;
            // value = noise.perlin3(x0 * 1, y0 * 1, time + z0) * 0.8 * (distTh - dist) ;
            verts.array[ix] = x0 + value * nx;
            verts.array[iy] = y0 + value * ny;
            verts.array[iz] = z0 + value * nz;
        // }
        // else{
        //     verts.array[ix] = x0;
        //     verts.array[iy] = y0;
        //     verts.array[iz] = z0;
        // }
       
    }
    geometry.attributes.position.needsUpdate = true;
}


const loader = new OBJLoader();
loader.load('assets/edited2.obj',
(obj) => {
    // the request was successfull
    const sprite = new THREE.TextureLoader().load( 'images/disc.png' );
    let material = new THREE.PointsMaterial({ color: 0x01b6c7, size: 0.03, sizeAttenuation: true, map: sprite, alphaTest: 0.5, transparent: true })
    var collideMat = new THREE.MeshBasicMaterial({color: 0x01b6c7, transparent: true, opacity: 0});
    // geo = obj.children[0].geometry;
    
    // baseMesh.position.y = -10 //this model is not exactly in the middle by default so I moved it myself
    // baseMesh.position.x = -3;
    // baseMesh.scale.set(50,50,50);

    baseGeo.copy(obj.children[0].geometry);
    deformedGeo.copy(obj.children[0].geometry);
    targetGeo.copy(obj.children[0].geometry);
    // baseMesh = new THREE.Points(targetGeo, material);
    
    deformGeo(deformedGeo, baseGeo, 10, 0.2);
    baseMesh = new THREE.Points(targetGeo, material);
    // baseMesh.position.y = -10; 
    console.log(baseMesh);
    // meshColider = new THREE.Mesh(baseGeo, collideMat);
    // console.log(mesh.geometry);
    scene.add(baseMesh)
    // scene.add(meshColider)
   
;
    // verts.attributes.position.array.forEach(element => {
    //     console.log(element);
    // });
    isLoaded = true;
},
(xhr) => {
    // the request is in progress
    console.log((xhr.loaded / xhr.total) * 100);
    loadingVal = (xhr.loaded / xhr.total) * 100;
    updateLoading();
},
(err) => {
    // something went wrong
    console.error("loading pointcloud3.obj went wrong, ", err)
})


var light = new THREE.PointLight(0xFFFFFF, 1, 1000)
light.position.set(0,0,0);
scene.add(light);

var light = new THREE.PointLight(0xFFFFFF, 2, 1000)
light.position.set(0,0,25);
scene.add(light);

const stats = Stats()
document.body.appendChild(stats.dom)
const geometrySphere = new THREE.SphereGeometry(0.1, 8, 8 );
const mat = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
const sphere = new THREE.Mesh( geometrySphere, mat );
// sphere.position.x =  5;
// mouseVec.set(5,0,0);
scene.add( sphere );


const pointDeforminig = (targetGeo, baseGeo, deformedGeo, point , size = 1) => {
    const targetVerts = targetGeo.attributes.position;
    const baseVerts = baseGeo.attributes.position;
    const deformedVerts = deformedGeo.attributes.position;

    let x0, y0, z0, index ,ix ,iy, iz, value, x1, y1, z1;
    index = 0;

    for(let i = 0; i < targetVerts.count; i++){
        ix = index ++;
        iy = index ++;
        iz = index ++;
        const p = new THREE.Vector3(targetVerts.array[ix], targetVerts.array[iy], targetVerts.array[iz]);
        const dist = Math.abs(p.distanceTo(point));

        x0 = baseVerts.array[ix];
        y0 = baseVerts.array[iy];
        z0 = baseVerts.array[iz];

        if(dist < size){
            x1 = deformedVerts.array[ix];
            y1 = deformedVerts.array[iy];
            z1 = deformedVerts.array[iz];
            // value = noise.perlin3(x0 * size, y0 * size, z0 * size) * amp;
            value = (size - dist) / size;
            
            targetVerts.array[ix] = x0 * (1 - value) + value * x1;
            targetVerts.array[iy] = y0 * (1 - value) + value * y1;
            targetVerts.array[iz] = z0 * (1 - value) + value * z1;
        }
        else{
            targetVerts.array[ix] = x0;
            targetVerts.array[iy] = y0;
            targetVerts.array[iz] = z0;
        }
       
    }
    targetGeo.attributes.position.needsUpdate = true;
    
}

var render = function() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    stats.update()
    sphere.position.set(mouseVec.x,mouseVec.y,mouseVec.z);
    if(isLoaded){
        // camera.rotation.y += 0.003;
        pointDeforminig(targetGeo, baseGeo, deformedGeo, mouseVec, 10);
       
        // baseMesh.geometry.attributes.position.needsUpdate = true;
        // console.log(value);
        
    }
   

    
}

function onMouseMove(event) {
    event.preventDefault();

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    // mouseVec.set(mouse.x, mouse.y, 0.5);
    // mouseVec.unproject( camera );
    // mouseVec.sub( camera.position ).normalize();

    planeNormal.copy(camera.position).normalize();
    plane.setFromNormalAndCoplanarPoint(planeNormal, scene.position);
    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(plane, mouseVec);

    // console.log(mouseVec);

    // raycaster.setFromCamera(mouse, camera);
    // var intersects = raycaster.intersectObjects(scene.children, true);
    // // console.log(intersects);
    // if(intersects.length > 0)
    //     for (var i = 0; i < intersects.length; i++) {
    //         if(intersects[i].object == meshColider){
    //             mouseVec.set(intersects[i].point.x,intersects[i].point.y,intersects[i].point.z);
    //             break;
    //         }
           
    //     }
    // else{
    //     // mouseVec.set(100,100,100);
    //     planeNormal.copy(camera.position).normalize();
    //     plane.setFromNormalAndCoplanarPoint(planeNormal, scene.position);
    //     // raycaster.setFromCamera(mouse, camera);
    //     raycaster.ray.intersectPlane(plane, mouseVec);
    // }
}




render();

