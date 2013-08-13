define(['pex/gl/Context', 'pex/color/Color'], function(Context, Color) {
  function GLX() {
    this.gl = Context.currentContext.gl;

    if (this.gl.getExtension) {
      this.gl.getExtension('OES_standard_derivatives');
    }
  }

  GLX.prototype.clearColor = function(color) {
    var gl = this.gl;
    if (color)
      gl.clearColor(color.r, color.g, color.b, color.a);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return this;
  };

  GLX.prototype.clearDepth = function(color) {
    var gl = this.gl;
    gl.clear(gl.DEPTH_BUFFER_BIT);
    return this;
  };

  GLX.prototype.clearColorAndDepth = function(color) {
    var gl = this.gl;
    color = color || Color.Black;
    gl.clearColor(color.r, color.g, color.b, color.a);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    return this;
  };

  GLX.prototype.enableDepthWriteAndRead = function(depthWrite, depthRead) {
    if (depthWrite === undefined) depthWrite = true;
    if (depthRead === undefined) depthRead = true;
    var gl = this.gl;


    if (depthWrite) gl.depthMask(1);
    else gl.depthMask(0);

    if (depthRead) gl.enable(gl.DEPTH_TEST);
    else gl.disable(gl.DEPTH_TEST);

    gl.depthFunc(gl.LEQUAL);

    return this;
  };

  GLX.prototype.enableAdditiveBlending = function() {
    return this.enableBlending('ONE', 'ONE');
  };

  GLX.prototype.enableAlphaBlending = function(src, dst) {
    return this.enableBlending('SRC_ALPHA', 'ONE_MINUS_SRC_ALPHA');
  };

  GLX.prototype.enableBlending = function(src, dst) {
    var gl = this.gl;
    if (src === false) {
      gl.disable(gl.BLEND);
      return this;
    }
    gl.enable(gl.BLEND);
    gl.blendFunc(gl[src], gl[dst]);
    return this;
  };

  GLX.prototype.viewport = function(x, y, w, h) {
    var gl = this.gl;
    gl.viewport(x, y, w, h);
    return this;
  };

  GLX.prototype.cullFace = function(enabled) {
    enabled = (enabled !== undefined) ? enabled : true
    var gl = this.gl;
    if (enabled)
      gl.enable(gl.CULL_FACE);
    else
      gl.disable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    return this;
  };

  GLX.prototype.lineWidth = function(width) {
    var gl = this.gl;
    gl.lineWidth(width);
    return this;
  }

  return GLX;
});