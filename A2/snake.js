/*
 *	This file comprises the Snake and associated SnakeSegment
 *	objects, with functions involving movement, collision 
 *	detection, and drawing of the snake.
 */


// A single square of the snake's body
function SnakeSegment(x, y){
	this.x = x;
	this.y = y;
}

// Checks if a given segment is inside a 4x4 space (e.g. a 
// building or food) with origin (objectX, objectY)
SnakeSegment.prototype.isInside4x4 = function(objectX, objectY){
	var xDist = this.x - objectX;
	var yDist = this.y - objectY;
	if ((xDist === 0 || xDist === 1)  &&
		(yDist === 0 || yDist === 1)){
		return true;
	}
	return false;
}

function Snake(startX, startY){
	// Possible directions: "UP", "DOWN", "LEFT", "RIGHT"
	this.direction = "RIGHT";
	this.tail = []; // Array of SnakeSegments

	// Create a snake of length 5 with tail[0] as the head
	for (var i = 0; i < 5; i++) {
		this.tail[this.tail.length] = new SnakeSegment(startX -
												 i, startY);
	}
}

// Checks if any of the snake's segments are inside a 4x4 space
Snake.prototype.hasTailInside4x4 = function(objectX, objectY){
	for (var i = 0; i < this.tail.length; i++){
		if (this.tail[i].isInside4x4(objectX, objectY)){
			return true;
		}
	}
	return false;
}

// Update snake's position, score, and checks for collisions
Snake.prototype.moveSnake = function (gs, ctx){
	var currHead = this.tail[0];
	// Adds another SnakeSegment in the current direction
	switch(this.direction){
		case "UP":
			this.tail.splice(0,0, new SnakeSegment(currHead.x, 
											 currHead.y - 1));
			break;
		case "DOWN":
			this.tail.splice(0,0, new SnakeSegment(currHead.x,
											 currHead.y + 1));
			break;
		case "LEFT":
			this.tail.splice(0,0, new SnakeSegment(
								 currHead.x - 1, currHead.y));
			break;
		case "RIGHT":
			this.tail.splice(0,0, new SnakeSegment(
								 currHead.x + 1, currHead.y));
			break;
		default:
			console.log("Invalid direction specified:" + 
											  this.direction);
			break;
	}
	// Move food if eating, and chop off tail end otherwise
	if (this.isEating(gs)){
		// Move and redraw food
		gs.addObject(true);
		gs.food.draw(gs, ctx);

		// Update score, and highscore if applicable
		gs.score++;
		$("#score").text(gs.score);
		if ($("#hiscore").text() < gs.score){
			$("#hiscore").text(gs.score);
		}
	} else {
		// Chop off the tail if no food is being eaten
		this.tail.pop();
	}
	// End game if collision takes place
	if (this.hasCollided(gs)){
		gs.isGameOver = true;
	}
}

// Returns true if snake's head intersects food
Snake.prototype.isEating = function (gs){
	if (this.tail[0].isInside4x4(gs.food.x, gs.food.y)){
		return true;
	}
	return false;
}

// Checks if the snake has collided with a building, the map
// edges, or its own tail
Snake.prototype.hasCollided = function (gs){
	var head = this.tail[0];
	// Check for edge collision
	if (head.x < 0 || head.x > gs.canvasWidth ||
		head.y < 0 || head.y > gs.canvasLength){
		return true;
	}

	// Check for tail collision by testing if the head and a
	// tail segment occupy the same position
	for (var i = 1; i < this.tail.length; i++){
		if (head.x === this.tail[i].x &&
			head.y === this.tail[i].y){
			return true;
		}
	}
	// Check for building collision
	for (var i = 0; i < gs.buildingList.length; i++) {
		if (head.isInside4x4(gs.buildingList[i].x,
							 gs.buildingList[i].y)){
			return true;
		}
	}
	return false;
}

// Draw out each SnakeSegment on the grid
Snake.prototype.draw = function (gs, ctx){
	for (var i = 0; i < this.tail.length; i++) {
		ctx.drawImage(gs.imgList[2], this.tail[i].x * 
				gs.tileSize, this.tail[i].y * gs.tileSize);
	}
}