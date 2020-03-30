function createVelocityFramebuffer(gl, width, height) {
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    const velocityTexture = createTexture(gl, width, height, gl.RG32F, gl.RG, gl.FLOAT);
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