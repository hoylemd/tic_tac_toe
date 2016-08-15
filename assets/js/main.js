
function what_time_is_it() {
  return new Date().getTime();
}

function random_int(min, max) {
  min = Math.ceil(min || 0);
  max = Math.floor(max || 100);

  return Math.floor(Math.random() * (max - min)) + min;
}

function main() {
  var game = new ConcentrationGame();
  game.start_time = what_time_is_it();

  function main_loop() {
    // get timing information
    var now = what_time_is_it();
    var timedelta = now - game.last_timestamp;

    game.update(timedelta);
    game.last_timestamp = now;

    // Schedule next update
    requestAnimationFrame(main_loop);
  }
  main_loop();
}

main();
