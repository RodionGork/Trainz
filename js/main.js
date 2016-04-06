function Trainz() {
}

Trainz.prototype.load = function(fileName, dataFeed, locale) {
    this.dataFeed = dataFeed;
    
    this.config = this.loadJson('data/config.json');
    var data = this.loadJson(fileName);
    if (typeof(locale) == 'undefined') {
        locale = this.config.locale;
    }
    this.messages = this.loadJson('data/msgs-' + locale + '.json');
    
    this.process(data);
    
    this.setupReload(fileName, dataFeed, locale);
}

Trainz.prototype.reloadOrLoad = function(fileName, dataFeed, locale) {
    if (sessionStorage.getItem('reload')) {
        sessionStorage.removeItem('reload');
        fileName = sessionStorage.getItem('fileName');
        dataFeed = sessionStorage.getItem('dataFeed');
        locale = sessionStorage.getItem('locale');
    }
    this.load(fileName, dataFeed, locale);
}

Trainz.prototype.loadJson = function(fileName) {
    var res = $.ajax(fileName, {
        async: false,
        dataType: 'json'
    });
    return JSON.parse(res.responseText);
}

Trainz.prototype.process = function(data) {
    $('body').css('background', data.background);
    $('#header').text(this.localize(data.title));
    if (typeof(data.topImage) != 'undefined') {
        this.imageMap = new ImageMap(this, data.topImage);
        this.loadTopControls();
    }
    var controls = $("#controls");
    controls.empty();
    this.addImages(controls, data.images);
    this.addLabels(controls, data.labels);
    this.addGauges(controls, data.gauges);
    if (typeof(this.timer) == 'undefined') {
        var updater = this;
        this.timer = setInterval(function() {updater.update()}, this.config.interval);
    }
}

Trainz.prototype.loadTopControls = function() {
    var topImageBlock = this.imageMap.topImageBlock;
    var topImageData = this.imageMap.data;
    if (topImageData) {
        if (typeof(topImageData.images) == 'object') {
            this.addImages(topImageBlock, topImageData.images);
        }
        if (typeof(topImageData.labels) == 'object') {
            this.addLabels(topImageBlock, topImageData.labels);
        }
        if (typeof(topImageData.gauges) == 'object') {
            this.addGauges(topImageBlock, topImageData.gauges);
        }
    }
}

Trainz.prototype.addImages = function(block, images) {
    for (var i in images) {
        var image = images[i];
        var elem = $('<img/>').attr('src', image.image);
        elem.css('position', 'absolute').appendTo(block);
        elem.css('left', image.x + 'px').css('top', image.y + 'px');
    }
}

Trainz.prototype.addLabels = function(block, labels) {
    for (var i in labels) {
        var label = labels[i];
        var elem = $('<span/>').text(this.localize(label.text)).css('display', 'inline-block');
        elem.attr('data-type', 'label');
        elem.css('position', 'absolute').appendTo(block);
        this.applyLabelColors(elem, label.border, label.background, label.foreground);
        this.applyPosition(elem, label.x, label.y, label.width);
        this.applySize(elem, label.size);
        this.applyMark(elem, label.mark);
        this.applyAction(elem, label.url, label.confirmation);
    }
}

Trainz.prototype.applyLabelColors = function(elem, border, bgr, fgr) {
    if (typeof(border) == 'string') {
        elem.css('border', border);
    }
    if (typeof(bgr) == 'string') {
        elem.css('background-color', bgr);
    }
    if (typeof(fgr) == 'string') {
        elem.css('color', fgr);
    }
}

Trainz.prototype.addGauges = function(block, gauges) {
    for (var i in gauges) {
        var gauge = gauges[i];
        var elem = $('<span/>').text('').css('display', 'inline-block').css('text-align', 'center');
        elem.css('position', 'absolute').appendTo(block);
        this.applyMark(elem, gauge.mark);
        this.applyPosition(elem, gauge.x, gauge.y, gauge.width, gauge.height);
        switch (gauge.type) {
            case 'oval':
                elem.css('border-radius', '50%');
            case 'rect':
                if (typeof(gauge.height) != 'undefined') {
                    elem.css('line-height', gauge.height + 'px');
                }
                elem.attr('data-type', 'gauge-rect');
                if (typeof(gauge.colors) == 'object' && typeof(gauge.colors.join) == 'function') {
                    gauge.colors = gauge.colors.join(' ');
                }
                elem.attr('data-config', gauge.colors);
                this.applySize(elem, gauge.size);
                break;
            case 'vertical':
                elem.attr('data-type', 'gauge-vertical');
                new VertGauge(elem, gauge.config);
                break;
            case 'round':
                elem.attr('data-type', 'gauge-round');
                new RoundGauge(elem, gauge.config);
                break;
        }
    }
}

Trainz.prototype.applyPosition = function(elem, x, y, w, h) {
    var dx = 0;
    if (typeof(w) != 'undefined') {
        dx = -w / 2;
        elem.css('text-align', 'center').css('width', w + 'px');
    }
    if (typeof(h) != 'undefined') {
        elem.css('height', h + 'px');
    }
    elem.css('left', (x + dx) + 'px').css('top', y + 'px');
}

Trainz.prototype.applySize = function(elem, size) {
    if (typeof(size) != 'undefined') {
        elem.css('font-size', size);
    }
}

Trainz.prototype.applyMark = function(elem, mark) {
    if (typeof(mark) != 'undefined') {
        elem.addClass('mark-' + mark);
    }
}

Trainz.prototype.applyAction = function(elem, action, confirmation) {
    if (typeof(action) != 'string') {
        return;
    }
    var conf = typeof(confirmation) == 'string' ? this.localize(confirmation) : null;
    elem.css('cursor', 'pointer');
    elem.click(function() {
        if (conf && !confirm(conf)) {
            return false;
        }
        $.ajax(action, {"error": function(data) {
            alert("Error: " + data.status);
        }});
    });
}

Trainz.prototype.update = function() {
    var self = this;
    var res = $.ajax(this.dataFeed, {cache: false, success: function(data) {
        try {
            data = JSON.parse(data);
        } catch (e) {
            self.errorMessage("DataSource returned:\n" + data);
            return;
        }
        for (var key in data) {
            $('.mark-' + key).each(function(idx, elem) {
                self.updateElem($(elem), data[key]);
            });
        }
    },
    error: function(xhr) {self.errorMessage('Error: ' + xhr.status)}});
}

Trainz.prototype.updateElem = function(elem, value) {
    var type = elem.attr('data-type');
    switch (type) {
        case 'label':
            elem.text(value);
            break;
        case 'gauge-rect':
            this.updateGaugeRect(elem, value);
            break;
        case 'gauge-vertical':
        case 'gauge-round':
            elem.trigger('gauge:update', [value]);
            break;
    }
}

Trainz.prototype.updateGaugeRect = function(elem, value) {
    var color = null;
    if (typeof(value) == 'object') {
        color = value[1];
        value = value[0];
    }
    elem.text(value);
    if (color == null) {
        value *= 1;
        var config = elem.attr('data-config').split(' ');
        for (var i = 0; i < config.length; i += 2) {
            if (parseInt(config[i]) > value) {
                break;
            }
        }
        color = config[i - 1];
    }
    elem.css('background', color);
}

Trainz.prototype.setupReload = function(fileName, dataFeed, locale) {
    var self = this;
    if (typeof(this.config.reloadInterval) != 'number') {
        return;
    }
    sessionStorage.setItem('fileName', fileName);
    sessionStorage.setItem('dataFeed', dataFeed);
    sessionStorage.setItem('locale', locale);
    setTimeout(function() {
        sessionStorage.setItem('reload', true);
        location.reload(true);
    }, this.config.reloadInterval);
}

Trainz.prototype.localize = function(text) {
    var obj = this;
    return text.replace(/\#\{([^\}]+)\}/g, function(x, y) {
        if (typeof(obj.messages[y]) != 'undefined') {
            return obj.messages[y];
        } else {
            return '?' + y + '?';
        }
    });
}

Trainz.prototype.errorMessage = function(msg) {
    if (this.config.errorAlerts) {
        alert(msg);
    } else {
        console.log(msg);
    }
}

