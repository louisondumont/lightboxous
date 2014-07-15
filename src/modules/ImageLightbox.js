define(function(require, exports, module) {
    "use strict";

    var Engine = require('famous/core/Engine');
    var RenderNode = require('famous/core/RenderNode');
    var ImageSurface = require('famous/surfaces/ImageSurface');
    var Transform = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Transitionable = require('famous/transitions/Transitionable');
    var SnapTransition = require('famous/transitions/SnapTransition');
    var Modifier = require('famous/core/Modifier');

    Transitionable.registerMethod('snap', SnapTransition);
    var snap = { method: 'snap', period: 1000, dampingRatio: 0.5 }

    function ImageLightbox(options) {
        RenderNode.apply(this, arguments);
  
        // Create the image
        this.imageSurface = new ImageSurface({
            content: options.url,
            size: [undefined, undefined]
        });
    
        // Main modifier
        this.modifier = new Modifier({
            size: options.thumbSize
        }); 

        // States
        this.initial = {
            size: options.thumbSize,
            parentModifierPos: options.thumbPos,
            pos: [0, 0]
        }
        this.end = {
            size: [],
            pos: []      
        };
        this.fullScreen = false;

        // Modifier size transition
        this.sizeTrans = new Transitionable(this.initial.size);
        this.modifier.sizeFrom(function(){
            return this.sizeTrans.get();
        }.bind(this));

        _calculateSizeAndPos.call(this);
        _monitor.call(this);

        this.add(this.modifier).add(this.imageSurface);
    }

    ImageLightbox.prototype = Object.create(RenderNode.prototype);
    ImageLightbox.prototype.constructor = ImageLightbox;

    ImageLightbox.DEFAULT_OPTIONS = {};

    function _monitor() {
        this.imageSurface.on('click', function(e) {
            _toggleFullscreen.call(this);
        }.bind(this));

        Engine.on('resize', function(){
            if(this.fullScreen) {
                _calculateSizeAndPos.call(this);
                _updateAll.call(this);
            }
        }.bind(this));
    }

    var _calculateSizeAndPos = function() {
        console.log(this);
            var imageRatio = this.initial.size[0]/this.initial.size[1];
            var screenRatio = window.innerWidth/window.innerHeight;

            if(imageRatio > screenRatio) { 
                console.log('width limiter')
                this.end.size[0] = window.innerWidth;
                this.end.size[1] = this.end.size[0]/imageRatio;
                this.end.pos[0] = -this.initial.parentModifierPos[0];
                this.end.pos[1] = -this.initial.parentModifierPos[1] + (window.innerHeight - this.end.size[1])/2;
            }
            else {

                console.log('height limiter')
                this.end.size[1] = window.innerHeight;
                this.end.size[0] = this.end.size[1]*imageRatio;
                this.end.pos[0] = -this.initial.parentModifierPos[0] + (window.innerWidth - this.end.size[0])/2;
                this.end.pos[1] = -this.initial.parentModifierPos[1];
            }
    }

    function _updateSize(when) {
        this.sizeTrans.halt();
        this.sizeTrans.set([this[when].size[0], this[when].size[1], 0], snap);
    }

    function _updatePosition(when) {
        this.modifier.setTransform(this.modifier.getFinalTransform());
        this.modifier.setTransform(Transform.translate(this[when].pos[0], this[when].pos[1], 0), snap);
    }

    function _updateAll() {
        _updatePosition.call(this, (this.fullScreen) ? 'end' : 'initial');
        _updateSize.call(this, (this.fullScreen) ? 'end' : 'initial');
    }

    function _toggleFullscreen() {
        this.fullScreen = !this.fullScreen;
        _updateAll.call(this);
    }

    module.exports = ImageLightbox;
});