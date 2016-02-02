function Font() {}

function loading() {
  Font.isReady();
}

Font.size = 8;

Font.sprite_sheets = new Collection();
Font.sprite_sheets.add('', new SpriteSheet('fonts.png', 8, 8));
Font.sprite_sheets.add('red', new SpriteSheet('fonts_red.png', 8, 8));
Font.sprite_sheets.add('green', new SpriteSheet('fonts_green.png', 8, 8));
Font.sprite_sheets.add('black', new SpriteSheet('fonts_black.png', 8, 8));
Font.sprite_sheets.add('dark_gray', new SpriteSheet('fonts_dark_gray.png', 8, 8));
Font.sprite_sheets.add('gray', new SpriteSheet('fonts_gray.png', 8, 8));
Font.sprite_sheets.add('light_green', new SpriteSheet('font_light_green.png', 8, 8));
Font.sprite_sheets.add('light_red', new SpriteSheet('font_light_red.png', 8, 8));

Font.loaded = false;
Font.timer = setInterval(loading, 40);
Font.currentSpriteSheet = '';

// When everything is loaded
// ------------------------------------------------------------------------------------------------
Font.isReady = function() {
  var loaded = true;
  for(var i=0; i<Font.sprite_sheets.length(); i++) {
    if( Font.sprite_sheets.elemAt(i).loaded == false ) {
      loaded = false;
      break;
    }
  }
  if( loaded && Font.loaded == false  ) {
    clearInterval(this.timer);
    Font.loaded = true;
  }
}

// Change the current sprite sheet
// ------------------------------------------------------------------------------------------------
Font.setSpriteSheet = function(new_sprite_sheet) {
  Font.currentSpriteSheet = new_sprite_sheet;
}

// Write a string
// ------------------------------------------------------------------------------------------------
Font.write = function(context, str, x, y, max_width, scale, alpha) {
  // Default values
  // ----------------------------------------------------------------------------------------------
  if( scale == undefined ) {
    scale = 1;
  }
  if( max_width == undefined ) {
    max_width = 500;
  }
  
  var padding_x = 0;
  var padding_y = 0;
  var remove_padding = 0;
  var max_padding_x = 0;
  var lines = [];                         // Hold all lines
  var line = '';                          // Hold the current line
  
  // Load the correct sprite sheet (The default one if it is not valid
  // ----------------------------------------------------------------------------------------------
  var current_sprite_sheet = Font.sprite_sheets.elem( Font.currentSpriteSheet );
  if( current_sprite_sheet == null ) {
    current_sprite_sheet = Font.sprite_sheets.elem('');
  }
  
  // Split into tokens (space, ponctuation)
  // ----------------------------------------------------------------------------------------------
  var words = str.split(' ');
  for(var w=0; w<words.length; w++) {
    var token = words[w];
    // Check if the token is bigger than the allowed width
    // --------------------------------------------------------------------------------------------
    if( padding_x + (token.length *  (current_sprite_sheet.width * scale)) > max_width ) {
      if( padding_x > 0 ) {
        padding_x = 0;
        padding_y += (Font.size + 1) * scale;
        lines.push( line );
        line = '';
      }
    }

    token += ' ';
    line += token;
    
    // Show the token
    // --------------------------------------------------------------------------------------------
    for(var i=0; i<token.length; i++) {
      remove_padding = 0;
      var index = -1;
      var c = token.charAt(i);
      var code = token.charCodeAt(i);
      
      if( padding_x > max_padding_x ) {
        max_padding_x = padding_x;
      }
      
      if( c == ' ' ) {
        if( padding_x > 0 ) {
          padding_x += (current_sprite_sheet.width * scale);
        }
      } else if( c >= 'a' && c <= 'z' ) {
        index = code - 97 + 26;
      } else if( c >= 'A' && c <= 'Z' ) {
        index = code - 65 + 52;
      } else if( c >= 0 && c < 10 ) {
        index = code - 48;
      } else {
        switch(c) {
          case '%':
            index = 10;
            break;
          case '+':
            index = 11;
            break;
          case ',':
            index = 12;
            remove_padding = (4 * scale);
            break;
          case '.':
            index = 13;
            remove_padding = (4 * scale);
            break
          case '-':
            index = 14;
            break
          case '=':
            index = 15;
            break
          case '!':
            index = 16;
            break
          case '?':
            index = 17;
            break
          case "'":
          case "`":
            index = 18;
            remove_padding = (4 * scale);
            break
          case ":":
            index = 19;
            remove_padding = (3 * scale);
            break
          case "/":
            index = 20;
            remove_padding = (1 * scale);
            break
          case "[":
            index = 21;
            remove_padding = (3 * scale);
            break
          case "]":
            index = 22;
            remove_padding = (3 * scale);
            break
          case "<":
            index = 23;
            remove_padding = (3 * scale);
            break
          case ">":
            index = 24;
            remove_padding = (3 * scale);
            break
          default:
            trace('Other character:' + c);
        }
      }
      
      if( index != -1 ) {
        if( context != undefined && context != null ) {
          current_sprite_sheet.drawScale(index, context, x+padding_x, y + padding_y, scale, alpha);
        }
        padding_x += ( current_sprite_sheet.width * scale) - remove_padding;
      }
    }
  }
  
  if( line != '' ) {
    lines.push(line);
  }
  
  return { 'width': max_padding_x, 'height': (padding_y + (Font.size * scale)), 'lines': lines };
}
