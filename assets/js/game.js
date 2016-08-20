// from main.js:
//   random_int(min, max)
// from tile.js:
//   Tile
function GameState(game) {
  this.game = game;
};
GameState.prototype = {
  name: 'Unnamed State',

  game: null,

  update: function base_state_update(timedelta) {
    console.log("Update called on " + this.name + " state, which doesn't " +
                "have it's own update defined.");
  },

  event_handlers: [],
  handle_event: function base_state_handle_event(event, object, parameters) {
    var handler = this.event_handlers[event]
    if (handler) {
      handler.call(this, object, parameters);
      return true;
    }
    return false;
  }
};

function LoadingAssetsState(game) {
  GameState.call(this, game);

  this.name = 'loading_assets';

  this.loading_started = false;
  this.loading_done = false;

  this.update =  function LoadingAssets_update(timedelta) {
    if (!this.loading_started) {
      console.log("Loading assets...")

      var that = this;
      function done_loading() {
        that.loading_done = true;
      }

      // TODO: These assets could be defined here...
      PIXI.loader.add(this.game.textures)
                 .add(this.game.texture_atlases)
                 .load(done_loading);
      this.loading_started = true;
    } else if (this.loading_done){
      console.log("done loading assets!");
      this.game.transition_state('initializing');
    } else {
      console.log("still loading...");
    }
  };
}
LoadingAssetsState.prototype = Object.create(GameState.prototype);

function InitializingState(game) {
  GameState.call(this, game);

  this.name = 'initializing';

  this.update = function InitializingState_update(timedelta) {
    // don't initialize until assets are loaded
    var symbol_names = ['A', 'Apophis', 'Delta', 'Earth',
                        'Gamma', 'Omega', 'Sigma', 'Theta'];
    // create the tile pairs
    for (var i in symbol_names) {
      var texture_name = 'tile_' + symbol_names[i] + '.png';
      var first_tile = new Tile(symbol_names[i], texture_name);
      var second_tile = new Tile(symbol_names[i], texture_name);

      first_tile.sibling = second_tile;
      second_tile.sibling = first_tile;

      this.game.stage.addChild(first_tile.sprite);
      this.game.stage.addChild(second_tile.sprite);

      this.game.tiles.push(first_tile);
      this.game.tiles.push(second_tile);

      this.game.game_objects.push(first_tile);
      this.game.game_objects.push(second_tile);
    }

    var tiles = this.game.tiles;

    // shuffle the tiles
    for (var i in tiles) {
      var swap_tile = tiles[i];
      var swap_index = random_int(0, tiles.length);

      /* console.log("swapping tile " + i + "(" + first_tile.name + ")" +
                  " with tile " + swap_index + "(" + second_tile.name + ")");
      */

      tiles[i] = tiles[swap_index];
      tiles[swap_index] = swap_tile;;
    }

    // position the tiles
    for (var i in tiles) {
      var tile = tiles[i];
      var x = Math.floor(i % 4) * Tile.TILE_WIDTH;
      var y = Math.floor(i / 4) * Tile.TILE_HEIGHT;
      // console.log("moving " + tile.name + " to (" + x + ", " + y + ")");
      tile.move_to(x, y);
    }

    this.game.transition_state('main');
  };
}
InitializingState.prototype = Object.create(GameState.prototype);

function MainState(game) {
  GameState.call(this, game);

  this.name = 'main';

  this.update = function MainState_update(timedelta) {
    console.log("Click a tile!");
  }

  // events
  function tile_flipped(object, parameters) {
    this.game.flipped_tile = object;
    this.game.transition_state('one_flipped');
  }

  this.event_handlers = {
    'tile_flipped': tile_flipped
  }
}
MainState.prototype = Object.create(GameState.prototype);

function OneFlippedState(game) {
  GameState.call(this, game);

  this.name = 'one_flipped';

  var ms_to_flip = 5000;

  this.update = function OneFlippedState_update(timedelta) {
    console.log("You flipped a " + this.game.flipped_tile.name + " tile!");
    game.transition_state('main');
  }
}
OneFlippedState.prototype = Object.create(GameState.prototype);

function ConcentrationGame() {
  // Constants
  var TILE_COLUMNS = 4;
  var TILE_ROWS = 4;

  var BACKGROUND_COLOUR = 0x999999;

  this.start_time = 0;
  this.last_timestamp = 0;
  this.running_time = 0;

  this.renderer = PIXI.autoDetectRenderer(
    TILE_COLUMNS * Tile.TILE_WIDTH,
    TILE_ROWS * Tile.TILE_HEIGHT);
  this.renderer.backgroundColor = BACKGROUND_COLOUR;

  this.stage = new PIXI.Container();

  this.renderer.render(this.stage);

  // Assets to load
  this.textures = [];
  this.texture_atlases = ['assets/sprites/symbols.json'];

  // game objects
  this.tiles = [];
  this.flipped_tile = null;
  this.game_objects = [];

  // Add the canvas to the DOM
  document.body.appendChild(this.renderer.view);

  /* Constructor Ends */

  /* Game states */

  var game = this;

  this.game_states = {
    'loading_assets': LoadingAssetsState,
    'initializing': InitializingState,
    'main': MainState,
    'one_flipped': OneFlippedState
    // two flipped
    // win
  };

  this.state_name = 'loading_assets'; // loading_assets should be initial state
  this.state = null;

  // transition methods
  this.transitioning = true;
  function transition_state(next_state) {
    this.state_name = next_state;
    this.transitioning = true;
  }
  this.transition_state = transition_state;

  // global events
  this.events = {};

  // Main driver method
  function update(timedelta) {

    // call state update
    if (this.state) {
      this.state.update(timedelta);
    }

    // update objects
    for (var i in this.game_objects) {
      var object = this.game_objects[i];
      var events = object.update(timedelta);

      for (var event in events) {
        if (!this.state.handle_event(event, object, events[event])) {
          if (this.events[event]) {
            var handler = this.events[event];
            handler(object, events[event]);
          } else {
            throw "Unhandled Event '" + event + "'.";
          }
        }
      };
    }

    // render graphics
    this.renderer.render(this.stage);

    // transition state
    if (this.transitioning) {
      this.state = new this.game_states[this.state_name](this);
      this.transitioning = false;
    }

    this.running_time += timedelta;
  }
  this.update = update;
}
