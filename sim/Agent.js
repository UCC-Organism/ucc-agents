define(['pex/geom/Vec3', 'pex/utils/MathUtils', 'pex/utils/Time'], function(Vec3, MathUtils, Time) {

  if (typeof(Vec3.prototype.limit) === 'undefined') {
    Vec3.prototype.limit = function(maxLength) {
      var length = this.length();
      if (length > maxLength) {
        this.scale(1/length).scale(maxLength);
      }
    }
  }

  function Agent(boundingBox) {
    this.position = new Vec3(0, 0, 0);
    this.velocity = new Vec3(0, 0, 0);
    this.acceleration = new Vec3(0, 0, 0);
    this.steer = new Vec3(0, 0, 0);
    this.desired = new Vec3(0, 0, 0);
    this.target = new Vec3(0, 0, 0);
    this.maxSpeed = 0.4;
    this.maxForce = 0.05;
    this.friction = 0.05;
    this.targetRadius = 1;
    this.desiredSeparation = 1;
    this.alignmentDistance = 1;
    this.boundingBox = boundingBox;
    this.chooseNewTarget = false;
  }

  Agent.prototype.update = function() {
    this.velocity.addScaled(this.acceleration, Time.delta);
    this.velocity.limit(this.maxSpeed);
    this.position.addScaled(this.velocity, Time.delta);
    this.velocity.scale(1.0 - this.friction);
    this.acceleration.scale(0);
  }

  Agent.prototype.applyForce = function(force) {
    this.acceleration.add(force);
  }

  Agent.prototype.seek = function(target) {
    this.desired.asSub(target, this.position);
    var d = this.desired.length();
    this.desired.normalize();
    if (d < this.targetRadius) {
      this.desired.scale(MathUtils.map(d, 0, this.targetRadius, 0, this.maxSpeed));
    }
    else {
      this.desired.scale(d);
    }

    this.steer.asSub(this.desired, this.velocity);
    this.steer.limit(this.maxForce);
    this.applyForce(this.steer);
  }

  Agent.prototype.separate = function(agents) {
    var sum = MathUtils.getTempVec3('sum');
    var diff = MathUtils.getTempVec3('diff');
    var count = 0;
    for(var i=0; i<agents.length; i++) {
      var otherAgent = agents[i];
      var d = otherAgent.position.distance(this.position);
      if (d > 0 && d < this.desiredSeparation) {
        diff.asSub(this.position, otherAgent.position);
        diff.normalize();
        sum.add(diff);
        count++;
      }
    }
    if (count > 0) {
      sum.scale(1/count);
      sum.normalize().scale(this.maxForce);
      this.steer.asSub(sum, this.velocity);
      this.steer.limit(this.maxForce);
      this.applyForce(this.steer);
    }
  }

  Agent.prototype.align = function(agents) {
    var sum = MathUtils.getTempVec3('sum');
    var count = 0;
    for(var i=0; i<agents.length; i++) {
      var otherAgent = agents[i];
      var d = otherAgent.position.distance(this.position);
      if (d > 0 && d < this.alignmentDistance) {
        sum.add(otherAgent.velocity);
        count++;
      }
    }
    if (count > 0) {
      sum.scale(1/count);
      sum.normalize().scale(this.maxForce);
      this.steer.asSub(sum, this.velocity);
      this.steer.limit(this.maxForce);
      this.applyForce(this.steer);
    }
  }

  Agent.prototype.bounceBorders = function() {

  }

  Agent.prototype.followPath = function(path, pathWidth) {
    pathWidth = pathWidth || 1;
    var predictedVelocity = MathUtils.getTempVec3('predictedVelocity');
    predictedVelocity.copy(this.velocity).normalize().scale(this.maxSpeed);
    var predictedPos = MathUtils.getTempVec3('predictedPos');
    predictedPos.asAdd(this.position, predictedVelocity); //where we could be in 1s

    var start = path.points[0];
    var end = path.points[1];

    //from start to predicted pos
    var a = MathUtils.getTempVec3('a');
    a.asSub(predictedPos, start);

    //segment direction
    var b = MathUtils.getTempVec3('b');
    b.asSub(end, start).normalize();

    var d = a.length() * a.dot(b);
    b.scale(d);

    var normalPoint = MathUtils.getTempVec3('normalPoint');
    normalPoint.asAdd(start, b);

    if (normalPoint.x < start.x || normalPoint.x > end.x) {
      normalPoint = end;
    }

    var distance = predictedPos.distance(normalPoint);
    if (distance > pathWidth) {
      this.seek(normalPoint);
    }

  }

  return Agent;
})