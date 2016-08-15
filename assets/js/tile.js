/* Class for game Tiles */

/* tiles
 * tile_A
 * tile_Apophis
 * tile_Delta
 * tile_Earth
 * tile_Gamma
 * tile_Omega
 * tile_Sigma
 * tile_Theta
 *
 * tile_Back
 * */

var TIME_TO_FLIP = 1500;
var TILE_WIDTH = 64;
var TILE_HEIGHT = 64;

function Tile(texture_name) {
  // Aliases
  var Sprite = PIXI.Sprite;
  var TextureCache = PIXI.utils.TextureCache;

  // Attributes
  this.name = texture_name;
  this.sibling = null;

  this.x = 0;
  this.y = 0;

  this.front = new Sprite(TextureCache[texture_name]);
  this.front.visible = false;

  this.back = new Sprite(TextureCache['tile_Back.png']);
  this.back.visible = true;

  this.time_since_last_flip = 0;
  this.flipped_up = false;

  this.solved = false;

  function move_to(x, y) {
    this.x = x;
    this.y = y;
  }
  this.move_to = move_to;

  function update(timedelta) {

    this.time_since_last_flip += timedelta;

    if (this.time_since_last_flip >= TIME_TO_FLIP) {
      this.flipped_up = !this.flipped_up;
      this.time_since_last_flip = 0;
    }

    this.front.x = this.x;
    this.front.y = this.y;
    this.front.visible = this.flipped_up;

    this.back.x = this.x;
    this.back.y = this.y;
    this.back.visible = !this.flipped_up;

  }
  this.update = update;
}

Tile.TILE_WIDTH = TILE_WIDTH;
Tile.TILE_HEIGHT = TILE_HEIGHT;
