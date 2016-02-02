function Card() {
  this.canvas = document.createElement('canvas');
  this.canvas.width = 84;
  this.canvas.height = 112;
  this.context = this.canvas.getContext('2d');
}

Card.prototype.load = function(data) {
  this.sprite = data.sprite;
  this.name = data.name;
  this.attack = data.attack;
  this.defense = data.defense;
}

Card.prototype.update = function(attack, defense, sprite_sheets, sprite_sheet ) {
  this.attack = attack;
  this.defense = defense;
  this.create(sprite_sheets, sprite_sheet);
}

Card.prototype.create = function(sprite_sheets, sprite_sheet) {
  sprite_sheets.elem(SSName('cards', CONFIG.card_scale)).draw(0, this.context, 0, 0);
  sprite_sheets.elem(SSName(sprite_sheet, CONFIG.entity_scale)).draw(this.sprite, this.context, Math.floor((this.canvas.width - sprite_sheets.elem(SSName(sprite_sheet, CONFIG.entity_scale)).width)/2), Math.floor((this.canvas.height - sprite_sheets.elem(SSName(sprite_sheet, CONFIG.entity_scale)).height)/2));
  
  this.showText(this.name, 14);
  
  this.showText(this.attack + ' / ' + this.defense, this.canvas.height - 22);
}

Card.prototype.showText = function(string, start_y) {
  var infos = Font.write(null, string, 0, 0, this.canvas.width - 16);
  for(var i=0; i<infos['lines'].length; i++) {
    var line = infos['lines'][i];
    line = line.replace(/^\s+|\s+$/g, '');
    var infos_line = Font.write(null, line, 0, 0);
    Font.write(this.context, line, Math.floor((this.canvas.width - infos_line['width']) / 2), start_y);
    start_y += Font.size + 1;
  }
}