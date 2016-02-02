function AjaxQueue(method) {
  if( method == 'POST' ) {
    this.method = method;
  } else {
    this.method = 'GET'; 
  }
  this.state = false;              // Executing or not ?
  this.items = [];
}

AjaxQueue.prototype.add = function(url, params) {
  // Add it
  // ----------------------------------------------------------------------------------------------
  if( params == undefined && params == null ) {
    params = {};
  }
  var item = params;
  item.url = url;
  this.items.push( item );
  
  // If the queue is not already running, do it
  // ----------------------------------------------------------------------------------------------
  if( this.state == false ) {
    this.execute();
  }
}
  
AjaxQueue.prototype.done = function() {
  this.state = false;
  this.items.splice(0, 1);
  
  // If the queue is not empty, execute it
  // ----------------------------------------------------------------------------------------------
  if( this.items.length > 0 ) {
    this.execute();
  }
}
  
AjaxQueue.prototype.execute = function() {
  if( this.items.length > 0 && this.state == false ) {
    this.req = get_xmlhttp();
    this.req.onreadystatechange = function() {
      if( queue.req.readyState == 4 || queue.req.readyState == 'complete' ) {
        if( queue.items[0].object != null ) {
          queue.items[0].object[queue.items[0].function_name](escape(queue.req.responseText), queue.items[0].values);
        } else if( queue.items[0].function_name != null ) {
          if( queue.items[0].values != null && queue.items[0].values != '' ) {
            window[queue.items[0].function_name]( escape(queue.req.responseText), queue.items[0].values);
          } else {
            trace('ici');
            window[queue.items[0].function_name]( escape(queue.req.responseText) );
          }          
        }
        queue.done();
      }
    }     
        
    var ajax_method = this.method;
    if( this.items[0].method != null ){
      ajax_method = this.items[0].method;
    }      
    this.state = true;
      
    if( ajax_method == 'POST' ) {
      this.req.open(ajax_method, this.items[0].url, true);
      this.req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
      this.req.setRequestHeader('Content-length', this.items[0].params.length);
      this.req.setRequestHeader('Connection', 'close');
      this.req.send(this.items[0].params);
    } else {
      var url = this.items[0].url;
      if( this.items[0].params != undefined ) {
        url += '?' + this.items[0].params;
      }
      this.req.open(ajax_method, url, true);
      this.req.send(null);
    }
  }
}

// --------------------------------------------------------------------------------------

queue = new AjaxQueue('GET');