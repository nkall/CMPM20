function GameState(imgList){
	this.tileSize = 16;      // Pixel length of (square) tiles
	this.canvasWidth = 64;   // Width of canvas in tiles
	this.canvasLength = 32;  // Length of canvas in tiles

	this.buildingList = [];
	this.imgList = imgList;

	// Adds the food to board
	this.food = new GameObject (0, 0, 1, true);
	this.snake = new Snake (this.canvasLength / 2, this.canvasLength / 2);
}

// Adds a new building to buildingList at a random location
GameState.prototype.addBuilding = function (){
	for (var i = 0; i < 500; i++){
		var randX = Math.round(Math.random() *
							(this.canvasWidth + 1)) - 1;
		var randY = Math.round(Math.random() *
							(this.canvasLength + 1)) - 1;
		if (!this.isOverlappingObject(randX, randY)){
			var buildIndex = Math.round(Math.random() * 
				         (this.imgList.length - 3)) + 2;
			this.buildingList[this.buildingList.length] = 
					new GameObject(randX, randY, 
									buildIndex, false);
			return;
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


// Possible directions: "UP", "DOWN", "LEFT", "RIGHT"
function Snake(startX, startY){
	this.len = 5;
	this.direction = "RIGHT";

	// Tail[0] is closest to the head
	for (var i = 0; i < this.len; i++) {
		this.tail[this.tail.length] = new SnakeSegment(startX -
												 i, startY);
	}
}

Snake.prototype.moveSnake = function (){
	var currHead = this.tail[0];
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
			break;
	}
	// Chop off old tail end
	this.tail.pop();
}

Snake.prototype.draw = function (gs, ctx){
	for (var i = 0; i < this.tail.length; i++) {
		ctx.rect(this.tail[i].x * gs.tileSize, this.tail[i].y *
				  gs.tileSize, gs.tileSize, gs.tileSize);
		ctx.fill();
		console.log(this.tail[i].x + "/" + this.tail[i].y);
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

function gameLoop(gs, ctx){
	fillGrass(gs, ctx);
	drawObjects(gs, ctx);
	gs.addBuilding();

	// Draw snake
	gs.snake.draw(gs, ctx);
	gs.snake.moveSnake();

}

function runGame(ctx, imgList){
	var gs = new GameState(imgList);
	window.setInterval(function() {
		gameLoop(gs, ctx);
	}, 500);
}

$(window).load(function(){
	var canvas = $("#canvas")[0];
	var ctx = canvas.getContext("2d");

	loadImgs(function (imgList){
		runGame(ctx, imgList)
	});
});

function loadImgs(callbackFn){
	var imgPaths = ["grass.png","food.png"];
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