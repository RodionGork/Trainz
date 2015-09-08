function Trainz() {
}

Trainz.prototype.load = function(fileName, dataFeed, locale) {
    this.dataFeed = dataFeed;
    
    var res = $.ajax(fileName, {
        async: false,
        dataType: 'json'
    });
    var data = JSON.parse(res.responseText);

    res = $.ajax('data/msgs-' + locale + '.json', {
        async: false,
        dataType: 'json'
    });
    this.messages = JSON.parse(res.responseText);
    
    this.process(data);
}

Trainz.prototype.process = function(data) {
    $('body').css('background', data.background);
    $('#header').text(data.title);
    $('<img/>').attr('src', data.topImage).appendTo($("#top-image-block"));
    var controls = $("#controls");
    this.addImages(controls, data.images);
    this.addLabels(controls, data.labels);
    var updater = this;
    setInterval(function() {updater.update()}, 500);
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
        var dx = 0;
        if (typeof(label.width) != 'undefined') {
            dx = -label.width / 2;
            elem.css('text-align', 'center').css('width', label.width + 'px');
        }
        elem.css('position', 'absolute').appendTo(block);
        elem.css('left', (label.x + dx) + 'px').css('top', label.y + 'px');
        if (typeof(label.size) != 'undefined') {
            elem.css('font-size', label.size);
        }
        if (typeof(label.mark) != 'undefined') {
            elem.addClass('mark-' + label.mark);
        }
    }
}

Trainz.prototype.update = function() {
    var res = $.ajax(this.dataFeed, {cache: false, success: function(data) {
        try {
            data = JSON.parse(data);
        } catch (e) {
            alert("DataSource returned:\n" + data);
            return;
        }
        for (var key in data) {
            $('.mark-' + key).text(data[key]);
        }
    },
    error: function(xhr) {alert('Error: ' + xhr.status)}});
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