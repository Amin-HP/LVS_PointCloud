import * as THREE from 'three';
import { OrbitControls } from 'orbitControls';
import { OBJLoader } from 'OBJLoader';
// import { FirstPersonControls } from 'FirstPersonControls';
import Stats from 'stats';
// import { GUI } from 'datgui'

const modelData = {
    vertexCount : "0",

}
const deform = {
    amp : 20,
    ferq : 10,
    radius : 6,
}
const noiseAnim = {
    ferq : 4,
    amp : 0.05,
    speed : 0.002
}
const mouse = {
    x : window.innerWidth / 2,
    y : window.innerHeight / 2,
    cursorX : window.innerWidth / 2,
    cursorY : window.innerHeight / 2,
    speed : 0.1,
    size: 30,
    isVisible: false

}

const particle = {
    size: 1,
    color: "#01b6c7",
    opacity: 0.5,
}

const gui = new dat.GUI();
const deformFolder = gui.addFolder('Deform')
deformFolder.add(deform, 'amp', 0, 50).onFinishChange(
    function(){
      updateModel();
    }
  )
deformFolder.add(deform, 'ferq', 0.1, 30).onFinishChange(
    function(){
      updateModel();
    }
  )
deformFolder.add(deform, 'radius', 1, 15);

deformFolder.open();

const mouseFolder = gui.addFolder('mouse')
mouseFolder.add(mouse, 'speed', 0.01, 0.2);
mouseFolder.add(mouse, 'size', 10, 100);
mouseFolder.add(mouse, 'isVisible').onChange(() => {
    mouse.isVisible ? renderer.domElement.style.cursor = 'default' : renderer.domElement.style.cursor = 'none';
   
});
mouseFolder.open();

const animFolder = gui.addFolder('Noise Animation')
animFolder.add(noiseAnim, 'amp', 0, 2);
animFolder.add(noiseAnim, 'ferq', 0.1, 15);
animFolder.add(noiseAnim, 'speed', 0.00001, 0.01);
animFolder.open();

const particleFolder = gui.addFolder('particle')
particleFolder.add(particle, 'size', 0, 2).onChange(() => {updateMaterial();})
particleFolder.addColor(particle, 'color', 0.1, 15).onChange(() => {updateMaterial();})
particleFolder.add(particle, 'opacity', 0, 1).onChange(() => {updateMaterial();})
particleFolder.open();
console.log(particleFolder)
const modelGui = gui.add(modelData, 'vertexCount');
modelGui.name('Vertex Count');
const btn = { loadFile : function(){ 
    console.log("clicked") 
    input.click();
}};
gui.add(btn, 'loadFile').name('Load OBJ file');;

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
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setClearColor("#23232b");
renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.domElement.style.cursor = 'none';
const controls = new OrbitControls( camera, renderer.domElement );
controls.autoRotate = true;
controls.enabled = true;
controls.enableDamping = true;
controls.enableZoom = false;

const bar = document.querySelector(".progress-bar");
const cursor = document.querySelector("#cursor");

let loadingVal = 0;
let isLoaded = false;

const material = new THREE.PointsMaterial({ color: 0x01b6c7, size: 1, sizeAttenuation: false, opacity: 0.2, transparent : true})

var updateLoading = function() {
    bar.style.width = Math.floor(loadingVal) + "%";
    bar.innerText = Math.floor(loadingVal) + "%";
    if((loadingVal) >= 100){
        document.querySelector("#loading").style.display = "none";
    }
}

window.addEventListener('mousemove', onMouseMove);
window.addEventListener('click', onMouseClick);
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth,window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();
})

var raycaster = new THREE.Raycaster();
// var mouse = new THREE.Vector2();
var plane = new THREE.Plane();
var planeNormal = new THREE.Vector3();
// var geometry = new THREE.BoxGeometry(1, 1, 1);
// var material = new THREE.MeshLambertMaterial({color: 0xF7F7F7});
//var mesh = new THREE.Mesh(geometry, material);
let baseMesh, meshColider;

const baseGeo = new THREE.BufferGeometry();
const deformedGeo = new THREE.BufferGeometry();
const targetGeo = new THREE.BufferGeometry();

const mouseVec = new THREE.Vector3(100, 100, 100);

//scene.add(mesh);

const deformGeo = (geometry, baseGeometry, amp, ferq) => {
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

            value = noise.perlin3(x0 / ferq, y0 / ferq, z0 / ferq) * amp;
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

// const queryString = window.location.search;
// const urlParams = new URLSearchParams(queryString);
// const model_type = urlParams.get('model_type')
// console.log(model_type);
console.log(material)
const updateModel = () => {
    deformGeo(deformedGeo, baseGeo, deform.amp, deform.ferq);
    console.log("update model")
}
const updateMaterial = () => {
    material.size = particle.size;
    material.opacity = particle.opacity;
    material.color.set(particle.color);
}
const LoadModel = (path) => {
    const loader = new OBJLoader();
    // const file = path;
    loader.load(path,
    (obj) => {
        // the request was successfull
        // const sprite = new THREE.TextureLoader().load( 'images/disc.png' );
        // let material = new THREE.PointsMaterial({ color: 0x01b6c7, size: 0.03, sizeAttenuation: true, map: sprite, alphaTest: 0.5, transparent: true })
        
        // var collideMat = new THREE.MeshBasicMaterial({color: 0x01b6c7, transparent: true, opacity: 0});
        // geo = obj.children[0].geometry;
        
        // baseMesh.position.y = -10 //this model is not exactly in the middle by default so I moved it myself
        // baseMesh.position.x = -3;
        // baseMesh.scale.set(50,50,50);

        baseGeo.copy(obj.children[0].geometry);
        deformedGeo.copy(obj.children[0].geometry);
        targetGeo.copy(obj.children[0].geometry);
        // baseMesh = new THREE.Points(targetGeo, material);
        modelGui.setValue(baseGeo.attributes.position.count.toString());

        updateModel();
        baseMesh = new THREE.Points(targetGeo, material);
        // baseMesh.position.y = -10; 
        console.log(baseMesh);
        // meshColider = new THREE.Mesh(baseGeo, collideMat);
        // console.log(mesh.geometry);
        scene.add(baseMesh)
        // scene.add(meshColider)

    
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
        console.error("loading obj went wrong, ", err)
    })
}
LoadModel('assets/mamut.obj');

var light = new THREE.PointLight(0xFFFFFF, 1, 1000)
light.position.set(0,0,0);
scene.add(light);

var light = new THREE.PointLight(0xFFFFFF, 2, 1000)
light.position.set(0,0,25);
scene.add(light);

const stats = Stats()
document.body.appendChild(stats.dom)

const input = document.getElementById('inputFile');
input.addEventListener('change', (event) => {
    var tmppath = URL.createObjectURL(event.target.files[0]);
    // console.log(tmppath);
    loadingVal = 0;
    isLoaded = false;
    LoadModel(tmppath);
});



// const geometrySphere = new THREE.SphereGeometry(0.1, 8, 8 );
// const mat = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
// const sphere = new THREE.Mesh( geometrySphere, mat );
// sphere.position.x =  5;
// scene.add( sphere );

// mouseVec.set(5,0,0);
const updateMouse = () => {
    let distX = mouse.x - mouse.cursorX;
    let distY = mouse.y - mouse.cursorY;
    const distSpeed = Math.sqrt(distX * distX + distY * distY);

    mouse.cursorX = mouse.cursorX + (distX * mouse.speed);
    mouse.cursorY = mouse.cursorY + (distY * mouse.speed);

    cursor.style.left = mouse.cursorX + "px";
    cursor.style.top = mouse.cursorY + "px";
    cursor.style.width = distSpeed / 10 + mouse.size + "px";
    cursor.style.height = distSpeed / 10 + mouse.size + "px";
    // console.log(distSpeed);
    
}

const pointDeforminig = (targetGeo, baseGeo, deformedGeo, point , amp = 1, ferq = 1, speed = 0.001) => {
    const targetVerts = targetGeo.attributes.position;
    const baseVerts = baseGeo.attributes.position;
    const deformedVerts = deformedGeo.attributes.position;

    let x0, y0, z0, index ,ix ,iy, iz, value, x1, y1, z1;
    index = 0;
    const t = (Date.now() * speed) ;
    const size = 2; 
    for(let i = 0; i < targetVerts.count; i++){
        ix = index ++;
        iy = index ++;
        iz = index ++;
        const p = new THREE.Vector3(targetVerts.array[ix], targetVerts.array[iy], targetVerts.array[iz]);
        const dist = Math.abs(p.distanceTo(point));

        x0 = baseVerts.array[ix];
        y0 = baseVerts.array[iy];
        z0 = baseVerts.array[iz];
        const n = noise.perlin3((x0 + t) / ferq, (y0 + t) / ferq, (z0 + t) / ferq) * amp;
        if(dist < deform.radius){
            x1 = deformedVerts.array[ix];
            y1 = deformedVerts.array[iy];
            z1 = deformedVerts.array[iz];
            
            value = ( deform.radius - dist) /  deform.radius;
            
            targetVerts.array[ix] = x0 * (1 - value) + value * x1 + n;
            targetVerts.array[iy] = y0 * (1 - value) + value * y1 + n;
            targetVerts.array[iz] = z0 * (1 - value) + value * z1 + n;
        }
        else{
            targetVerts.array[ix] = x0 + n;
            targetVerts.array[iy] = y0 + n;
            targetVerts.array[iz] = z0 + n;
        }
       
    }
    targetGeo.attributes.position.needsUpdate = true;
    
}


var render = function() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    stats.update()
    controls.update();
    updateMouse();
    // sphere.position.set(mouseVec.x,mouseVec.y,mouseVec.z);

    if(isLoaded){
        // baseMesh.rotation.y += 0.005;
    
        pointDeforminig(targetGeo, baseGeo, deformedGeo, mouseVec, noiseAnim.amp, noiseAnim.ferq, noiseAnim.speed);
        
        // baseMesh.geometry.attributes.position.needsUpdate = true;
        // console.log(value);
        
    }
   

    
}
function onMouseClick(event) {
    // console.log("click");
    // isExplode = true;
    // exploding = true;
}
function onMouseMove(event) {
    event.preventDefault();
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    // mouseRate = 0;
    // mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    // mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    // targetMouseVec.set(mouse.x, mouse.y, 0.5);
    // targetMouseVec.unproject( camera );
    // targetMouseVec.sub( camera.position ).normalize();
    
    const mx = ( mouse.cursorX / window.innerWidth ) * 2 - 1;
    const my = - (  mouse.cursorY / window.innerHeight ) * 2 + 1;
    
    planeNormal.copy(camera.position).normalize();
    plane.setFromNormalAndCoplanarPoint(planeNormal, scene.position);
    raycaster.setFromCamera({x : mx, y: my}, camera);
    raycaster.ray.intersectPlane(plane, mouseVec);

    // console.log(targetMouseVec);

    // raycaster.setFromCamera(mouse, camera);
    // var intersects = raycaster.intersectObjects(scene.children, true);
    // // console.log(intersects);
    // if(intersects.length > 0)
    //     for (var i = 0; i < intersects.length; i++) {
    //         if(intersects[i].object == meshColider){
    //             targetMouseVec.set(intersects[i].point.x,intersects[i].point.y,intersects[i].point.z);
    //             break;
    //         }
           
    //     }
    // else{
    //     // targetMouseVec.set(100,100,100);
    //     planeNormal.copy(camera.position).normalize();
    //     plane.setFromNormalAndCoplanarPoint(planeNormal, scene.position);
    //     // raycaster.setFromCamera(mouse, camera);
    //     raycaster.ray.intersectPlane(plane, targetMouseVec);
    // }
}




render();

