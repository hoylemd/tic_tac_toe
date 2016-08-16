// from main.js:
//   random_int(min, max)
// from tile.js:
//   Tile

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
  this.game_objects = [];

  // Add the canvas to the DOM
  document.body.appendChild(this.renderer.view);

  /* Constructor Ends */

  /* Game states */
  this.done_loading = false;

  var game = this;
  function loading_assets_state() {
    var state = {
      name: 'loading_assets',
      loading_started: false,
      done_loading: false,
    }

    function done_loading() {
      state.done_loading = true;
    };

    function loading_assets_update(timedelta) {
      if (!state.loading_started) {
        console.log("Loading assets...")
        PIXI.loader.add(game.textures)
                   .add(game.texture_atlases)
                   .load(done_loading);
        state.loading_started = true;
      } else if (state.done_loading){
        console.log("done loading assets!");
        game.state_name = 'initializing';
      } else {
        console.log("still loading...");
      }
    }

    state.update = loading_assets_update;
    return state;
  }

  function initializing_state() {
    var state = {
      name: 'initializing'
    };

    function initializing_update(timedelta) {
      // don't initialize until assets are loaded
      var symbol_names = ['A', 'Apophis', 'Delta', 'Earth',
                          'Gamma', 'Omega', 'Sigma', 'Theta'];
      // create the tile pairs
      for (var i in symbol_names) {
        var texture_name = 'tile_' + symbol_names[i] + '.png';
        var first_tile = new Tile(texture_name);
        var second_tile = new Tile(texture_name);

        first_tile.sibling = second_tile;
        second_tile.sibling = first_tile;

        game.stage.addChild(first_tile.sprite);
        game.stage.addChild(second_tile.sprite);

        game.tiles.push(first_tile);
        game.tiles.push(second_tile);

        game.game_objects.push(first_tile);
        game.game_objects.push(second_tile);
      }

      // shuffle the tiles
      for (var i in game.tiles) {
        var first_tile = game.tiles[i];
        var swap_index = random_int(0, game.tiles.length);
        var second_tile = game.tiles[swap_index];

        /* console.log("swapping tile " + i + "(" + first_tile.name + ")" +
                    " with tile " + swap_index + "(" + second_tile.name + ")");
        */

        game.tiles[swap_index] = first_tile;
        game.tiles[i] = second_tile;
      }

      // position the tiles
      for (var i in game.tiles) {
        var tile = game.tiles[i];
        var x = Math.floor(i % 4) * Tile.TILE_WIDTH;
        var y = Math.floor(i / 4) * Tile.TILE_HEIGHT;
        // console.log("moving " + tile.name + " to (" + x + ", " + y + ")");
        tile.move_to(x, y);
      }

      game.state_name = 'main';
    }

    state.update = initializing_update;
    return state;
  }

  function main_state() {
    var state = {
      name: 'main'
    };

    function main_update(timedelta) {
      console.log("Click a tile!");
    }

    state.update = main_update;
    return state;
  }

  function one_flipped_state() {
    var state = {
      name: 'one_flipped'
    };

    function one_flipped_update(timedelta) {
      console.log("You flipped a tile!");
      game.state_name = 'main';
    }

    state.update = one_flipped_update;
    return state;
  }

  this.game_states = {
    'loading_assets': loading_assets_state,
    'initializing': initializing_state,
    'main': main_state,
    'one_flipped': one_flipped_state
    // two flipped
    // win
  };

  this.state_name = 'loading_assets'; // loading_assets should be initial state
  this.state = null;

  // events
  function tile_flipped(object, parameters) {
    game.state_name = 'one_flipped';
  }

  this.events = {
    'tile_flipped': tile_flipped
  }

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
        if (this.events[event]) {
          var handler = this.events[event];
          handler(object, events[event]);
        } else {
          throw "Event '" + event + "' is not known!!!";
        }
      };
    }

    // render graphics
    this.renderer.render(this.stage);

    // transition state
    // TODO: add a transition mathod
    if (this.state_name != (this.state && this.state.name)) {
      this.state = this.game_states[this.state_name]();
    }

    this.running_time += timedelta;
  }
  this.update = update;
}
