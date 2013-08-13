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
var BoundingBox = pex.geom.BoundingBox;

pex.require(['utils/FuncUtils', 'utils/GLX', 'utils/GeomUtils', 'sim/Agent', 'helpers/BoundingBoxHelper'],
  function(FuncUtils, GLX, GeomUtils, Agent, BoundingBoxHelper) {
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
    mouseDown: false,
    init: function() {
      Time.verbose = true;

      this.boundingBox = BoundingBox.fromPositionSize(new Vec3(0,0,0), new Vec3(30,15,1));
      console.log(this.boundingBox);
      this.boundingBoxHelper = new BoundingBoxHelper(this.boundingBox);

      this.agents = FuncUtils.seq(0, this.numAgents).map(function(i) {
        var agent = new Agent(this.boundingBox);
        agent.position = new Vec3(this.boundingBox.min.x, 0, 0);
        agent.target = MathUtils.randomVec3InBoundingBox(this.boundingBox);
        return agent;
      }.bind(this));

      this.camera = new pex.scene.PerspectiveCamera(60, this.width/this.height);
      this.arcball = new pex.scene.Arcball(this, this.camera, 17);
      this.arcball.target = new Vec3(0,0,0);
      this.arcball.updateCamera();
      this.framerate(30);

      var bodyCube = new Cube(0.2, 0.2, 0.4);
      var headCube = new Cube(0.21, 0.21, 0.21);
      var headTransform = new Mat4().translate(0, 0.0, 0.3);
      GeomUtils.transformVertices(headCube, headTransform);

      this.agentBody = new pex.gl.Mesh(bodyCube, new pex.materials.Diffuse({diffuseColor:Color.White}));
      this.agentHead = new pex.gl.Mesh(headCube, new pex.materials.Diffuse({diffuseColor:Color.Yellow}));

      this.cube = new pex.gl.Mesh(new Cube(0.1), new pex.materials.Diffuse({diffuseColor:Color.Green}));

      this.glx = new GLX();
      this.glx.clearColorAndDepth(Color.Black).enableDepthWriteAndRead().cullFace(false)

      this.on('leftMouseDown', function(e) {
        this.mouseDown = true;
      }.bind(this));
      this.on('leftMouseUp', function(e) {
        this.mouseDown = false;
      }.bind(this));
    },
    draw: function() {
      var target = new Vec3(
        2 * Math.cos(Time.seconds*2),
        2 * Math.cos(Time.seconds),
        2 * Math.sin(Time.seconds*2)
      );

      this.glx.clearColorAndDepth(Color.Black).enableDepthWriteAndRead().cullFace(false);

      this.agents.forEach(function(agent, i) {
        agent.update();
        agent.rotation = GeomUtils.quatFromDirection(agent.velocity);
      }.bind(this));

      this.agentBody.drawInstances(this.camera, this.agents);
      this.agentHead.drawInstances(this.camera, this.agents);

      this.cube.position = target;
      this.cube.draw(this.camera);

      this.boundingBoxHelper.draw(this.camera);
    }
  });
})

