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

pex.require(['utils/FuncUtils', 'utils/GLX', 'utils/GeomUtils', 'sim/Agent', 'helpers/BoundingBoxHelper', 'lib/timeline', 'lib/TWEEN'],
  function(FuncUtils, GLX, GeomUtils, Agent, BoundingBoxHelper, timeline, TWEEN) {

  anim = timeline.anim

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
    test: 0,
    target: new Vec3(0, 0, 0),
    init: function() {
      Time.verbose = true;

      function updateTargets() {
        this.agents.forEach(function(agent) {
          agent.target.copy(this.target);
        }.bind(this))
      }

      function randomizeTarget() {
        this.agents.forEach(function(agent) {
          //agent.target = MathUtils.randomVec3().scale(5).add(agent.position);
        }.bind(this))
      }

      //anim(this).to({test:1}, 5)
      var center = new TWEEN.Tween(this.target).to({x:30/2, y:0, z:0}, 5000).delay(1000).start().onUpdate(updateTargets.bind(this)).onComplete(randomizeTarget.bind(this));
      var top  = new TWEEN.Tween(this.target).to({x:0, y:15/2, z:0}, 5000).delay(5000).onUpdate(updateTargets.bind(this)).onComplete(randomizeTarget.bind(this));
      var bottom  = new TWEEN.Tween(this.target).to({x:0, y:-15/2, z:0}, 5000).delay(5000).onUpdate(updateTargets.bind(this)).onComplete(randomizeTarget.bind(this));

      center.chain(top);
      top.chain(bottom);
      bottom.chain(center);

      this.boundingBox = BoundingBox.fromPositionSize(new Vec3(0,0,0), new Vec3(30,15,15));
      console.log(this.boundingBox);
      this.boundingBoxHelper = new BoundingBoxHelper(this.boundingBox);

      this.agents = FuncUtils.seq(0, this.numAgents).map(function(i) {
        var agent = new Agent(this.boundingBox);
        agent.position = MathUtils.randomVec3();
        agent.offset = MathUtils.randomVec3().scale(5);
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
      timeline.Timeline.getGlobalInstance().update();
      TWEEN.update();

     this.glx.clearColorAndDepth(Color.Black).enableDepthWriteAndRead().cullFace(false);

     this.agents.forEach(function(agent, i) {
        //agent.target = this.target;
        agent.update();
        agent.rotation = GeomUtils.quatFromDirection(agent.velocity);
      }.bind(this));

      this.agentBody.drawInstances(this.camera, this.agents);
      this.agentHead.drawInstances(this.camera, this.agents);

      this.cube.position = this.target;
      this.cube.draw(this.camera);

      this.boundingBoxHelper.draw(this.camera);
    }
  });
})

