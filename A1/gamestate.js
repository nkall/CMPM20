// nkallhov@ucsc.edu
// This file controls much of the overall game logic and mouse handling
// See also pokemon.js


function GameState(pokeList, spriteList){
	this.pokeList = pokeList;
	this.spriteList = spriteList;

	// Evaluates to true if the Pokemon at that index has been discovered
	this.isDiscovered = [];
	for (var i = 0; i < pokeList.length; i++) {
		this.isDiscovered[this.isDiscovered.length] = false;
	};
	this.isClicking = false; //Flag to check if mouse button being held
}

// Adds a new sprite to be generated next frame
GameState.prototype.appendSprite = function (newSprite) {
	this.spriteList[this.spriteList.length] = newSprite;
};

// Draws each sprite using the drawSprite method
GameState.prototype.drawSprites = function (image, context){
	for (var i = 0; i < this.spriteList.length; i++) {
		this.spriteList[i].drawSprite(image, context);
	}
};

// If the mouse is being held down and moving, this function handles sprite dragging
GameState.prototype.handleDragging = function (e){
	if (this.isClicking){
		// If sprite overlaps mouse, move sprite center to mouse location
		// It always grabs the earliest list members first, which causes some strange behavior
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
};

// Checks for any sprite overlaps and transforms Pokemen if they are different enough
GameState.prototype.handleOverlaps = function (){
	for (var i = 0; i < this.spriteList.length - 1; i++) {
		for (var j = i + 1; j < this.spriteList.length; j++) {
			// To merge, sprites must overlap and be more than one Pokedex number apart
			if (this.spriteList[i].overlapsSprite(this.spriteList[j]) &&
			    (this.spriteList[i].poke.pokedexNo > this.spriteList[j].poke.pokedexNo + 1 ||
				 this.spriteList[j].poke.pokedexNo > this.spriteList[i].poke.pokedexNo + 1 )){
				// Remove old sprites, after saving them in temp variables
				// Should've used a better data structure here to avoid the reverse for loop
				var s1 = this.spriteList[i];
				var s2 = this.spriteList[j];
				for (var k = this.spriteList.length - 1; k >= 0; k--) {
					if (this.spriteList[k] === s1 || this.spriteList[k] === s2){
						this.spriteList.splice(k, 1);
					}
				};

				// Insert new sprite, average of the old ones' pokedex nums
				newSprite = s1.combineWith(s2, this.pokeList);
				this.appendSprite(newSprite);

				// Mark as discovered and update HTML selector
				this.isDiscovered[newSprite.poke.pokedexNo-1] = true;
				updateSelector(this.isDiscovered);
			}
		}
	}
};

// Ordered array of names for the original 151 Pokemon
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
"Articuno","Zapdos","Moltres","Dratini","Dragonair","Dragonite","Mewtwo","Mew"];