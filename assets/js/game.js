var constants = {
  TILE_COLUMNS: 6,
  TILE_ROWS: 6,
  TILE_WIDTH: 66,
  TILE_HEIGHT: 66
}

function init_game(width, height, options) {
  var return_package = {
    renderer: null, // PIXI renderer
    stage: null,    // PIXI stage
    resources: PIXI.loader.resources  // PIXI resources
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

function main() {
 var PI = 3.14159;

  // Alias some constructors
  var Sprite = PIXI.Sprite;
  var Rectangle = PIXI.Rectangle;
  var TextureCache = PIXI.utils.TextureCache;

  var game = init_game(constants.TILE_COLUMNS, constants.TILE_ROWS);

  var textures = [
  ]
  var texture_atlases = [
    'assets/sprites/symbols.json',
  ]

  function done_loading() {
    var earth_sprite = new Sprite(TextureCache['tile_Earth.png']);
    var apophis_sprite = new Sprite(TextureCache['tile_Apophis.png']);

    apophis_sprite.x = 128;
    apophis_sprite.y = 64;

    game.stage.addChild(earth_sprite);
    game.stage.addChild(apophis_sprite);
    game.renderer.render(game.stage);
  }

  PIXI.loader
    .add(textures)
    .add(texture_atlases)
    .load(done_loading)
}

main();
