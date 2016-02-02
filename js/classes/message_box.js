function MessageBox(context) {
  this.context = context;
}

MessageBox.prototype.resize = function(width, height, x, y) {
  this.context.canvas.width = width;
  this.context.canvas.height = height;
  
  this.setSize(width, height, x, y);
}

MessageBox.prototype.setSize = function(width, height, x, y) {
  this.width = width;
  this.height = height;
  
  if( x == undefined || x == null ) {
    x = 0;
  }
  
  if( y == undefined || y == null ) {
    y = 0;
  }
  
  this.start_x = x;
  this.start_y = y;
}

MessageBox.prototype.draw = function(str) {
  //this.context.fillStyle = "#111111"; 
  //this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height); 
  
  var border_size = CONFIG.border_size;
  var text_padding = value(10);
  var margin = value(30);
  var size = CONFIG.border_size;
    
                                // Padding inside the text box
  var text_width = this.width - (margin*2) - (border_size * 2) - (text_padding*2);
  var text_height = this.height - (margin*2) - (border_size * 2) - (text_padding*2);
  
  var border_x = this.start_x + margin + (border_size);
  var border_y = this.start_y + margin + (border_size);
  
  
  this.applyBackground(this.context, border_x, border_y, text_width + (text_padding*2), text_height + (text_padding*2), size);
  
  this.applyBorder(this.context, border_x, border_y, text_width + (text_padding*2), text_height  + (text_padding*2), size);
  
  var infos = Font.write(null, str, 0, 0, text_width, CONFIG.text_scale);
  Font.write(this.context, str, this.start_x + Math.floor( (this.width - infos['width']) / 2), Math.floor( (this.height - infos['height']) / 2), text_width, CONFIG.text_scale);
}

// Private methods
// ------------------------------------------------------------------------------------------------
MessageBox.prototype.applyBorder = function(context, margin_x, margin_y, map_width, map_height, size) {
  var background_color = '#939e47';
  var border_color = '#bbc95b';
  
  // Apply the border
  // ----------------------------------------------------------------------------------------------
  context.fillStyle = border_color;
  context.fillRect( margin_x - size, margin_y - size, map_width + (size*2), map_height + (size*2));
  
  // Replace the border color, with the background color
  // ----------------------------------------------------------------------------------------------
  var positions = new Array();
  positions.push( {'x': margin_x - size, 'y': margin_y - size} );
  positions.push( {'x': margin_x - size + map_width + size, 'y': margin_y - size} );
  positions.push( {'x': margin_x - size + map_width + size, 'y': margin_y - size + map_height + size} );
  positions.push( {'x': margin_x - size, 'y': margin_y - size + map_height + size} );
  
  // Remove partial parts in each sides
  // ----------------------------------------------------------------------------------------------
  var max_space = 5;
  var parts = this.getParts((map_width + (size*2)) / size, false, max_space);
  for(var i=0; i<parts.length; i++) {
    positions.push( {'x': margin_x - size + (parts[i]*size), 'y':margin_y - size } );
  }
  var parts = this.getParts((map_width + (size*2)) / size, false, max_space);
  for(var i=0; i<parts.length; i++) {
    positions.push( {'x': margin_x - size + (parts[i]*size), 'y':margin_y - size + map_height + size } );
  }
  
  var parts = this.getParts((map_height + (size*2)) / size, false, max_space);
  for(var i=0; i<parts.length; i++) {
    positions.push( {'x': margin_x - size, 'y':margin_y - size + (parts[i]*size) } );
  }
  var parts = this.getParts((map_height + (size*2)) / size, false, max_space);
  for(var i=0; i<parts.length; i++) {
    positions.push( {'x': margin_x - size + map_width + size, 'y':margin_y - size + (parts[i]*size) } );
  }
  
  // Replace the coloring
  // ----------------------------------------------------------------------------------------------
  for(var i=0; i<positions.length; i++) {
    context.fillStyle = background_color;
    context.fillRect(positions[i].x, positions[i].y, size, size);  
  }
}

MessageBox.prototype.applyBackground = function(context, margin_x, margin_y, map_width, map_height, size) {
  var background_color = '#939e47';
  // Apply the background
  // ----------------------------------------------------------------------------------------------
  context.fillStyle = background_color;
  context.fillRect( margin_x - (size*2), margin_y - (size*2), map_width + (size*4), map_height + (size*4));  
  
  // Remove the corner (4 corners)
  // ----------------------------------------------------------------------------------------------
  var positions = new Array();
  positions.push( {'x': margin_x - (size*2), 'y': margin_y - (size*2)} );
  positions.push( {'x': margin_x - (size*2) + map_width + (size*3), 'y': margin_y - (size*2)} );
  positions.push( {'x': margin_x - (size*2) + map_width + (size*3), 'y': margin_y - (size*2) + map_height + (size*3)} );
  positions.push( {'x': margin_x - (size*2), 'y': margin_y - (size*2) + map_height + (size*3)} );
  
  // Remove partial parts in each sides
  // ----------------------------------------------------------------------------------------------
  var max_space = 5;
  var parts = this.getParts((map_width + (size*4)) / size, true, max_space);
  for(var i=0; i<parts.length; i++) {
    positions.push( {'x': margin_x - (size*2) + (parts[i]*size), 'y':margin_y - (size*2) } );
  }
  var parts = this.getParts((map_width + (size*4)) / size, true, max_space);
  for(var i=0; i<parts.length; i++) {
    positions.push( {'x': margin_x - (size*2) + (parts[i]*size), 'y':margin_y - (size*2) + map_height + (size*3) } );
  }
  
  var parts = this.getParts((map_height + (size*4)) / size, true, max_space);
  for(var i=0; i<parts.length; i++) {
    positions.push( {'x': margin_x - (size*2), 'y':margin_y - (size*2) + (parts[i]*size) } );
  }  
  var parts = this.getParts((map_height + (size*4)) / size, true, max_space);
  for(var i=0; i<parts.length; i++) {
    positions.push( {'x': margin_x - (size*2) + map_width + (size*3), 'y':margin_y - (size*2) + (parts[i]*size) } );
  }
  
  // Remove the removed parts
  // ----------------------------------------------------------------------------------------------
  for(var i=0; i<positions.length; i++) {
//    context.clearRect(positions[i].x, positions[i].y, size, size);
    context.fillStyle = '#111111';
    context.fillRect(positions[i].x, positions[i].y, size, size);  
  }
}

MessageBox.prototype.getParts = function(total, allow_gap, max_space) {
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