Encroachment
------------

Use the arrow keys to move, and the spacebar to restart.

The game code is split between three files:
* 'main.js' for main game loop, some draw functions
  and key press detection
* 'game.js' for the game state object and game object
  class, along with various functions to draw, add,
  and alter buildings and food, checking for overlap
* 'snake.js' for all functions and objects pertaining
  to the snake and its segments, including moving,
  hit detection, and drawing for the snake

The only external library used was jQuery 1.11.2, a free and
open source library for JavaScript that simplifies some HTML
scripting.  This file has been included for convenience.
