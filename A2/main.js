/*
 *	This file comprises the main game loop and some misc
 *	functions involving drawing and key press detection.
 */

// Fills the map with grass tile background
function fillGrass(gs, ctx){
	// Uses multiples of 2, since grass tiles are 2x grid size
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
	// Draw bg
	fillGrass(gs, ctx);

	// Add building if at the right time interval
	if (shouldBuild){
		gs.addObject(false);
	}

	// Draw all buildings and food
	drawObjects(gs, ctx);

	// Update the snake's position/state, and draw it if it
	// hasn't died yet
	gs.snake.moveSnake(gs, ctx);
	if (!gs.isGameOver){
		gs.snake.draw(gs, ctx);
	} else {
		// Dim screen
		ctx.fillStyle = '#000000';
		ctx.globalAlpha=0.5;
		ctx.fillRect(0, 0, gs.canvasWidth * gs.tileSize, 
						  gs.canvasLength * gs.tileSize);
		// Print 'Game Over' and 'try again' messages
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

// Initializes main game state, runs main game loop, and
// detects keypresses
function runGame(ctx, imgList){
	var gs = new GameState(imgList);
	var buildingTimer = 0;

	// Run main game loop at an interval
	window.setInterval(function() {
		// Buildings are generated once every x frames, where
		// x is the number given in gs.buildingTimerLimit
		var shouldBuild = false;
		buildingTimer++;
		// If timer is over the limit, reset the timer and
		// add a new building
		if (buildingTimer > gs.buildingTimerLimit){
			buildingTimer = 0;
			shouldBuild = true;
		} else {
			buildingTimer++;
		}
		gameLoop(gs, ctx, shouldBuild);
	}, 200);

	// Change direction based on keypress, provided the snake
	// is not going the opposite direction.  Also, detects
	// spacebar to start a new game
	document.addEventListener("keydown", function(e){
		switch(e.key){
			case "w":
			case "Up":
				if (gs.snake.direction !== "DOWN"){
					gs.snake.direction = "UP";
				}
				break;
			case "s":
			case "Down":
				if (gs.snake.direction !== "UP"){
					gs.snake.direction = "DOWN";
				}
				break;
			case "a":
			case "Left":
				if (gs.snake.direction !== "RIGHT"){
					gs.snake.direction = "LEFT";
				}
				break;
			case "d":
			case "Right":
				if (gs.snake.direction !== "LEFT"){
					gs.snake.direction = "RIGHT";
				}
				break;
			case " ":
				// Restart is done with a new gameState
				// and a score display reset
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

// Canvas/context initialization and run game upon image load
$(window).load(function(){
	var canvas = $("#canvas")[0];
	var ctx = canvas.getContext("2d");

	loadImgs(function (imgList){
		runGame(ctx, imgList)
	});
});

// Makes sure all the images are loaded by the browser before
// attempting to display them onscreen
function loadImgs(callbackFn){
	var imgPaths = ["grass.png","food.png","snake.png"];
	// Add various building obstacle images
	for (var i = 0; i < 20; i++){
		imgPaths[imgPaths.length] = "build" + i + ".png";
	}
	var imgList = []
	// Keep count of loaded images to make sure each is
	// loaded. Otherwise, this would be callback hell.
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