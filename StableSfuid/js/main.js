(function(){

    const canvas = document.getElementById('canvas');
    const gl = canvas.getContext('webgl2');
    gl.getExtension('EXT_color_buffer_float');


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
    const FILL_VIEWPORT_VERTEX_SHADER_SOURCE =
        `#version 300 es

        const vec3[4] POSITIONS = vec3[](
        vec3(-1.0, -1.0, 0.0),
        vec3(1.0, -1.0, 0.0),
        vec3(-1.0, 1.0, 0.0),
        vec3(1.0, 1.0, 0.0)
        );

        const int[6] INDICES = int[](
        0, 1, 2,
        3, 2, 1
        );

        void main(void) {
        vec3 position = POSITIONS[INDICES[gl_VertexID]];
        gl_Position = vec4(position, 1.0);
        }
        `;

    const INITIALIZE_VELOCITY_FRAGMENT_SHADER_SOURCE =
        `#version 300 es

        precision highp float;

        //out vec2 o_velocity;
        out vec4 o_velocity;

        void main(void) {
        //o_velocity = vec2(0.0);
        o_velocity = vec4(0.0, 1.0, 1.0, 1.0);
        }
        `;
    //--------------------------------------------------------------------------------------------------------
    //shader val
    
    const initializeVelocityProgram = createProgram(gl, FILL_VIEWPORT_VERTEX_SHADER_SOURCE, INITIALIZE_VELOCITY_FRAGMENT_SHADER_SOURCE);

    //--------------------------------------------------------------------------------------------------------
    //create FrameBuffers 
    //複数のFrameBufferを使用しているため，gl.COLOR_ATTACHMENT0 
    function createVelocityFramebuffer(gl, width, height){
        const framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        //!! 2D->gl.RG
        const velocityTexture = createTexture(gl, width, height, gl.RG32F, gl.RG, gl.FLOAT);
    
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


    const renderVelocity = function() {
        //gl.useProgram(renderVelocityProgram);
        //setUniformTexture(gl, 0, velocityFbObjR.velocityTexture, renderVelocityUniforms['u_velocityTexture']);
        //gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    
    const renderDensity = function() {
        //gl.useProgram(renderDensityProgram);
        //setUniformTexture(gl, 0, densityFbObjR.densityTexture, renderDensityUniforms['u_densityTexture']);
        //gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    const render = function() {
        // if (parameters['render'] === 'density') {
        //     renderDensity();
        // } else {
        //     renderVelocity();
        // }
        //renderDensity();
        initializeVelocity();
       //console.log("render");
    };
    //--------------------------------------------------------------------------------------------------------
    //solver functions
    
    //--velocity Fbo
    let velocityFbObjR = createVelocityFramebuffer(gl, canvas.width, canvas.height);
    let velocityFbObjW = createVelocityFramebuffer(gl, canvas.width, canvas.height);
    const swapVelocityFbObj = function(){
        const temp = velocityFbObjR;
        velocityFbObjR = velocityFbObjW;
        velocityFbObjW = temp;
    };

    //--density Fbo
    let densityFboObjR = createVelocityFramebuffer(gl, canvas.width, canvas.height);
    let densityFboObjW = createVelocityFramebuffer(gl, canvas.width, canvas.height);
    const swapDensityFboObj = function(){
        const temp = densityFboObjW;
        densityFboObjR = densityFboObjW;
        densityFboObjW = temp;
    };

    //--proj
    let projectFbObjR = createProjectFramebuffer(gl, canvas.width, canvas.height);
    let projectFbObjW = createProjectFramebuffer(gl, canvas.width, canvas.height);
    const swapProjectFbObj = function() {
      const tmp = projectFbObjR;
      projectFbObjR = projectFbObjW;
      projectFbObjW = tmp;
    };

    const initializeVelocity = function() {
        //gl.bindFramebuffer(gl.FRAMEBUFFER, velocityFbObjW.framebuffer);
        gl.useProgram(initializeVelocityProgram);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        //gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        //swapVelocityFbObj();
    };


    //main----------------------------------------------------------------------------------------------------
    ///const imageTexture = createImageTexture(gl, './resource/lenna.png');
    let requestId = null;
    const reset = function(){
        //init01
        if(requestId == null){
            //stop animation loop 
            cancelAnimationFrame(requestId);
        }
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0.0, 0.0, canvas.width, canvas.height);

        //setup solver
        let simulationSeconds = 0.0;
        let remaindedSimulationSeconds = 0.0;
        let previousRealSeconds = performance.now() * 0.001;
        initializeVelocity();
        //loop----------------------------------------------------------------------------------------------------
        const loop = function(){
            requestAnimationFrame(loop);
            
            const currentRealSeconds = performance.now() * 0.001;
            //time scale : 1.0
            //time step 0.05
            //debug
            const nextSimulationSeconds = simulationSeconds + remaindedSimulationSeconds + 1.0 * Math.min(0.02, currentRealSeconds - previousRealSeconds);
            
            //previous frame seconds
            previousRealSeconds = currentRealSeconds;
            //debug
            const timeStep = 0.05;
            while(nextSimulationSeconds - simulationSeconds > timeStep) {
                //stepSimulation(timeStep);
                simulationSeconds += timeStep;
            }
            remaindedSimulationSeconds = nextSimulationSeconds - simulationSeconds;
            
            render();
            //mouseMoved = false;
            //console.log("calculate");
        };
        
        loop();
        console.log("done reset"); 
    };

    reset();

}());
