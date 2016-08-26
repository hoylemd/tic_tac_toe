/* Class for game Tiles */

// from pixi.js:
//   PIXI

// Alias
var TextureCache = PIXI.utils.TextureCache;

var TILE_WIDTH = 128;
var TILE_HEIGHT = 128;


function Tile(column, row) {
  var none_texture = TextureCache['none.png'];
  var x_texture = TextureCache['X.png'];
  var o_texture = TextureCache['O.png'];

  PIXI.Sprite.call(this, none_texture);
  this.visible = true;

  this.events = {}; // Events have a name (string key) and an array of arguments

  this.owner = null;

  this.column = column;
  this.x = column + (TILE_WIDTH * column);
  this.row = row;
  this.y = row + (TILE_WIDTH * row);

  this.update = function Tile_update(timedelta) {
    var new_events = this.events;
    this.events = {};
    return new_events;
  }

  this.claim = function Tile_claim(owner) {
    this.owner = owner;
    console.log(owner + " claimed (" + this.column + "," + this.row + ")");
    if (owner === 'player') {
      this.texture = x_texture;
    } else if (owner === 'ai') {
      this.texture = o_texture;
    }
  };

  // Input handlers
  this.interactive = true;

  var that = this
  function onClicked() {
    that.events['claim'] = [];
  }

  // Set interactions
  this.on('mouseup', onClicked)
      .on('touchend', onClicked);
}
Tile.prototype = Object.create(PIXI.Sprite.prototype);

Tile.TILE_WIDTH = TILE_WIDTH;
Tile.TILE_HEIGHT = TILE_HEIGHT;
