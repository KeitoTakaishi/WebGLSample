(function(){

    const canvas = document.getElementById('canvas');
    const gl = canvas.getContext('webgl2');
    gl.getExtension('EXT_color_buffer_float'); // for FloatBuffer

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
        gl.linkProgram(prgram);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error(gl.getProgramInfoLog(program));
          }
          return program;
    }

    function createTexture(gl, width, height, internalFormat, format, type){
        //create TextureObjext
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, format, type, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return texture;
    }

    function createImageTexture(gl, src) {
        const texture = gl.createTexture();
        const image = new Image();
        image.src = src;
        //? after loading
        image.onload = () =>{
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.bindTexture(gl.TEXTURE_2D, null);
        };
        return texture;
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

    //--------------------------------------------------------------------------------------------------------
    //create FrameBuffers 
    //複数のFrameBufferを使用しているため，gl.COLOR_ATTACHMENT0 
    function createVelocityFrameBuffer(gl, width, height){
        const framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        //!! 2D->gl.RG
        const velocityTexture = createTexture(gl, width, height, gl.RGB32F, gl.RG, gl.FLOAT);
        //FrameBufferとRenderTextureの紐づけ
        //第五引数はTextureLevel
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, velocityTexture, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);        
        gl.bindTexture(gl.TEXTURE_2D, null);
        return {
            framebuffer: framebuffer,
            velocityTexture: velocityTexture
        };  
    }

    function createDensityFramebuffer(gl, width, height) {
        const framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        const densityTexture = createTexture(gl, width, height, gl.RGBA32F, gl.RGBA, gl.FLOAT);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, densityTexture, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return {
          framebuffer: framebuffer,
          densityTexture: densityTexture
        };
      }
    
      function createProjectFramebuffer(gl, width, height) {
        const framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        const projectTexture = createTexture(gl, width, height, gl.RG32F, gl.RG, gl.FLOAT);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, projectTexture, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return {
          framebuffer: framebuffer,
          projectTexture: projectTexture
        };
      }
    //--------------------------------------------------------------------------------------------------------



    //main----------------------------------------------------------------------------------------------------
    ///const imageTexture = createImageTexture(gl, './resource/lenna.png');
    let requestId = null;
    


    let simulationSeconds = 0.0;
    let remaindedSimulationSeconds = 0.0;
    let previousRealSeconds = performance.now() * 0.001;

    //loop----------------------------------------------------------------------------------------------------
    (function loop(){
        //window.requestAnimationFrame(loop);
        console.log("loop");
    })();
}());
