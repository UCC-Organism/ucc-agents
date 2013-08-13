var pex = pex || require('./lib/pex');

var Platform = pex.sys.Platform;
var MathUtils = pex.utils.MathUtils;
var PerspectiveCamera = pex.scene.PerspectiveCamera;
var Arcball = pex.scene.Arcball;
var Cube = pex.geom.gen.Cube;
var hem = pex.geom.hem;
var Color = pex.color.Color;

pex.require(['utils/FuncUtils', 'utils/GLX', 'sim/Agent', 'geom/Pyramid'], function(FuncUtils, GLX, Agent, Pyramid) {
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
    agentSpreadRadius: 15,
    init: function() {
      this.agents = FuncUtils.seq(0, this.numAgents).map(function(i) {
        var agent = new Agent();
        agent.position.copy(MathUtils.randomVec3().scale(this.agentSpreadRadius));
        agent.position.z = 0;
        return agent;
      }.bind(this));

      this.camera = new pex.scene.PerspectiveCamera(60, this.width/this.height);
      this.arcball = new pex.scene.Arcball(this, this.camera, 5);
      this.framerate(30);

      var pyramid = hem().fromGeometry(new Pyramid()).toFlatGeometry();
      pyramid = new Pyramid();
      pyramid2 = new Pyramid();
      //this.agentMesh = new pex.gl.Mesh(pyramid, new pex.materials.SolidColor(), {useEdges:true});
      this.agentMesh2 = new pex.gl.Mesh(pyramid2, new pex.materials.Diffuse({wrap:1, ambientColor:Color.Red}));

      this.glx = new GLX();
    },
    draw: function() {
      this.agents.forEach(function(agent) {
        agent.update();
      })
      this.glx.clearColorAndDepth().enableDepthWriteAndRead().cullFace(false)
      //this.agentMesh.drawInstances(this.camera, this.agents);

      this.agentMesh2.draw(this.camera);
      //this.agentMesh.draw(this.camera);
    }
  });
})

