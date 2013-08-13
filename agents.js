var pex = pex || require('./lib/pex');

var Platform = pex.sys.Platform;
var MathUtils = pex.utils.MathUtils;
var PerspectiveCamera = pex.scene.PerspectiveCamera;
var Arcball = pex.scene.Arcball;

pex.require(['utils/FuncUtils', 'utils/GLX', 'sim/Agent'], function(FuncUtils, GLX, Agent) {
  pex.sys.Window.create({
    settings: {
      width: 1280,
      height: 720,
      type: '3d',
      vsync: false,
      multisample: true,
      fullscreen: Platform.isBrowser,
      center: true
    },
    numAgents: 50,
    agents: [],
    agentSpreadRadius: 5,
    init: function() {
      this.agents = FuncUtils.seq(0, this.numAgents).map(function(i) {
        var agent = new Agent();
        agent.position.copy(MathUtils.randomVec3().scale(this.agentSpreadRadius));
        return agent;
      }.bind(this));

      this.camera = new pex.scene.PerspectiveCamera(60, this.width/this.height);
      this.arcball = new pex.scene.Arcball(this, this.camera, 5);
      this.framerate(30);

      this.agentMesh = new pex.gl.Mesh(new pex.geom.gen.Cube(0.2), new pex.materials.Test());

      this.glx = new GLX();
    },
    draw: function() {
      this.glx.clearColorAndDepth().enableDepthWriteAndRead()
      this.agentMesh.drawInstances(this.camera, this.agents);
    }
  });
})

