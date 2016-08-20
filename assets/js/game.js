// from pixi.js:
//   PIXI
// from tile.js:
//   Tile
// from states.js:
//   LoadingAssetsState
//   InitializingState
//   MainState
//   OneFlippedState
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
            console.warn("Unhandled Event '" + event + "'.");
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
