function GameState(imgList){
	this.tileSize = 16;      // Pixel length of (square) tiles
	this.canvasWidth = 64;   // Width of canvas in tiles
	this.canvasLength = 32;  // Length of canvas in tiles

	this.buildingList = [];
	this.imgList = imgList;

	// Adds the food to board
	this.food = new GameObject (0, 0, 1, true);
}

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

function GameObject (x, y, imgIndex, isFood){
	this.x = x;
	this.y = y;
	this.imgIndex = imgIndex;
	this.isFood = isFood;
}

GameObject.prototype.isOverlapping = function(x, y){
	if (Math.abs(x - this.x) < 2 && Math.abs(y - this.y) < 2){
		return true;
	}
	return false;
};

GameObject.prototype.draw = function(gs, cxt){
	cxt.drawImage(gs.imgList[this.imgIndex], this.x * 
		gs.tileSize, this.y * gs.tileSize);
}



function fillGrass(gs, cxt){
	for (var x = 0; x < gs.canvasWidth; x += 2){
		for (var y = 0; y < gs.canvasLength; y += 2){
			cxt.drawImage(gs.imgList[0], x * gs.tileSize, 
										y * gs.tileSize);
		}
	}
}

function drawObjects(gs, cxt){
	// Draw buildings
	for (var i = 0; i < gs.buildingList.length; i++){
		gs.buildingList[i].draw(gs, cxt);
	}
	// Draw food
	gs.food.draw(gs, cxt);
}

function gameLoop(gs, cxt){
	fillGrass(gs, cxt);
	drawObjects(gs, cxt);
	gs.addBuilding();
}

function runGame(cxt, imgList){
	var gs = new GameState(imgList);
	window.setInterval(function() {
		gameLoop(gs, cxt);
	}, 500);
}

$(window).load(function(){
	var canvas = $("#canvas")[0];
	var cxt = canvas.getContext("2d");

	loadImgs(function (imgList){
		runGame(cxt, imgList)
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