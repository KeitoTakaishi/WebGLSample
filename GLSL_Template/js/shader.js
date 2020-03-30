function createShader(gl, source, type){
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader) + source);
    }
    return shader;
}

function createProgram(gl, vert, frag){
    var program = gl.createProgram();
    gl.attachShader(program, createShader(gl, vert, gl.VERTEX_SHADER));
    gl.attachShader(program, createShader(gl, frag, gl.FRAGMENT_SHADER));
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program));
    }
    return program;
}

function setUnifromTexture(gl, index, texture, location){
    //location : uniform id
    gl.activeTexture(gl.TEXTURE0 + index);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1f(location, index);
}

function getUniformLocations(gl, program, keys){
    const locations = {};
    keys.forEach(key => {
        locations[key] = gl.getUniformLocation(program, key);
    });
    return locations;
}