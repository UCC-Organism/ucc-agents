define(['pex/geom/Vec3', 'pex/utils/MathUtils'], function(Vec3, MathUtils) {

  if (typeof(Vec3.prototype.limit) === 'undefined') {
    Vec3.prototype.limit = function(maxLength) {
      var length = this.length();
      if (length > maxLength) {
        this.scale(1/length).scale(maxLength);
      }
    }
  }

  function Agent() {
    this.position = new Vec3(0, 0, 0);
    this.velocity = new Vec3(0, 0, 0);
    this.acceleration = new Vec3(0, 0, 0);
    this.steer = new Vec3(0, 0, 0);
    this.desired = new Vec3(0, 0, 0);
    this.target = new Vec3(0, 0, 0);
    this.maxSpeed = 0.15;
    this.maxForce = 0.15;
    this.targetRadius = 2;
  }

  Agent.prototype.update = function() {
    this.seek(this.target);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
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
      this.desired.scale(this.maxSpeed);
    }
    this.steer.asSub(this.desired, this.velocity);
    this.steer.limit(this.maxForce);
    this.applyForce(this.steer);
  }

  return Agent;
})