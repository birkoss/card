function Player(type) {
  this.type = type;
  
  this.sprite = 0;
  this.sprite_sheet = (this.type == 'human' ? 'ennemies_right' : 'ennemies_left');
  
  this.decks = [];
  this.hands = [];
  this.graveyard = [];
  this.hand_position = {'x':0, 'y':0};
  this.selected_card = -1;
  
  this.hands_limit = 5;
  this.decks_limit = 60;
}

Player.prototype.takeDamage = function( damage ) {
  if( damage > this.decks.length ) {
    damage = this.decks.length;
  }
  this.decks.splice(0, damage);
}

Player.prototype.removeCard = function(card_index) {
  this.graveyard.push( this.hands.splice(card_index, 1) );
}

Player.prototype.loadDeck = function(cards, sprite_sheets) {
  for(var i=0; i<cards.length(); i++) {
    var c = new Card();
    c.load(cards.elemAt(i));
    c.create(sprite_sheets, this.sprite_sheet);
    this.decks.push( c );
  }
  //this.decks = array_shuffle(this.decks);
}

Player.prototype.drawCard = function() {
  if( this.hands.length < this.hands_limit ) {
    if( this.decks.length > 0 ) {
      var card = this.decks.shift();
      this.hands.push( {'x':-1, 'y':-1, 'card':card} );
      return true;
    }
  }
  return false;
  
}