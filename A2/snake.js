function GameState(imgList){
	this.tileSize = 16;      // Pixel length of (square) tiles
	this.canvasWidth = 64;   // Width of canvas in tiles
	this.canvasLength = 32;  // Length of canvas in tiles

	this.buildingList = [];
	this.imgList = imgList;

	this.snake = new Snake (this.canvasLength / 2, 
								this.canvasLength / 2);

	// Adds the food and randomizes it
	this.food = new GameObject (0, 0, 1, true);
	this.addObject(true);

	this.isGameOver = false;
	this.score = 0;

	this.buildingTimerLimit = 10;
}

// Adds a new building to buildingList at a random location
GameState.prototype.addObject = function (isFood){
	for (var i = 0; i < 500; i++){
		if (isFood){
			var randX = Math.round(Math.random() *
									(this.canvasWidth - 2));
			var randY = Math.round(Math.random() *
									(this.canvasLength - 2));
			if (!this.isOverlappingObject(randX, randY) &&
				!this.snake.hasTailInside4x4(randX, randY)){
				this.food = new GameObject (randX, randY, 1,
									  		          true);
				return;
			}
		} else {
			var randX = Math.round(Math.random() *
								(this.canvasWidth + 1)) - 1;
			var randY = Math.round(Math.random() *
								(this.canvasLength + 1)) - 1;
			if (!this.isOverlappingObject(randX, randY) &&
				!this.snake.hasTailInside4x4(randX, randY)){
				var buildIndex = Math.round(Math.random() * 
				         	(this.imgList.length - 4)) + 3;
				this.buildingList[this.buildingList.length] = 
					new GameObject(randX, randY, 
									buildIndex, false);
				return;
			}
		}
	}
};

// Checks if an object at coordinates x, y would be overlapping
// or overlapped by any other object
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
	this.imgIndex = imgIndex;
	this.isFood = isFood;
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

function SnakeSegment(x, y){
	this.x = x;
	this.y = y;
}

SnakeSegment.prototype.isInside4x4 = function(objectX, objectY){
	var xDist = this.x - objectX;
	var yDist = this.y - objectY;
	if ((xDist === 0 || xDist === 1)  &&
		(yDist === 0 || yDist === 1)){
		return true;
	}
	return false;
}

// Possible directions: "UP", "DOWN", "LEFT", "RIGHT"
function Snake(startX, startY){
	this.direction = "RIGHT"
	this.tail = []

	// Create a snake with length 5
	// Tail[0] is the head
	for (var i = 0; i < 5; i++) {
		this.tail[this.tail.length] = new SnakeSegment(startX -
												 i, startY);
	}
}

Snake.prototype.hasTailInside4x4 = function(objectX, objectY){
	for (var i = 0; i < this.tail.length; i++){
		if (this.tail[i].isInside4x4(objectX, objectY)){
			return true;
		}
	}
	return false;
}

Snake.prototype.moveSnake = function (gs, ctx){
	var currHead = this.tail[0];
	var gotFood = this.isEating(gs);
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
		gs.addObject(true);
		gs.food.draw(gs, ctx);
		gs.score++;
		$("#score").text(gs.score);
		if ($("#hiscore").text() < gs.score){
			$("#hiscore").text(gs.score);
		}
	} else {
		this.tail.pop();
	}
	if (this.hasCollided(gs)){
		gs.isGameOver = true;
	}
}

Snake.prototype.isEating = function (gs){
	if (this.tail[0].isInside4x4(gs.food.x, gs.food.y)){
		return true;
	}
	return false;
}

// Checks if the snake has collided with a building, the walls,
// or its own tail
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

Snake.prototype.draw = function (gs, ctx){
	for (var i = 0; i < this.tail.length; i++) {
		ctx.drawImage(gs.imgList[2], this.tail[i].x * 
				gs.tileSize, this.tail[i].y * gs.tileSize);
	}
}

// Fills the map with grass tiles
function fillGrass(gs, ctx){
	// Using multiples of 2, since grass tiles are 2x grid size
	for (var x = 0; x < gs.canvasWidth; x += 2){
		for (var y = 0; y < gs.canvasLength; y += 2){
			ctx.drawImage(gs.imgList[0], x * gs.tileSize, 
										 y * gs.tileSize);
		}
	}
}

// Draws all GameObjects (buildings + food) on map
function drawObjects(gs, ctx){
	// Draw buildings
	for (var i = 0; i < gs.buildingList.length; i++){
		gs.buildingList[i].draw(gs, ctx);
	}
	// Draw food
	gs.food.draw(gs, ctx);
}

function gameLoop(gs, ctx, shouldBuild){
	fillGrass(gs, ctx);

	if (shouldBuild){
		gs.addObject(false);
	}
	drawObjects(gs, ctx);

	// Draw snake
	gs.snake.moveSnake(gs, ctx);
	if (!gs.isGameOver){
		gs.snake.draw(gs, ctx);
	} else {
		// Dim screen
		ctx.fillStyle = '#000000';
		ctx.globalAlpha=0.5;
		ctx.fillRect(0, 0, gs.canvasWidth * gs.tileSize, 
						  gs.canvasLength * gs.tileSize);
		// Print 'Game Over' message
		ctx.globalAlpha=1;
		ctx.font = '30pt Helvetica';
		ctx.fillStyle = '#FFFFFF';
		ctx.textAlign = 'center';
		ctx.fillText('Game Over',
					 (gs.canvasWidth * gs.tileSize) / 2,
						(gs.canvasLength * gs.tileSize) / 2);
		ctx.font = '20pt Helvetica';
		ctx.fillText('Press Space to try again',
				(gs.canvasWidth * gs.tileSize) / 2,
				(gs.canvasLength * gs.tileSize) / 2 + 50);
	}
}

function runGame(ctx, imgList){
	var gs = new GameState(imgList);
	var buildingTimer = 0;

	window.setInterval(function() {
		var shouldBuild = false;
		buildingTimer++;
		if (buildingTimer > gs.buildingTimerLimit){
			buildingTimer = 0;
			shouldBuild = true;
		} else {
			buildingTimer++;
		}
		gameLoop(gs, ctx, shouldBuild);
	}, 200);

	document.addEventListener("keydown", function(e){
		console.log(e.key);
		switch(e.key){
			case "Up":
				if (gs.snake.direction !== "DOWN"){
					gs.snake.direction = "UP";
				}
				break;
			case "Down":
				if (gs.snake.direction !== "UP"){
					gs.snake.direction = "DOWN";
				}
				break;
			case "Left":
				if (gs.snake.direction !== "RIGHT"){
					gs.snake.direction = "LEFT";
				}
				break;
			case "Right":
				if (gs.snake.direction !== "LEFT"){
					gs.snake.direction = "RIGHT";
				}
				break;
			case " ":
				if (gs.isGameOver){
					gs = new GameState(imgList);
					$("#score").text('0');
				}
				break;
			default:
				break;
		}
	}, false);
}

$(window).load(function(){
	var canvas = $("#canvas")[0];
	var ctx = canvas.getContext("2d");

	loadImgs(function (imgList){
		runGame(ctx, imgList)
	});
});

function loadImgs(callbackFn){
	var imgPaths = ["grass.png","food.png","snake.png"];
	// Add various building obstacle images
	for (var i = 0; i < 20; i++){
		imgPaths[imgPaths.length] = "build" + i + ".png";
	}
	var imgList = []
	var loadCount = 0
	for (var i = 0; i < imgPaths.length; i++){
		imgList[i] = new Image();
		imgList[i].src = imgPaths[i];
		imgList[i].onload = function (){
			loadCount++;
			if (loadCount === imgPaths.length){
				callbackFn(imgList);
			}
		};
	}
}