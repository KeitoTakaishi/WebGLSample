
const vertStr = `
precision highp float;
precision highp int;

attribute vec3 position;
attribute vec2 uv;
attribute vec3 normal;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

varying vec3 vNormal;
varying vec2 vUv;

void main(){
  vNormal = normal;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;

const fragStr = `
precision highp float;
precision highp int;

uniform sampler2D uTexture;

varying vec3 vNormal;
varying vec2 vUv;

void main(){
    vec3 col = texture2D(uTexture, vUv).rgb;
    float black = (col.r + col.g + col.b)/3.0;
    gl_FragColor = vec4(black, black, black, 1.0);
}
`;

const fragStr2 = `
    precision highp float;
    precision highp int;

    uniform sampler2D uTexture;
    uniform vec2 uSize;

    varying vec2 vUv;

    void main(){
        vec3 mainColor = texture2D(uTexture, vUv).rgb;
        float main = mainColor.r;

        float mainDx =  (texture2D(uTexture, vUv + vec2(1.0/uSize.x, 0.0)).r - main + 1.0)/2.0;
        float mainDy =  (texture2D(uTexture, vUv + vec2(0.0, 1.0/uSize.y)).r - main + 1.0)/2.0;

        gl_FragColor = vec4(mainDx, mainDy, 0.0, 1.0);
    }
`;

const fragmentShaderVel = `
    uniform sampler2D divergentTex;
    uniform vec2 uSize;
    uniform float uTime;

    float rand(vec2 co){
        return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
    }

    void main(){
        vec4 vel;
        vec2 uv = gl_FragCoord.xy / resolution.xy;

        vec4 pos = texture2D(texturePosition, uv);
        if(pos.w == pos.z){
            vel.z = pos.x;
            vel.w = pos.y;
            vel.xy = vec2(0.0);
        }else{
            vec2 relPos = vec2( ( pos.x + uSize.x/2.)/uSize.x, (pos.y + uSize.y/2.)/uSize.y);
            vel = texture2D(textureVelocity, uv);
            vec2 acl = (texture2D(divergentTex, relPos).xy - vec2(0.5)) * 1.2 + vec2(0., -0.05) - vel.xy * 0.5 * pos.w/pos.z;

            vel = vel + vec4(acl, 0.0, 0.0);
        }

        gl_FragColor = vec4(vel.xy , vel.zw);
    }
`;

const fragmentShaderPos = `
    uniform vec2 uSize;
    uniform float uTime;

    float rand(vec2 co){
        return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
    }

    void main(){
         vec2 uv = gl_FragCoord.xy / resolution.xy;
         vec4 pos = texture2D(texturePosition, uv);
         vec3 vel = texture2D(textureVelocity, uv).xyz;

         pos.w = pos.w - 1./60.;

         if(pos.w < 0.0){
            pos.w = pos.z;

            pos.x = uSize.x * (rand(uv + vec2(uTime, 0.0)) - 0.5);
            pos.y = uSize.y * (rand(vec2(uv.y, uv.x)+ vec2(0.0, uTime)) - 0.5);
         }

         gl_FragColor = vec4(pos) + vec4(vel.xy, 0.0, 0.0);
    }
`;

const vertParticleStr = `
precision highp float;
precision highp int;

attribute vec3 position;
attribute vec2 uv;
attribute vec3 normal;
attribute vec2 customUv;
attribute float size;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform sampler2D texturePosition;
uniform sampler2D textureVelocity;
uniform sampler2D baseTexture;
uniform float uSize;

varying vec3 vNormal;
varying vec2 vUv;
varying vec4 vColor;
varying float vSize;

void main(){
    vUv = uv;
    vec4 pos = texture2D(texturePosition, customUv);
    vec2 oriPos = texture2D(textureVelocity, customUv).zw ;
    vec2 relUv = vec2( (oriPos.x + uSize * 0.5)/uSize, (oriPos.y + uSize * 0.5)/uSize );
    vColor.rgb = texture2D( baseTexture, relUv).rgb; // * mix(0.5, 1.0, pos.w/pos.z);
    if(pos.w == pos.z) {vColor.a = 0.0;
    }else{
        vColor.a = 1.0; //(1.0 - pos.w/pos.z);
    }

    vSize = size;
    // this._mainTexture
    gl_Position = projectionMatrix * modelViewMatrix * vec4( pos.rgb + vec3(uv - vec2(0.5), 0.0) * size * pos.w/pos.z, 1. );
}
`;

const fragParticleStr = `
precision highp float;
precision highp int;

varying vec2 vUv;
varying vec4 vColor;
varying float vSize;

void main(){
    float dis = distance(vUv, vec2(0.5)) / 0.5;
    float maxAlpha = clamp(100. /vSize, 0.0, 1.0);

    gl_FragColor = vec4(vColor.rgb, clamp( step(dis, 0.5), 0.0, 1.0) * maxAlpha * vColor.a );
}
`;

const fragSwapStr = `
precision highp float;
precision highp int;

varying vec2 vUv;

uniform sampler2D curTexture;
uniform sampler2D prevTexture;
uniform float uOpacity;

float blendAdd(float base, float blend) {
	return min(base+blend,1.0);
}

vec3 blendAdd(vec3 base, vec3 blend) {
	return min(base+blend,vec3(1.0));
}

vec3 blendAdd(vec3 base, vec3 blend, float opacity) {
	return (blendAdd(base, blend) * opacity + base * (1.0 - opacity));
}

vec3 blendNormal(vec3 base, vec3 blend) {
	return blend;
}

vec3 blendNormal(vec3 base, vec3 blend, float opacity) {
	return (blendNormal(base, blend) * opacity + base * (1.0 - opacity));
}

float blendOverlay(float base, float blend) {
	return base<0.5?(2.0*base*blend):(1.0-2.0*(1.0-base)*(1.0-blend));
}

vec3 blendOverlay(vec3 base, vec3 blend) {
	return vec3(blendOverlay(base.r,blend.r),blendOverlay(base.g,blend.g),blendOverlay(base.b,blend.b));
}

vec3 blendOverlay(vec3 base, vec3 blend, float opacity) {
	return (blendOverlay(base, blend) * opacity + base * (1.0 - opacity));
}

void main(){
    vec4 curColor = texture2D(curTexture, vUv).rgba;
    vec4 prevColor = texture2D(prevTexture, vUv).rgba;

    vec3 outColor = mix(prevColor.rgb, curColor.rgb, curColor.a); // , curColor.a );
    gl_FragColor = vec4(outColor, 1.0);
}
`;

class App {
    constructor(params){
        this.params = params || {};

        this._curActiveNum = params.curActiveNum;
        this._textures = params.textures;
        this._mainTexture = this._textures[this._curActiveNum];
        this._isDebug = params.isDebug;

        this.camera = new THREE.OrthographicCamera(-window.innerWidth / 2, window.innerWidth / 2, window.innerHeight / 2, -window.innerHeight / 2, 1, 10000);
        this.camera.position.z = 100;

        this._imgWid = 512;
        this._imgHig = 512;

        var scale = 1/2;
        let glParams = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            stencilBuffer: false
        };
        this._blackAndWhiteRenderTarget = new THREE.WebGLRenderTarget(this._mainTexture.image.width * scale, this._mainTexture.image.height * scale, glParams);
        this._derivativeRenderTarget = new THREE.WebGLRenderTarget(this._mainTexture.image.width * scale, this._mainTexture.image.height * scale, glParams);

        this._particleRenderTarget =  new THREE.WebGLRenderTarget(this._imgWid, this._imgHig, glParams);

        this.minCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 10000);
        this.minCamera.position.z = 100;

        this.scene = new THREE.Scene();

        // this.mesh = this.createMesh();
        // this.scene.add(this.mesh);

        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });

        this._outputRenderTarget = {front: new THREE.WebGLRenderTarget(this._imgWid, this._imgHig, glParams), back: new THREE.WebGLRenderTarget(this._imgWid, this._imgHig, glParams)};
        this._outputRenderTarget.read = this._outputRenderTarget.front;
        this._outputRenderTarget.out  = this._outputRenderTarget.back;

        this._createMesh();
        this._createParticles();


        this.dom = this.renderer.domElement;

        if(this.params.isDebug){
            this.stats = new Stats();
            document.body.appendChild(this.stats.dom);
            this._addGui();
        }

        this.clock = new THREE.Clock();
        // this.control = new OrbitControls(this.camera);

        this._inc = 1;

        this.resize();
    }
    _swap(){
        if(this._outputRenderTarget.read === this._outputRenderTarget.front){
            this._outputRenderTarget.read =  this._outputRenderTarget.back;
            this._outputRenderTarget.out  = this._outputRenderTarget.front;
        }else{
            this._outputRenderTarget.read =  this._outputRenderTarget.front;
            this._outputRenderTarget.out  = this._outputRenderTarget.back;
        }
    }
    _addGui(){
        this.gui = new dat.GUI();
        this.playAndStopGui = this.gui.add(this, '_playAndStop').name('pause');
        // this.gui.add(this.mesh.material.uniforms.uDistance, 'value', 0, 1200).name('uDistance');
    }

    _createParticles(){
        this._gpuComputeSize =64;
        this._gpuCompute = new GPUComputationRenderer( this._gpuComputeSize, this._gpuComputeSize, this.renderer );
        var randomArr = new Float32Array( this._gpuComputeSize * this._gpuComputeSize * 4 );
        var randomArr2 = new Float32Array( this._gpuComputeSize * this._gpuComputeSize * 4 );
        let minVal = -this._imgWid/2; let maxVal = this._imgWid/2;

        for(var ii = 0; ii < this._gpuComputeSize * this._gpuComputeSize; ii++){
            randomArr[4 * ii]     = THREE.Math.randFloat(minVal, maxVal);
            randomArr[4 * ii + 1] = THREE.Math.randFloat(minVal, maxVal);
            randomArr[4 * ii + 2] = THREE.Math.randFloat(1, 8);
            randomArr[4 * ii + 3] = THREE.Math.randFloat(0, randomArr[4 * ii + 2]);
        }

        for(var ii = 0; ii < this._gpuComputeSize * this._gpuComputeSize; ii++){
            randomArr2[4 * ii]     = 0;
            randomArr2[4 * ii + 1] = 0;
            randomArr2[4 * ii + 2] = THREE.Math.randFloat(minVal, maxVal);//+ THREE.Math.randFloat(-100, 100);
            randomArr2[4 * ii + 3] = THREE.Math.randFloat(minVal, maxVal);
        }

        this._pos0 = this._gpuCompute.createCustomTexture(randomArr);
        this._vel0 = this._gpuCompute.createCustomTexture(randomArr2);

        this._velVar = this._gpuCompute.addVariable( 'textureVelocity', fragmentShaderVel, this._vel0 );
        this._posVar = this._gpuCompute.addVariable( 'texturePosition', fragmentShaderPos, this._pos0 );

        this._velVar.material.uniforms.divergentTex = {value: this._derivativeRenderTarget.texture};
        this._velVar.material.uniforms.uSize = {value: new THREE.Vector2(this._imgWid, this._imgHig)};
        this._velVar.material.uniforms.uTime = {value: 0};

        this._posVar.material.uniforms.uSize = {value: new THREE.Vector2(this._imgWid, this._imgHig)};
        this._posVar.material.uniforms.uTime = {value: 0};

        this._gpuCompute.setVariableDependencies( this._velVar, [ this._velVar, this._posVar ] );
        this._gpuCompute.setVariableDependencies( this._posVar, [ this._velVar, this._posVar ] );

        let error =this._gpuCompute.init();
        if( error !== null){
            console.error(error);
        }

        let mat = new THREE.RawShaderMaterial({
            uniforms: {
                texturePosition: {value: null},
                textureVelocity: {value: null},
                baseTexture: {value: this._mainTexture},
                uSize : {value: this._imgWid}
            },
            vertexShader: vertParticleStr,
            fragmentShader: fragParticleStr,
            side: THREE.DoubleSide,
            depthTest: false,
            transparent: true
        });

        this._particleMesh = new THREE.Mesh(this._createGeometry(), mat );; //new THREE.Mesh(new THREE.PlaneGeometry(512  , 512  ), mat );
        this._particleScene = new THREE.Scene();
        this._particleScene.add(this._particleMesh);
        this._particleCamera = new THREE.OrthographicCamera(-this._imgWid/2, this._imgWid/2, this._imgHig/2, -this._imgHig/2, 1, 100000);
        this._particleCamera.position.z = 100;


    }

    _createMesh(){
        // console.log(this._mainTexture);

        let image = this._mainTexture.image;

        let plangeGeometry = new THREE.PlaneGeometry(2, 2);
        let blackMat = new THREE.RawShaderMaterial({
            uniforms: {
                uTexture: {value: this._mainTexture}
            },
            vertexShader: vertStr,
            fragmentShader: fragStr,
        });

        let derivativeMat =new THREE.RawShaderMaterial({
            uniforms: {
                uTexture: {value: this._blackAndWhiteRenderTarget.texture},
                uSize : {value: new THREE.Vector2(256, 256)}
            },
            vertexShader: vertStr,
            fragmentShader: fragStr2,

        });

        this.blackMatMesh = new THREE.Mesh( plangeGeometry, blackMat);
        this.blackScene = new THREE.Scene();
        this.blackScene.add(this.blackMatMesh);
        this.renderer.render(this.blackScene, this.minCamera, this._blackAndWhiteRenderTarget);

        this._derivativeMesh = new THREE.Mesh( plangeGeometry, derivativeMat);
        this._derivativeScene = new THREE.Scene();
        this._derivativeScene.add(this._derivativeMesh);
        this.renderer.render(this._derivativeScene, this.minCamera, this._derivativeRenderTarget);

        if(this._isDebug){
            let scale = 0.25;
            let size = image.width * scale;
            let planeGeometry = new THREE.PlaneGeometry( size, size);
            let _debugMat0 = new THREE.MeshBasicMaterial({map: this._derivativeRenderTarget.texture});
            let _debugMesh0 = new THREE.Mesh(planeGeometry, _debugMat0);

            this.scene.add(_debugMesh0);
            var xPos = -window.innerWidth/2 + size/2 + 40;
            var yPos = window.innerWidth/2 - size/2 - 40;

            _debugMesh0.position.x = xPos; _debugMesh0.position.y = yPos;
        }

        var geo = new THREE.PlaneGeometry(1, 1);
        var mat = new THREE.MeshBasicMaterial({map: this._outputRenderTarget.read.texture, transparent: true, opacity: 1.0 });
        this._mainMesh = new THREE.Mesh(geo, mat);
        this._meshSize =  Math.min(this._imgWid, Math.min(window.innerWidth, window.innerHeight) * 0.9 );
        this._mainMesh.scale.set(this._meshSize, this._meshSize, 1);
        this.scene.add(this._mainMesh);



        this._outputMat = new THREE.RawShaderMaterial({
            uniforms: {
                curTexture: {value: this._particleRenderTarget.texture},
                uOpacity: {value: 1},
                prevTexture: {value: this._outputRenderTarget.read.texture }
            },
            vertexShader: vertStr,
            fragmentShader: fragSwapStr,
            transparent: true
        });

        this._outputMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 2),
            this._outputMat
        );
        this._outputScene = new THREE.Scene();
        this._outputScene.add(this._outputMesh);
    }

    _createGeometry (){
        let particleNum = this._gpuComputeSize * this._gpuComputeSize;

        let geometry = new THREE.BufferGeometry();
        let positions = new Float32Array( particleNum * 3 * 4);
        let indexArray = [];
        let uvs = new Float32Array(particleNum * 2 * 4);
        let sizes = new Float32Array(particleNum * 1 * 4);
        let customUvs = new Float32Array(particleNum * 2 * 4);

        var c = 0;
        for(var ii = 0; ii < particleNum; ii++){
            let xx = 0;THREE.Math.randFloat(-500, 500);
            let yy = THREE.Math.randFloat(-500, 500);
            let zz = 0; //THREE.Math.randFloat(0, 1000);

            var size = THREE.Math.randFloat(2, 20);

            for(var jj = 0; jj < 4; jj++){

                positions[4 * 3 * ii +3 * jj+ 1] = yy;
                positions[4 * 3 * ii +3 * jj+ 2] = zz;

                uvs[4 * 2 * ii + 2 * jj] = parseInt(jj /2);
                uvs[4 * 2 * ii + 2 * jj + 1] = jj % 2;

                sizes[4 * 1 * ii + 1 * jj] = size;

                customUvs[4 * 2 * ii + 2 * jj] = parseInt(ii % this._gpuComputeSize) / this._gpuComputeSize;
                customUvs[4 * 2 * ii + 2 * jj + 1] = parseInt(ii / this._gpuComputeSize) / this._gpuComputeSize;
            }

            indexArray[c++] = 4 * ii + 0;
            indexArray[c++] = 4 * ii + 1;
            indexArray[c++] = 4 * ii + 2;
            indexArray[c++] = 4 * ii + 2;
            indexArray[c++] = 4 * ii + 1;
            indexArray[c++] = 4 * ii + 3;
        }



        indexArray = new Uint32Array(indexArray);

        geometry.addAttribute('position', new THREE.BufferAttribute( positions, 3 ) );
        geometry.addAttribute('uv', new THREE.BufferAttribute( uvs, 2 ) );
        geometry.addAttribute('customUv', new THREE.BufferAttribute( customUvs, 2 ) );
        geometry.addAttribute('size', new THREE.BufferAttribute( sizes, 1 ) );

        geometry.setIndex(new THREE.BufferAttribute(indexArray, 1));


        return geometry;
    }


    animateIn(){
        this.isLoop = true;
        TweenMax.ticker.addEventListener('tick', this.loop, this);
    }

    loop(){
        this._posVar.material.uniforms.uTime.value = this._posVar.material.uniforms.uTime.value + 1/60;
        this._velVar.material.uniforms.uTime.value = this._posVar.material.uniforms.uTime.value;

        this._gpuCompute.compute();

        this._particleMesh.material.uniforms.texturePosition.value = this._gpuCompute.getCurrentRenderTarget( this._posVar ).texture;
        this._particleMesh.material.uniforms.textureVelocity.value = this._gpuCompute.getCurrentRenderTarget( this._velVar ).texture;

        this.renderer.render(this._particleScene, this._particleCamera, this._particleRenderTarget);
        this._outputMat.uniforms.prevTexture.value = this._outputRenderTarget.read.texture;
        this.renderer.render(this._outputScene, this.minCamera, this._outputRenderTarget.out);
        this._swap();

        this._mainMesh.material.map = this._outputRenderTarget.read.texture;
        this.renderer.render(this.scene, this.camera);
        if(this.stats) this.stats.update();

    }

    animateOut(){
        TweenMax.ticker.removeEventListener('tick', this.loop, this);
    }

    onMouseMove(mouse){

    }

    onKeyDown(ev){
        switch(ev.which){
            case 27:
                this._playAndStop();
                break;
        }
    }

    _playAndStop(){
        this.isLoop = !this.isLoop;
        if(this.isLoop){
            TweenMax.ticker.addEventListener('tick', this.loop, this);
            this.playAndStopGui.name('pause');
        }else{
            TweenMax.ticker.removeEventListener('tick', this.loop, this);
            this.playAndStopGui.name('play');
        }
    }


    resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    destroy(){

    }
    updateTexture(num){
        this._mainTexture = this._textures[num];

        this.blackMatMesh.material.uniforms.uTexture.value = this._mainTexture;
        this.renderer.render(this.blackScene, this.minCamera, this._blackAndWhiteRenderTarget);
        this.renderer.render(this._derivativeScene, this.minCamera, this._derivativeRenderTarget);
        this._velVar.material.uniforms.divergentTex = {value: this._derivativeRenderTarget.texture};
        this._particleMesh.material.uniforms.baseTexture.value = this._mainTexture;
    }

}

let app;
let texture0, texture1, texture2;
var cnt = 0;
let base = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/13842/';
var url0 = 'sam9.png';
var url1 = 'sam4.png';
var url2 = 'sam2.png';
var lists = [];
var images = [];
let curActiveNum = 0;

(() =>{
    initLoad();
})();

function initLoad(){
    var loader = new THREE.TextureLoader();
	loader.crossOrigin = 'anonymous';
	[url0, url1, url2].forEach((url)=>{
		let img = new Image();
		img.src = base + url;
		img.crossOrigin = "anonymous";
		img.onload = loadImg;
		images.push(img)
	});
}

function loadImg(){
	cnt++;
	if(cnt === 3){
		texture0 = new THREE.Texture(images[0]);
		texture0.needsUpdate = true;
		texture1 = new THREE.Texture(images[1]);
		texture1.needsUpdate = true;
		texture2 = new THREE.Texture(images[2]);
		texture2.needsUpdate = true;
		onload();
	}
}

function onload(){
    var parent = document.createElement('div');
    parent.style.zIndex = '9999';
    parent.style.position = 'absolute';
    parent.style.top = '10px';
    parent.style.left = '10px';
    document.body.appendChild(parent);

    var urls = [url0, url1, url2];
    for(var ii = 0; ii < 3; ii++){
        var div = document.createElement('div');
        div.style.marginBottom = '20px';

        var image = new Image();
        image.src = base + urls[ii];
        image.width = 64;
        image.height = 64;
        div.appendChild(image);
        parent.appendChild(div);

        div.dataset.index = ii;
        div.addEventListener('click', clickHandler);

        if(ii === 0){
            div.style.opacity = 1;
        }else{
            div.style.opacity = 0.4;
            div.style.cursor = 'pointer';
        }

        lists.push(div);
    }

    init();
    start();


}

function clickHandler(ev){
    let activeNum = parseInt(ev.currentTarget.dataset.index);
    if(activeNum === curActiveNum) return;
    curActiveNum = activeNum;

    for(var ii = 0; ii < 3; ii++){
        if(ii == activeNum) {
            lists[ii].style.opacity = 1;
            lists[ii].style.cursor = 'default';
        }else{
            lists[ii].style.opacity = 0.4;
            lists[ii].style.cursor = 'pointer';
        }
    }


    app.updateTexture(curActiveNum);
}

function init(){
    app = new App({
        mainTexture : texture1,
        textures : [texture0, texture1, texture2],
        curActiveNum: curActiveNum,
        isDebug: false
    });

    document.body.appendChild(app.dom);
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    // document.addEventListener('click', onDocumentClick, false);
}

function start(){
    app.animateIn();
}


function onDocumentMouseMove(event){
    let mouseX = ( event.clientX / window.innerWidth ) * 2 - 1;
    let mouseY = -( event.clientY / window.innerHeight ) * 2 + 1;

    if(app) app.onMouseMove({x: mouseX, y: mouseY});
}

function onDocumentClick(event){
    let mouseX = ( event.clientX / window.innerWidth ) * 2 - 1;
    let mouseY = -( event.clientY / window.innerHeight ) * 2 + 1;

    if(app) app.clickHandler({x: mouseX, y: mouseY});
}

window.addEventListener('resize', function(){
    if(app) app.resize();
});

window.addEventListener('keydown', function(ev){
    if(app) app.onKeyDown(ev);
});

function GPUComputationRenderer( sizeX, sizeY, renderer ) {

	this.variables = [];

	this.currentTextureIndex = 0;

	var scene = new THREE.Scene();

	var camera = new THREE.Camera();
	camera.position.z = 1;

	var passThruUniforms = {
		texture: { value: null }
	};

	var passThruShader = createShaderMaterial( getPassThroughFragmentShader(), passThruUniforms );

	var mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), passThruShader );
	scene.add( mesh );


	this.addVariable = function( variableName, computeFragmentShader, initialValueTexture ) {

		var material = this.createShaderMaterial( computeFragmentShader );

		var variable = {
			name: variableName,
			initialValueTexture: initialValueTexture,
			material: material,
			dependencies: null,
			renderTargets: [],
			wrapS: null,
			wrapT: null,
			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter
		};

		this.variables.push( variable );

		return variable;

	};

	this.setVariableDependencies = function( variable, dependencies ) {

		variable.dependencies = dependencies;

	};

	this.init = function() {

		if ( ! renderer.extensions.get( "OES_texture_float" ) ) {

			return "No OES_texture_float support for float textures.";

		}

		if ( renderer.capabilities.maxVertexTextures === 0 ) {

			return "No support for vertex shader textures.";

		}

		for ( var i = 0; i < this.variables.length; i++ ) {

			var variable = this.variables[ i ];

			// Creates rendertargets and initialize them with input texture
			variable.renderTargets[ 0 ] = this.createRenderTarget( sizeX, sizeY, variable.wrapS, variable.wrapT, variable.minFilter, variable.magFilter );
			variable.renderTargets[ 1 ] = this.createRenderTarget( sizeX, sizeY, variable.wrapS, variable.wrapT, variable.minFilter, variable.magFilter );
			this.renderTexture( variable.initialValueTexture, variable.renderTargets[ 0 ] );
			this.renderTexture( variable.initialValueTexture, variable.renderTargets[ 1 ] );

			// Adds dependencies uniforms to the ShaderMaterial
			var material = variable.material;
			var uniforms = material.uniforms;
			if ( variable.dependencies !== null ) {

				for ( var d = 0; d < variable.dependencies.length; d++ ) {

					var depVar = variable.dependencies[ d ];

					if ( depVar.name !== variable.name ) {

						// Checks if variable exists
						var found = false;
						for ( var j = 0; j < this.variables.length; j++ ) {

							if ( depVar.name === this.variables[ j ].name ) {
								found = true;
								break;
							}

						}
						if ( ! found ) {
							return "Variable dependency not found. Variable=" + variable.name + ", dependency=" + depVar.name;
						}

					}

					uniforms[ depVar.name ] = { value: null };

					material.fragmentShader = "\nuniform sampler2D " + depVar.name + ";\n" + material.fragmentShader;

				}
			}
		}

		this.currentTextureIndex = 0;

		return null;

	};

	this.compute = function() {

		var currentTextureIndex = this.currentTextureIndex;
		var nextTextureIndex = this.currentTextureIndex === 0 ? 1 : 0;

		for ( var i = 0, il = this.variables.length; i < il; i++ ) {

			var variable = this.variables[ i ];

			// Sets texture dependencies uniforms
			if ( variable.dependencies !== null ) {

				var uniforms = variable.material.uniforms;
				for ( var d = 0, dl = variable.dependencies.length; d < dl; d++ ) {

					var depVar = variable.dependencies[ d ];

					uniforms[ depVar.name ].value = depVar.renderTargets[ currentTextureIndex ].texture;

				}

			}

			// Performs the computation for this variable
			this.doRenderTarget( variable.material, variable.renderTargets[ nextTextureIndex ] );

		}

		this.currentTextureIndex = nextTextureIndex;
	};

	this.getCurrentRenderTarget = function( variable ) {

		return variable.renderTargets[ this.currentTextureIndex ];

	};

	this.getAlternateRenderTarget = function( variable ) {

		return variable.renderTargets[ this.currentTextureIndex === 0 ? 1 : 0 ];

	};

	function addResolutionDefine( materialShader ) {

		materialShader.defines.resolution = 'vec2( ' + sizeX.toFixed( 1 ) + ', ' + sizeY.toFixed( 1 ) + " )";

	}
	this.addResolutionDefine = addResolutionDefine;


	// The following functions can be used to compute things manually

	function createShaderMaterial( computeFragmentShader, uniforms ) {

		uniforms = uniforms || {};

		var material = new THREE.ShaderMaterial( {
			uniforms: uniforms,
			vertexShader: getPassThroughVertexShader(),
			fragmentShader: computeFragmentShader
		} );

		addResolutionDefine( material );

		return material;
	}
	this.createShaderMaterial = createShaderMaterial;

	this.createRenderTarget = function( sizeXTexture, sizeYTexture, wrapS, wrapT, minFilter, magFilter ) {

		sizeXTexture = sizeXTexture || sizeX;
		sizeYTexture = sizeYTexture || sizeY;

		wrapS = wrapS || THREE.ClampToEdgeWrapping;
		wrapT = wrapT || THREE.ClampToEdgeWrapping;

		minFilter = minFilter || THREE.NearestFilter;
		magFilter = magFilter || THREE.NearestFilter;

		var renderTarget = new THREE.WebGLRenderTarget( sizeXTexture, sizeYTexture, {
			wrapS: wrapS,
			wrapT: wrapT,
			minFilter: minFilter,
			magFilter: magFilter,
			format: THREE.RGBAFormat,
			type: ( /(iPad|iPhone|iPod)/g.test( navigator.userAgent ) ) ? THREE.HalfFloatType : THREE.FloatType,
			stencilBuffer: false
		} );

		return renderTarget;

	};

    this.createTexture = function( sizeXTexture, sizeYTexture ) {

		sizeXTexture = sizeXTexture || sizeX;
		sizeYTexture = sizeYTexture || sizeY;

		var a = new Float32Array( sizeXTexture * sizeYTexture * 4 );
		var texture = new THREE.DataTexture( a, sizeX, sizeY, THREE.RGBAFormat, THREE.FloatType );
		texture.needsUpdate = true;

		return texture;

	};

    this.createRandTexture = function( sizeXTexture, sizeYTexture, minVal = 0, maxVal = 1) {

        sizeXTexture = sizeXTexture || sizeX;
        sizeYTexture = sizeYTexture || sizeY;

        var a = new Float32Array( sizeXTexture * sizeYTexture * 4 );
        for(var ii = 0; ii < sizeXTexture * sizeYTexture; ii++){
        	a[4 * ii]     = THREE.Math.randFloat(minVal, maxVal);
            a[4 * ii + 1] = THREE.Math.randFloat(minVal, maxVal);
            a[4 * ii + 2] = THREE.Math.randFloat(minVal, maxVal);
            a[4 * ii + 3] = THREE.Math.randFloat(minVal, maxVal);
		}
        var texture = new THREE.DataTexture( a, sizeX, sizeY, THREE.RGBAFormat, THREE.FloatType );
        texture.needsUpdate = true;

        return texture;

    };

    this.createCustomTexture = function( a, sizeXTexture, sizeYTexture) {

        sizeXTexture = sizeXTexture || sizeX;
        sizeYTexture = sizeYTexture || sizeY;

        var texture = new THREE.DataTexture( a, sizeX, sizeY, THREE.RGBAFormat, THREE.FloatType );
        texture.needsUpdate = true;

        return texture;

    };


	this.renderTexture = function( input, output ) {

		// Takes a texture, and render out in rendertarget
		// input = Texture
		// output = RenderTarget

		passThruUniforms.texture.value = input;

		this.doRenderTarget( passThruShader, output);

		passThruUniforms.texture.value = null;

	};

	this.doRenderTarget = function( material, output ) {

		mesh.material = material;
		renderer.render( scene, camera, output );
		mesh.material = passThruShader;

	};

	// Shaders

	function getPassThroughVertexShader() {

		return	"void main()	{\n" +
				"\n" +
				"	gl_Position = vec4( position, 1.0 );\n" +
				"\n" +
				"}\n";

	}

	function getPassThroughFragmentShader() {

		return	"uniform sampler2D texture;\n" +
				"\n" +
				"void main() {\n" +
				"\n" +
				"	vec2 uv = gl_FragCoord.xy / resolution.xy;\n" +
				"\n" +
				"	gl_FragColor = texture2D( texture, uv );\n" +
				"\n" +
				"}\n";

	}

}
