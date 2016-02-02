function Action() {
  this.clear();
}

Action.prototype.clear = function( action ) {
  this.actions = [];
}

Action.prototype.add = function( action ) {
  this.actions.push( action );
}

Action.prototype.addFirst = function( action ) {
  if( Object.prototype.toString.call( action ) === '[object Array]' ) {
    for(var i=action.length -1 ; i>=0; i--) {
      this.addFirst( action[i] );
    }
  } else {
    this.actions.unshift( action );
  }
}

Action.prototype.show = function() {
  trace('======================================');
  for(var i=0; i<this.actions.length; i++) {
    trace('=' + this.actions[i].function_name + ', ' + this.actions[i].param1);
  }
  trace('======================================');
}

Action.prototype.execute = function() {
  var wait = false;  
  if( this.actions.length > 0 ) {
    var action = this.actions.shift();
    var func = action.function_name;
    
    trace('Action.execute:' + func + ', ' + action.param1);
    //this.show();
    
    switch( func ) {
      case 'WAIT':
        wait = true;
        break;
      default:   
        if( action.param3 != null && action.param3 != undefined ) {
          game[func](action.param1, action.param2, action.param3);
        } else if( action.param2 != null && action.param2 != undefined ) {
          game[func](action.param1, action.param2);
        } else if( action.param1 != null && action.param1 != undefined ) {
          game[func](action.param1);
        } else {
          game[func]();
        }
    }
  }
  
  if( !wait && this.actions.length > 0 ) {
    this.execute();
  }
}