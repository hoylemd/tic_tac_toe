// from pixi.js:
//   PIXI
// from tile.js:
//   Tile
// from states.js:
//   get_all_states()
function Game() {
  // excision ends

  // Set up graphics
  this.renderer = PIXI.autoDetectRenderer(this.width, this.height);
  this.renderer.backgroundColor = this.BACKGROUND_COLOUR || 0x999999;
  this.stage = new PIXI.Container();

  // Add the canvas to the DOM
  document.body.appendChild(this.renderer.view);

  // get the states
  this.game_states = get_all_states();
  this.state_name = this.game_states.__initial__;
}
Game.prototype = {
  // timing
  start_time: 0,
  last_timestamp: 0,
  running_time: 0,

  // Main driver method
  update: function Game_update(timedelta) {

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
  },

  state: null,
  state_name: '',
  transitioning: true,
  transition: function Game_transition(next_state) {
    this.state_name = next_state;
    this.transitioning = true;
  }
};
