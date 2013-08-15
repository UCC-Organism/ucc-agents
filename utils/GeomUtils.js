define(['pex/geom/Vec3', 'pex/geom/Quat', 'pex/geom/Mat4', 'pex/utils/MathUtils'], function(Vec3, Quat, Mat4, MathUtils) {
  return {
    transformVertices: function(geom, matrix) {
      geom.vertices.forEach(function(v) {
        v.transformMat4(matrix);
      })
    },
    quatFromDirection: function(direction) {
      //var up = new Vec3(0, 1, 0);
      //var dir = direction.dup().normalize()
      //if (Math.abs(dir.y) > Math.abs(dir.x) && Math.abs(dir.y) > Math.abs(dir.z)) {
      ////  up = new Vec3(1, 0, 0);
      //}
      //var sign = (direction.y > 0) ? -1 : 1;
      //var rot = Vec3.create().asCross(dir, up);
      //var q = new Quat().setAxisAngle(rot, -90);
      //return q;

      var dir = MathUtils.getTempVec3('dir');
      dir.copy(direction).normalize();

      var up = MathUtils.getTempVec3('up');
      up.set(0, 1, 0);

      var right = MathUtils.getTempVec3('right');
      right.asCross(up, dir);
      up.asCross(dir, right);
      right.normalize();
      up.normalize();

      var m = MathUtils.getTempMat4('m');
      m.set4x4r(
        right.x, right.y, right.z, 0,
        up.x, up.y, up.z, 0,
        dir.x, dir.y, dir.z, 0,
        0, 0, 0, 1
      );

      // Step 3. Build a quaternion from the matrix
      var q = MathUtils.getTempQuat('q');
      q.w = Math.sqrt(1.0 + m.a11 + m.a22 + m.a33) / 2.0;
      var dfWScale = q.w * 4.0;
      //q.x = ((m.a32 - m.a23) / dfWScale);
      //q.y = ((m.a13 - m.a31) / dfWScale);
      //q.z = ((m.a21 - m.a12) / dfWScale);
      q.x = ((m.a23 - m.a32) / dfWScale);
      q.y = ((m.a31 - m.a13) / dfWScale);
      q.z = ((m.a12 - m.a21) / dfWScale);

      return q;
    }
  }
})