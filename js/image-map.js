function ImageMap(trainz, descriptor) {
    this.trainz = trainz;
    this.topImageBlock = $("#top-image-block");
    this.topImageBlock.css('position', 'relative').empty();
    
    if (this.isImageUrl(descriptor)) {
        this.plainImage(descriptor);
        this.data = null;
    } else {
        this.data = trainz.loadJson(descriptor);
        this.plainImage(this.data.image);
        this.loadMap(this.data);
    }
}

ImageMap.prototype.isImageUrl = function(url) {
    return /\.(png|jpg|jpeg|gif)$/.test(url);
}

ImageMap.prototype.plainImage = function(url) {
    $('<img/>').attr('src', url).appendTo(this.topImageBlock);
}

ImageMap.prototype.loadMap = function(data) {
    for (var i in data.zones) {
        this.loadZone(data.zones[i]);
    }
    var self = this;
    this.topImageBlock.find("img").click(function() {
        self.trainz.load(data.main.config, data.main.dataSource, data.main.locale);
    });
}

ImageMap.prototype.loadZone = function(zone) {
    var area = $('<div class="zone">&nbsp;</div>');
    area.width(zone.width).height(zone.height);
    area.css('top', zone.top).css('left', zone.left);
    if (typeof(zone.hint) != 'undefined') {
        area.attr('title', this.trainz.localize(zone.hint));
    }
    var self = this;
    area.click(function() {
        self.trainz.load(zone.config, zone.dataSource, zone.locale);
    });
    this.topImageBlock.append(area);
}

