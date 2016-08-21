/* Class for game Tiles */

// from pixi.js:
//   PIXI

// Alias
var TextureCache = PIXI.utils.TextureCache;

var TILE_WIDTH = 128;
var TILE_HEIGHT = 128;


function Tile() {
  PIXI.Sprite.call(this, TextureCache['']);

  this.name = tile_name;
  this.events = {}; // Events have a name (string key) and an array of arguments

  this.sibling = null;
  this.flipped_up = false;
  this.solved = false;

  this.x = 0;
  this.y = 0;

  this.front_texture = TextureCache[texture_name];
  this.back_texture = back_texture

  // Methods
  this.move_to = function Tile_move_to(x, y) {
    this.x = x;
    this.y = y;
  }

  this.update = function Tile_update(timedelta) {
    var new_events = this.events;
    this.events = {};
    return new_events;
  }

  this.flip_up = function Tile_flip_up() {
    if (!this.flipped_up) {
      this.flipped_up = true;
      this.texture = this.front_texture
    }
  };

  this.flip_down = function Tile_flip_down() {
    if (this.flipped_up) {
      this.flipped_up = false;
      this.texture = this.back_texture
    }
  };

  this.solve = function Tile_solve() {
    this.flip_up();
    this.solved = true;
  }

  // Input handlers
  this.interactive = true;

  var that = this
  function onClicked() {
    if (!this.solved) {
      that.events['tile_flipped'] = [];
    }
  }

  // Set interactions
  this.on('mouseup', onClicked)
      .on('touchend', onClicked);
}
Tile.prototype = Object.create(PIXI.Sprite.prototype);

Tile.TILE_WIDTH = TILE_WIDTH;
Tile.TILE_HEIGHT = TILE_HEIGHT;
