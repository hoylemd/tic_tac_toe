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
      // create the tile objects
      var sigma_tile = new Tile('tile_Sigma.png');
      sigma_tile.move_to(128, 0);
      this.stage.addChild(sigma_tile.front);
      this.stage.addChild(sigma_tile.back);
      sigma_tile.flipped_up = true;;

      var theta_tile = new Tile('tile_Theta.png');
      theta_tile.move_to(192, 64);
      this.stage.addChild(theta_tile.front);
      this.stage.addChild(theta_tile.back);

      this.game_objects.push(sigma_tile);
      this.game_objects.push(theta_tile);

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
