THREE.EdgeShader = {
  uniforms: {
    "tDiffuse":   { value: null },
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
    "varying vec2 vUv;",

    "void main() {",
      //"const float step = 3.0;",
      "vec4 cols[9];",
      "vec2 uv = vUv;",

      "for (float i = 0.0; i < 3.0; i++) {",
        "for (float j = 0.0; j < 3.0; j++) {",
          "cols[int(i*3.0+j)] = texture2D(tDiffuse, vec2( uv.x+j-2.0, uv.y+i-2.0));",
          "cols[int(i*3.0+j)].r = (cols[int(i*3.0+j)].r + cols[int (i*3.0+j) ].g + cols[int (i*3.0+j) ].b) / 3.0;",
        "}",
      "}",

      "float mn = 1.0,mx = 0.0;",
      "for (float i = 0.0 ;i < 3.0*3.0; i++){",
      "mn = min(cols[ int(i) ].r,mn);",
      "mx = max(cols[ int (i) ].r,mx);",
      "}",

      "float dst = abs(mx-mn);",
      "vec4 c = texture2D(tDiffuse, vUv);",
      "gl_FragColor.rgb = vec3(dst*0.2,dst * 0.8,dst * 0.8);",
      //"gl_FragColor.rgba = vec4(c);",
  "}"

].join("\n")

};

THREE.EdgePass = function(){
  THREE.Pass.call(this);
  if(THREE.EdgeShader === undefined){
    console.log("this pass relies on EdgeShader");
  }

  var shader = THREE.EdgeShader;
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

THREE.EdgePass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.EdgePass,

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
