var pex = pex || require('./lib/pex');

var Platform = pex.sys.Platform;

pex.require([], function() {
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
    init: function() {
    },
    draw: function() {
    }
  });
})

