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

    game.log('Tic Tac Toe! You go first.');
    this.game.transition('main');
  };
}
InitializingState.prototype = Object.create(GameState.prototype);
all_states['initializing'] = InitializingState;

function check_line(first, second, third) {
  return first && first === second && first === third;
}

function simplify_grid(tile_grid) {
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

  return grid;
}

function check_for_winner(grid) {
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
        winner: grid[0][i],
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
      winner: grid[2][0],
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

    var simple_grid = simplify_grid(game.grid);
    var result = check_for_winner(simple_grid);

    if (result) {
      this.game.transition('game_over', result);
    } else {
      this.game.transition('ai_turn');
    }

    game.log('You marked (' + object.column + ',' + object.row + '). My turn!');
  }

  this.event_handlers = {
    'claim': claim
  }
}
MainState.prototype = Object.create(GameState.prototype);
all_states['main'] = MainState;

function Coordinates(x, y) {
  this.x = x;
  this.y = y;
}
Coordinates.prototype = {x: 0, y: 0};

function IndexCoordinates(index) {
  this.x = index % 3;
  this.y = Math.floor(index / 3);
}
IndexCoordinates.prototype = Object.create(Coordinates.prototype);

function AITurnState(game) {
  GameState.call(this, game);

  this.name = 'ai_state';

  function print_grid(grid) {
    function mark(x, y) {
      var value = grid[x][y];
      if (value === 'player') {
        return 'X';
      }
      if (value === 'ai') {
        return 'O';
      }
      return ' ';
    }

    var str = '';
    str += '[' + mark(0, 0) + '][' + mark(1, 0) + '][' + mark(2, 0) + ']\n';
    str += '[' + mark(0, 1) + '][' + mark(1, 1) + '][' + mark(2, 1) + ']\n';
    str += '[' + mark(0, 2) + '][' + mark(1, 2) + '][' + mark(2, 2) + ']';

    return str;
  }

  function rotate_grid(grid, turns) {
    if (!turns) {
      return grid;
    }
        var new_grid = [
      ['', '', ''],
      ['', '', ''],
      ['', '', '']
    ];
    new_grid[0][0] = grid[2][0];
    new_grid[1][0] = grid[2][1];
    new_grid[2][0] = grid[2][2];

    new_grid[0][1] = grid[1][0];
    new_grid[1][1] = grid[1][1];
    new_grid[2][1] = grid[1][2];

    new_grid[0][2] = grid[0][0];
    new_grid[1][2] = grid[0][1];
    new_grid[2][2] = grid[0][2];

    return rotate_grid(new_grid, turns - 1);
  }

  function choose_tile() {
    var grid = simplify_grid(game.grid);
    var valid_moves = [];

    for (var i = 0; i < 9; i += 1) {
      var coords = new IndexCoordinates(i);

      // if this is a valid move
      if(!grid[coords.x][coords.y]) {
        // check if this will just win the game

        // will AI win if they go here?
        grid[coords.x][coords.y] = 'ai';
        if (check_for_winner(grid)) {
          return coords;
        }

        // will Player win if they go here?
        grid[coords.x][coords.y] = 'player';
        if (check_for_winner(grid)) {
          return coords;
        }

        // if not, erase that
        grid[coords.x][coords.y] = '';
        valid_moves.push(coords);
      }
    }

    var turns_taken = 9 - valid_moves.length;

    if (turns_taken === 0) {
      // Going first, so grab the corner
      return new Coordinates(0, 0);
    }
    if (turns_taken === 1) {
      // going second
      // did they go center?
      if (grid[1][1]) {

      }
      // normalize, so if they went corner or edge, it's in pos 0 or 1
      if (grid[2][0] || grid[2][1]) {
        game.ai.rotations = 1;
      }
      if (grid[2][2] || grid[1][2]) {
        game.ai.rotations = 2;
      }
      if (grid[0][2] || grid[0][1]) {
        game.ai.rotations = 3;
      }

      var rotated_grid = rotate_grid(grid, game.ai.rotations);
      // did they go corner?
      if (rotated_grid[0][0] || rotated_grid[1][0]) {
        // also go center
        return new Coordinates(1, 1);
      }
    }

    // At this point, we don't have a win, a block, or a strategy start
    return valid_moves[0];
  }

  this.update = function AITurnState_update(timedelta) {
    var coordinates = choose_tile();
    if (!coordinates) {
      this.game.transition('game_over');
      return;
    }
    this.game.grid[coordinates.x][coordinates.y].claim('ai');

    game.log('I choose (' + coordinates.x + ', ' + coordinates.y + ').')

    var simple_grid = simplify_grid(game.grid);
    var result = check_for_winner(simple_grid);

    if (result) {
      this.game.transition('game_over', result);
    } else {
      game.log('Your turn!')
      this.game.transition('main');
    }
  };
}
AITurnState.prototype = Object.create(GameState.prototype);
all_states['ai_turn'] = AITurnState;

function GameOverState(game, arguments) {
  if (arguments) {
    if (arguments.winner === 'player') {
      game.log("Game over. You... won? but... but I'm undefeatable... YOU CHEATED!!!!!!!");
    } else {
      game.log("Game over! I win! See? " + arguments.direction + "ly!");
    }
  } else {
    game.log("Game over! it's a draw.");
  }
  game.log("Refresh to play again.");
}
GameOverState.prototype = Object.create(GameState.prototype);
all_states['game_over'] = GameOverState;

function get_all_states() {
  all_states.__initial__ = 'loading_assets';
  return all_states;
}
