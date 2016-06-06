function BarGauge(parent, config, trainz) {
    this.trainz = trainz;
    this.setup(parent, config);
    self = this;
    parent.on('gauge:update', function(elem, value) {
        self.updateValue(elem.target, value);
    });
}

BarGauge.prototype.setup = function(parent, config) {
    this.w = parent.css('width');
    this.h = parent.css('height');
    if (typeof(config.bColor) != 'undefined') {
        parent.css('background', config.bColor);
    }
    parent.css('line-height', this.h)
        .css('text-align', 'left')
        .css('vertical-align', 'middle');
    this.gauge = $('<span class="bar-gauge"/>').css('position', 'relative').css('display', 'inline-block')
        .css('float', 'left')
        .css('height', this.h).css('width', '0px')
        .appendTo(parent);
    this.text = $('<span/>').css('position', 'relative').css('display', 'inline-block')
        .css('width', this.w).css('margin-left', '3px')
        .text(trainz.localize(config.text))
        .appendTo(this.gauge);
    this.value = $('<span class="bar-value"/>').css('position', 'relative').css('display', 'inline-block')
        .css('font-weight', 'bold').css('font-style', 'italic')
        .css('float', 'right').css('margin-right', '6px')
        .text('')
        .appendTo(this.text);
    var self = this;
}

BarGauge.prototype.updateValue = function(parent, value) {
    parent = $(parent);
    parent.find('.bar-gauge').css('width', Math.round(parent.width() * value[0]) + 'px')
        .css('background', value[2]);
    parent.find('.bar-value').text(value[1]);
}

