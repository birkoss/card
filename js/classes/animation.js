function Animation() {
  this.speed = 10;
  this.effects = new Array();
  this.started = false;
  this.callback = null;
}

Animation.prototype.add = function( effect ) {
  effect.ready = false;
  this.effects.push( effect );
}

Animation.prototype.setCallback = function( func ) {
  var me = game;
  this.callback = function() { me[func](); };
}

Animation.prototype.start = function() {
  for(var i=0; i<this.effects.length; i++) {
    if( this.effects[i].ready == false ) {
      switch( this.effects[i].type ) {
        case 'fade_out':
          this.effects[i].modifier = 0.05;
          if( this.effects[i].speed != undefined && this.effects[i].speed != null ) {
            this.effects[i].modifier = this.effects[i].speed;
          }
          this.effects[i].object.alpha = 1;
          this.effects[i].ready = true;
          break;
        case 'move':
          this.effects[i].direction = (this.effects[i].from < this.effects[i].to ? '<' : '>');
          
          if( this.effects[i].speed == undefined || this.effects[i].speed == null ) {
            this.effects[i].modifier = ((this.effects[i].to - this.effects[i].from) / this.speed);
          } else {
            this.effects[i].modifier = (this.effects[i].from > this.effects[i].to ? this.effects[i].speed * -1 : this.effects[i].speed);
          }
          
          this.effects[i].ready = true;
          break;
        case 'attack':
          this.effects[i].step = 0;
          this.effects[i].ready = true;
          break;
        case 'wait':
          this.effects[i].modifier = ((this.effects[i].to - this.effects[i].from) / this.speed);
          this.effects[i].modifier = 0.1;
          this.effects[i].ready = true;
          break;
        case 'zoom':
          this.effects[i].step = 0;
          this.effects[i].ready = true;
          this.effects[i].modifier = ((this.effects[i].to - this.effects[i].from) / this.speed);
          
          this.effects[i].modifier = 0.5;
          
          this.effects[i].direction = (this.effects[i].from < this.effects[i].to ? '<' : '>');
          break;
      }
    }
  }
}

Animation.prototype.stop = function() {
  //clearInterval(this.timer);
  this.started = false;
}

// Private methods
// ------------------------------------------------------------------------------------------------
Animation.prototype.animate = function(rate) {
  this.start();
  //trace('Rate:' + rate);
  //if( this.started ) {
    // Animate everything
    // --------------------------------------------------------------------------------------------
  for(var i=0; i<this.effects.length; i++) {
    if( this.effects[i].ready ) {
      switch( this.effects[i].type ) {
        case 'fade_out':
          if( this.effects[i].object.alpha <= 0 ) {
            this.effects[i].object.alpha = 0;
            this.effects[i].ready = false;
          }
          this.effects[i].object.alpha = Math.max(0, this.effects[i].object.alpha - this.effects[i].modifier);
          break;
        case 'zoom':
          var prop = this.effects[i].variable;
          
          this.effects[i].object[prop] += this.effects[i].modifier;
          
          if( this.effects[i].direction == '<' ) {
            if( this.effects[i].object[prop] >= this.effects[i].to ) {
              trace('oui1');
              this.effects[i].ready = false;
            }
          } else {
            if( this.effects[i].object[prop] <= this.effects[i].to ) {
              trace('oui2');
              this.effects[i].ready = false;
            }
          }
          
          if( !this.effects[i].ready ) {
            this.effects[i].object[prop] = this.effects[i].to;
          }
          break;
        case 'move':
          var prop = this.effects[i].variable;
          
          this.effects[i].object[prop] += this.effects[i].modifier;
          
          if( this.effects[i].direction == '<' ) {
            if( this.effects[i].object[prop] >= this.effects[i].to ) {
              this.effects[i].ready = false;
            }
          } else {
            if( this.effects[i].object[prop] <= this.effects[i].to ) {
              this.effects[i].ready = false;
            }
          }
          
          if( !this.effects[i].ready ) {
            this.effects[i].object[prop] = this.effects[i].to;
          }
          
          break;
        case 'wait':
          var prop = this.effects[i].variable;
          
          this.effects[i].object[prop] += this.effects[i].modifier;

          if( this.effects[i].object[prop] >= this.effects[i].to ) {
            this.effects[i].ready = false;
            this.effects[i].object[prop] = this.effects[i].to;
          }
          
          break;
      }
    }
  }
   
  // Remove ended animation 
  // --------------------------------------------------------------------------------------------
  for(var i=this.effects.length-1; i>=0; i--) {
    if( this.effects[i].ready == false ) {
      this.effects.splice(i, 1);
    }
  }
    
  // If no more, delete it
  // --------------------------------------------------------------------------------------------
  if( this.effects.length == 0 ) {
    if( this.callback != null ) {
      var function_name = this.callback;
      this.callback = null;
      function_name();
    }
  }

}