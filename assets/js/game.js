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
    'assets/images/images.png',
  ]

  function done_loading() {
    var person_sprite = new Sprite(TextureCache['assets/images/images.png']);


    game.stage.addChild(person_sprite);
    game.renderer.render(game.stage);
  }

  PIXI.loader
    .add(textures)
    .load(done_loading)
}

main();
