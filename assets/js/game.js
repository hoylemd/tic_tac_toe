var constants = {
  TILE_COLUMNS: 4,
  TILE_ROWS: 4,
  TILE_WIDTH: 66,
  TILE_HEIGHT: 66
}

// Alias some constructors
var Sprite = PIXI.Sprite;
var Rectangle = PIXI.Rectangle;
var TextureCache = PIXI.utils.TextureCache;

var game = null;

function init_game(width, height, options) {
  var return_package = {
    renderer: null, // PIXI renderer
    stage: null,    // PIXI stage
    last_timestamp: new Date().getTime(),

    // game-specific stuff
    tiles: [],
    ms_since_last_flip: 0
  };

  //Create the renderer
  var renderer = PIXI.autoDetectRenderer(
    constants.TILE_COLUMNS * constants.TILE_WIDTH,
    constants.TILE_ROWS * constants.TILE_HEIGHT,
    options);
  renderer.backgroundColor = 0x999999;

  //Add the canvas to the HTML document
  document.body.appendChild(renderer.view);

  //Create a container object called the `stage`
  var stage = new PIXI.Container();

  //Tell the `renderer` to `render` the `stage`
  renderer.render(stage);

  return_package.renderer = renderer;
  return_package.stage = stage;

  return return_package;
}

function gameLoop() {
  requestAnimationFrame(gameLoop);

  var now = new Date().getTime();
  var timedelta = now - game.last_timestamp;

  for (i in game.tiles) {
    game.tiles[i].update(timedelta);
  }

  game.renderer.render(game.stage);

  game.last_timestamp = now;
}

function done_loading() {
  var earth_sprite = new Sprite(TextureCache['tile_Earth.png']);
  var apophis_sprite = new Sprite(TextureCache['tile_Apophis.png']);

  apophis_sprite.x = 128;
  apophis_sprite.y = 64;

  game.stage.addChild(earth_sprite);
  game.stage.addChild(apophis_sprite);

  // create the tile objects
  var sigma_tile = new Tile('tile_Sigma.png');
  sigma_tile.move_to(128, 0);
  game.stage.addChild(sigma_tile.front);
  game.stage.addChild(sigma_tile.back);
  sigma_tile.flipped_up = true;;

  var theta_tile = new Tile('tile_Theta.png');
  theta_tile.move_to(192, 64);
  game.stage.addChild(theta_tile.front);
  game.stage.addChild(theta_tile.back);

  game.tiles.push(sigma_tile);
  game.tiles.push(theta_tile);

  game.renderer.render(game.stage);

  gameLoop();
}

function main() {
 game = init_game(constants.TILE_COLUMNS, constants.TILE_ROWS);

  var textures = [
  ]
  var texture_atlases = [
    'assets/sprites/symbols.json',
  ]
  PIXI.loader
    .add(textures)
    .add(texture_atlases)
    .load(done_loading)
}

main();
