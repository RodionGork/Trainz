function Trainz() {
}

Trainz.prototype.load = function(fileName) {
    var res = $.ajax(fileName, {
        async: false,
        dataType: 'json'
    });
    
    this.process(JSON.parse(res.responseText));
}

Trainz.prototype.process = function(data) {
    $('body').css('background', data.background);
    $('#header').text(data.title);
    var container = $('#container');
    $('<img/>').attr('src', data.topImage).appendTo(container);
}
