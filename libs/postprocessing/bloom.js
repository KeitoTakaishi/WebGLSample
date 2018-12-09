THREE.blurShader = {


  uniforms: {
    "tDiffuse":   { value: null },
		"time":       { value: 0.0 },
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
    "uniform sampler2D tDiffuse;",
    "float weight[5];",


    "varying vec2 vUv;",
    "float strength = 1;",
    "bool horizontal = true;",

    "void main() {",
      "weight[0] = 0.382928;",
      "weight[1] = 0.241732;",
      "weight[2] = 0.060598;",
      "weight[3] = 0.005977;",
      "weight[4] = 0.000229;",
      "vec3 color = vec3(0.0);",
      "color += texture2D(tDiffuse, vUv + vec2(0.0, 0)).rgb * weight[0];",
      "if(horizontal) {",
      "for(float i = 1.0; i < 5.0; i++) {",
      "color += texture2D(tDiffuse, vUv + vec2(strength * i, 0.0)).rgb * weight[int(i)];",
      "color += texture2D(tDiffuse, vUv + vec2(strength * i, 0.0)).rgb * weight[int(i)];",
      "color += texture2D(tDiffuse, vUv - vec2(strength * i, 0.0)).rgb * weight[int(i)];",
      "}",
      "} else {",
      "for(float i = 1.0; i < 5.0; i++) {",
      "color += texture2D(tDiffuse, vUv + vec2(0.0, strength * i)).rgb * weight[int(i)];",
      "color += texture2D(tDiffuse, vUv - vec2(0.0, strength * i)).rgb * weight[int(i)];",
      "}",
      "}",
      "gl_FragColor = vec4(color, 1.0);",
  "}"

].join("\n")

};

THREE.blurPass = function(){
  THREE.Pass.call(this);
  if(THREE.blurShader === undefined){
    console.log("this pass relies on testShader");
  }

  var shader = THREE.blurShader;
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

THREE.blurPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {
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
