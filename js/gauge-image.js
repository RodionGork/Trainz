function ImageGauge(parent, config) {
    this.setup(parent);
    this.parseConfig(config);
    this.drawFull(config);
}

ImageGauge.prototype.setup = function(parent) {
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

ImageGauge.prototype.parseConfig = function(config) {
    this.images = [];
    if (typeof(config.image) == 'string') {
        this.images.push(this.loadImage(config.image));
    } else {
        for (var i in config.image) {
            this.images.push(this.loadImage(config.image[i]));
        }
    }
}

ImageGauge.prototype.loadImage = function(url) {
    var img = new Image();
    img.src = url;
    return img;
}

ImageGauge.prototype.drawFull = function(config) {
    var ctx = this.context;
    this.drawPointer(0);
}

ImageGauge.prototype.drawPointer = function(value) {
    var angle = value[0] * Math.PI / 180;
    var slide = value.length > 1 ? value[1] : 0;
    var image = this.images[slide];
    var ctx = this.context;
    ctx.clearRect(0, 0, this.w, this.h);
    var x = this.w / 2;
    var y = this.h / 2;
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.drawImage(image, -image.width / 2, -image.height / 2);
    ctx.rotate(-angle);
    ctx.translate(-x, -y);
}

