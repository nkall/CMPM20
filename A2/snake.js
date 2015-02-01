function GameState(){
	this.tileSize = 16;      // Pixel length of (square) tiles
	this.canvasWidth = 64;   // Width of canvas in tiles
	this.canvasLength = 32;  // Length of canvas in tiles

	this.buildingList = [];
	//this.tileList = this.initTileList;
}
/*
GameState.prototype.initTileList = function (){
	newTileList = [];
	for(var x = 0; x < this.canvasWidth; x++){
		newYList = [];
		for(var y = 0; y < this.canvasLength; y++){
			newYList[y] = new Tile(false, false);
		}
		newTileList[x] = newYList;
	}
	return newTileList;
};*/

GameState.prototype.addBuilding = function (){
	while(1){
		var randX = Math.round(Math.random() * this.canvasWidth);
		var randY = Math.round(Math.random() * this.canvasLength);
		if (!this.isOverlappingSomething(randX, randY)){
			this.buildingList[this.buildingList.length] = \
							new Building(randX, randY, imgIndex);
		}
	}
};

GameState.prototype.isOverlappingBuilding = function(x, y, size){
	for (var i = 0; i < this.buildingList.length; i++){
		if (buildingList[i].isOverlapping(x, y, size)){
			return true;
		}
	}
	return false;
}

function Building (x, y, imgIndex){
	this.x = x;
	this.y = y;
	this.imgIndex = imgIndex;
}

Building.prototype.isOverlapping(x, y){

}

function Tile(isObstructed, isFood){
	this.isObstructed = isObstructed;
	this.isFood = isFood;
}

function fillGrass(gs, cxt, grassImg){
	for (var x = 0; x < gs.canvasWidth; x += 2){
		for (var y = 0; y < gs.canvasLength; y += 2){
			drawTile(gs, cxt, x, y, grassImg);
		}
	}
}

function drawTile(gs, cxt, tileX, tileY, img){
	cxt.drawImage(img, tileX * gs.tileSize, tileY * gs.tileSize);
}

function runGame(canvas, cxt){
	drawTile(gs, cxt, randX, randY, imgList[randBuild]);
}

$(window).load(function(){
	var canvas = $("#canvas")[0];
	var cxt = canvas.getContext("2d");

	loadImgs(function (imgList){
		var gs = new GameState();
		fillGrass(gs, cxt, imgList[0]);
		window.setInterval(function() {
			runGame(canvas, context);
		}, 500);
		runGame(canvas, cxt, gs);
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