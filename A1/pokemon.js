function Coordinates(posX, posY){
	this.posX = posX;
	this.posY = posY;
}

function GameState(pokeList, spriteList){
	this.pokeList = pokeList;
	this.spriteList = spriteList;

	this.isClicking = false; //Flag to check if mouse button being held
}

GameState.prototype.appendSprite = function (newSprite) {
	this.spriteList[this.spriteList.length] = newSprite;
}

GameState.prototype.drawSprites = function (image, context){
	for (var i = 0; i < this.spriteList.length; i++) {
		this.spriteList[i].drawSprite(image, context);
	}
}

GameState.prototype.handleDragging = function (e){
	if (this.isClicking){
		// If sprite overlaps mouse, move sprite center to mouse location
		for (var i = 0; i < this.spriteList.length; i++) {
			mouseCoords = new Coordinates(e.clientX, e.clientY);
			if (this.spriteList[i].containsPoint(mouseCoords)){
				//Offset coordinates for proper centered dragging
				offset = (this.spriteList[i].poke.spriteLen) / 2
				mouseCoords.posX = mouseCoords.posX - offset;
				mouseCoords.posY = mouseCoords.posY - offset;
				this.spriteList[i].coords = mouseCoords;
				break;  //Don't want to drag multiple sprites at once
			}
		}
	}
}

// Checks for any sprite overlaps and transforms Pokemen if they are different enough
GameState.prototype.handleOverlaps = function (){
	for (var i = 0; i < this.spriteList.length; i++) {
		for (var j = i + 1; j < this.spriteList.length; j++) {
			// To merge, sprites must overlap and be more than one Pokedex number apart
			if (this.spriteList[i].overlapsSprite(this.spriteList[j]) &&
			    (this.spriteList[i].poke.pokedexNo > this.spriteList[j].poke.pokedexNo + 1 ||
				 this.spriteList[j].poke.pokedexNo > this.spriteList[i].poke.pokedexNo + 1 )){
					// Remove old sprites, after saving them in temp variables
					var s1 = this.spriteList[i];
					var s2 = this.spriteList[j];
					this.spriteList = this.spriteList.splice(i, 1);
					this.spriteList = this.spriteList.splice(j, 1);

					// Insert new sprite, average of the old ones' pokedex nums
					this.appendSprite(s1.combineWith(s2, this.pokeList));

					return; // Need to break out to avoid "chain reaction"
			}
		}
	}
}


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
}

// Returns true if one sprite overlaps another
Sprite.prototype.overlapsSprite = function (spr){
	len = spr.poke.spriteLen;
	// Left, right, and bottom left and right corners of testing sprite
	lc = spr.coords;
	rc = new Coordinates(spr.coords.posX + len, spr.coords.posY);
	blc = new Coordinates(spr.coords.posX, spr.coords.posY + len);
	brc = new Coordinates(spr.coords.posX + len, spr.coords.posY + len);

	if (this.containsPoint(lc) || this.containsPoint(rc) ||
		this.containsPoint(blc) || this.containsPoint(brc)){
		return true;
	}
	return false;
}

Sprite.prototype.drawSprite = function (image, context){
	//Variables for brevity
	p = this.poke;
	s = p.spriteLen;
	context.drawImage(image, p.clipCoords.posX, p.clipCoords.posY, s, s, 
					  this.coords.posX, this.coords.posY, s, s);
}

// Combines two sprites together and returns a new one.  The pokedex number
// of the new sprite is the average of the old two.
Sprite.prototype.combineWith = function (spr, pokeList){
	var newPokeIndex = Math.floor(((this.poke.pokedexNo + spr.poke.pokedexNo - 2) / 2));
	return (new Sprite(pokeList[newPokeIndex], this.coords));
}



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



// This divides the big image into individual Pokemon objects.  Why not just use
// individual sprite images?  Well, I'm too lazy to crop and resave each one.
function splitSprites(spriteAmt, spriteLen, columns){
	var pokemen = [];
	for (var i = 0; i < spriteAmt; i++){
		clipX = spriteLen * (i % columns);
		clipY = spriteLen * Math.floor((i / columns));
		clipCoords = new Coordinates(clipX, clipY);
		pokemen[pokemen.length] = new Pokemon(pokeNames[i], i+1, spriteLen, clipCoords);
	}
	return pokemen;
}


function gameLoop(state, context, bgImg, img, pokemen){
	context.drawImage(bgImg, 0, 0);
	state.drawSprites(img, context);
}




$(window).ready(function(){
	// Set up canvas
	canvas = $("#canvas")[0]
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
	var bgImg = new Image();
	bgImg.src = "bg.jpg";
	var img = new Image();
	img.src = "pokemon.png";

	//Once images are loaded, start game loop
	bgImg.onload = function() {
    	img.onload = function() {
    		// Start with Bulbasaur and Mew, the ends of the scale
    		bulb = new Sprite(pokemen[0], new Coordinates(50,275));
    		mew = new Sprite(pokemen[150], new Coordinates(450,275));
			state.appendSprite(bulb);
			state.appendSprite(mew);

    		window.setInterval(function() {
 				gameLoop(state, context, bgImg, img, pokemen);
			}, 10);
		};
	};
});

var pokeNames = ["Bulbasaur","Ivysaur","Venusaur","Charmander","Charmeleon","Charizard",
				 "Squirtle","Wartortle","Blastoise","Caterpie","Metapod","Butterfree","Weedle",
				 "Kakuna","Beedrill","Pidgey","Pidgeotto","Pidgeot","Rattata","Raticate",
				 "Spearow","Fearow","Ekans","Arbok","Pikachu","Raichu","Sandshrew","Sandslash",
				 "Nidoran♀","Nidorina","Nidoqueen","Nidoran♂","Nidorino","Nidoking","Clefairy",
				 "Clefable","Vulpix","Ninetales","Jigglypuff","Wigglytuff","Zubat","Golbat",
				 "Oddish","Gloom","Vileplume","Paras","Parasect","Venonat","Venomoth",
				 "Diglett","Dugtrio","Meowth","Persian","Psyduck","Golduck","Mankey",
				 "Primeape","Growlithe","Arcanine","Poliwag","Poliwhirl","Poliwrath","Abra",
				 "Kadabra","Alakazam","Machop","Machoke","Machamp","Bellsprout","Weepinbell",
				 "Victreebel","Tentacool","Tentacruel","Geodude","Graveler","Golem","Ponyta",
				 "Rapidash","Slowpoke","Slowbro","Magnemite","Magneton","Farfetch'd","Doduo",
				 "Dodrio","Seel","Dewgong","Grimer","Muk","Shellder","Cloyster","Gastly",
				 "Haunter","Gengar","Onix","Drowzee","Hypno","Krabby","Kingler","Voltorb",
				 "Electrode","Exeggcute","Exeggutor","Cubone","Marowak","Hitmonlee",
				 "Hitmonchan","Lickitung","Koffing","Weezing","Rhyhorn","Rhydon","Chansey",
				 "Tangela","Kangaskhan","Horsea","Seadra","Goldeen","Seaking","Staryu",
				 "Starmie","Mr. Mime","Scyther","Jynx","Electabuzz","Magmar","Pinsir","Tauros",
				 "Magikarp","Gyarados","Lapras","Ditto","Eevee","Vaporeon","Jolteon","Flareon",
				 "Porygon","Omanyte","Omastar","Kabuto","Kabutops","Aerodactyl","Snorlax",
				 "Articuno","Zapdos","Moltres","Dratini","Dragonair","Dragonite","Mewtwo","Mew"]