function RoundGauge(parent, config) {
    this.setup(parent);
    this.parseConfig(config);
    this.drawFull(config);
}

RoundGauge.prototype.setup = function(parent) {
    this.canvas = $('<canvas/>').appendTo(parent);
    var size = Math.min(parent.width(), parent.height());
    this.w = size;
    this.h = size;
    this.canvas.attr('width', this.w).attr('height', this.h);
    this.context = this.canvas.get(0).getContext('2d');
    var self = this;
    parent.on('gauge:update', function(elem, value) {
        self.drawPointer(value);
    });
}

RoundGauge.prototype.parseConfig = function(config) {
    config.min = config.colors[0];
    config.max = config.colors[config.colors.length - 1];
    this.minAngle = -135;
    this.maxAngle = 135;
    this.cx = this.w / 2;
    this.cy = this.h / 2;
    this.min = config.min;
    this.max = config.max;
    this.prevValue = this.min;
    this.delta = config.max - config.min;
    var radiusLabel = typeof(config.radiusLabel) != 'undefined'
        ? config.radiusLabel : 0.8;
    this.radiusLabel = Math.round(this.cx * radiusLabel);
    var radiusPointer = typeof(config.radiusPointer) != 'undefined'
        ? config.radiusPointer : 0.5;
    this.radiusPointer = Math.round(this.cx * radiusPointer);
}

RoundGauge.prototype.angle = function(value) {
    var deg = (value - this.min) * (this.maxAngle - this.minAngle) / this.delta + this.minAngle;
    return (deg - 90) * Math.PI / 180;
}

RoundGauge.prototype.polarX = function(r, value) {
    return this.cx + Math.cos(this.angle(value)) * r;
}

RoundGauge.prototype.polarY = function(r, value) {
    return this.cy + Math.sin(this.angle(value)) * r;
}

RoundGauge.prototype.drawFull = function(config) {
    var ctx = this.context;
    this.drawFrame(ctx);
    this.drawColors(ctx, config);
    this.drawSteps(ctx, config);
    this.drawPointer(config.min);
}

RoundGauge.prototype.drawFrame = function(ctx) {
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

RoundGauge.prototype.drawColors = function(ctx, config) {
    var r = this.cx - 10;
    ctx.lineWidth = 10;
    for (var i = 0; i < config.colors.length - 1; i += 2) {
        var start = config.colors[i];
        var color = config.colors[i + 1];
        var finish = config.colors[i + 2];
        ctx.beginPath();
        ctx.arc(this.cx, this.cy, r, this.angle(start), this.angle(finish));
        ctx.strokeStyle = color;
        ctx.stroke();
    }
}

RoundGauge.prototype.drawSteps = function(ctx, config) {
    ctx.strokeStyle = '#fff';
    ctx.fillStyle = '#777';
    ctx.lineWidth = 2;
    ctx.font = 'bold 10pt Sans Serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var r = this.cx - 10;
    for (var t = config.min + config.step; t < config.max - this.delta * 1e-7; t += config.step) {
        ctx.beginPath();
        ctx.moveTo(this.polarX(r - 4, t), this.polarY(r - 4, t));
        ctx.lineTo(this.polarX(r + 4, t), this.polarY(r + 4, t));
        ctx.stroke();
    }
    r = this.radiusLabel;
    for (var t = config.min; t <= config.max + this.delta * 1e-7; t += config.step) {
        ctx.fillText(t + '', this.polarX(r, t), this.polarY(r, t));
    }
}

RoundGauge.prototype.drawPointer = function(value) {
    var ctx = this.context;
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, this.radiusPointer, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(this.cx, this.cy);
    ctx.lineTo(this.polarX(this.radiusPointer, value), this.polarY(this.radiusPointer, value));
    ctx.strokeStyle = '#777';
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, Math.round(this.radiusPointer * 0.1), 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = '#777';
    ctx.fill();
    ctx.font = 'bold 14pt Sans Serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var x = this.cx;
    var y = this.h - 15;
    ctx.fillStyle = '#fff';
    var measure = ctx.measureText(this.prevValue + '');
    ctx.fillRect(x - measure.width / 2 - 1, y - 20 / 2 - 1, measure.width + 2, 20 + 2);
    this.prevValue = value;
    ctx.fillStyle = '#777';
    ctx.fillText(value + '', x, y);
}

