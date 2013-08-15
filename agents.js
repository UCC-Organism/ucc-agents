var pex = pex || require('./lib/pex');

var Platform = pex.sys.Platform;
var MathUtils = pex.utils.MathUtils;
var PerspectiveCamera = pex.scene.PerspectiveCamera;
var Arcball = pex.scene.Arcball;
var Cube = pex.geom.gen.Cube;
var hem = pex.geom.hem;
var Color = pex.color.Color;
var Vec2 = pex.geom.Vec2;
var Vec3 = pex.geom.Vec3;
var Vec4 = pex.geom.Vec4;
var Mat4 = pex.geom.Mat4;
var Quat = pex.geom.Quat;
var Time = pex.utils.Time;
var BoundingBox = pex.geom.BoundingBox;
var GUI = pex.gui.GUI;
var SolidColor = pex.materials.SolidColor;
var Mesh = pex.gl.Mesh;

pex.require(['utils/FuncUtils', 'utils/GLX', 'utils/GeomUtils', 'sim/Agent', 'helpers/BoundingBoxHelper', 'lib/timeline', 'lib/TWEEN',
  'geom/Path', 'helpers/PathHelper'],
  function(FuncUtils, GLX, GeomUtils, Agent, BoundingBoxHelper, timeline, TWEEN, Path, PathHelper) {

  anim = timeline.anim

  pex.sys.Window.create({
    settings: {
      width: 1280,
      height: 660,
      type: '3d',
      vsync: false,
      multisample: true,
      fullscreen: Platform.isBrowser,
      center: true
    },
    numAgents: 40,
    agents: [],
    agentSpreadRadius: 15,
    mouseDown: false,
    test: 0,
    target: new Vec3(0, 0, 0),
    agentSeparation: 0,
    agentAlignment: true,
    init: function() {
      Time.verbose = true;

      this.gui = new GUI(this);

      function updateTargets() {
        this.agents.forEach(function(agent) {
          agent.target = this.target;
        }.bind(this))
      }

      function randomizeTarget() {
        this.agents.forEach(function(agent) {
          //agent.target = MathUtils.randomVec3().scale(5).add(agent.position);
        }.bind(this))
      }

      var bboxCenter = new Vec3(0,0,0);
      var bboxSize = new Vec3(100, 50, 2);
      this.boundingBox = BoundingBox.fromPositionSize(bboxCenter, bboxSize);
      console.log(this.boundingBox)
      this.helpers = [];
      this.helpers.push(new BoundingBoxHelper(this.boundingBox));
      var avatarSize = bboxSize.x/150;

      this.groups = [];
      this.groups.push({
        agents: [],
        startingPos: new Vec3(this.boundingBox.min.x, 0, 0),
        target: new Vec3(0, 0, 0),
        color: Color.Red
      });
      /*
      this.groups.push({
        agents: [],
        startingPos: new Vec3(this.boundingBox.max.x, 0, 0),
        target: new Vec3(0, 0, 0),
        color: Color.Green
      });
      this.groups.push({
        agents: [],
        startingPos: new Vec3(0, this.boundingBox.min.y, 0),
        target: new Vec3(0, 0, 0),
        color: Color.Blue
      });
      this.groups.push({
        agents: [],
        startingPos: new Vec3(0, this.boundingBox.max.y, 0),
        target: new Vec3(0, 0, 0),
        color: Color.Pink
      });
      */

      this.paths = [];
      this.paths.push(new Path([
        new Vec3(this.boundingBox.min.x, 0, 0),
        new Vec3(this.boundingBox.min.x + bboxSize.x*0.3, this.boundingBox.min.y*0.3, 0),
        new Vec3(this.boundingBox.min.x + bboxSize.x*0.6, this.boundingBox.max.y*0.3, 0),
        new Vec3(this.boundingBox.min.x + bboxSize.x*1.0, 0, 0)
      ]));

      this.helpers.push(new PathHelper(this.paths[0], Color.Red));

      var center = new TWEEN.Tween(this.target).to({x:bboxSize.x/2, y:0, z:0}, 5000).delay(0).start().onUpdate(updateTargets.bind(this)).onComplete(randomizeTarget.bind(this));
      var top  = new TWEEN.Tween(this.target).to({x:0, y:bboxSize.y/2, z:0}, 5000).delay(3000).onUpdate(updateTargets.bind(this)).onComplete(randomizeTarget.bind(this));
      var bottom  = new TWEEN.Tween(this.target).to({x:0, y:-bboxSize.y/2, z:0}, 5000).delay(3000).onUpdate(updateTargets.bind(this)).onComplete(randomizeTarget.bind(this));

      center.chain(top);
      top.chain(bottom);
      bottom.chain(center);

      this.agentSeparation = avatarSize * 2;
      this.agentAlignment = this.agentSeparation * 5;
      this.gui.addLabel('Agents');
      this.gui.addParam('Separation', this, 'agentSeparation', {min:0, max:avatarSize*15});
      this.gui.addParam('Alignmnent', this, 'agentAlignment', {min:0, max:avatarSize*15});

      for(var j=0; j<this.groups.length; j++) {
        var group = this.groups[j];
        for(var i=0; i<this.numAgents/4; i++) {
          var agent = new Agent(this.boundingBox);
          agent.maxSpeed = bboxSize.x/5; //fly through whole bounding box in 5s
          agent.maxForce = bboxSize.x/5; //achieve max speed in 1s
          agent.desiredSeparation = this.agentSeparation;
          agent.alignmentDistance = this.agentAlignment;
          agent.targetRadius = this.agentSeparation * 0.5;
          agent.friction = 0.05;
          agent.position = MathUtils.randomVec3().scale(bboxSize.x/10).add(group.startingPos);
          agent.velocity = MathUtils.randomVec3().scale(agent.maxSpeed);
          agent.offset = MathUtils.randomVec3().scale(5);
          agent.target = MathUtils.randomVec3InBoundingBox(this.boundingBox);
          agent.rotation = new Quat();
          agent.group = group;
          this.groups[j].agents.push(agent);
          this.agents.push(agent);
        }
      }

      this.camera = new pex.scene.PerspectiveCamera(60, this.width/this.height);
      this.arcball = new pex.scene.Arcball(this, this.camera, bboxSize.x*0.55);
      this.arcball.target = new Vec3(0,0,0);
      this.arcball.updateCamera();
      this.arcball.enabled = false;
      this.gui.addLabel('Camera');
      this.gui.addParam('Arcball', this.arcball, 'enabled');
      this.framerate(30);

      var bodyCube = new Cube(avatarSize, avatarSize, avatarSize * 2);
      var headCube = new Cube(avatarSize*1.05, avatarSize*1.05, avatarSize*1.05);
      var headTransform = new Mat4().translate(0, 0.0, avatarSize*1.5);
      GeomUtils.transformVertices(headCube, headTransform);

      this.agentBody = new pex.gl.Mesh(bodyCube, new pex.materials.Diffuse({diffuseColor:Color.White}));
      this.agentHead = new pex.gl.Mesh(headCube, new pex.materials.Diffuse({diffuseColor:Color.White}));

      this.cube = new pex.gl.Mesh(new Cube(bboxSize.x/100), new pex.materials.Diffuse({diffuseColor:Color.Green}));

      this.glx = new GLX();
      this.glx.clearColorAndDepth(Color.Black).enableDepthWriteAndRead().cullFace(false)

      this.on('leftMouseDown', function(e) {
        this.mouseDown = true;
      }.bind(this));
      this.on('leftMouseUp', function(e) {
        this.mouseDown = false;
      }.bind(this));

      var targetCube = new Cube(avatarSize, avatarSize, avatarSize);
      targetCube.computeEdges();
      this.targetCubeMesh = new Mesh(targetCube, new SolidColor({color:Color.Yellow}), {useEdges:true, primitiveType:this.gl.LINES});
    },
    draw: function() {
      timeline.Timeline.getGlobalInstance().update();
      TWEEN.update();

      if (Time.frameNumber % 30 == 0) {
        console.log('Vec2:' + Vec2.count + ' Vec3:' + Vec3.count + ' Vec4:' + Vec4.count + ' Mat4:' + Mat4.count + ' Quat:' + Quat.count)
        Vec2.count = Vec3.count = Vec4.count = Mat4.count = Quat.count = 0;
      }

      this.glx.clearColorAndDepth(Color.Black).enableDepthWriteAndRead().cullFace(false);

      this.agents.forEach(function(agent, i) {
        agent.desiredSeparation = this.agentSeparation;
        agent.alignmentDistance = this.agentAlignment;
        //agent.seek(agent.target);
        agent.followPath(this.paths[0], this.agentSeparation/2);
        agent.separate(this.agents);
        //agent.align(this.agents);
        agent.update();
        agent.rotation.setQuat(GeomUtils.quatFromDirection(agent.velocity));

        this.targetCubeMesh.material.uniforms.color = Color.Green;
        this.targetCubeMesh.position = agent.predictedPos;
        this.targetCubeMesh.draw(this.camera);

        this.targetCubeMesh.material.uniforms.color = Color.Yellow;
        this.targetCubeMesh.position = agent.closestNormalPoint;
        this.targetCubeMesh.draw(this.camera);
      }.bind(this));

      for(var j=0; j<this.groups.length; j++) {
        var group = this.groups[j];
        this.agentBody.material.uniforms.diffuseColor = group.color;
        this.agentBody.drawInstances(this.camera, group.agents);
        this.agentHead.drawInstances(this.camera, group.agents);
      }

      this.cube.position = this.target;
      this.cube.draw(this.camera);

      for(var i=0; i<this.helpers.length; i++) {
        this.helpers[i].draw(this.camera);
      }

      this.gui.draw();
    }
  });
})

