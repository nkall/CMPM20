/*
 *	This file comprises the main game state object as well as
 *	a game object class, which is a 4x4 unit that can be either
 *  a building or a piece of food.  Functions involve altering,
 *	drawing, and adding new objects, with overlap checks.
 */

function GameState(imgList){
	this.tileSize = 16;      // Pixel length of (square) tiles
	this.canvasWidth = 64;   // Width of canvas in tiles
	this.canvasLength = 32;  // Length of canvas in tiles

	this.buildingList = [];
	// List of all images used in the game:
	// 		imgList[0] is the grass
	//		imgList[1] is the food
	//		imgList[2] is a snake segment
	//		imgList[3+] are buildings
	this.imgList = imgList;

	// Creates the snake somewhere mid-board
	this.snake = new Snake (this.canvasLength / 2, 
								this.canvasLength / 2 - 1);

	// Adds the food to the board and randomizes it
	this.food = new GameObject (0, 0, 1, true);
	this.addObject(true);

	this.isGameOver = false;
	this.score = 0;

	this.buildingTimer = 0;
	this.buildingTimerLimit = 10;
}

// If isFood, replace this.food with one at another location,
// otherwise, adds a new building to buildingList.
// Positions are generated randomly and checked for collisions
GameState.prototype.addObject = function (isFood){
	// Try only 500 times to avoid infinite loop on full grid
	for (var i = 0; i < 500; i++){
		if (isFood){
			// Generate random position
			var randX = Math.floor(Math.random() *
									(this.canvasWidth - 2));
			var randY = Math.floor(Math.random() *
									(this.canvasLength - 2));
			// Replace food if no overlaps with the buildings
			// or any part of the snake
			if (!this.isOverlappingObject(randX, randY) &&
				!this.snake.hasTailInside4x4(randX, randY) &&
				!this.snake.hasHeadNear4x4(randX, randY)){
				this.food = new GameObject (randX, randY, 1,
									  		          true);
				return;
			}
		} else {
			// Generate random position
			var randX = Math.floor(Math.random() *
								(this.canvasWidth + 2)-1);
			var randY = Math.floor(Math.random() *
								(this.canvasLength + 2)-1);
			// Add a new building to buildingList if there's
			// no overlap with food, buildings, or snake
			if (!this.isOverlappingObject(randX, randY) &&
				!this.snake.hasTailInside4x4(randX, randY)){
				var buildIndex = Math.floor(Math.random() * 
				         	(this.imgList.length - 3)) + 3;
				this.buildingList[this.buildingList.length] = 
					new GameObject(randX, randY, 
									buildIndex, false);
				return;
			}
		}
	}
};

// Checks if an object at coordinates x, y would be overlapping
// or overlapped by any other object (food or building)
GameState.prototype.isOverlappingObject = function(x, y){
	// Check all buildings
	for (var i = 0; i < this.buildingList.length; i++){
		if (this.buildingList[i].isOverlapping(x, y)){
			return true;
		}
	}
	// Check food
	if (this.food.isOverlapping(x, y)){
		return true;
	}
	return false;
};

// A 4x4 object (32x32 pixels) at a given coordinate pair
// This can be either food or a building
function GameObject (x, y, imgIndex, isFood){
	this.x = x;
	this.y = y;
	this.imgIndex = imgIndex; // Index of image in gs.imgList
	this.isFood = isFood;	  // If true, food, else building
}

// Checks if an object at coordinates x, y would be overlapping
// or overlapped by the current object instance
GameObject.prototype.isOverlapping = function(x, y){
	if (Math.abs(x - this.x) < 2 && Math.abs(y - this.y) < 2){
		return true;
	}
	return false;
};

// Draws an object on the map
GameObject.prototype.draw = function(gs, ctx){
	ctx.drawImage(gs.imgList[this.imgIndex], this.x * 
		gs.tileSize, this.y * gs.tileSize);
}