
let prog;
const setup = function(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0.0, 0.0, canvas.width, canvas.height);
}
const render = function() {
    requestAnimationFrame(render);
    //console.log("render");
    gl.useProgram(prog);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
};

function loadShader(pathArray){
    let promises = pathArray.map((path) =>{
        return fetch(path).then((response) => {return response.text();});
    } )
    return Promise.all(promises);
}

function load(){
    return new Promise((resolve) =>{
        loadShader( ['shaders/shader.vert', 'shaders/shader.frag'])
        .then((shder_source) => {
            prog = createProgram(gl, shder_source[0], shder_source[1]);
        });
        resolve();
    });
}

const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl2'); 
load().then(() => {
    setup();
    render();
})
