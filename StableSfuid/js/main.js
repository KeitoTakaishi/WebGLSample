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

out vec2 o_velocity;

void main(void) {
  o_velocity = vec2(0.0);
}
`;

  const INITIALIZE_DENSITY_BY_CIRCLE_FRAGMNET_SHADER_SOURCE =
`#version 300 es

precision highp float;

out vec3 o_density;

uniform vec2 u_resolution;

void main(void) {
  vec2 st = (2.0 * gl_FragCoord.xy - u_resolution) / min(u_resolution.x, u_resolution.y);
  float density = smoothstep(0.51, 0.50, length(st));
  o_density = vec3(density);
}
`;

  const INITIALIZE_DENSITY_BY_CHECKER_FRAGMENT_SHADER_SOURCE =
`#version 300 es

precision highp float;

out vec3 o_density;

uniform vec2 u_resolution;

void main(void) {
  vec2 st = gl_FragCoord.xy / u_resolution * 30.0;
  ivec2 idx = ivec2(st);

  int pattern = (idx.x + idx.y) % 3;
  if (pattern == 0) {
    o_density = vec3(1.0, 1.0, 0.0);
  } else if (pattern == 1) {
    o_density = vec3(1.0, 0.0, 1.0);
  } else {
    o_density = vec3(0.0, 1.0, 1.0);
  }
}
`

  const INITIALIZE_DENSITY_BY_IMAGE_FRAGMENT_SHADER_SOURCE =
`#version 300 es

precision highp float;

out vec3 o_density;

uniform sampler2D u_imageTexture;
uniform vec2 u_resolution;

void main(void) {
  vec2 textureSize = vec2(textureSize(u_imageTexture, 0));
  vec2 st = (2.0 * gl_FragCoord.xy - u_resolution) / min(u_resolution.x, u_resolution.y);

  if (u_resolution.x > u_resolution.y) {
    st.x *= textureSize.y / textureSize.x;
  } else {
    st.y *= textureSize.x / textureSize.y;
  }

  vec2 uv = st * 0.5 + 0.5;
  uv = vec2(uv.x, 1.0 - uv.y);

  vec3 density = vec3(0.0);
  if (uv.x >= 0.0 && uv.x <= 1.0 && uv.y >= 0.0 && uv.y <= 1.0) {
    density = texture(u_imageTexture, uv).xyz;
  }
  o_density = density;
}
`;

  const ADD_DENSITY_SOURCE_FRAGMENT_SHADER_SOURCE =
`#version 300 es

precision highp float;

out vec3 o_density;

uniform sampler2D u_densityTexture;

void main(void) {
  vec3 density = texelFetch(u_densityTexture, ivec2(gl_FragCoord.xy), 0).xyz;
  o_density = density;
}
`;

  const DIFFUSE_DENSITY_FRAGMENT_SAHDER_SOURCE =
`#version 300 es

precision highp float;

out vec3 o_density;

uniform sampler2D u_densityTexture;
uniform float u_deltaTime;
uniform float u_gridSpacing;
uniform float u_diffuseCoef;

void main(void) {
  ivec2 coord = ivec2(gl_FragCoord.xy);

  vec3 center = texelFetch(u_densityTexture, coord, 0).xyz;
  vec3 left = texelFetch(u_densityTexture, coord + ivec2(-1, 0), 0).xyz;
  vec3 right = texelFetch(u_densityTexture, coord + ivec2(1, 0), 0).xyz;
  vec3 down = texelFetch(u_densityTexture, coord + ivec2(0, -1), 0).xyz;
  vec3 up = texelFetch(u_densityTexture, coord + ivec2(0, 1), 0).xyz;

  float a = u_deltaTime * u_diffuseCoef / (u_gridSpacing * u_gridSpacing);
  o_density = (center + a * (left + right + down + up)) / (1.0 + 4.0 * a);
}
`;

  const ADVECT_DENSITY_FRAGMENT_SHADER_SOURCE =
`#version 300 es

precision highp float;

out vec3 o_density;

uniform sampler2D u_velocityTexture;
uniform sampler2D u_densityTexture;
uniform float u_gridSpacing;
uniform float u_deltaTime;

void main(void) {
  ivec2 coord = ivec2(gl_FragCoord.xy);

  vec2 velocity = texelFetch(u_velocityTexture, coord, 0).xy;
  vec2 prevPos = vec2(coord) * u_gridSpacing - u_deltaTime * velocity;
  vec2 prevCoord = prevPos / u_gridSpacing;

  ivec2 i = ivec2(prevCoord);
  vec2 f = fract(prevCoord);

  vec3 density00 = texelFetch(u_densityTexture, i, 0).xyz;
  vec3 density10 = texelFetch(u_densityTexture, i + ivec2(1, 0), 0).xyz;
  vec3 density01 = texelFetch(u_densityTexture, i + ivec2(0, 1), 0).xyz;
  vec3 density11 = texelFetch(u_densityTexture, i + ivec2(1, 1), 0).xyz;

  o_density = mix(mix(density00, density10, f.x), mix(density01, density11, f.x), f.y);
}
`;

  const ADD_EXTERNAL_FORCE_FRAGMENT_SHADER_SOURCE =
`#version 300 es

precision highp float;

out vec2 o_velocity;

uniform sampler2D u_velocityTexture;
uniform float u_deltaTime;
uniform float u_gridSpacing;
uniform vec2 u_forceCenter;
uniform vec2 u_forceDir;//normalized
uniform float u_forceIntensity;
uniform float u_forceRadius;

void main(void) {
  vec2 velocity = texelFetch(u_velocityTexture, ivec2(gl_FragCoord.xy), 0).xy;
  vec2 force = smoothstep(u_forceRadius, 0.0,  length(u_forceCenter - gl_FragCoord.xy) * u_gridSpacing) * u_forceDir * u_forceIntensity;
  o_velocity = velocity + u_deltaTime * force;
}
`;

  const DIFFUSE_VELOCITY_FRAGMENT_SHADER_SOURCE =
`#version 300 es

precision highp float;

out vec2 o_velocity;

uniform sampler2D u_velocityTexture;
uniform float u_deltaTime;
uniform float u_gridSpacing;
uniform float u_diffuseCoef;

void main(void) {
  ivec2 coord = ivec2(gl_FragCoord.xy);
  float a = u_deltaTime * u_diffuseCoef / (u_gridSpacing * u_gridSpacing);

  vec2 center = texelFetch(u_velocityTexture, coord, 0).xy;
  vec2 left = texelFetch(u_velocityTexture, coord + ivec2(-1, 0), 0).xy;
  vec2 right = texelFetch(u_velocityTexture, coord + ivec2(1, 0), 0).xy;
  vec2 down = texelFetch(u_velocityTexture, coord + ivec2(0, -1), 0).xy;
  vec2 up = texelFetch(u_velocityTexture, coord + ivec2(0, 1), 0).xy;

  o_velocity = (center + a * (left + right + down + up)) / (1.0 + 4.0 * a);
}
`;

  const ADVECT_VELOCITY_FRAGMENT_SHADER_SOURCE =
`#version 300 es

precision highp float;

out vec2 o_velocity;

uniform sampler2D u_velocityTexture;
uniform float u_gridSpacing;
uniform float u_deltaTime;

void main(void) {
  ivec2 coord = ivec2(gl_FragCoord.xy);

  vec2 velocity = texelFetch(u_velocityTexture, coord, 0).xy;
  vec2 prevPos = vec2(coord) * u_gridSpacing - u_deltaTime * velocity;
  vec2 prevCoord = prevPos / u_gridSpacing;

  ivec2 i = ivec2(prevCoord);
  vec2 f = fract(prevCoord);

  vec2 velocity00 = texelFetch(u_velocityTexture, i, 0).xy;
  vec2 velocity10 = texelFetch(u_velocityTexture, i + ivec2(1, 0), 0).xy;
  vec2 velocity01 = texelFetch(u_velocityTexture, i + ivec2(0, 1), 0).xy;
  vec2 velocity11 = texelFetch(u_velocityTexture, i + ivec2(1, 1), 0).xy;

  o_velocity = mix( mix(velocity00, velocity10, f.x), mix(velocity01, velocity11, f.x), f.y);
}
`;

  const PROJECT_STEP1_FRAGMENT_SHADER_SOURCE =
`#version 300 es

precision highp float;

out vec2 o_project;

uniform sampler2D u_velocityTexture;
uniform float u_gridSpacing;

void main(void) {
  ivec2 coord = ivec2(gl_FragCoord.xy);

  vec2 left = texelFetch(u_velocityTexture, coord + ivec2(-1, 0), 0).xy;
  vec2 right = texelFetch(u_velocityTexture, coord + ivec2(1, 0), 0).xy;
  vec2 down = texelFetch(u_velocityTexture, coord + ivec2(0, -1), 0).xy;
  vec2 up = texelFetch(u_velocityTexture, coord + ivec2(0, 1), 0).xy;

  float div = -0.5 * u_gridSpacing * (right.x - left.x + up.y - down.y);
  //float div = -0.5 * (right.x - left.x + up.y - down.y);

  o_project = vec2(0.0, div);
}
`;

  const PROJECT_STEP2_FRAGMENT_SHADER_SOURCE =
`#version 300 es

precision highp float;

out vec2 o_project;

uniform sampler2D u_projectTexture;

void main(void) {
  ivec2 coord = ivec2(gl_FragCoord.xy);

  float div = texelFetch(u_projectTexture, coord, 0).y;

  float left = texelFetch(u_projectTexture, coord + ivec2(-1, 0), 0).x;
  float right = texelFetch(u_projectTexture, coord + ivec2(1, 0), 0).x;
  float down = texelFetch(u_projectTexture, coord + ivec2(0, -1), 0).x;
  float up = texelFetch(u_projectTexture, coord + ivec2(0, 1), 0).x;

  o_project = vec2((div + left + right + down + up) / 4.0, div);
}
`;

  const PROJECT_STEP3_FRAGMENT_SHADER_SOURCE =
`#version 300 es

precision highp float;

out vec2 o_velocity;

uniform sampler2D u_velocityTexture;
uniform sampler2D u_projectTexture;
uniform float u_gridSpacing;

void main(void) {
  ivec2 coord = ivec2(gl_FragCoord.xy);

  vec2 velocity = texelFetch(u_velocityTexture, coord, 0).xy;

  float left = texelFetch(u_projectTexture, coord + ivec2(-1, 0), 0).x;
  float right = texelFetch(u_projectTexture, coord + ivec2(1, 0), 0).x;
  float down = texelFetch(u_projectTexture, coord + ivec2(0, -1), 0).x;
  float up = texelFetch(u_projectTexture, coord + ivec2(0, 1), 0).x;

  o_velocity = velocity - 0.5 * vec2(right - left, up - down) / u_gridSpacing;
}
`;

  const RENDER_VELOCITY_FRAGMENT_SHADER_SOURCE =
`#version 300 es

precision highp float;

#define PI 3.14159265359

uniform sampler2D u_velocityTexture;

out vec4 o_color;

vec3 hsv2rgb(float h, float s, float v) {
  h = mod(h, 360.0);
  if (s == 0.0) {
    return vec3(0.0, 0.0, 0.0);
  }
  float c = v * s;
  float i = h / 60.0;
  float x = c * (1.0 - abs(mod(i, 2.0) - 1.0)); 
  return vec3(v - c) + (i < 1.0 ? vec3(c, x, 0.0) : 
    i < 2.0 ? vec3(x, c, 0.0) :
    i < 3.0 ? vec3(0.0, c, x) :
    i < 4.0 ? vec3(0.0, x, c) :
    i < 5.0 ? vec3(x, 0.0, c) :
    vec3(c, 0.0, x));
}

void main(void) {
  vec2 velocity = texelFetch(u_velocityTexture, ivec2(gl_FragCoord.xy), 0).xy;

  vec2 normVel = normalize(velocity);
  float radian = atan(velocity.y, velocity.x) + PI;

  float hue = 360.0 * radian / (2.0 * PI);
  float brightness = min(1.0, length(velocity) / 0.5);
  vec3 color = hsv2rgb(hue, 1.0, brightness);

  o_color = vec4(color, 1.0);
}
`;

  const RENDER_DENSITY_FRAGMENT_SHADER_SOURCE =
`#version 300 es

precision highp float;

uniform sampler2D u_densityTexture;

out vec4 o_color;

void main(void) {
  vec3 density = texelFetch(u_densityTexture, ivec2(gl_FragCoord.xy), 0).xyz;
  o_color = vec4(density, 1.0);
}
`;

  


let requestId = null;
const stats = new Stats();
document.body.appendChild(stats.dom);

let prevMousePosition = new Vector2(0.0, 0.0);
let mousePosition = new Vector2(0.0, 0.0);
let mouseDir = new Vector2(0.0, 0.0);
let mouseMoved = false;
window.addEventListener('mousemove', event => {
  prevMousePosition = mousePosition;
  mousePosition = new Vector2(event.clientX, window.innerHeight - event.clientY);
  if (!Vector2.equals(prevMousePosition, mousePosition)) {
    mouseDir = Vector2.sub(mousePosition, prevMousePosition).norm();
    mouseMoved = true;
  }
});

let mousePressing = false;
window.addEventListener('mousedown', _ => {
  mousePressing = true;
});
window.addEventListener('mouseup', _ => {
  mousePressing = false;
});
  //----------------------------------------
  //utils
  const parameters = {
    'grid spacing': 0.001,
    'force radius': 0.01,
    'force intensity': 100.0,
    'diffuse coef': 0.0,
    'time step': 0.005,
    'time scale': 1.0,
    'render': 'density',
    'initial density': 'circle',
    'reset': _ => reset()
  };

  const gui = new dat.GUI();
  gui.add(parameters, 'force radius', 0.001, 0.03).step(0.001);
  gui.add(parameters, 'force intensity', 0.0, 200.0).step(0.1);
  gui.add(parameters, 'diffuse coef', 0.0, 0.1).step(0.0001);
  gui.add(parameters, 'time step', 0.0001, 0.01).step(0.0001);
  gui.add(parameters, 'time scale', 0.5, 2.0).step(0.001);
  gui.add(parameters, 'render', ['density', 'velocity']);
  gui.add(parameters, 'initial density', ['circle', 'checker', 'image']).onChange(_ => reset());
  gui.add(parameters, 'reset');
  //----------------------------------------

  let initializeDensityByCircleProgram;
  let initializeDensityByCheckerProgram;
  let initializesDensityByImageProgram;
  let initializeVelocityProgram;
  let addDensitySourceProgram;
  let diffuseDensityProgram;
  let advectDensityProgram;
  let addExternalForceProgram;
  let diffuseVelocityProgram;
  let advectVelocityProgram;
  let projectStep1Program;
  let projectStep2Program;
  let projectStep3Program;
  let renderDensityProgram;
  let renderVelocityProgram;

  let initializeDensityByCircleUniforms;
  let initializeDensityByCheckerUniforms;
  let initializesDensityByImageUniforms;
  let initializeVelocityUniforms;
  let addDensitySourceUniforms;
  let diffuseDensityUniforms;
  let advectDensityUniforms;
  let addExternalForceUniforms;
  let diffuseVelocityUniforms;
  let advectVelocityUniforms;
  let projectStep1Uniforms;
  let projectStep2Uniforms;
  let projectStep3Uniforms;
  let renderDensityUniforms;
  let renderVelocityUniforms;

  const canvas = document.getElementById('canvas');
  const gl = canvas.getContext('webgl2');
  gl.getExtension('EXT_color_buffer_float');
  const imageTexture = createImageTexture(gl, './resource/lenna.png');


  function init(){
    initializeDensityByCircleProgram = createProgramFromSource(gl, FILL_VIEWPORT_VERTEX_SHADER_SOURCE, INITIALIZE_DENSITY_BY_CIRCLE_FRAGMNET_SHADER_SOURCE);
    //initializeDensityByCheckerProgram = createProgramFromSource(gl, FILL_VIEWPORT_VERTEX_SHADER_SOURCE, INITIALIZE_DENSITY_BY_CHECKER_FRAGMENT_SHADER_SOURCE);
    //initializesDensityByImageProgram = createProgramFromSource(gl, FILL_VIEWPORT_VERTEX_SHADER_SOURCE, INITIALIZE_DENSITY_BY_IMAGE_FRAGMENT_SHADER_SOURCE);
  
    initializeVelocityProgram = createProgramFromSource(gl, FILL_VIEWPORT_VERTEX_SHADER_SOURCE, INITIALIZE_VELOCITY_FRAGMENT_SHADER_SOURCE);
    addDensitySourceProgram = createProgramFromSource(gl, FILL_VIEWPORT_VERTEX_SHADER_SOURCE, ADD_DENSITY_SOURCE_FRAGMENT_SHADER_SOURCE);
    diffuseDensityProgram = createProgramFromSource(gl, FILL_VIEWPORT_VERTEX_SHADER_SOURCE, DIFFUSE_DENSITY_FRAGMENT_SAHDER_SOURCE);
    advectDensityProgram = createProgramFromSource(gl, FILL_VIEWPORT_VERTEX_SHADER_SOURCE, ADVECT_DENSITY_FRAGMENT_SHADER_SOURCE);
    addExternalForceProgram = createProgramFromSource(gl, FILL_VIEWPORT_VERTEX_SHADER_SOURCE, ADD_EXTERNAL_FORCE_FRAGMENT_SHADER_SOURCE);
    diffuseVelocityProgram = createProgramFromSource(gl, FILL_VIEWPORT_VERTEX_SHADER_SOURCE, DIFFUSE_VELOCITY_FRAGMENT_SHADER_SOURCE);
    advectVelocityProgram = createProgramFromSource(gl, FILL_VIEWPORT_VERTEX_SHADER_SOURCE, ADVECT_VELOCITY_FRAGMENT_SHADER_SOURCE);
    
    projectStep1Program = createProgramFromSource(gl, FILL_VIEWPORT_VERTEX_SHADER_SOURCE, PROJECT_STEP1_FRAGMENT_SHADER_SOURCE);
    projectStep2Program = createProgramFromSource(gl, FILL_VIEWPORT_VERTEX_SHADER_SOURCE, PROJECT_STEP2_FRAGMENT_SHADER_SOURCE);
    projectStep3Program = createProgramFromSource(gl, FILL_VIEWPORT_VERTEX_SHADER_SOURCE, PROJECT_STEP3_FRAGMENT_SHADER_SOURCE);
    
    renderDensityProgram = createProgramFromSource(gl, FILL_VIEWPORT_VERTEX_SHADER_SOURCE, RENDER_DENSITY_FRAGMENT_SHADER_SOURCE);
    renderVelocityProgram = createProgramFromSource(gl, FILL_VIEWPORT_VERTEX_SHADER_SOURCE, RENDER_VELOCITY_FRAGMENT_SHADER_SOURCE);

  
    initializeDensityByCircleUniforms = getUniformLocations(gl, initializeDensityByCircleProgram, ['u_resolution']);
    //initializeDensityByCheckerUniforms = getUniformLocations(gl, initializeDensityByCheckerProgram, ['u_resolution']);
    //initializesDensityByImageUniforms = getUniformLocations(gl, initializesDensityByImageProgram, ['u_resolution', 'u_imageTexture']);
    
    initializeVelocityUniforms = getUniformLocations(gl, initializeVelocityProgram, []);
    addDensitySourceUniforms = getUniformLocations(gl, addDensitySourceProgram, ['u_densityTexture']);
    diffuseDensityUniforms = getUniformLocations(gl, diffuseDensityProgram, ['u_densityTexture', 'u_deltaTime', 'u_gridSpacing', 'u_diffuseCoef']);
    advectDensityUniforms = getUniformLocations(gl, advectDensityProgram, ['u_velocityTexture', 'u_densityTexture', 'u_gridSpacing', 'u_deltaTime']);
    addExternalForceUniforms = getUniformLocations(gl, addExternalForceProgram, ['u_velocityTexture', 'u_deltaTime', 'u_gridSpacing', 'u_forceCenter', 'u_forceDir', 'u_forceIntensity', 'u_forceRadius']);
    diffuseVelocityUniforms = getUniformLocations(gl, diffuseVelocityProgram, ['u_velocityTexture', 'u_deltaTime', 'u_gridSpacing', 'u_diffuseCoef']);
    advectVelocityUniforms = getUniformLocations(gl, advectVelocityProgram, ['u_velocityTexture', 'u_gridSpacing', 'u_deltaTime']);
    projectStep1Uniforms = getUniformLocations(gl, projectStep1Program, ['u_velocityTexture', 'u_gridSpacing']);
    projectStep2Uniforms = getUniformLocations(gl, projectStep2Program, ['u_projectTexture']);
    projectStep3Uniforms = getUniformLocations(gl, projectStep3Program, ['u_velocityTexture', 'u_projectTexture', 'u_gridSpacing']);
    renderDensityUniforms = getUniformLocations(gl, renderDensityProgram, ['u_densityTexture']);
    renderVelocityUniforms = getUniformLocations(gl, renderVelocityProgram, ['u_velocityTexture']);

    //variables-------------------------------------------------

  }



  init();
  
  function reset () {
    if (requestId !== null) {
      cancelAnimationFrame(requestId);
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0.0, 0.0, canvas.width, canvas.height);

    let velocityFbObjR = createVelocityFramebuffer(gl, canvas.width, canvas.height);
    let velocityFbObjW = createVelocityFramebuffer(gl, canvas.width, canvas.height);
    const swapVelocityFbObj = function() {
      const tmp = velocityFbObjR;
      velocityFbObjR = velocityFbObjW;
      velocityFbObjW = tmp;
    };
    let densityFbObjR = createDensityFramebuffer(gl, canvas.width, canvas.height);
    let densityFbObjW = createDensityFramebuffer(gl, canvas.width, canvas.height);
    const swapDensityFbObj = function() {
      const tmp = densityFbObjR;
      densityFbObjR = densityFbObjW;
      densityFbObjW = tmp;
    };

    let projectFbObjR = createProjectFramebuffer(gl, canvas.width, canvas.height);
    let projectFbObjW = createProjectFramebuffer(gl, canvas.width, canvas.height);
    const swapProjectFbObj = function() {
      const tmp = projectFbObjR;
      projectFbObjR = projectFbObjW;
      projectFbObjW = tmp;
    };

    const initializeVelocity = function() {
      gl.bindFramebuffer(gl.FRAMEBUFFER, velocityFbObjW.framebuffer);
      gl.useProgram(initializeVelocityProgram);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      swapVelocityFbObj();
    };

    const initializeDensityByCircle = function() {
      gl.bindFramebuffer(gl.FRAMEBUFFER, densityFbObjW.framebuffer);
      gl.useProgram(initializeDensityByCircleProgram);
      gl.uniform2f(initializeDensityByCircleUniforms['u_resolution'], canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      swapDensityFbObj();
    };

    /*
    const initializeDensityByChecker = function() {
      gl.bindFramebuffer(gl.FRAMEBUFFER, densityFbObjW.framebuffer);
      gl.useProgram(initializeDensityByCheckerProgram);
      gl.uniform2f(initializeDensityByCheckerUniforms['u_resolution'], canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      swapDensityFbObj();
    }
    */
   
    /*
    const initializeDensityByImage =function() {
      gl.bindFramebuffer(gl.FRAMEBUFFER, densityFbObjW.framebuffer);
      gl.useProgram(initializesDensityByImageProgram);
      setUniformTexture(gl, 0, imageTexture, initializesDensityByImageUniforms['u_imageTexture']);
      gl.uniform2f(initializesDensityByImageUniforms['u_resolution'], canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      swapDensityFbObj();
    }
    */

    const addExternalForce = function(deltaTime) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, velocityFbObjW.framebuffer);
      gl.useProgram(addExternalForceProgram);
      setUniformTexture(gl, 0, velocityFbObjR.velocityTexture, addExternalForceUniforms['u_velocityTexture']);
      gl.uniform1f(addExternalForceUniforms['u_deltaTime'], deltaTime);
      gl.uniform1f(addExternalForceUniforms['u_gridSpacing'], parameters['grid spacing']);
      gl.uniform2fv(addExternalForceUniforms['u_forceCenter'], mousePosition.toArray());
      gl.uniform2fv(addExternalForceUniforms['u_forceDir'], mouseDir.toArray());
      gl.uniform1f(addExternalForceUniforms['u_forceIntensity'], parameters['force intensity']);
      gl.uniform1f(addExternalForceUniforms['u_forceRadius'], parameters['force radius']);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      swapVelocityFbObj();
    };

    const diffuseVelocity = function(deltaTime) {
      gl.useProgram(diffuseVelocityProgram);
      gl.uniform1f(diffuseVelocityUniforms['u_deltaTime'], deltaTime);
      gl.uniform1f(diffuseVelocityUniforms['u_gridSpacing'], parameters['grid spacing']);
      gl.uniform1f(diffuseVelocityUniforms['u_diffuseCoef'], parameters['diffuse coef']);
      for (let i = 0; i < 10; i++) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, velocityFbObjW.framebuffer);
        setUniformTexture(gl, 0, velocityFbObjR.velocityTexture, diffuseVelocityUniforms['u_densityTexture']);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        swapVelocityFbObj();  
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };

    const advectVelocity = function(deltaTime) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, velocityFbObjW.framebuffer);
      gl.useProgram(advectVelocityProgram);
      setUniformTexture(gl, 0, velocityFbObjR.velocityTexture, advectVelocityUniforms['u_velocityTexture']);
      gl.uniform1f(advectVelocityUniforms['u_gridSpacing'], parameters['grid spacing']);
      gl.uniform1f(advectVelocityUniforms['u_deltaTime'], deltaTime);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      swapVelocityFbObj();
    };

    const proceedProjectStep1 = function() {
      gl.bindFramebuffer(gl.FRAMEBUFFER, projectFbObjW.framebuffer);
      gl.useProgram(projectStep1Program);
      setUniformTexture(gl, 0, velocityFbObjR.velocityTexture, projectStep1Uniforms['u_velocityTexture']);
      gl.uniform1f(projectStep1Uniforms['u_gridSpacing'], parameters['grid spacing']);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      swapProjectFbObj();
    };

    const proceedProjectStep2 = function() {
      gl.useProgram(projectStep2Program);
      for (let i = 0; i < 10; i++) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, projectFbObjW.framebuffer);
        setUniformTexture(gl, 0, projectFbObjR.projectTexture, projectStep2Uniforms['u_projectTexture']);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        swapProjectFbObj();
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };

    const proceedProjectStep3 = function() {
      gl.bindFramebuffer(gl.FRAMEBUFFER, velocityFbObjW.framebuffer);
      gl.useProgram(projectStep3Program);
      setUniformTexture(gl, 0, velocityFbObjR.velocityTexture, projectStep3Uniforms['u_velocityTexture']);
      setUniformTexture(gl, 1, projectFbObjR.projectTexture, projectStep3Uniforms['u_projectTexture']);
      gl.uniform1f(projectStep3Uniforms['u_gridSpacing'], parameters['grid spacing']);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      swapVelocityFbObj();
    };

    const projectVelocity = function() {
      proceedProjectStep1();
      proceedProjectStep2();
      proceedProjectStep3();
    };

    const updateVelocity = function(deltaTime) {
      if (mousePressing && mouseMoved) {
        addExternalForce(deltaTime);
      }
      if (parameters['diffuse coef'] > 0.0) {
        diffuseVelocity(deltaTime);
      }
      projectVelocity();
      advectVelocity(deltaTime);
      projectVelocity();
    };

    const addDensitySource = function() {
      gl.bindFramebuffer(gl.FRAMEBUFFER, densityFbObjW.framebuffer);
      gl.useProgram(addDensitySourceProgram);
      setUniformTexture(gl, 0, densityFbObjR.densityTexture, addDensitySourceUniforms['u_densityTexture']);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      swapDensityFbObj();
    };

    const diffuseDensity = function(deltaTime) {
      gl.useProgram(diffuseDensityProgram);
      gl.uniform1f(diffuseDensityUniforms['u_deltaTime'], deltaTime);
      gl.uniform1f(diffuseDensityUniforms['u_gridSpacing'], parameters['grid spacing']);
      gl.uniform1f(diffuseDensityUniforms['u_diffuseCoef'], parameters['diffuse coef']);
      for (let i = 0; i < 10; i++) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, densityFbObjW.framebuffer);
        setUniformTexture(gl, 0, densityFbObjR.densityTexture, diffuseDensityUniforms['u_densityTexture']);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        swapDensityFbObj();
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };

    const advectDensity = function(deltaTime) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, densityFbObjW.framebuffer);
      gl.useProgram(advectDensityProgram);
      setUniformTexture(gl, 0, velocityFbObjR.velocityTexture, advectDensityUniforms['u_velocityTexture']);
      setUniformTexture(gl, 1, densityFbObjR.densityTexture, advectDensityUniforms['u_densityTexture']);
      gl.uniform1f(advectDensityUniforms['u_gridSpacing'], parameters['grid spacing']);
      gl.uniform1f(advectDensityUniforms['u_deltaTime'], deltaTime);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      swapDensityFbObj();
    };

    const updateDensity = function(deltaTime) {
      addDensitySource();
      if (parameters['diffuse coef'] > 0.0) {
        diffuseDensity(deltaTime);
      }
      advectDensity(deltaTime);
    };

    const stepSimulation = function(deltaTime) {
      updateVelocity(deltaTime);
      updateDensity(deltaTime);
    };

    //render mode1
    /*
    const renderVelocity = function() {
      gl.useProgram(renderVelocityProgram);
      setUniformTexture(gl, 0, velocityFbObjR.velocityTexture, renderVelocityUniforms['u_velocityTexture']);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    */
    //reder mode2
    const renderDensity = function() {
      gl.useProgram(renderDensityProgram);
      setUniformTexture(gl, 0, densityFbObjR.densityTexture, renderDensityUniforms['u_densityTexture']);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    //render modeの選択が可能
    const render = function() {
      if (parameters['render'] === 'density') {
        renderDensity();
      } else {
        //renderVelocity();
      }
    };
    //--------------------------------------------------------------------------------------------------
    let simulationSeconds = 0.0;
    let remaindedSimulationSeconds = 0.0;
    let previousRealSeconds = performance.now() * 0.001;
    initializeVelocity();
    if (parameters['initial density'] === 'circle') {
      initializeDensityByCircle();
    } else if (parameters['initial density'] === 'checker') {
      //initializeDensityByChecker();
    } else {
      //initializeDensityByImage();
    }
    //--------------------------------------------------------------------------------------------------
    //main routine------------------
    const loop = function() {
        /*
        const currentRealSeconds = performance.now() * 0.001;
        const nextSimulationSeconds = simulationSeconds + remaindedSimulationSeconds + parameters['time scale'] * Math.min(0.02, currentRealSeconds - previousRealSeconds);
        previousRealSeconds = currentRealSeconds;
     
      
        while(nextSimulationSeconds - simulationSeconds > timeStep) {
            stepSimulation(timeStep);
            simulationSeconds += timeStep;
        }      
        */
       stats.update();
        const timeStep = parameters['time step'];
        stepSimulation(timeStep);
        remaindedSimulationSeconds = nextSimulationSeconds - simulationSeconds;

        render();
        mouseMoved = false;
        requestId = requestAnimationFrame(loop);
    };
    loop();
    //-------------------------------
  };

  reset();


  window.addEventListener('resize', _ => {
    reset();
  });
