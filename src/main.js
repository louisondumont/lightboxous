
/*globals define*/
define('main', function(require, exports, module) {
    "use strict";

  // Dependencies
  var Engine = require('famous/core/Engine');
  var Surface = require('famous/core/Surface');
  var Transform = require('famous/core/Transform');
  var ImageLightbox = require('modules/ImageLightbox');
  var StateModifier = require('famous/modifiers/StateModifier');
  
  // Create context
  var mainContext = Engine.createContext();

  // Image
  var pos = [0, 300]
  var size = [480, 360];
  var img = new ImageLightbox({
    url: 'linkedinView.jpg',
    thumbSize: size,
    thumbPos: pos
  });
  var sm = new StateModifier({
    transform: Transform.translate(pos[0], pos[1], 0)
  });

  mainContext.add(sm).add(img);  
});
