function create_room(room_type, room_size) {

  var size_class = "room-slice-" + room_size;
  var type_class = "room-" + room_type;
  var $new_element = $('<div class="room-slice"></div>');

  $new_element.addClass([size_class, type_class]);

  return {
    size: room_size,
    type: room_type,
    $element: $new_element,
    level: null,
    left: null
  };
}

function create_level(number) {
  var $new_element = $('<div class="vault-level"></div');

  return {
    depth: 0,
    $element: $new_element,
    rooms: [],
    add_room: function(room, left) {

    }
  }
}

function create_vault() {
  var $new_element = $('<div class="vault"></div');

  return {
    levels: [],
    $element: $new_element,
    add_level: function(level) {
      level.depth = this.levels.length;
      this.levels.append(level);
    }
  };
}

function init_game(width, height, options) {
  var return_package = {
    renderer: null, // PIXI renderer
    stage: null,    // PIXI stage
    resources: PIXI.loader.resources  // PIXI resources
  };

  //Create the renderer
  var renderer = PIXI.autoDetectRenderer(width, height, options);
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
  var constants = {
    VAULT_WIDTH: 832,
    VAULT_HEIGHT: 640
  }
  var PI = 3.14159;
  var room_dimensions = {
    'height': 64,
    'small': 96,
    'medium': 192,
    'large': 288
  };
  var room_coordinates = {
    'red': 0,
    'green': room_dimensions['height'],
    'blue': 2 * room_dimensions['height'],
    'small': 0,
    'medium': room_dimensions['small'],
    'large': room_dimensions['small'] + room_dimensions['medium']
  };

  // Alias some constructors
  var Sprite = PIXI.Sprite;
  var Rectangle = PIXI.Rectangle;
  var TextureCache = PIXI.utils.TextureCache;

  function room_tile(size, colour) {
    return new Rectangle(
      room_coordinates[size], room_coordinates[colour],
      room_dimensions[size], room_dimensions['height']
    );
  }

  var game = init_game(constants.VAULT_WIDTH, constants.VAULT_HEIGHT);

  var textures = [
    'assets/images/person.png',
    'assets/images/room_sprites.png'
  ]

  function done_loading() {
    var entrance_texture = TextureCache['assets/images/room_sprites.png'];
    entrance_texture.frame = room_tile('large', 'red');
    var entrance_sprite = new Sprite(entrance_texture);
    entrance_sprite.position.set(0, 0);
    game.stage.addChild(entrance_sprite);

    var person_sprite = new Sprite(TextureCache['assets/images/person.png']);

    person_sprite.position.set(10, 5);

    game.stage.addChild(person_sprite);
    game.renderer.render(game.stage);
  }

  PIXI.loader
    .add(textures)
    .load(done_loading)
}

main();
