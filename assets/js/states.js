// from pixi.js:
//   PIXI
// from utils.js:
//   random_int(min, max)
// from tile.js:
//   Tile

function GameState(game) {
  this.game = game;
}
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
      var texture_atlases = ['assets/sprites/marks.json'];
      // Done defining Textures and Atlases

      PIXI.loader.add(textures)
                 .add(texture_atlases)
                 .load(done_loading);
      this.loading_started = true;
    } else if (this.loading_done){
      console.log('done loading assets!');
      this.game.transition('initializing');
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

    var lines = new PIXI.Graphics();
    lines.lineStyle(2, 0x000000, 1);

    lines.moveTo(Tile.TILE_WIDTH + 1, 0);
    lines.lineTo(Tile.TILE_WIDTH + 1, game.height);

    lines.moveTo(2 * (Tile.TILE_WIDTH + 1), 0);
    lines.lineTo(2 * (Tile.TILE_WIDTH + 1), game.height);

    lines.moveTo(0, Tile.TILE_WIDTH + 1);
    lines.lineTo(game.width, Tile.TILE_WIDTH + 1);

    lines.moveTo(0, 2 * (Tile.TILE_WIDTH + 1));
    lines.lineTo(game.width, 2 * (Tile.TILE_WIDTH + 1));

    game.lines = lines;
    game.stage.addChild(lines);

    this.game.transition('main');
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

  function claim(object, arguments) {
    object.claim('player');
    this.transition('ai_turn');
  }

  this.event_handlers = {
    'claim': claim
  }
}
MainState.prototype = Object.create(GameState.prototype);
all_states['main'] = MainState;

function AITurnState(game) {
  GameState.call(this, game);

  this.name = 'ai_state';

  function choose_tile() {
    for (var i = 0; i < 9; i += 1) {

    }

    return 'Havent implemented this yet'
  }

  this.update = function AITurnState_update(timedelta) {

  };

}

function get_all_states() {
  all_states.__initial__ = 'loading_assets';
  return all_states;
}
