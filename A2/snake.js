function GameState(imgList){
	this.tileSize = 16;      // Pixel length of (square) tiles
	this.canvasWidth = 64;   // Width of canvas in tiles
	this.canvasLength = 32;  // Length of canvas in tiles

	this.buildingList = [];
	this.imgList = imgList;
	//this.food = new Object;
}

GameState.prototype.addObject = function (isFood){
	while(1){
		var randX = Math.round(Math.random() * this.canvasWidth);
		var randY = Math.round(Math.random() * this.canvasLength);
		if (!this.isOverlappingBuilding(randX, randY, 2) && 
			!this.isOverlappingFood(randX, randY, 2)){
				if (isFood){
					food = new Object(randX, randY, imgIndex, true);
				} else{
					this.buildingList[this.buildingList.length] = \
						new Object(randX, randY, imgIndex, false);
				}
			break;
		}
	}
};

GameState.prototype.moveFood = function(){
	while(1){

}

GameState.prototype.isOverlappingBuilding = function(x, y, size){
	for (var i = 0; i < this.buildingList.length; i++){
		if (buildingList[i].isOverlapping(x, y, size)){
			return true;
		}
	}
	return false;
};

GameState.prototype.isOverlappingFood = function(x, y, size){

};

function Object (x, y, imgIndex, isFood){
	this.x = x;
	this.y = y;
	this.imgIndex = imgIndex;
	this.isFood = isFood;
}

Object.prototype.isOverlapping(x, y){
	if (Math.abs(x - this.x) > size && Math.abs(y - this.y) > size){
		return true;
	}
	return false;
};

Object.prototype.draw(gs, cxt){
	cxt.drawImage(gs.imgList[this.imgIndex], this.x * gs.tileSize, 
					this.y * gs.tileSize);
}

function fillGrass(gs, cxt, grassImg){
	for (var x = 0; x < gs.canvasWidth; x += 2){
		for (var y = 0; y < gs.canvasLength; y += 2){
			drawTile(gs, cxt, x, y, grassImg);
		}
	}
}

function drawObjects(gs, cxt){
	// Draw buildings
	for (var i = 0; i < this.gs.buildingList.length; i++){
		gs.buildingList[i].draw(gs, cxt);
	}
	// Draw food
}

function runGame(gs, cxt){
	fillGrass(gs, cxt, imgList[0]);
}

$(window).load(function(){
	var canvas = $("#canvas")[0];
	var cxt = canvas.getContext("2d");

	loadImgs(function (imgList){
		var gs = new GameState(imgList);
		window.setInterval(function() {
			runGame(gs, cxt);
		}, 500);
	});
});

function loadImgs(callbackFn){
	var imgPaths = ["grass.png","food.png"];
	// Add various building obstacle images
	for (var i = 0; i < 18; i++){
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