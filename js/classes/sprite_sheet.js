function SpriteSheet(image, width, height) {
  this.loaded = false;
  this.width = 0;
  if( width != null ) {
    this.width = width;
  }
  this.height = 0;
  if( height != null ) {
    this.height = height;
  }
  
  if( image != null ) {
    // Load the sprite sheet
    // ----------------------------------------------------------------------------------------------
    this.image = new Image();
    this.image.sprite_sheet = this;
    this.image.onload = function() {
      if(!this.complete) {
        throw new Error("Erreur de chargement du tileset nommé \"" + url + "\".");
      }
      this.sprite_sheet.total_height = this.height;
      this.sprite_sheet.total_width = this.width;
      this.sprite_sheet.loaded = true;
    }
    this.image.src = "medias/sprite_sheets/" + image+'?rnd=' + rand(0, 100000);
  }
}

SpriteSheet.prototype.scale = function(origin, scale) {
  this.loaded = true;
  // Create temporary canvas and context to draw the image to
  // ----------------------------------------------------------------------------------------------
  var tmp_canvas = document.createElement('canvas');
  tmp_canvas.width = origin.total_width;
  tmp_canvas.height = origin.total_height;
  var tmp_ctx = tmp_canvas.getContext('2d');
  
  // Draw the image to the temporary context
  // ----------------------------------------------------------------------------------------------
  tmp_ctx.drawImage(origin.image, 0, 0, origin.total_width, origin.total_height);//, 0, 0, origin.total_width, origin.total_height);

  // Fetch the pixels depending on the device
  // ----------------------------------------------------------------------------------------------
  var ratio = tmp_ctx.webkitBackingStorePixelRatio || 1;
  var pixels = null;
  if( ratio != 1 ) {
    pixels = tmp_ctx.webkitGetImageDataHD( 0, 0, origin.total_width, origin.total_height );
  } else {
    pixels = tmp_ctx.getImageData( 0, 0, origin.total_width, origin.total_height );
  }
  var pixel = pixels.data;
  
  // Create the new canvas
  // ----------------------------------------------------------------------------------------------
  this.total_width = (origin.total_width * scale);
  this.total_height = (origin.total_height * scale);
  
  this.image = document.createElement('canvas');
  this.image.width = this.total_width;
  this.image.height = this.total_height;
  this.context = this.image.getContext('2d');

  
  // Draw the canvas using the right scale
  // ----------------------------------------------------------------------------------------------
  var offset = 0;
  for (var y = 0; y < origin.total_height; ++y) {
    for (var x = 0; x < origin.total_width; ++x) {
      var r = pixel[offset++];
      var g = pixel[offset++];
      var b = pixel[offset++];
      var a = pixel[offset++] / 100.0;
      this.context.fillStyle = 'rgba(' + [r, g, b, a].join(',') + ')';
      this.context.fillRect(0 + (x * scale), 0 + (y * scale), scale, scale);
    }
  }

}

SpriteSheet.prototype.rotate = function() {
  trace('rotate...');
  this.context.scale(-1, 1);
}

// ------------------------------------------------------------------------------------------------

SpriteSheet.prototype.draw = function(index, context, dest_x, dest_y) {
  var y = Math.floor(index / (this.total_width / this.width));
  var x = index - (y * (this.total_width / this.width));   
  context.drawImage(this.image, x*this.width, y*this.height, this.width, this.height, dest_x, dest_y, this.width, this.height);
}

// ------------------------------------------------------------------------------------------------

SpriteSheet.prototype.drawScale = function(index, context, dest_x, dest_y, scale, alpha) { 
  // Only use this function if we need to scale
  // ----------------------------------------------------------------------------------------------
  if( scale <= 1 ) {
    this.draw(index, context, dest_x, dest_y);
  } else {  
    // Create temporary canvas and context to draw the image to
    // ----------------------------------------------------------------------------------------------
    var tmp_canvas = document.createElement('canvas');
    tmp_canvas.width = this.width;
    tmp_canvas.height = this.height;
    var tmp_ctx = tmp_canvas.getContext('2d');
    
    // Draw the image to the temporary context
    // ----------------------------------------------------------------------------------------------
    this.draw(index, tmp_ctx, 0, 0);
    
    // Fetch the pixels depending on the device
    // ----------------------------------------------------------------------------------------------
    var ratio = tmp_ctx.webkitBackingStorePixelRatio || 1;
    var pixels = null;
    if( ratio != 1 ) {
      pixels = tmp_ctx.webkitGetImageDataHD( 0, 0, this.width, this.height );
    } else {
      pixels = tmp_ctx.getImageData( 0, 0, this.width, this.height );
    }
    var pixel = pixels.data;
    
    // Draw the canvas using the right scale
    // ----------------------------------------------------------------------------------------------
    var offset = 0;
    for (var y = 0; y < this.height; ++y) {
      for (var x = 0; x < this.width; ++x) {
        var r = pixel[offset++];
        var g = pixel[offset++];
        var b = pixel[offset++];
        var a = pixel[offset++] / 100.0;
        if( alpha != undefined && a != 0 ) {
          a = alpha;
        }
        context.fillStyle = 'rgba(' + [r, g, b, a].join(',') + ')';
        context.fillRect(dest_x + (x * scale), dest_y + (y * scale), scale, scale);
      }
    }
  }
}
