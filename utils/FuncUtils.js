define([], function() {
  return {
    seq: function(min, max) {
      var result = [];
      for(var i=min; i<=max; i++) {
        result.push(i);
      }
      return result;
    }
  }
})