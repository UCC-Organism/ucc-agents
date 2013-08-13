var pex = pex || require('./lib/pex');

var Platform = pex.sys.Platform;
var MathUtils = pex.utils.MathUtils;
var PerspectiveCamera = pex.scene.PerspectiveCamera;
var Arcball = pex.scene.Arcball;
var Cube = pex.geom.gen.Cube;
var hem = pex.geom.hem;
var Color = pex.color.Color;
var Mat4 = pex.geom.Mat4;
var Quat = pex.geom.Quat;
var Vec3 = pex.geom.Vec3;
var Time = pex.utils.Time;

pex.require(['utils/FuncUtils', 'utils/GLX', 'utils/GeomUtils', 'sim/Agent', 'geom/Pyramid'], 
  function(FuncUtils, GLX, GeomUtils, Agent, Pyramid) {
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
    numAgents: 150,
    agents: [],
    agentSpreadRadius: 15,
    init: function() {
      this.agents = FuncUtils.seq(0, this.numAgents).map(function(i) {
        var agent = new Agent();
        agent.position.copy(MathUtils.randomVec3().scale(this.agentSpreadRadius));
        //agent.position.z = 0;
        return agent;
      }.bind(this));

      this.camera = new pex.scene.PerspectiveCamera(60, this.width/this.height);
      this.arcball = new pex.scene.Arcball(this, this.camera, 5);
      this.framerate(30);

      var bodyCube = new Cube(0.2, 0.2, 0.4);
      var headCube = new Cube(0.21, 0.21, 0.21);
      var headTransform = new Mat4().translate(0, 0, 0.3);
      GeomUtils.transformVertices(headCube, headTransform);

      this.agentBody = new pex.gl.Mesh(bodyCube, new pex.materials.Diffuse({diffuseColor:Color.White}));
      this.agentHead = new pex.gl.Mesh(headCube, new pex.materials.Diffuse({diffuseColor:Color.Yellow}));

      this.cube = new pex.gl.Mesh(new Cube(0.1), new pex.materials.Diffuse({diffuseColor:Color.Green}));

      this.glx = new GLX();
      this.glx.clearColorAndDepth(Color.Black).enableDepthWriteAndRead().cullFace(false)
    },
    draw: function() {
      var target = new Vec3(
        2 * Math.cos(Time.seconds*2),
        2 * Math.cos(Time.seconds),
        2 * Math.sin(Time.seconds*2)
      );
      var dir = new Vec3();

      this.glx.clearColorAndDepth(Color.Black).enableDepthWriteAndRead().cullFace(false)

      this.agents.forEach(function(agent) {
        //agent.update();
        dir.asSub(target, agent.position);
        this.agentBody.position = this.agentHead.position = agent.position;
        this.agentBody.rotation = this.agentHead.rotation = GeomUtils.quatFromDirection(dir);
        this.agentBody.draw(this.camera);
        this.agentHead.draw(this.camera);
      }.bind(this));

      this.cube.position = target;
      this.cube.draw(this.camera);
    }
  });
})

