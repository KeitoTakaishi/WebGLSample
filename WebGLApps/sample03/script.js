onload = function(){
	var c = document.getElementById('canvas');
	c.width = 300;
	c.height = 300;

	var gl = c.getContext('webgl') || c.getContext('experimental-webgl');
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clearDepth(1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //shader
	var v_shader = create_shader('vs');
	var f_shader = create_shader('fs');
	var prg = create_program(v_shader, f_shader);

	//attribute
	var attLocation = new Array(2);
	attLocation[0] = gl.getAttribLocation(prg, 'position');
	attLocation[1] = gl.getAttribLocation(prg, 'color');

	var attStride = new Array(2);
	attStride[0] = 3;
	attStride[1] = 4;

	var vertex_position = [
		 0.0, 1.0, 0.0,
		 1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0
	];

	var vertex_color = [
		1.0, 0.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 1.0
	];

	// VBOの生成
	var position_vbo = create_vbo(vertex_position);
	var color_vbo = create_vbo(vertex_color);

	gl.bindBuffer(gl.ARRAY_BUFFER, position_vbo);
	gl.enableVertexAttribArray(attLocation[0]);
	gl.vertexAttribPointer(attLocation[0], attStride[0], gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, color_vbo);
	gl.enableVertexAttribArray(attLocation[1]);
	gl.vertexAttribPointer(attLocation[1], attStride[1], gl.FLOAT, false, 0, 0);

	// minMatrix.js を用いた行列関連処理
	var m = new matIV();
	var mMatrix = m.identity(m.create());
	var vMatrix = m.identity(m.create());
	var pMatrix = m.identity(m.create());
	var mvpMatrix = m.identity(m.create());
	m.lookAt([0.0, 1.0, 3.0], [0, 0, 0], [0, 1, 0], vMatrix);
	m.perspective(90, c.width / c.height, 0.1, 100, pMatrix);
	m.multiply(pMatrix, vMatrix, mvpMatrix);
	m.multiply(mvpMatrix, mMatrix, mvpMatrix);
	var uniLocation = gl.getUniformLocation(prg, 'mvpMatrix');
	gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);

	// モデルの描画
	gl.drawArrays(gl.TRIANGLES, 0, 3);
	gl.flush();

	// シェーダを生成する関数
	function create_shader(id){
		// シェーダを格納する変数
		var shader;

		// HTMLからscriptタグへの参照を取得
		var scriptElement = document.getElementById(id);

		// scriptタグが存在しない場合は抜ける
		if(!scriptElement){return;}

		// scriptタグのtype属性をチェック
		switch(scriptElement.type){

			// 頂点シェーダの場合
			case 'x-shader/x-vertex':
				shader = gl.createShader(gl.VERTEX_SHADER);
				break;

			// フラグメントシェーダの場合
			case 'x-shader/x-fragment':
				shader = gl.createShader(gl.FRAGMENT_SHADER);
				break;
			default :
				return;
		}

		// 生成されたシェーダにソースを割り当てる
		gl.shaderSource(shader, scriptElement.text);

		// シェーダをコンパイルする
		gl.compileShader(shader);

		// シェーダが正しくコンパイルされたかチェック
		if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){

			// 成功していたらシェーダを返して終了
			return shader;
		}else{

			// 失敗していたらエラーログをアラートする
			alert(gl.getShaderInfoLog(shader));
		}
	}

	// プログラムオブジェクトを生成しシェーダをリンクする関数
	function create_program(vs, fs){
		// プログラムオブジェクトの生成
		var program = gl.createProgram();

		// プログラムオブジェクトにシェーダを割り当てる
		gl.attachShader(program, vs);
		gl.attachShader(program, fs);

		// シェーダをリンク
		gl.linkProgram(program);

		// シェーダのリンクが正しく行なわれたかチェック
		if(gl.getProgramParameter(program, gl.LINK_STATUS)){

			// 成功していたらプログラムオブジェクトを有効にする
			gl.useProgram(program);

			// プログラムオブジェクトを返して終了
			return program;
		}else{

			// 失敗していたらエラーログをアラートする
			alert(gl.getProgramInfoLog(program));
		}
	}

	// VBOを生成する関数
	function create_vbo(data){
		// バッファオブジェクトの生成
		var vbo = gl.createBuffer();

		// バッファをバインドする
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo);

		// バッファにデータをセット
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

		// バッファのバインドを無効化
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		// 生成した VBO を返して終了
		return vbo;
	}

};
