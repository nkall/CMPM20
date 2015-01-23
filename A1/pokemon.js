function GameState(pokeList, spriteList){
	this.pokeList = pokeList;
	this.spriteList = spriteList;
}

GameState.prototype.appendSprite = function (newSprite) {
	this.spriteList[this.spriteList.length] = newSprite;
}

function Sprite (poke, coords){
	this.poke = poke;  // Type of Pokemon
	this.coords = coords;
}

Sprite.prototype.drawSprite = function (image, context){
	//Variables for brevity
	p = this.poke;
	s = p.spriteSize;
	context.drawImage(image, p.clipCoords.posX, p.clipCoords.posY, s, s, 
					  this.coords.posX, this.coords.posY, s, s);
}

function Coordinates(posX, posY){
	this.posX = posX;
	this.posY = posY;
}

// This represents a Pokemon type, not an individual sprite
function Pokemon(species, pokedexNo, spriteSize, clipCoords){
	this.species = species;
	this.pokedexNo = pokedexNo;

	// Sprites are square -- this is the length of an edge
	this.spriteSize = spriteSize;
	// This represents the coordinates on the bigger image from which to 'clip'
	// the smaller image
	this.clipCoords = clipCoords;
}

// This divides the big image into individual Pokemon objects.  Why not just use
// individual sprite images?  Well, I'm too lazy to crop and resave each one.
function splitSprites(sourceImg, spriteAmt, spriteSize, columns){
	var pokemen = [];
	for (var i = 0; i < spriteAmt; i++){
		clipX = spriteSize * (i % columns);
		clipY = spriteSize * Math.floor((i / columns));
		clipCoords = new Coordinates(clipX, clipY);
		pokemen[pokemen.length] = new Pokemon("Unknown", i+1, spriteSize, clipCoords);
	}
	return pokemen;
}


function gameLoop(context, bgImg, img, pokemen){
	context.drawImage(bgImg, 0, 0);
	spr = new Sprite(pokemen[Math.round(Math.random()*150)], new Coordinates(0,0));
	spr.drawSprite(img, context);
}


$(window).ready(function(){
	// Set up canvas and mouse events
	canvas = $("#canvas")[0]
	var context = canvas.getContext("2d");
	//canvas.addEventListener("mousedown")

	// Set up images that will be used
	var bgImg = new Image();
	bgImg.src = "bg.jpg";
	var img = new Image();
	img.src = "pokemon.png";

	//Once images are loaded, start game loop
	bgImg.onload = function() {
    	img.onload = function() {
    		var pokemen = splitSprites(img, 151, 96, 13);
    		var state = new GameState();
    		window.setInterval(function() {
 				gameLoop(context, bgImg, img, pokemen);
			}, 1000);
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