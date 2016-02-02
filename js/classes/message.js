function Message() {
  this.clear();
}

Message.prototype.add = function(str) {
  this.texts.push( str );
  this.generated = false;
}

// Draw the floor in the canvas depending on the player position and direction
// ------------------------------------------------------------------------------------------------
Message.prototype.draw = function(context, viewport) {
  if( this.generated == false ) {
  
    context.fillStyle = "#111111"; 
    context.fillRect(viewport.x, viewport.y, viewport.width, viewport.height);  
 
    var border_x = CONFIG.message_margin;
    var border_y = CONFIG.message_margin;  

    // Apply the background
    // ----------------------------------------------------------------------------------------------
    this.applyBackground(context, viewport.x + border_x, viewport.y + border_y, viewport.width - (border_x * 2), viewport.height - (border_y * 2), CONFIG.border_size);
    border_x += CONFIG.border_size;
    border_y += CONFIG.border_size;
    
    // Apply the border
    // ----------------------------------------------------------------------------------------------
    this.applyBorder(context, viewport.x + border_x, viewport.y + border_y, viewport.width - (border_x * 2), viewport.height - (border_y * 2), CONFIG.border_size);
    border_x += CONFIG.border_size;
    border_y += CONFIG.border_size;
    
    // Show all texts
    // ----------------------------------------------------------------------------------------------
    var content = [];
    var text_width = viewport.width - (CONFIG.message_padding * 2) - (border_x * 2);
    var available_height = viewport.height - (border_x * 2) - (CONFIG.border_size * 2);
    
    // Take the last 10 texts, and split big one
    // ----------------------------------------------------------------------------------------------
    for(var i=this.texts.length-1; i>= Math.max(0, this.texts.length-10); i--) {
      var infos = Font.write(null, this.texts[i], 0, 0, text_width);
      for(var l=infos.lines.length-1; l>=0; l--) {
        content.push( infos.lines[l] );
      }
      content.push(' ');
    }
    content.pop();
    content.reverse();
    
    // Remove message until everything fit in the available space
    // ----------------------------------------------------------------------------------------------
    while( (content.length * 8) + (content.length-1) > available_height ) {
      content.shift();
    }

    // Show all messages
    // ----------------------------------------------------------------------------------------------
    var text_height = (content.length * 8) + (content.length-1);
    var start_at_y = viewport.y + border_y + CONFIG.border_size + Math.floor((available_height - text_height ) / 2);
    for(var i=0; i<content.length; i++) {
      context.globalAlpha = 1 - (0.04 * (content.length-1-i));
      var infos = Font.write(null, content[i], 0, 0, text_width);
      Font.write(context, content[i], viewport.x + ((viewport.width - infos['width']) / 2), start_at_y, text_width);
      start_at_y += (Font.size+1);
    }
    context.globalAlpha = 1;
   
    this.generated = true;
  }
}

Message.prototype.clear = function() {
  this.texts = [];
}

Message.prototype.applyBorder = function(context, margin_x, margin_y, map_width, map_height, size) {
  var background_color = '#939e47';
  var border_color = '#bbc95b';
  
  // Apply the border
  // ----------------------------------------------------------------------------------------------
  context.fillStyle = border_color;
  context.fillRect( margin_x, margin_y , map_width, map_height);
  
  // Replace the border color, with the background color
  // ----------------------------------------------------------------------------------------------
  var positions = new Array();
  positions.push( {'x': margin_x, 'y': margin_y} );
  positions.push( {'x': margin_x + map_width - size, 'y': margin_y} );
  positions.push( {'x': margin_x + map_width - size, 'y': margin_y + map_height - size} );
  positions.push( {'x': margin_x, 'y': margin_y + map_height - size} );
  
  // Remove partial parts in each sides
  // ----------------------------------------------------------------------------------------------
  var max_space = 3;
  var parts = this.getParts(map_width / size, false, max_space);
  for(var i=0; i<parts.length; i++) {
    positions.push( {'x': margin_x + (parts[i]*size), 'y':margin_y } );
  }
  var parts = this.getParts(map_width  / size, false, max_space);
  for(var i=0; i<parts.length; i++) {
    positions.push( {'x': margin_x + (parts[i]*size), 'y':margin_y + map_height - size } );
  }
  
  var parts = this.getParts(map_height / size, false, max_space);
  for(var i=0; i<parts.length; i++) {
    positions.push( {'x': margin_x, 'y':margin_y + (parts[i]*size) } );
  }
  var parts = this.getParts(map_height / size, false, max_space);
  for(var i=0; i<parts.length; i++) {
    positions.push( {'x': margin_x + map_width - size, 'y':margin_y + (parts[i]*size) } );
  }
  
  // Replace the coloring
  // ----------------------------------------------------------------------------------------------
  for(var i=0; i<positions.length; i++) {
    context.fillStyle = background_color;
    context.fillRect(positions[i].x, positions[i].y, size, size);  
  }
  
  // Apply the inside 
  //
  context.fillStyle = background_color;
  context.fillRect(margin_x + size, margin_y + size, map_width - (size*2), map_height - (size*2));    
}

Message.prototype.applyBackground = function(context, margin_x, margin_y, map_width, map_height, size) {
  var background_color = '#939e47';
  // Apply the background
  // ----------------------------------------------------------------------------------------------
  context.fillStyle = background_color;
  context.fillRect( margin_x, margin_y, map_width, map_height);  
  
  // Remove the corner (4 corners)
  // ----------------------------------------------------------------------------------------------
  var positions = new Array();
  positions.push( {'x': margin_x, 'y': margin_y} );
  positions.push( {'x': margin_x + map_width - size, 'y': margin_y} );
  positions.push( {'x': margin_x + map_width - size, 'y': margin_y + map_height - size } );
  positions.push( {'x': margin_x, 'y': margin_y + map_height - size} );
  
  // Remove partial parts in each sides
  // ----------------------------------------------------------------------------------------------
  var max_space = 3;
  var parts = this.getParts(map_width / size, true, max_space);
  for(var i=0; i<parts.length; i++) {
    positions.push( {'x': margin_x + (parts[i]*size), 'y':margin_y  } );
  }
  var parts = this.getParts(map_width / size, true, max_space);
  for(var i=0; i<parts.length; i++) {
    positions.push( {'x': margin_x + (parts[i]*size), 'y':margin_y  + map_height - size } );
  }
  
  var parts = this.getParts(map_height / size, true, max_space);
  for(var i=0; i<parts.length; i++) {
    positions.push( {'x': margin_x, 'y':margin_y + (parts[i]*size) } );
  }  
  var parts = this.getParts(map_height / size, true, max_space);
  for(var i=0; i<parts.length; i++) {
    positions.push( {'x': margin_x + map_width - size, 'y':margin_y + (parts[i]*size) } );
  }     
  
  // Remove the removed parts
  // ----------------------------------------------------------------------------------------------
  for(var i=0; i<positions.length; i++) {
    context.fillStyle = '#111111';
    context.fillRect(positions[i].x, positions[i].y, size, size);  
  }
}

Message.prototype.getParts = function(total, allow_gap, max_space) {
  var padding = (allow_gap ? 1 : 2);
  var indexes = new Array();
  for(var i=padding; i<total-padding; i++) {
    indexes.push(i);
  }
  indexes = array_shuffle(indexes);
  
  var parts = new Array();
  var rnd = rand(1, max_space);
  if( rnd >= indexes.length ) {
    rnd = indexes.length - 1;
  }
  
  while( parts.length < rnd ) {
    indexes = array_shuffle(indexes);
    // Check if the parts is near another one
    // --------------------------------------------------------------------------------------------
    var ok = true;
    for(var j=0; j<parts.length; j++) {
      if( parts[j] == indexes[0] ) {
        ok = false;
      } else if( !allow_gap && parts[j] + 1 == indexes[0] ) {
        ok = false;
      } else if( !allow_gap && parts[j] - 1 == indexes[0] ) {
        ok = false
      }
    }
    if( ok ) {
      parts.push( indexes[0] );
    }
  }
  
  return parts;
}