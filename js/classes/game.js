function GameEngine() {

  this.sprite_sheets = new Collection();
  this.sprite_sheets.add('background', new SpriteSheet('background.png', 488, 412));
  this.sprite_sheets.add('cards', new SpriteSheet('cards.png', 84, 112));
  this.sprite_sheets.add('portraits', new SpriteSheet('portraits.png', 6, 6));
  this.sprite_sheets.add('backgrounds', new SpriteSheet('backgrounds.png', 28, 20));
  this.sprite_sheets.add('frame', new SpriteSheet('frame.png', 30, 22));
  this.sprite_sheets.add('effects', new SpriteSheet('effects.png', 8, 8));
  this.sprite_sheets.add('panel_icons', new SpriteSheet('panel_icons.png', 8, 8));
  this.sprite_sheets.add('markers', new SpriteSheet('markers.png', 60, 60));
  
  this.sprite_sheets.add('ennemies_right', new SpriteSheet('ennemies_right.png', 8, 8));
  this.sprite_sheets.add('ennemies_left', new SpriteSheet('ennemies_left.png', 8, 8));
  
  this.loaded = {'cards': false, 'game': false};

  this.animation = new Animation();
  
  this.actions = new Action();
  this.message = new Message();
  this.effects = [];

  queue.add('data/cards.json' + '?rnd' + rand(0, 1000000), {'function_name':'parseCards', 'object':this});
}

// Engine methods
// ------------------------------------------------------------------------------------------------
GameEngine.prototype.init = function() {
  // If it's retina, change the pixel ratio
  // ----------------------------------------------------------------------------------------------
  CONFIG.pixel_ratio = (window.devicePixelRatio == 2 ? 2 : 1);
  //CONFIG.pixel_ratio = 1;
  if( CONFIG.pixel_ratio === 2 ) {
    var e = document.getElementById('meta_viewport');
    e.setAttribute('content', 'width=device-width target-densityDpi=device-dpi initial-scale=0.5 maximum-scale=0.5 user-scalable=no');
    document.head.appendChild(e);
  }
  
  // Disable the elastic scrolling from the iPad/iPod/iPhone
  // ----------------------------------------------------------------------------------------------
  document.body.addEventListener('touchmove', function(event){
    event.preventDefault();
  },false);
  
  // Prevent Chrome to show a text cursor while moving the mouse
  // ----------------------------------------------------------------------------------------------
  document.onselectstart = function(){ return false; }
  
  // Detect if we change the orientation
  // ----------------------------------------------------------------------------------------------
  window.addEventListener('orientationchange', function(event) {
    game.prepareGame(window.innerWidth, window.innerHeight);
   // game.refresh();
  }, false);
  
  // Detect if we resize the window
  // ----------------------------------------------------------------------------------------------
  window.addEventListener('resize', function(event) {
    game.prepareGame(window.innerWidth, window.innerHeight);
    //game.refresh();
  }, false);

  // Link javascript with the HTML element
  // ----------------------------------------------------------------------------------------------
  this.context = document.getElementById('game_engine').getContext('2d')
  
  // Resize using the width/height
  // ----------------------------------------------------------------------------------------------
  this.prepareGame(window.innerWidth, window.innerHeight);
  
  //this.prepareGame(300, 300);
  
  // iPod/iPhone
  //this.prepareGame(100, 320);
  //this.prepareGame(480, 208);
  
  // iPad
  //this.prepareGame(1024, 644);
  //this.prepareGame(768, 900);
  
  // Nexus 7
  //this.prepareGame(599, 791);
  //this.prepareGame(960, 441);

  // Wait for everything to be loaded
  // ----------------------------------------------------------------------------------------------
  this.timer = setInterval(function() {
    if( Font.loaded && game.loaded.cards ) {
      var loaded = true;
      // Check to be sure every sprite sheets is loaded
      // ------------------------------------------------------------------------------------------
      for(var i=0; i<game.sprite_sheets.length(); i++) {
        if( game.sprite_sheets.elemAt(i).loaded == false ) {
          loaded = false;
          break;
        }
      }
      if( loaded ) {
        clearInterval(game.timer);
        if( game.loaded.game == false ) {
          game.loaded.game = true;
          game.startGame();
        }
      }
    }
  }, 40);
}

GameEngine.prototype.executeAction = function() {
  this.actions.execute();
}

GameEngine.prototype.prepareGame = function(width, height) {
  // Default values
  // ----------------------------------------------------------------------------------------------
  CONFIG.max_width = 488;
  CONFIG.max_height = 412;
  CONFIG.min_width = 320;
  CONFIG.min_height = 320;
  CONFIG.width = width;
  CONFIG.height = height;
  CONFIG.real_width = (CONFIG.width / CONFIG.pixel_ratio);
  CONFIG.real_height = (CONFIG.height / CONFIG.pixel_ratio);
  CONFIG.is_too_small = false;
  CONFIG.border_size = value(5);
  CONFIG.text_scale = value(1);
  CONFIG.tile_size = 32;
  CONFIG.world_scale = 1;
  CONFIG.card_scale = value(1);
  CONFIG.card_padding = value(10);
  CONFIG.portrait_scale = value(8);
  CONFIG.entity_scale = value(4);
  CONFIG.panel_scale = value(2);
  
  CONFIG.message_margin = 10;
  CONFIG.message_padding = 10;
  CONFIG.message_height = 100;
  
  if( CONFIG.real_width < CONFIG.min_width || CONFIG.real_height < CONFIG.min_height ) {
    CONFIG.is_too_small = true;
    CONFIG.panel_width = CONFIG.panel_height = 0;         // No panel
  } else {
    // Force max/min values
    // ----------------------------------------------------------------------------------------------  
    CONFIG.width = Math.min(CONFIG.max_width, Math.max(CONFIG.width, CONFIG.min_width));
    CONFIG.height = Math.min(CONFIG.max_height, Math.max(CONFIG.height, CONFIG.min_height));

    // Default values if using the max resolution
    // --------------------------------------------------------------------------------------------
    CONFIG.panel_height = value(150);
    CONFIG.map_scale = value(4);//4
    CONFIG.button_scale = value(5);
    
    // Overwrite some values if the screen is smaller
    // --------------------------------------------------------------------------------------------
    var min_value = (CONFIG.width < CONFIG.height ? CONFIG.real_width : CONFIG.real_height);
    if( min_value <= CONFIG.min_height ) {
      CONFIG.panel_height = value(100);
      CONFIG.map_scale = value(2);
    }
   
    // Set some values
    // ----------------------------------------------------------------------------------------------
    CONFIG.viewport_width = CONFIG.width;
    CONFIG.viewport_height = CONFIG.height;

    CONFIG.panel_width = CONFIG.width;
    CONFIG.panel_position = 'bottom';

    CONFIG.game_width = CONFIG.width;
    CONFIG.game_height = CONFIG.height;
  }
  
  // Check if we have the sprite_sheets in the right scale
  // --------------------------------------------------------------------------------------------
  var sprite_sheet_tiles = [];
  sprite_sheet_tiles = ['portraits','backgrounds','frame','ennemies_right','ennemies_left','effects'];
  for(var i=0; i<sprite_sheet_tiles.length; i++) {
    if( this.sprite_sheets.elem(sprite_sheet_tiles[i] + '_' + CONFIG.portrait_scale) == null ) {
      var ss = new SpriteSheet(null, this.sprite_sheets.elem(sprite_sheet_tiles[i]).width * CONFIG.portrait_scale, this.sprite_sheets.elem(sprite_sheet_tiles[i]).height * CONFIG.portrait_scale);
      ss.scale(this.sprite_sheets.elem(sprite_sheet_tiles[i]), CONFIG.portrait_scale);
      this.sprite_sheets.add(sprite_sheet_tiles[i] + '_' + CONFIG.portrait_scale, ss);
    }
  }
  
  sprite_sheet_tiles = ['ennemies_right','ennemies_left'];
  for(var i=0; i<sprite_sheet_tiles.length; i++) {
    if( this.sprite_sheets.elem(sprite_sheet_tiles[i] + '_' + CONFIG.entity_scale) == null ) {
      var ss = new SpriteSheet(null, this.sprite_sheets.elem(sprite_sheet_tiles[i]).width * CONFIG.entity_scale, this.sprite_sheets.elem(sprite_sheet_tiles[i]).height * CONFIG.entity_scale);
      ss.scale(this.sprite_sheets.elem(sprite_sheet_tiles[i]), CONFIG.entity_scale);
      this.sprite_sheets.add(sprite_sheet_tiles[i] + '_' + CONFIG.entity_scale, ss);
    }
  }
  
  sprite_sheet_tiles = ['panel_icons'];
  var scale = CONFIG.panel_scale;
  for(var i=0; i<sprite_sheet_tiles.length; i++) {
    if( this.sprite_sheets.elem(sprite_sheet_tiles[i] + '_' + scale) == null ) {
      var ss = new SpriteSheet(null, this.sprite_sheets.elem(sprite_sheet_tiles[i]).width * scale, this.sprite_sheets.elem(sprite_sheet_tiles[i]).height * scale);
      ss.scale(this.sprite_sheets.elem(sprite_sheet_tiles[i]), scale);
      this.sprite_sheets.add(sprite_sheet_tiles[i] + '_' + scale, ss);
    }
  }
  
  // Resize the panel and the map
  // --------------------------------------------------------------------------------------------
  this.context.canvas.width = CONFIG.game_width;
  this.context.canvas.height = CONFIG.game_height + CONFIG.message_height;
}

GameEngine.prototype.startGame = function() {
  this.players = [];
  this.players.push( new Player('human') );
  this.players[0].loadDeck(this.cards, this.sprite_sheets );
  this.players[0].sprite = 1;
  this.players[0].sprite_sheet = 'ennemies_right';
  this.players[0].entity_sprite = 2;
  this.players[0].portrait_color = '#3b7517';
  
  this.players[0].portrait_position = {'x':4, 'y':162};
  this.players[0].hand_position =  {'x':14, 'y':286};
  this.players[0].card_position =  {'x':122, 'y':150};

  this.players.push( new Player('ai') );
  this.players[1].loadDeck(this.cards, this.sprite_sheets );
  this.players[1].sprite = 2;
  this.players[1].entity_sprite = 40;
  this.players[1].portrait_color = '#750012';

  this.players[1].hand_position =  {'x':14, 'y':14};
  this.players[1].portrait_position = {'x':380, 'y':144};
  this.players[1].card_position =  {'x':282, 'y':150};
  
  this.first_player = 0;
  
  this.actions.clear();

  this.actions.add( {'function_name': 'startTurn'} );
  
  this.executeAction();

  this.blit();
//  this.refresh();
}

GameEngine.prototype.refresh = function() {
  if( CONFIG.is_too_small ) {
    var msgbox = new MessageBox(this.map.context);
    msgbox.resize(CONFIG.width, CONFIG.height);
    msgbox.draw('This screen is too small. It need at least a resolution of 320x320!');
  } else {
    // Background
    // --------------------------------------------------------------------------------------------
    this.sprite_sheets.elem('background').draw(0, this.context, 0, 0);
    
    for(var p=0; p<this.players.length; p++) {
      this.showPortrait(this.players[p], 104);
    }

    for(var p=0; p<this.players.length; p++) {
      this.showCards(this.players[p], (p == 0 ? true : false));
    }    
    
    this.message.draw(this.context, {'x':0, 'y':CONFIG.game_height, 'width':this.context.canvas.width, 'height':CONFIG.message_height} );
  }
}

GameEngine.prototype.disableEvents = function() {
  removeAllEvents(this.context.canvas, 'selectstart');
  removeAllEvents(this.context.canvas, 'touchstart');
  removeAllEvents(this.context.canvas, 'mousedown');
}

GameEngine.prototype.enableEvents = function() {
  var me = this;
  addEvent(this.context.canvas, 'selectstart', function(e) { e.preventDefault(); return false; }, false);
  addEvent(this.context.canvas, 'touchstart', function(e) { me.onClicked(e); e.preventDefault(); return false; }, false);
  addEvent(this.context.canvas, 'mousedown', function(e) { me.onClicked(e); e.preventDefault(); return false; }, false);
}

GameEngine.prototype.showCards = function(player, reveal) {
  for(var i=0; i<player.hands.length; i++) {
    var hide = reveal;
    if( hide == false && player == this.players[1] && this.players[1].selected_card == i ) {
      hide = true;
    }
    hide = true;
    if( player.hands[i].alpha != 1 ) {
      this.context.globalAlpha = player.hands[i].alpha;
    }
    //this.sprite_sheets.elem(SSName('cards', CONFIG.card_scale)).draw(( hide ? 0 : 1), this.context, player.hands[i].x, player.hands[i].y);
    //this.sprite_sheets.elem(SSName('cards', CONFIG.card_scale)).draw(player.hands[i].canvas, this.context, player.hands[i].x, player.hands[i].y);
    if( !hide ) {
      this.sprite_sheets.elem(SSName('cards', CONFIG.card_scale)).draw(1, this.context, player.hands[i].x, player.hands[i].y);
    } else {
      this.context.drawImage(player.hands[i].card.canvas, 0, 0, 84, 112, player.hands[i].x, player.hands[i].y, 84, 112);
    }
    
    if( player.selected_card == i ) {
      this.sprite_sheets.elem(SSName('cards', CONFIG.card_scale)).draw((player.ready ? (player == this.players[0] ? 3 : 4) : 2), this.context, player.hands[i].x, player.hands[i].y);
    }
    
    if( player.hands[i].alpha != 1 ) {
      this.context.globalAlpha = 1;
    }
    
  }
}

GameEngine.prototype.showPortrait = function(player, width) {

  var y = player.portrait_position.y;
  var x = player.portrait_position.x;
  
  var icon_padding = 6;
  
  // Decks
  // ----------------------------------------------------------------------------------------------
  var text_x = x + 10;
  this.sprite_sheets.elem(SSName('panel_icons', CONFIG.panel_scale)).draw(1, this.context, text_x, y);  
  text_x += this.sprite_sheets.elem(SSName('panel_icons', CONFIG.panel_scale)).width + icon_padding;
  var str = player.decks.length;
  Font.write(this.context, str.toString(), text_x , y + 5, width);
  
  // Graveyard
  // ----------------------------------------------------------------------------------------------
  str = player.graveyard.length;
  var text_x = x + width - 10;
  var infos = Font.write(null, str.toString(), 0 , 0, width);
  Font.write(this.context, str.toString(), text_x - infos['width'], y + 5, width);
  text_x -= icon_padding;
  text_x -= infos['width'];
  text_x -= this.sprite_sheets.elem(SSName('panel_icons', CONFIG.panel_scale)).width;
  this.sprite_sheets.elem(SSName('panel_icons', CONFIG.panel_scale)).draw(0, this.context, text_x, y);  
  
  y += this.sprite_sheets.elem(SSName('panel_icons', CONFIG.panel_scale)).height + 10;
  
  // Border around portraits
  // ----------------------------------------------------------------------------------------------
  var border_size = 4;
  var border_width = this.sprite_sheets.elem(SSName('portraits', CONFIG.portrait_scale)).width + (border_size*2);
  
  this.context.fillStyle = player.portrait_color;
  this.context.fillRect(x + Math.floor((width - border_width) / 2), y, border_width, this.sprite_sheets.elem(SSName('portraits', CONFIG.portrait_scale)).height + (border_size*2));  
  y += border_size;

  // Portrait
  // ----------------------------------------------------------------------------------------------
  this.sprite_sheets.elem(SSName('portraits', CONFIG.portrait_scale)).draw(player.sprite, this.context, x + Math.floor((width - this.sprite_sheets.elem(SSName('portraits', CONFIG.portrait_scale)).width) / 2), y);
  y += this.sprite_sheets.elem(SSName('portraits', CONFIG.portrait_scale)).height + 10;
  
  // HP remaining
  // ----------------------------------------------------------------------------------------------
  var text_width = this.sprite_sheets.elem(SSName('panel_icons', CONFIG.panel_scale)).width + icon_padding;
  var str = player.decks.length + '/' + player.decks_limit;
  var infos = Font.write(null, str, 0, 0, width);
  text_width += infos['width'];
  var text_x = x + Math.floor((width - text_width) / 2);
  text_width = 0;
  
  this.sprite_sheets.elem(SSName('panel_icons', CONFIG.panel_scale)).draw(2, this.context, text_x, y);
  text_width += this.sprite_sheets.elem(SSName('panel_icons', CONFIG.panel_scale)).width + icon_padding;
  Font.write(this.context, str, text_x + text_width, y + 5, width);
}

GameEngine.prototype.startTurn = function() {
  this.entities = [];
  
  this.message.clear();
  
  this.actions.clear();
  
  // Draw cards
  // ----------------------------------------------------------------------------------------------
  for(var p=0; p<this.players.length; p++) {
    for(var i=0; i<this.players[p].hands_limit - this.players[p].hands.length; i++) {
      this.actions.add( {'function_name': 'drawCard', 'param1': this.players[p] } );
    }
  }
  
  // Pick a card
  // ----------------------------------------------------------------------------------------------
  
  if( this.first_player == 0 ) {  
    this.message.add('Choose a card to play');
    this.actions.add( {'function_name': 'playerTurn' } );
    this.actions.add( {'function_name': 'WAIT' } );
    this.actions.add( {'function_name': 'disableEvents' } );
    this.actions.add( {'function_name': 'moveCard', 'param1':this.players[0]} );
    this.actions.add( {'function_name': 'WAIT', 'param1':'moveCard' } );
  
    this.actions.add( {'function_name': 'ennemyTurn' } );
    this.actions.add( {'function_name': 'moveCard', 'param1':this.players[1]} );
    this.actions.add( {'function_name': 'WAIT', 'param1':'moveCard' } );
  } else {
    this.message.add('Waiting for the ennemy...');
    this.actions.add( {'function_name': 'ennemyTurn' } );
    this.actions.add( {'function_name': 'moveCard', 'param1':this.players[1]} );
    this.actions.add( {'function_name': 'WAIT', 'param1':'moveCard' } );
    
    this.actions.add( {'function_name': 'playerTurn' } );
    this.actions.add( {'function_name': 'WAIT' } );
    this.actions.add( {'function_name': 'disableEvents' } );
    this.actions.add( {'function_name': 'moveCard', 'param1':this.players[0]} );
    this.actions.add( {'function_name': 'WAIT', 'param1':'moveCard' } );
  }
  
  // Wait and Activate cards
  // ----------------------------------------------------------------------------------------------
  this.actions.add( {'function_name':'setTimer', 'param1':2});
  this.actions.add( {'function_name':'WAIT'});
  this.actions.add( {'function_name':'activateCard'} );
  
  // End of Turn
  // ----------------------------------------------------------------------------------------------
  this.actions.add( {'function_name': 'endTurn' } );
}

GameEngine.prototype.activateCard = function() {
  this.message.clear();
  this.message.add('Activating card...');
  
  // If it's 2 "creatures" cards, collide them
  // ----------------------------------------------------------------------------------------------
  for(var p=0; p<this.players.length; p++) {
    var to = this.players[p].hands[ this.players[p].selected_card ].x + (p == 0 ? 38 : -38);
    this.animation.add( {'type':'move', 'from':this.players[p].hands[ this.players[p].selected_card ].x, 'to':to, 'object':this.players[p].hands[ this.players[p].selected_card ], 'variable':'x'} );
  }
  
  var actions = [];
  actions.push( {'function_name':'WAIT', 'param1':'activateCard (Clash Cards)'} );
  
  
  
  actions.push( {'function_name':'setTimer', 'param1':2});
  actions.push( {'function_name':'WAIT', 'param1':'setTimer'} );
  actions.push( {'function_name':'damageCard'} );
  actions.push( {'function_name':'WAIT', 'param1':'damageCard'} );
  actions.push( {'function_name':'animateCard'} );
  
  this.actions.addFirst( actions );
  
  this.animation.setCallback('executeAction');
}

GameEngine.prototype.animateCard = function() {
  var loop = false;
  for(var p=0; p<this.players.length; p++) {
    if( this.players[p].hands[ this.players[p].selected_card ].state != -1 ) {
      loop = true;
      switch( this.players[p].hands[ this.players[p].selected_card ].state ) {
        case 1:
          this.animateEffect(this.players[p].hands[ this.players[p].selected_card ], this.players[ (p==0 ? 1 : 0) ]);
          break;
      }
    }
  }
  
  if( loop ) {
    var actions = [];
    actions.push( {'function_name':'animateCard'} );
    actions.push( {'function_name':'WAIT', 'param1':'animateCard'} );
    
    this.actions.addFirst( actions );
  }
  
}

GameEngine.prototype.damageCard = function() {
  var card1 = this.players[0].hands[ this.players[0].selected_card ];
  card1.state = 0;
  var card2 = this.players[1].hands[ this.players[1].selected_card ];
  card2.state = 0;
  var new_attack1 = Math.max(card1.card.attack - card2.card.defense, 0);
  var new_defense1 = Math.max(card1.card.defense - card2.card.attack, 0);  
  
  var new_attack2 = Math.max(card2.card.attack - card1.card.defense, 0);
  var new_defense2 = Math.max(card2.card.defense - card1.card.attack, 0); 
  
  card1.card.update(new_attack1, new_defense1, this.sprite_sheets, this.players[0].sprite_sheet);
  card2.card.update(new_attack2, new_defense2, this.sprite_sheets, this.players[1].sprite_sheet);
  
  var actions = [];
  var actions2 = [];
  
  actions.push( {'function_name':'setTimer', 'param1':2});
  actions.push( {'function_name':'WAIT', 'param1':'setTimer'} );
  
  // Destroy dead card...
  // ----------------------------------------------------------------------------------------------
  for(var p=0; p<this.players.length; p++) {
    if( this.players[p].hands[ this.players[p].selected_card ].card.attack > 0 ) {
      actions.push( {'function_name':'attackPlayer', 'param1':this.players[p].hands[ this.players[p].selected_card ], 'param2': this.players[ (p==0 ? 1 : 0) ] } );
    } else {
      actions.push( {'function_name':'checkCardStatus', 'param1':this.players[p].hands[ this.players[p].selected_card ] } );
    }
  }

  if( actions.length > 0 ) {
    this.actions.addFirst( actions );
  }  
}

GameEngine.prototype.checkCardStatus = function(card) {
  var actions = [];
  
  if( card.card.defense <= 0 ) {
    this.hideCard(card);
  } else {
    this.returnCard(card);
  }
  
  //this.actions.addFirst( actions );
}

GameEngine.prototype.destroyCard = function(card) {
  var actions = [];
  
  actions.push( {'function_name':'hideCard', 'param1':card} );
    
  this.actions.addFirst( actions );
}

GameEngine.prototype.returnCard = function(card) {
  this.hideCard(card);
}

GameEngine.prototype.attackPlayer = function(card, player) {
  card.state = 1;
  this.animation.add( {'type':'move', 'from': card.x, 'to':player.portrait_position.x, 'object':card, 'variable':'x'} );
  this.animation.add( {'type':'move', 'from': card.y, 'to':player.portrait_position.y, 'object':card, 'variable':'y'} );
  this.animation.setCallback('executeAction');
}

GameEngine.prototype.animateEffect = function(card, player) {
  // Fade out the card
  //var actions = [];
  //actions.push( {'function_name':'hideCard', 'param1':card} );
  //actions.push( {'function_name':'WAIT', 'param1':'hideCard'} );
    
  //this.actions.addFirst( actions );
  this.hideCard(card);
}



GameEngine.prototype.setTimer = function(stop_at) {
  var tmp = {'timer': 0};
  this.animation.add( {'type':'wait', 'from': 1, 'to':stop_at, 'object':tmp, 'variable':'timer'} );
  this.animation.setCallback('executeAction');
}

GameEngine.prototype.drawCard = function(player) {
  if( player.drawCard() ) {
    this.actions.addFirst( {'function_name': 'WAIT' } );
    var card = player.hands[ player.hands.length - 1 ];
    card.x = this.context.canvas.width - 10;
    card.y = player.hand_position.y;
    card.scale = CONFIG.card_scale;
    card.width = this.sprite_sheets.elem(SSName('cards', CONFIG.card_scale)).width;
    card.height = this.sprite_sheets.elem(SSName('cards', CONFIG.card_scale)).height;
    card.alpha = 1;
    
    this.animation.add( {'type':'move', 'from': card.x, 'to':player.hand_position.x + ((player.hands.length -1) * (card.width+CONFIG.card_padding)), 'object':card, 'variable':'x'} );
    this.animation.setCallback('executeAction');
  }
}

GameEngine.prototype.executeAction = function() {
  this.actions.execute();
}

GameEngine.prototype.ennemyTurn = function() {
  // Fetch a card in hand
  // ----------------------------------------------------------------------------------------------
  var card_index = -1;
  for(var i=0; i<this.players[1].hands.length; i++) {
    this.players[1].selected_card = i;
    break;
  }
}

GameEngine.prototype.playerTurn = function() {
  this.enableEvents();
  this.message.clear();
  this.message.add('Choose a card to play');
}

GameEngine.prototype.damagePlayer = function(player, damage) {
  player.takeDamage(damage);
  var entity = {'str': damage.toString(), 'x':player.portrait_position.x + 16, 'y':player.portrait_position.y};
  this.entities.push( entity );
  
  this.moveEntity(entity, entity.x, entity.y - 50, 1);
  //this.hideEntity(entity, 0.01);
}

GameEngine.prototype.endTurn = function() {
  trace('endTurn...');
  this.actions.add({'function_name':'removeCard'});
  
  this.actions.add({'function_name':'WAIT'});
  
  this.actions.add({'function_name':'startTurn'});
  
  this.first_player ++;
  if( this.first_player > this.players.length ) {
    this.first_player = 0;
  }
}

GameEngine.prototype.showEffect = function(entity) {
  var entity_effect = {'x': entity.x, 'y':entity.y, 'sprite': 4, 'sprite_sheet':'effects', 'alpha':1};
  this.entities.push( entity_effect );
  this.hideEntity(entity_effect);
}

GameEngine.prototype.hideEntity = function(entity, speed) {
  this.animation.add( {'type':'fade_out', 'object':entity, 'speed':speed} );
  
  this.animation.setCallback('executeAction'); 
}

GameEngine.prototype.hideCard = function(card) {
//  var card = this.players[0].hands[ this.players[0].selected_card ];
  card.alpha = 1;
  card.state = -1;
  this.animation.add( {'type':'fade_out', 'object':card} );
/*
  var card2 = this.players[1].hands[ this.players[1].selected_card ];
  card2.alpha = 1;
  this.animation.add( {'type':'fade_out', 'object':card2} );
  */
  this.animation.setCallback('executeAction');
}

GameEngine.prototype.moveCard = function(player) {
  var position = player.card_position;
  
  player.ready = true;
  
  this.animation.add( {'type':'move', 'from': player.hands[ player.selected_card ].x, 'to':position.x, 'object':player.hands[ player.selected_card ], 'variable':'x'} );
  this.animation.add( {'type':'move', 'from': player.hands[ player.selected_card ].y, 'to':position.y, 'object':player.hands[ player.selected_card ], 'variable':'y'} );
  this.animation.setCallback('executeAction');
}

GameEngine.prototype.removeCard = function() {
  for(var p=0; p<this.players.length; p++) {
    this.players[p].removeCard(this.players[p].selected_card);
    for(var i=this.players[p].selected_card; i<this.players[p].hands.length; i++) {
      this.animation.add( {'type':'move', 'from': this.players[p].hands[i].x, 'to':this.players[p].hands[i].x - CONFIG.card_padding - this.players[p].hands[i].width, 'object':this.players[p].hands[i], 'variable':'x'} );
    }
    this.players[p].selected_card = -1;
  }
  this.animation.setCallback('executeAction');
}

// Blitting methods
// ------------------------------------------------------------------------------------------------
GameEngine.prototype.blit = function() {
  game.update();
  requestAnimFrame(game.blit);
}

GameEngine.prototype.update = function() {
  // Check if we need to animate/draw
  // ----------------------------------------------------------------------------------------------
 // this.animation.animate();
  
  // Show everything
  // ----------------------------------------------------------------------------------------------
  this.refresh();
  
  this.animation.animate();
}

// Parsing JSON methods
// ------------------------------------------------------------------------------------------------
GameEngine.prototype.parseCards = function(result) {
  var data = JSON.parse( unescape(result) );
  this.cards = new Collection();
  for(key in data) {
    //var c = new Card();
    //c.load(data[key]);
    this.cards.add(key, data[key]);
  }
  this.loaded.cards = true;
}

GameEngine.prototype.onClicked = function(event) {
  var x = -1, y = -1;
  switch(event.type) {
    case 'mousedown':
      x = event.layerX;
      y = event.layerY;
      break;
    default:
      x = event.targetTouches[0].pageX;
      y = event.targetTouches[0].pageY;
  }

  // Click on our buttons
  // ----------------------------------------------------------------------------------------------
  var clicked = false;
  for(var i=0; i<this.players[0].hands.length; i++) {
    if( isHover(this.players[0].hands, i, x, y, 5) ) {
      clicked = true;
      if( i == this.players[0].selected_card ) {
        
        this.message.clear();
        if( this.first_player == 0 ) {
          this.message.add('Waiting for the ennemy to play...');
        } else {
          this.message.add('');
        }
        this.executeAction();
      } else {
        this.players[0].selected_card = i;
        this.players[0].ready = false;
        this.message.clear();
        this.message.add('Click again to confirm!');
      }
      break;
    }
  }
}

// ------------------------------------------------------------------------------------------------
var game = new GameEngine();
