THREE.testShader = {
  uniforms: {
    "tDiffuse":   { value: null },
		"time":       { value: 0.0 },
    "R":{value:1.0},
    "G":{value:0.0},
    "B":{value:0.0},

  },

  vertexShader: [
    "varying vec2 vUv;",

		"void main() {",
			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
		"}"

	].join( "\n" ),

  fragmentShader: [
    "#include <common>",

		"uniform float time;",
    "uniform float R",
    "uniform float G",
    "uniform float B",
    "uniform sampler2D tDiffuse;",
    "varying vec2 vUv;",

    "void main() {",
    "vec4 cTextureScreen = texture2D( tDiffuse, vUv );",
    "gl_FragColor =  vec4( R, G,  B, 1.0);",
  "}"

].join("\n")

};

THREE.testPass = function(){
  THREE.Pass.call(this);
  if(THREE.testShader === undefined){
    console.log("this pass relies on testShader");
  }

  var shader = THREE.testShader;
  this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

  this.material = new THREE.ShaderMaterial( {

    uniforms: this.uniforms,
    vertexShader: shader.vertexShader,
    fragmentShader: shader.fragmentShader
  } );

    this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
  	this.scene  = new THREE.Scene();

  	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
  	this.scene.add( this.quad );
};

THREE.testPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.testPass,

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		this.uniforms[ "tDiffuse" ].value = readBuffer.texture;
		this.uniforms[ "time" ].value += delta;

		this.quad.material = this.material;

		if ( this.renderToScreen ) {
			renderer.render( this.scene, this.camera );

		} else {

			renderer.render( this.scene, this.camera, writeBuffer, this.clear );

		}

	}

} );
