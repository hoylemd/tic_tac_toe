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

  function loading_assets(timedelta) {
    var game = this;
    function done_loading() {
      game.done_loading = true;
    };
    console.log("Loading assets...")
    PIXI.loader.add(this.textures)
               .add(this.texture_atlases)
               .load(done_loading);
    this.state_name = 'initializing';
  }

  function initializing(timedelta) {
    // don't initialize until assets are loaded
    if (this.done_loading) {
      var symbol_names = ['A', 'Apophis', 'Delta', 'Earth',
                          'Gamma', 'Omega', 'Sigma', 'Theta'];
      // create the tile pairs
      for (var i in symbol_names) {
        var texture_name = 'tile_' + symbol_names[i] + '.png';
        var first_tile = new Tile(texture_name);
        var second_tile = new Tile(texture_name);

        first_tile.sibling = second_tile;
        second_tile.sibling = first_tile;

        this.stage.addChild(first_tile.front);
        this.stage.addChild(first_tile.back);

        this.stage.addChild(second_tile.front);
        this.stage.addChild(second_tile.back);

        first_tile.flipped_up = true;
        second_tile.flipped_up = true;

        this.tiles.push(first_tile);
        this.tiles.push(second_tile);

        this.game_objects.push(first_tile);
        this.game_objects.push(second_tile);
      }

      // shuffle the tiles

      // position the tiles
      for (var i in this.tiles) {
        var tile = this.tiles[i];
        var x = Math.floor(i % 4) * Tile.TILE_WIDTH;
        var y = Math.floor(i / 4) * Tile.TILE_HEIGHT;
        // console.log("moving " + tile.name + " to (" + x + ", " + y + ")");
        tile.move_to(x, y);
      }

      this.state_name = 'main';
    } else {
      console.log('assets still loading...');
      return false;
    }
  }

  function main_state(timedelta) {
    console.log("This is where I would handle input, I guess?");
  }
  this.game_states = {
    'loading_assets': loading_assets,
    'initializing': initializing,
    'main': main_state
    // one flipped
    // two flipped
    // win
  };

  this.state_name = 'loading_assets'; // loading_assets should be initial state
  this.state = null;

  function update(timedelta) {

    // call state update
    if (this.state) {
      this.state(timedelta);
    }

    // update objects
    for (var i in this.game_objects) {
      this.game_objects[i].update(timedelta);
    }

    // render graphics
    this.renderer.render(this.stage);

    // transition state
    this.state = this.game_states[this.state_name];

    this.running_time += timedelta;
  }
  this.update = update;
}
