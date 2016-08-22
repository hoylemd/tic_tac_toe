// from game.js
//   Game

function TicTacToeGame() {
  // game-specific stuff to excise
  var GRID_COLUMNS = 3;
  var GRID_ROWS = 3;

  var BACKGROUND_COLOUR = 0x999999;

  this.width = GRID_COLUMNS * Tile.TILE_WIDTH + 2;
  this.height = GRID_ROWS * Tile.TILE_HEIGHT + 2;

  Game.call(this);
}
TicTacToeGame.prototype = Object.create(Game.prototype);
