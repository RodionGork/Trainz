function VertGauge(parent, config) {
    
    this.setup(parent, config);
    
}

VertGauge.prototype.setup = function(parent, config) {
    this.canvas = $('<canvas/>').appendTo(parent);
    this.w = parent.width();
    this.h = parent.height();
    this.canvas.attr('width', this.w).attr('height', this.h);
    this.context = this.canvas.get(0).getContext('2d');
    var ctx = this.context;
    ctx.strokeStyle = '#999';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, this.h);
    ctx.lineTo(this.w, this.h);
    ctx.lineTo(this.w, 0);
    ctx.closePath();
    ctx.stroke();
}

