THREE.PartyShader = {
  uniforms: {
    "tDiffuse":   { value: null },
    "tex":        {value: null},
		"time":       { value: 0.0 },
  },
  vertexShader: [
    "varying vec2 vUv;",
    "uniform float time;",
		"void main() {",
			"vUv = uv;",
      "vec3 pos = position;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );",
		"}"
	].join( "\n" ),
  fragmentShader: [
    "#include <common>",
		"uniform float time;",
    "uniform sampler2D tDiffuse;",
    "uniform sampler2D tex;",
    "varying vec2 vUv;",

    "void main() {",
      "vec2 uv = vUv;",
      "vec4 c = texture2D(tex, uv);",
      "gl_FragColor = vec4(c.r, 0.1, c.b, 1.0);",
  "}"
].join("\n")
};

THREE.PartyShaderPass = function(){
  THREE.Pass.call(this);
  if(THREE.PartyShader === undefined){
    console.log("this pass relies on testShader");
  }
  var shader = THREE.PartyShader;
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
THREE.PartyShaderPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {
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
