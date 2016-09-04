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

    game.tiles = [];
    game.grid = [];

    for (var i = 0; i < 3; i += 1) {
      var new_row = [];
      for (var j = 0; j < 3; j += 1) {
        var new_tile = new Tile(i, j);
        new_row[j] = new_tile;
        game.tiles.push(new_tile);
        game.game_objects.push(new_tile);
        game.stage.addChild(new_tile);
      }
      game.grid[i] = new_row;
    }

    this.game.transition('main');
  };
}
InitializingState.prototype = Object.create(GameState.prototype);
all_states['initializing'] = InitializingState;

function check_line(first, second, third) {
  return first && first === second && first === third;
}

function check_for_winner(tile_grid) {
  var grid = [['','',''],
              ['','',''],
              ['','','']]

  //construct simpler grid
  for (var i = 0; i < 3; i += 1) {
    for (var j = 0; j < 3; j += 1) {
      var tile = tile_grid[i][j];
      grid[i][j] = tile.owner || '';
    }
  }

  for (var i = 0; i < 3; i += 1) {
    // check vertical
    if (check_line(grid[i][0], grid[i][1], grid[i][2])) {
      return {
        winner: grid[i][0],
        direction: 'vertical',
        position: i
      };
    }

    // check horizontal
    if (check_line(grid[0][i], grid[1][i], grid[2][i])) {
      return {
        winner: grid[i][0],
        direction: 'horizontal',
        position: i
      }
    }
  }

  // check diagonal
  if (check_line(grid[0][0], grid [1][1], grid[2][2])) {
    return {
      winner: grid[0][0],
      direction: 'diagonal',
      position: 0
    }
  }
  if (check_line(grid[2][0], grid [1][1], grid[0][2])) {
    return {
      winner: grid[0][0],
      direction: 'diagonal',
      position: 1
    }
  }

  return null;
}

function MainState(game) {
  GameState.call(this, game);

  this.name = 'main';

  function claim(object, arguments) {
    object.claim('player');

    var result = check_for_winner(game.grid);

    if (result) {
      this.game.transition('game_over', result);
    } else {
      this.game.transition('ai_turn');
    }
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
    var valid_moves = [];

    for (var i = 0; i < 9; i += 1) {
      var row = Math.floor(i / 3);
      var column = i % 3;
      var tile = game.grid[row][column];
      if (!tile.owner) {
        valid_moves.push({ x:row, y:column });
      }
    }

    return valid_moves[0];
  }

  this.update = function AITurnState_update(timedelta) {
    var coordinates = choose_tile();
    this.game.grid[coordinates.x][coordinates.y].claim('ai');

    var result = check_for_winner(game.grid);

    if (result) {
      this.game.transition('game_over', result);
    } else {
      this.game.transition('main');
    }
  };
}
AITurnState.prototype = Object.create(GameState.prototype);
all_states['ai_turn'] = AITurnState;

function GameOverState(game, arguments) {
  console.log("Game over! " + arguments.winner + " wins!");
  console.log(arguments.direction + "ly at position " + arguments.position);
}
GameOverState.prototype = Object.create(GameState.prototype);
all_states['game_over'] = GameOverState;

function get_all_states() {
  all_states.__initial__ = 'loading_assets';
  return all_states;
}
