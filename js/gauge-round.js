function RoundGauge(parent, config) {
    this.setup(parent);
    this.parseConfig(config);
    this.drawFull(config);
}

RoundGauge.prototype.setup = function(parent) {
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

RoundGauge.prototype.parseConfig = function(config) {
    config.min = config.colors[0];
    config.max = config.colors[config.colors.length - 1];
    this.max = config.max;
    this.delta = config.max - config.min;
}

RoundGauge.prototype.drawFull = function(config) {
    var ctx = this.context;
    this.drawFrame(ctx);
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

RoundGauge.prototype.drawPointer = function(value) {
}

