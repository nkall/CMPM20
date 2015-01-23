// nkallhov@ucsc.edu
// This file deals with individual sprites and HTML manipulation
// See also gamestate.js


function Coordinates(posX, posY){
	this.posX = posX;
	this.posY = posY;
}

// This represents a sprite on the screen.  There can be multiple of the same pokemen
function Sprite (poke, coords){
	this.poke = poke;  // Type of Pokemon
	this.coords = coords;
}

// Returns true if a given coordinate pair overlaps the sprite
Sprite.prototype.containsPoint = function (point){
	sprLen = this.poke.spriteLen;
	if (point.posX > this.coords.posX && point.posX < this.coords.posX + sprLen &&
		point.posY > this.coords.posY && point.posY < this.coords.posY + sprLen){
		return true;
	}
	return false;
};

// Returns true if one sprite overlaps another
Sprite.prototype.overlapsSprite = function (spr){
	// Left, right, and bottom left and right corners are used to test overlap
	len = spr.poke.spriteLen;
	lc = spr.coords;
	rc = new Coordinates(spr.coords.posX + len, spr.coords.posY);
	blc = new Coordinates(spr.coords.posX, spr.coords.posY + len);
	brc = new Coordinates(spr.coords.posX + len, spr.coords.posY + len);

	if (this.containsPoint(lc) || this.containsPoint(rc) ||
		this.containsPoint(blc) || this.containsPoint(brc)){
		return true;
	}
	return false;
};

Sprite.prototype.drawSprite = function (image, context){
	//Variables for brevity
	p = this.poke;
	s = p.spriteLen;
	context.drawImage(image, p.clipCoords.posX, p.clipCoords.posY, s, s, 
					  this.coords.posX, this.coords.posY, s, s);
};

// Combines two sprites together and returns a new one.  The pokedex number
// of the new sprite is the average of the old two.
Sprite.prototype.combineWith = function (spr, pokeList){
	var newPokeIndex = Math.floor(((this.poke.pokedexNo + spr.poke.pokedexNo - 2) / 2));
	return (new Sprite(pokeList[newPokeIndex], this.coords));
};



// This represents a Pokemon type, not an individual sprite
function Pokemon(species, pokedexNo, spriteLen, clipCoords){
	this.species = species;
	this.pokedexNo = pokedexNo;

	// Sprites are square -- this is the length of an edge
	this.spriteLen = spriteLen;
	// This represents the coordinates on the bigger image from which to 'clip'
	// the smaller image
	this.clipCoords = clipCoords;
}


// This divides the big image into individual Pokemon objects.  Why not just use a bunch
// of individual sprite images?  Well, I'm too lazy to crop it and resave each one.
function splitSprites(spriteAmt, spriteLen, columns){
	var pokemen = [];
	for (var i = 0; i < spriteAmt; i++){
		// Math done to determine what row and column the sprite exists in
		clipX = spriteLen * (i % columns);
		clipY = spriteLen * Math.floor((i / columns));
		clipCoords = new Coordinates(clipX, clipY);
		pokemen[pokemen.length] = new Pokemon(pokeNames[i], i+1, spriteLen, clipCoords);
	}
	return pokemen;
}

// Drawing only -- most logic is handled by the event listeners
function draw(state, context, bgImg, img, balloon){
	context.drawImage(bgImg, 0, 0);
	balloon.update(context);
	state.drawSprites(img, context);
}

// Start with Bulbasaur and Mew, the ends of the scale
function initStarterPokemen(state, pokemen){
	// Create sprites
    bulb = new Sprite(pokemen[0], new Coordinates(50,275));
    mew = new Sprite(pokemen[150], new Coordinates(475,25));
	state.appendSprite(bulb);
	state.appendSprite(mew);

	// Add these two to the 'discovered' list and update HTML selector
	state.isDiscovered[0] = true;
	state.isDiscovered[150] = true;
	updateSelector(state.isDiscovered);
}

//
function Balloon(img, coords){
	this.img = img;
	this.startCoords = new Coordinates(coords.posX, coords.posY);
	this.coords = coords;
	this.leftLimit = -250;
	this.isGoingUp = true; // Toggles for up/down movement
	this.vertCount = 0;
	this.vertLimit = 5;  // Number of up/down pixel travel
	this.frameCount = 0;
	this.frameUpdateRate = 25; // Updates every x frames
}

// Update and display the baloon
Balloon.prototype.update = function(context){
	this.frameCount++;
	if (this.frameCount > this.frameUpdateRate){
		this.frameCount = 0;
		this.vertCount++;
		this.coords.posX -= 2;
		// Bob up or down
		if (this.isGoingUp){
			this.coords.posY++;
		} else {
			this.coords.posY--;
		}

		// Snap to limits
		if (this.coords.posX < this.leftLimit){
			this.coords = this.startCoords;
		}
		if (this.vertCount > this.vertLimit){
			this.vertCount = 0;
			this.isGoingUp = !this.isGoingUp;
		}
	}
	context.drawImage(this.img, this.coords.posX, this.coords.posY);
}

// Adds fields to the HTML Pokemon selector if needed
function updateSelector(isDiscovered){
	newSelectorContents = '';
	for (var i = 0; i < isDiscovered.length; i++) {
		if (isDiscovered[i]){
			newSelectorContents += ('<option value="' + i.toString() + '">#' + 
				(i + 1).toString() + ' ' + pokeNames[i])
		}
	}
	$('#choices').html(newSelectorContents);
}

//Loads image from source path
function loadContent(source){
	var newImg = new Image();
	newImg.src = source;
	return newImg;
}

$(document).ready(function(){
	// Set up canvas
	var canvas = $("#canvas")[0]
	var context = canvas.getContext("2d");

	// Create game state and mouse events
    var pokemen = splitSprites(151, 96, 13);
    var state = new GameState(pokemen, []);
	canvas.addEventListener("mousedown", function(){
		state.isClicking = true;
	}, false);
	canvas.addEventListener("mouseup", function(){
		state.isClicking = false;
		state.handleOverlaps();
	}, false);
	canvas.addEventListener("mousemove", function(e){
		state.handleDragging(e);
	}, false);

	// Set up images that will be used
	// I did not personally make any of these art assets
	var bgImg = loadContent("bg.jpg");  // Background
	var img = loadContent("pokemon.png");  // Sprite sheet
	var rocket = loadContent("rocket.png");
	var balloon = new Balloon(rocket, new Coordinates(650, -3))

	//Once images are loaded, start game loop
	bgImg.onload = function() {
    	img.onload = function() {
    		initStarterPokemen(state, pokemen);
    		window.setInterval(function() {
 				draw(state, context, bgImg, img, balloon);
			}, 10);
		};
	};

	// Adds the Pokemon specified in the HTML selector to the canvas if button pressed
	$('#chooseButton').click(function(){
		pokeVal = $('#choices')[0].value;
		newPoke = new Sprite(pokemen[pokeVal], new Coordinates(Math.random()*500,
															   Math.random()*275));
		state.appendSprite(newPoke);
	});
});