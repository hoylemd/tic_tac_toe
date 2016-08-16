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

var TILE_WIDTH = 64;
var TILE_HEIGHT = 64;

function Tile(texture_name) {
  // Aliases
  var Sprite = PIXI.Sprite;
  var TextureCache = PIXI.utils.TextureCache;

  // Attributes
  this.name = texture_name;
  this.events = {}; // Events have a name (string key) and an array of arguments

  this.sibling = null;
  this.flipped_up = false;
  this.solved = false;

  this.x = 0;
  this.y = 0;

  // TODO: only use one sprite and swap textures
  this.front_texture = TextureCache[texture_name];
  this.back_texture = TextureCache['tile_Back.png'];

  this.sprite = new Sprite(this.back_texture);

  // Methods
  function move_to(x, y) {
    this.x = x;
    this.y = y;
  }
  this.move_to = move_to;

  function update(timedelta) {
    this.sprite.x = this.x;
    this.sprite.y = this.y;

    if (this.flipped_up) {
      this.sprite.texture = this.front_texture;
    } else {
       this.sprite.texture = this.back_texture;
    }

    var events = this.events;
    this.events = {};
    return events;
  }
  this.update = update;

  // Interactivity
  this.sprite.interactive = true;

  var tile = this
  function onBackClicked() {
    if (!tile.flipped_up) {
      tile.flipped_up = true;
      tile.events['tile_flipped'] = [];
    }
  }

  // Set interactions
  this.sprite.on('mouseup', onBackClicked)
             .on('touchend', onBackClicked);
}

Tile.TILE_WIDTH = TILE_WIDTH;
Tile.TILE_HEIGHT = TILE_HEIGHT;
