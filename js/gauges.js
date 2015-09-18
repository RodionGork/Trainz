function VertGauge(parent, config) {
    
    this.setup(parent);
    this.parseConfig(config);
    this.drawFull(config);
    
}

VertGauge.prototype.setup = function(parent) {
    this.canvas = $('<canvas/>').appendTo(parent);
    this.w = parent.width();
    this.h = parent.height();
    this.canvas.attr('width', this.w).attr('height', this.h);
    this.context = this.canvas.get(0).getContext('2d');
    var self = this;
    parent.on('gauge:update', function(elem, value) {
        self.drawPointer(value);
    });
}

VertGauge.prototype.parseConfig = function(config) {
    config.min = config.colors[0];
    config.max = config.colors[config.colors.length - 1];
    this.max = config.max;
    this.low = this.h - 15;
    this.high = 15;
    this.len = this.low - this.high;
    this.delta = config.max - config.min;
    var middle = typeof(config.middle) != 'undefined' ? config.middle : 0.75;
    this.middle = Math.round(this.w * middle);
}

VertGauge.prototype.drawFull = function(config) {
    var ctx = this.context;
    this.drawFrame(ctx);
    this.drawColors(ctx, config);
    this.drawSteps(ctx, config);
    this.drawPointer(config.min);
}

VertGauge.prototype.drawFrame = function(ctx) {
    ctx.strokeStyle = '#999';
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, this.h);
    ctx.lineTo(this.w, this.h);
    ctx.lineTo(this.w, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

VertGauge.prototype.drawColors = function(ctx, config) {
    var x = this.middle;
    ctx.lineWidth = 7;
    for (var i = 0; i < config.colors.length - 1; i += 2) {
        var start = config.colors[i];
        var color = config.colors[i + 1];
        var finish = config.colors[i + 2];
        ctx.beginPath();
        ctx.moveTo(x, this.getY(start));
        ctx.lineTo(x, this.getY(finish));
        ctx.strokeStyle = color;
        ctx.stroke();
    }
}

VertGauge.prototype.drawSteps = function(ctx, config) {
    var x = this.middle - 10;
    var smallLength = 10;
    var largeLength = 20;
    var delta = config.max - config.min;
    var len = this.low - this.high;
    ctx.strokeStyle = '#777';
    ctx.fillStyle = '#777';
    ctx.lineWidth = 2;
    for (var t = config.min; t < config.max; t += config.smallStep) {
        ctx.beginPath();
        var y = this.getY(t);
        ctx.moveTo(x - smallLength, y);
        ctx.lineTo(x, y);
        ctx.stroke();
    }
    ctx.font = 'bold 10pt Sans Serif';
    ctx.textAlign = 'end';
    ctx.textBaseline = 'middle';
    for (var t = config.min; t <= config.max + delta * 1e-7; t += config.step) {
        ctx.beginPath();
        var y = this.getY(t);
        ctx.moveTo(x - largeLength, y);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.fillText(t + '', x - largeLength - 5, y);
    }
}

VertGauge.prototype.drawPointer = function(value) {
    var ctx = this.context;
    var x = this.middle + 10;
    var y = this.getY(value);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x - 1, 1, 14, this.h - 1);
    ctx.fillStyle = '#777';
    ctx.lineStyle = '#777';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 8, this.getY(this.max - this.delta));
    ctx.lineTo(x + 8, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 12, y - 7);
    ctx.lineTo(x + 12, y + 7);
    ctx.closePath();
    ctx.fill();
}

VertGauge.prototype.getY = function(value) {
    return this.high + this.len * (this.max - value) / this.delta;
}
