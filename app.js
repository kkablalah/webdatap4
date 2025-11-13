/*const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const port = 3100;

app.use(cors());

//Host, user, password database
const connection = mysql.createConnection({
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASSWORD,
    database: process.env.DBDATABASE
});*/


// Chart 1 - Top Genre by Country – World Map
const RADIUS = 5, globeCanvas = document.getElementById('globe');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(48, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0,0,15);

const renderer = new THREE.WebGLRenderer({canvas: globeCanvas, antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);

scene.add(new THREE.AmbientLight(0xffffff, 0.9));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
dirLight.position.set(10,10,10);
scene.add(dirLight);

const globe = new THREE.Mesh(
    new THREE.SphereGeometry(RADIUS, 64, 64),
    new THREE.MeshPhongMaterial({ color: 0x177ccb, shininess: 75 })
);
scene.add(globe);

// --- Universal drag-to-spin (virtual trackball) ---
let dragging = false, lastX = 0, lastY = 0, lastQuat = new THREE.Quaternion(), velocityQ = new THREE.Quaternion(), inertia = false, lastTime = 0;

function getTrackballVector(screenX, screenY) {
    const rect = globeCanvas.getBoundingClientRect();
    // Center coords [-1,1]
    let x = 2*(screenX - rect.left)/rect.width - 1;
    let y = 1 - 2*(screenY - rect.top)/rect.height;
    const z2 = 1 - x*x - y*y;
    const z = z2 > 0 ? Math.sqrt(z2) : 0;
    return new THREE.Vector3(x, y, z).normalize();
}

globeCanvas.addEventListener('mousedown', e => {
    dragging = true; inertia = false;
    lastX = e.clientX; lastY = e.clientY;
    lastQuat.copy(globe.quaternion);
});
window.addEventListener('mousemove', e => {
    if (!dragging) return;
    const vFrom = getTrackballVector(lastX, lastY);
    const vTo = getTrackballVector(e.clientX, e.clientY);
    const axis = new THREE.Vector3().crossVectors(vFrom, vTo).normalize();
    if (axis.lengthSq() < 1e-8) return;
    const angle = Math.acos(Math.max(-1, Math.min(1, vFrom.dot(vTo))));
    const q = new THREE.Quaternion().setFromAxisAngle(axis, angle);
    globe.quaternion.copy(lastQuat).premultiply(q);
    velocityQ.copy(q);
});
window.addEventListener('mouseup', e => {
    dragging = false;
    inertia = true;
    lastTime = performance.now();
});
globeCanvas.addEventListener('mouseleave', e => { dragging = false; inertia = false; });

function updateInertia() {
    if (inertia && velocityQ) {
        // decay spin
        velocityQ.slerp(new THREE.Quaternion(), 0.08); // friction
        globe.quaternion.multiply(velocityQ);
        if (velocityQ.angleTo(new THREE.Quaternion()) < 0.001) inertia = false;
    }
}

// --- GeoJSON country rendering (light green fill!)
function latLon3D(lat, lon, r) {
    const phi = (90-lat) * Math.PI/180, theta = (lon+180) * Math.PI/180;
    return new THREE.Vector3(
        -r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
    );
}
fetch('custom.geo.json').then(r=>r.json()).then(geojson=>{
    geojson.features.forEach(f=>{
        let polys = f.geometry.type==='Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
        polys.flat().forEach(ring=>{
            const pts3 = ring.map(([lon, lat])=>latLon3D(lat,lon,RADIUS+0.03));
            if(pts3.length>1) globe.add(new THREE.Line(
                new THREE.BufferGeometry().setFromPoints(pts3),
                new THREE.LineBasicMaterial({color:0x22713f, linewidth:2})
            ));
            if(pts3.length>2){
                const shape = new THREE.Shape(ring.map(([lon,lat])=>{
                    const v = latLon3D(lat,lon,RADIUS+0.031); return new THREE.Vector2(v.x,v.y)
                }));
                const mesh = new THREE.Mesh(
                    new THREE.ShapeGeometry(shape),
                    new THREE.MeshBasicMaterial({color:0x67fd72, opacity:0.85, transparent:true, side:THREE.DoubleSide})
                );
                globe.add(mesh);
            }
        });
    });
});

window.addEventListener('resize', ()=>{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
(function animate() {
    requestAnimationFrame(animate);
    updateInertia();
    renderer.render(scene,camera);
})();


//Chart 2 - Hvilke genre dominere globalt?
// Hent data fra JSON-filen
fetch("globalChart.json")
    .then(response => response.json()) // lav teksten om til data
    .then(data => {
        data.sort((a, b) => b.PercentShare - a.PercentShare);

        // Tag de 4 største
        const top4 = data.slice(0, 4);

        // Læg resten sammen som "Other"
        const other = data.slice(4).reduce((sum, item) => sum + item.PercentShare, 0);

        // Lav labels og værdier
        const labels = [...top4.map(item => item.Genre), "Other"];
        const values = [...top4.map(item => item.PercentShare), other];

        // Lav pie chartet
        new Chart(document.getElementById("globalChart"), {
            type: "pie",
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: ["#5C6BC0", "#FBC02D", "#81C784", "#4DB6AC", "#FF8A65"]
                }]
            }
        });
});

// Chart 3 - Top 1 Artist & Songs
fetch('querie3.json')
    .then(res => res.json())
    .then(data => {

        console.log(data)

        const labels = data.map(item => item.Artist);
        const sales = data.map(item => item.TotalSales);

        const ctx = document.getElementById("artistChart").getContext('2d');
        const myChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total Sales',
                    data: sales,
                    backgroundColor: ["#5C6BC0", "#FBC02D", "#81C784"],
                    borderColor: 'rgba(75,192,192,1)',
                    borderWidth: 1,
                }]
            }
        });
    });

// Chart 4 - Genre Growth Popularity
fetch('querie4.json')
    .then(response => {
        if (!response.ok) throw new Error('HTTP error ' + response.status);
        return response.json();
    })
    .then(data => {
        console.log('Data loaded:', data);

        // Labels = årstal (fra første objekt)
        const labels = Object.keys(data[0]).filter(key => /^\d{4}$/.test(key));

        // Datasets = ét sæt pr. genre
        const datasets = data.map(item => ({
            label: item.Genre,
            data: labels.map(year => item[year]),
            backgroundColor: ["#BA68C8", "#FBC02D", "#FF8A65"],
            borderColor: ["#BA68C8", "#FBC02D", "#FF8A65"],
            fill: false,
            tension: 0.3
        }));

        //Tegn grafen
        const ctx = document.getElementById('growthChart');
        new Chart(ctx, {
            type: 'line',
            data: { labels, datasets },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Development in sold tracks per genre (2009–2013) for the three genres that have evolved the most'
                    },
                    legend: { position: 'bottom' }
                },
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Solgte tracks' } }
                }
            }
        });
    })
    .catch(error => console.error('Error fetching JSON:', error));

