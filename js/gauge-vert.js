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
    this.flip = typeof(config.flip) != 'undefined' ? config.flip : false;
    this.min = config.min;
    this.max = config.max;
    this.outlie = (this.max - this.min) / 20;
    this.low = this.h - 15;
    this.high = 15;
    this.len = this.low - this.high;
    this.delta = config.max - config.min;
    var middle = typeof(config.middle) != 'undefined' ? config.middle : 0.75;
    this.middle = Math.round(this.w * middle);
    this.bColor = typeof(config.bColor) != 'undefined' ? config.bColor : '#fff';
    this.fColor = typeof(config.fColor) != 'undefined' ? config.fColor : '#777';
}

VertGauge.prototype.drawFull = function(config) {
    var ctx = this.context;
    this.drawFrame(ctx);
    this.drawColors(ctx, config);
    this.drawSteps(ctx, config);
    this.drawPointer('-');
}

VertGauge.prototype.drawFrame = function(ctx) {
    ctx.strokeStyle = '#999';
    ctx.fillStyle = this.bColor;
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
    var len = this.low - this.high;
    ctx.strokeStyle = this.fColor;
    ctx.fillStyle = this.fColor;
    ctx.lineWidth = 1;
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
    ctx.lineWidth = 2;
    for (var t = config.min; t <= config.max + this.delta * 1e-7; t += config.step) {
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
    ctx.fillStyle = this.bColor;
    ctx.fillRect(x - 1, 1, 14, this.h - 2);
    if (typeof(value) != 'number') {
        value = parseFloat(value);
    }
    if (Number.isFinite(value)) {
        value = Math.max(value, this.min - this.outlie);
        value = Math.min(value, this.max + this.outlie);
        var x = this.middle + 10;
        var y = this.getY(value);
        ctx.fillStyle = this.fColor;
        ctx.lineStyle = this.fColor;
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
}

VertGauge.prototype.getY = function(value) {
    if (!this.flip) {
        value = this.max - value;
    } else {
        value = value - this.min;
    } 
    return this.high + this.len * value / this.delta;
}
