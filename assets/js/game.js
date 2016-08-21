// from pixi.js:
//   PIXI
// from tile.js:
//   Tile
// from states.js:
//   get_all_states()
function Game() {
  // Constants
  var TILE_COLUMNS = 4;
  var TILE_ROWS = 4;

  var BACKGROUND_COLOUR = 0x999999;

  this.start_time = 0;
  this.last_timestamp = 0;
  this.running_time = 0;

  this.width = 3 * Tile.TILE_WIDTH + 2;
  this.height = 3 * Tile.TILE_HEIGHT + 2;

  this.renderer = PIXI.autoDetectRenderer(this.width, this.height);
  this.renderer.backgroundColor = BACKGROUND_COLOUR;

  this.stage = new PIXI.Container();

  this.renderer.render(this.stage);

  // Add the canvas to the DOM
  document.body.appendChild(this.renderer.view);

  // consume all_states
  this.game_states = get_all_states();
  this.state_name = this.game_states.__initial__; // loading_assets should be initial state
  this.state = null;

  // transition methods
  this.transitioning = true;
  function transition_state(next_state) {
    this.state_name = next_state;
    this.transitioning = true;
  }
  this.transition_state = transition_state;

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
          console.warn("Unhandled Event '" + event + "'.");
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
