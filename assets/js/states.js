// from pixi.js:
//   PIXI
// from utils.js:
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
    console.log('Update called on ' + this.name + ' state, which doesn\'t ' +
                'have it\'s own update defined.');
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

// Global list of states
var all_states = {};

function LoadingAssetsState(game) {
  GameState.call(this, game);

  this.name = 'loading_assets';

  this.loading_started = false;
  this.loading_done = false;

  this.update =  function LoadingAssets_update(timedelta) {
    if (!this.loading_started) {
      console.log('Loading assets...')

      var that = this;
      function done_loading() {
        that.loading_done = true;
      }

      // Define Textures and Atlases to load here
      var textures = [];
      var texture_atlases = ['assets/sprites/symbols.json'];
      // Done defining Textures and Atlases

      PIXI.loader.add(textures)
                 .add(texture_atlases)
                 .load(done_loading);
      this.loading_started = true;
    } else if (this.loading_done){
      console.log('done loading assets!');
      this.game.transition_state('initializing');
    } else {
      console.log('still loading...');
    }
  };
}
LoadingAssetsState.prototype = Object.create(GameState.prototype);
all_states['loading_assets'] = LoadingAssetsState;

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

      this.game.stage.addChild(first_tile);
      this.game.stage.addChild(second_tile);

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

      tiles[i] = tiles[swap_index];
      tiles[swap_index] = swap_tile;;
    }

    // position the tiles
    for (var i in tiles) {
      var tile = tiles[i];
      var x = Math.floor(i % 4) * Tile.TILE_WIDTH;
      var y = Math.floor(i / 4) * Tile.TILE_HEIGHT;

      tile.move_to(x, y);
    }

    this.game.transition_state('main');
  };
}
InitializingState.prototype = Object.create(GameState.prototype);
all_states['initializing'] = InitializingState;

function MainState(game) {
  GameState.call(this, game);

  this.name = 'main';

  this.update = function MainState_update(timedelta) {
    console.log('Click a tile!');
  }

  // events
  function tile_flipped(object, parameters) {
    this.game.flipped_tile = object;

    object.flip_up();

    this.game.transition_state('one_flipped');
  }

  this.event_handlers = {
    'tile_flipped': tile_flipped
  }
}
MainState.prototype = Object.create(GameState.prototype);
all_states['main'] = MainState;

function OneFlippedState(game) {
  GameState.call(this, game);

  this.name = 'one_flipped';

  var ms_to_flip = 5000;
  var next_update = 5;

  this.update = function OneFlippedState_update(timedelta) {
    if (ms_to_flip === 5000) {
      console.log('You flipped a ' + game.flipped_tile.name + ' tile!');
    };

    ms_to_flip -= timedelta;

    if (ms_to_flip <= 0) {
      game.flipped_tile.flip_down();
      game.flipped_tile = null;

      console.log('Time\'s up!');

      game.transition_state('main');
    } else {
      if (ms_to_flip < next_update * 1000) {
        console.log('' + next_update + ' seconds left to make a choice...');
        next_update -= 1;
      }
    }

  };

  function tile_flipped(object, parameters) {
    game.second_flipped_tile = object;
    object.flip_up();

    if (object.sibling == game.flipped_tile) {

    }
  }
}
OneFlippedState.prototype = Object.create(GameState.prototype);
all_states['one_flipped'] = OneFlippedState;

function TwoFlippedWrongState(game) {
  GameState.call(this, game);

  this.name = 'two_flipped_wrong';

  var ms_to_flip = 3000;

  this.update = function TwoFlippedWrongState_update(timedelta) {
    if (ms_to_flip === 3000) {
      console.log('You flipped a ' + game.second_flipped_tile.name + ' tile,' +
                  ' but it doesn\'t match the ' + game.flipped_tile.name +
                  ' that you flipped first! Try again in 3 seconds.');
    }

    ms_to_flip -= timedelta;

    if (ms_to_flip <= 0) {
      game.flipped_tile.flip_down();
      game.flipped_tile = null;

      game.second_flipped_tile.flip_down();
      game.second_flipped_tile.flip_down();

      console.log('Time\'s up! Try again!');

      game.transition_state('main');
    }
  };
}
TwoFlippedWrongState.prototype = Object.create(GameState.prototype);
all_states['two_flipped_wrong'] = TwoFlippedWrongState;

function get_all_states() {
  all_states.__initial__ = 'loading_assets';
  return all_states;
}
