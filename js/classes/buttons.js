function Buttons(size, context) {
  this.size = size;  
  this.selected = true;
  
  this.clear();
  
  context.canvas.addEventListener('selectstart', function(e) { e.preventDefault(); return false; }, false);
  context.canvas.addEventListener('touchstart', function(e) {  game.buttons.OnButtonTouched(e); e.preventDefault(); return false; }, false);
  context.canvas.addEventListener('mousedown', function(e) {  game.buttons.OnButtonClicked(e); e.preventDefault(); return false; }, false);
}

// Pulic methods
// ------------------------------------------------------------------------------------------------
Buttons.prototype.addButton = function( button ) {
  this.buttons.push( button );
}

Buttons.prototype.changePage = function(mod) {
  this.current_page += mod;
  this.current_page = Math.max(0, Math.min(this.current_page, this.pages.length-1));
}

Buttons.prototype.clear = function() {
  this.buttons = [];
  this.pages_mandatory = [];
  this.pages_last = [];
  this.pages = [];
  this.current_page = -1;
}

Buttons.prototype.clickAt = function(x, y) {
  for(var i=0; i<this.visible_buttons.length; i++) {
    if( (this.visible_buttons[i].clickable == undefined || this.visible_buttons[i].clickable == true) && this.visible_buttons[i].x <= x && (this.visible_buttons[i].x + this.visible_buttons[i].width) >= x && this.visible_buttons[i].y <= y && (this.visible_buttons[i].y + this.visible_buttons[i].height) >= y ) {
      var function_name = this.visible_buttons[i].function_name;
      var function_param = this.visible_buttons[i].function_param;
      if( this.visible_buttons[i].clear == undefined || this.visible_buttons[i].clear == true ) {
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);      
        this.clear();
      }
      trace('Calling:' + function_name + ' with:' + function_param);
      game[function_name](function_param);
      break;
    }
  }
}

Buttons.prototype.draw = function(context, sprite_sheets, options) {
  
  // Did we split the button in pages ?
  // ----------------------------------------------------------------------------------------------
  if( this.pages.length == 0 ) {
    var page = 0;
    this.pages.push( [] );
    for(var i=0; i<this.buttons.length; i++) {
      if( this.buttons[i].visible == false ) {
        this.pages_mandatory.push(this.buttons[i]);
      } else if( this.buttons[i].always_visible === true ) {
        this.pages_last.push(this.buttons[i]);
      } else {
        if( this.pages[ page ].length >= this.getButtonLimit() ) {
          page++;
          this.pages.push( [] );
        }
        
        this.pages[ page ].push( this.buttons[i] );
      }
    }
    this.current_page = 0;
  }

  // Get all the buttons to show in the screen
  // ----------------------------------------------------------------------------------------------
  this.visible_buttons = [];
  if( this.pages.length > 1 ) {
    this.visible_buttons = [{'index':(this.current_page > 0 ? 6 : 7), 'x':-2, 'y':0, 'clear':false, 'function_name':'showButton', 'function_param':-1 }, {'index':(this.current_page+1 >= this.pages.length ? 3 : 2), 'clear':false, 'x':-1, 'y':0, 'function_name':'showButton', 'function_param':1 }];
  }
  for(var i=0; i<this.pages_mandatory.length; i++) {
    this.visible_buttons.push( this.pages_mandatory[i] );
  }
  for(var i=0; i<this.pages[this.current_page].length; i++) {
    this.visible_buttons.push( this.pages[this.current_page][i] );
  }
  for(var i=0; i<this.pages_last.length; i++) {
    this.visible_buttons.push( this.pages_last[i] );
  }
  
  // Show the visible buttons
  // ----------------------------------------------------------------------------------------------
  this.context = context;
  
  var start_at_y = options.start_at_y;
  var padding = options.padding;
  var scale = 4;
 
  for(var i=0; i<this.visible_buttons.length; i++) {
    var button = this.visible_buttons[ i ];
    var size = this.size;
    
    if( button.visible == undefined || button.visible == true ) {    
      var current_sprite_sheet = this.getSpriteSheet(button, sprite_sheets);

      if( button.index != undefined ) {
        button.height = (sprite_sheets.elem('button_small').height * scale);    
        button.width = (sprite_sheets.elem('button_small').width * scale);        
        button.y = Math.floor(start_at_y + ((this.getTotalHeight(padding, sprite_sheets)-button.height) / 2));
        if( button.x == -1 ) {
          //button.x = context.canvas.width - button.width;
          
          //CONFIG.padding_buttons_navigation
          button.x = Math.floor(((context.canvas.width - sprite_sheets.elem('button_action').width) / 2) + sprite_sheets.elem('button_action').width + CONFIG.padding_buttons_navigation);
          
          var str = (this.current_page+1) + '/' + this.pages.length;
          var infos = Font.write(null, str, 0, 0);
          Font.setSpriteSheet('dark_gray');
          Font.write(context, str, button.x + Math.floor( (button.width - infos['width']) / 2), start_at_y + this.getTotalHeight(padding, sprite_sheets) - infos['height'] );
          Font.setSpriteSheet('');
          
        } else if( button.x == -2 ) {
          button.x = Math.floor(((context.canvas.width - sprite_sheets.elem('button_action').width) / 2) - CONFIG.padding_buttons_navigation - button.width);
        }
        
        sprite_sheets.elem('button_small').drawScale(button.index, context, button.x, button.y, scale);

      } else {
        button.x = ((context.canvas.width - current_sprite_sheet.width) / 2);
        button.y = start_at_y;
        button.height = (current_sprite_sheet.height);    
        button.width = (current_sprite_sheet.width);    

        start_at_y += current_sprite_sheet.height + padding;

        // Draw the button background
        // --------------------------------------------------------------------------------------------
        current_sprite_sheet.draw((button.clickable == undefined ? 0 : 1), context, button.x, button.y);
        
        if( button.location != undefined ) {
          Font.setSpriteSheet('white');
          Font.write(context, button.location.name, button.x + 76, button.y + 15, 200, 1);
          var encounter = 'None';
          switch( button.location.encounters.ennemies ) {
            case 0:
              encounter = 'None';
              break;
            case 50:
              encounter = 'Some';
              break;
            case 70:
              encounter = 'A lot';
              break;
          }      
          Font.setSpriteSheet('gray');
          Font.write(context, 'Encounter: ' + encounter, button.x + 76, button.y + 30, 200, 1);
          Font.setSpriteSheet('');
          
          // Show map
          // ------------------------------------------------------------------------------------------
          var map_width = 6;
          var map_height = 6;
          var map_scale = 1;

          var map_border_width = ( (map_width) * (sprite_sheets.elem('map_background').width * map_scale) + 8 );
          var map_border_height = ( (map_height) * (sprite_sheets.elem('map_background').height * map_scale) + 8 );
          game.panel.showMap(context, sprite_sheets, button.location, button.x + 12, button.y + 12, map_scale, map_width, map_height, map_border_width, map_border_height);
        } else if( button.item != undefined ) {
          var text_y = button.y + 15;
          var text_x = button.x + 76;
          var text_max_width = 132;
          
          Font.setSpriteSheet('white');
          var infos = Font.write(context, button.item.name, text_x, text_y, text_max_width, 1);
          text_y += infos['height'] + 7;
          
          if( button.item.effects != undefined ) {
            var str = '';
            var effect;
            for(var e=0; e<button.item.effects.length; e++) {
              effect = button.item.effects[e];
              for(attribute in effect ) {
                switch(attribute) {
                  case 'attack':
                    str = 'Attack: +' + effect[attribute];
                    break;
                  case 'health':
                    str = 'Health: +' + effect[attribute];
                    break;
                  case 'attack_min':
                    str = 'Damage from ' + effect[attribute];
                    break;
                  case 'attack_max':
                    str += ' to ' + effect[attribute];
                    break;
                  case 'flee':
                    str = 'You can flee this battle';
                    break;
                }
              }
            }
            
            if( str != '' ) {
              Font.setSpriteSheet('gray');
              var infos = Font.write(context, str, text_x, text_y, text_max_width, 1);
              text_y += infos['height'] + 7;
              Font.setSpriteSheet('');
            }
          }
          if( button.item.effect != undefined ) {
            Font.setSpriteSheet('gray');
            var infos = Font.write(context, button.item.effect, text_x, text_y, text_max_width, 1);
            text_y += infos['height'] + 7;
            Font.setSpriteSheet('');
          }
          
          if( button.quantity != undefined ) {
            Font.setSpriteSheet('gray');
            if( button.quantity <= 1 ) {
              Font.setSpriteSheet('red');
            }
            var infos = Font.write(context, 'Quantity: ' + button.quantity, text_x, text_y, text_max_width, 1);
            text_y += infos['height'] + 7;
            Font.setSpriteSheet('');          
          }
          
          // Show the item
          // ------------------------------------------------------------------------------------------
          var item_scale = 6;
          
          var border_x = button.x + 12;
          var border_y = button.y + 12;
          
          // Show the border around the map
          // ----------------------------------------------------------------------------------------------
          context.fillStyle = "#D6D6D6"; 
          context.fillRect(border_x, border_y, ((sprite_sheets.elem('ennemies').width) * item_scale)+8, ((sprite_sheets.elem('ennemies').height) * item_scale)+8);  
          context.fillStyle = "#111111"; 
          context.fillRect(border_x+4, border_y+4, ((sprite_sheets.elem('ennemies').width) * item_scale), ((sprite_sheets.elem('ennemies').height) * item_scale));      
          
          // Show the item
          // --------------------------------------------------------------------------------------
          sprite_sheets.elem('items').drawScale(button.item.sprite, context, border_x + 4, border_y + 4, item_scale);
        } else if( button.stats != undefined ) {
          var text_y = button.y + 15;
          var text_x = button.x + 76;
          var text_max_width = 132;
          
          Font.setSpriteSheet('white');
          var infos = Font.write(context, button.stats.name, text_x, text_y, text_max_width, 1);
          text_y += infos['height'] + 7;
          
          Font.setSpriteSheet('gray');
          var infos = Font.write(context, button.stats.description, text_x, text_y, text_max_width, 1);
          text_y += infos['height'] + 7;
          Font.setSpriteSheet('');

          // Show the item
          // ------------------------------------------------------------------------------------------
          var item_scale = 6;
          
          var border_x = button.x + 12;
          var border_y = button.y + 12;
          
          // Show the border around the map
          // ----------------------------------------------------------------------------------------------
          context.fillStyle = "#D6D6D6"; 
          context.fillRect(border_x, border_y, ((sprite_sheets.elem('ennemies').width) * item_scale)+8, ((sprite_sheets.elem('ennemies').height) * item_scale)+8);  
          context.fillStyle = "#111111"; 
          context.fillRect(border_x+4, border_y+4, ((sprite_sheets.elem('ennemies').width) * item_scale), ((sprite_sheets.elem('ennemies').height) * item_scale));      
          
          // Show the item
          // --------------------------------------------------------------------------------------
          sprite_sheets.elem('items').drawScale(button.stats.sprite, context, border_x + 4, border_y + 4, item_scale);
        } else {      
          if( button.label != undefined ) {
            var infos = Font.write(null, button.label, 0, 0, current_sprite_sheet.width-(padding*2));
            Font.write(context, button.label, button.x + sprite_sheets.elem('button_icon').width + 25, button.y + Math.floor( (current_sprite_sheet.height-infos['height'])/2));
          } else {
            current_sprite_sheet.drawScale(button.index-1, context, button.x, button.y, size);
          }
          
          // If we need an icon, draw it
          // --------------------------------------------------------------------------------------------
          if( button.icon != undefined ) {
            sprite_sheets.elem('button_icon').draw(button.icon -1, context, button.x + 15, button.y + 11);
          }
        }
      }
    }
  }
}

Buttons.prototype.length = function() {
  return this.buttons.length;
}

Buttons.prototype.getButtonLimit = function() {
  switch( game.mode ) {
    case GameEngine.MODE_TRAVEL:
      return CONFIG.max_buttons_locations;
      break;
    case GameEngine.MODE_ITEMS_BATTLE:
    case GameEngine.MODE_ITEMS:
      return CONFIG.max_buttons_items;
      break;
  }
  return CONFIG.max_buttons;
}

Buttons.prototype.getSpriteSheet = function(button, sprite_sheets) {
  var current_sprite_sheet = sprite_sheets.elem('button_action');
  if( button.location != undefined ) {
    current_sprite_sheet = sprite_sheets.elem('button_location');
  } else if( button.item != undefined ) {
    current_sprite_sheet = sprite_sheets.elem('button_location');
  } else if( button.stats != undefined ) {
    current_sprite_sheet = sprite_sheets.elem('button_location');
  }
  return current_sprite_sheet;
}

Buttons.prototype.getTotalHeight = function(padding, sprite_sheets) {
  var button_height = 0;
  for(var i=0; i<Math.min(this.buttons.length, this.getButtonLimit()); i++) {
    if( this.buttons[i].visible == undefined || this.buttons[i].visible == true || this.buttons[i].always_visible  ) {
      button_height += this.getSpriteSheet(this.buttons[i], sprite_sheets).height;
      button_height += padding;
    }
  }
  button_height -= padding;
  return Math.max(0, button_height);
}

// Events methods
// ------------------------------------------------------------------------------------------------
Buttons.prototype.OnButtonClicked = function(event) {
  var x;
  var y;

  if (event.pageX != undefined && event.pageY != undefined) {
    x = event.pageX;
    y = event.pageY;
  } else {
    x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
  }
  
  var currentElement = this.context.canvas;
  var totalOffsetX = 0;
  var totalOffsetY = 0;
  do{
      totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
      totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
  } while(currentElement = currentElement.offsetParent);

  x -= totalOffsetX;
  y -= totalOffsetY;
  
  game.buttons.clickAt(x, y);
}

Buttons.prototype.OnButtonTouched = function(event) {
  var x = event.targetTouches[0].pageX;
  var y = event.targetTouches[0].pageY;

  var currentElement = this.context.canvas;
  var totalOffsetX = 0;
  var totalOffsetY = 0;
  do{
      totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
      totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
  } while(currentElement = currentElement.offsetParent);

  x -= totalOffsetX;
  y -= totalOffsetY;
  
  game.buttons.clickAt(x, y);
}
