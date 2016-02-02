function Collection() {
  this.clear();
}

Collection.prototype.add = function(key, val) {
  this.keys.push( key );
  this.values.push( val );
}

Collection.prototype.clear = function() {
  this.keys = new Array();
  this.values = new Array();  
}

Collection.prototype.elem = function(key_) {
  var index = this.getIndexByKey(key_);
  if(index>=0) {
    return this.values[index];
  } else {
    return null;
  }
}

Collection.prototype.elemAt = function(index_) {
  if(index_<this.values.length){
    return this.values[index_];
  }else{
    return null;
  }
}

Collection.prototype.getIndexByKey = function(key_) {
  for(var i=0;i<this.keys.length;i++){
    if(this.keys[i]==key_){
      return i;
    }
  }
  return -1;
}

Collection.prototype.keyAt = function(index_) {
  if(index_<this.keys.length){
    return this.keys[index_];
  }else{
    return null;
  }
}

Collection.prototype.length = function() {
  return this.keys.length;
}

Collection.prototype.remove = function(key) {
  var index = this.getIndexByKey(key);
  if( index>=0 ) {
    return this.removeAt(index);
  } else {
    return null;
  }
}
    
Collection.prototype.removeAt = function(index_) {
  if( index_ < this.values.length ) {
    this.keys.splice(index_,1);
    this.values.splice(index_,1);
    return index_;
  } else {
    return null;
  }
}

Collection.prototype.update = function(key, value) {
  var index = this.getIndexByKey(key);
  if( index == -1 ) {
    this.add(key, value);
  } else {
    this.values[index] = value;
  }
}