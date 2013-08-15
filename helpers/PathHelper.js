// Generated by CoffeeScript 1.6.2
var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

define(function(require) {
  var Color, Context, LineBuilder, Mesh, PathHelper, SolidColor;

  Mesh = require('pex/gl/Mesh');
  Context = require('pex/gl/Context');
  LineBuilder = require('pex/geom/gen/LineBuilder');
  Color = require('pex/color/Color');
  SolidColor = require('pex/materials/SolidColor');
  return PathHelper = (function(_super) {
    __extends(PathHelper, _super);

    function PathHelper(path, color) {
      var geom, i, nextPoint, point, _i, _ref;

      color = color || Color.White;
      geom = new LineBuilder();
      for (i = _i = 0, _ref = path.points.length - 2; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        point = path.points[i];
        nextPoint = path.points[i + 1];
        geom.addLine(point, nextPoint);
      }
      PathHelper.__super__.constructor.call(this, geom, new SolidColor({
        color: color
      }), {
        useEdges: true,
        primitiveType: Context.currentContext.gl.LINES
      });
    }

    return PathHelper;

  })(Mesh);
});
