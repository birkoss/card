// Hold all our events (Should not be called directly)
// ------------------------------------------------------------------------------------------------
var _CUSTOM_EVENTS = {};

function emptyAction() {
  return {'type':'waiting'};
}

function addEvent(node, event, handler, capture) {
  if( !(node in _CUSTOM_EVENTS) ) {
    _CUSTOM_EVENTS[node] = {};
  }
  if( !(event in _CUSTOM_EVENTS[node]) ) {
    _CUSTOM_EVENTS[node][event] = [];
  }

  if( _CUSTOM_EVENTS[node][event].length == 0 ) {
    _CUSTOM_EVENTS[node][event].push( [handler, capture] );
    node.addEventListener(event, handler, capture);
  }
}

function removeAllEvents(node, event) {
  if( node in _CUSTOM_EVENTS) {
    var handlers = _CUSTOM_EVENTS[node];
    if( event in handlers ) {
      var eventHandlers = handlers[event];
      for(var i = eventHandlers.length; i--;) {
        var handler = eventHandlers[i];
        node.removeEventListener(event, handler[0], handler[1]);
      }
      _CUSTOM_EVENTS[node][event] = [];
    }
  }
}

function SSName(name, scale) {
 // trace('SSName(' + name + ',' + scale + ');');
  if( scale > 1 ) {
    name += '_' + scale;
  }
 // trace('=' + name);
  return name;
}

// RequestAnimFrame: a browser API for getting smooth animations
window.requestAnimFrame = (function() {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
  function(callback) {
    window.setTimeout(callback, 1000 / 60);
  };
})();

function isHover(array, index, x, y, padding) {
  if( padding == undefined || padding == null ) {
    padding = 0;
  }
  if( index >= array.length ) {
    return false;
  }
  
  if( x >= (array[index].x - padding) && x < (array[index].x + array[index].width + padding) && y >= (array[index].y - padding) && y < (array[index].y + array[index].height + padding) ) {
    return true;
  }
  return false;
}

function value(value) {
  return (value * CONFIG.pixel_ratio);
}

function trace(str) {
  console.log(str);
}

function get_xmlhttp() {
  var xmlhttp=false;    
  try {
    xmlhttp=new XMLHttpRequest();
  } catch(e) {        
    try {            
      xmlhttp= new ActiveXObject("Microsoft.XMLHTTP");
    } catch(e) {
      try{
        req = new ActiveXObject("Msxml2.XMLHTTP");
      } catch(e1) {
        xmlhttp=false;
      }
    }
  }

  return xmlhttp;
}


function chr(code) {
  return String.fromCharCode(code);
}

function glue(str,add,glue) {
  if(!glue) {
    glue='&';
  }
  
  if(str!='' && str!=null && add!='' && add!=null) {
    str += glue;
  }

  return str + add;
}

function array_shuffle(o) {
  for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
}

function clone(obj) {
    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        var copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        var copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }
    
    
   if (obj instanceof Card) {
        var copy = new Card;
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        var copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }
    
 

    throw new Error("Unable to copy obj! Its type isn't supported.");
}

function number_format(num, dec) {
  var result = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
  return result;
}

function rand(from, to) {
  return Math.floor(Math.random()*(to-from+1)+from);
}

function rand_decimal(from, to) {
  return (rand(from * 1000, to * 1000) / 1000).toFixed(3);
}
