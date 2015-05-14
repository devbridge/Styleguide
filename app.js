var express = require('express');
var request = require('request');
var http = require('http');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var jf = require('jsonfile');
var cheerio = require('cheerio');

var routes = require('./routes');
var scrape = require('./routes/scrape');
var users = require('./routes/user');
var snippets = require('./routes/snippets');

var port = process.env.PORT || 8080;

var app = express();
var fs = require('fs');


var replacementPatternStart = '// @import (.*?) //';
var replacementPatternEnd = '// @endimport //';
var pattern = new RegExp('(' + replacementPatternStart.replace('/', '\/') + ')(\n|\r|.)*?(' + replacementPatternEnd.replace('/', '\/') + ')', 'gi');



var extract = function (node, needle) {
    var children = node.childNodes,
        record = false,
        container = document.createDocumentFragment();

    for (var i = 0, l = children.length; i < l; i++) {
        console.log(children[i]);
        var child = children[i];

        if (record) {
            container.appendChild(child.cloneNode(true));
        }
        if (child.nodeType === 8 && child.nodeValue === needle) {
            record = !record;
        }
    }
    return container;
}


app.use('/scrape', scrape);
app.use('/users', users);
app.use('/snippets', snippets);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.get('/', routes.index);

/// catch 404 and forwarding to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;

// start the server
app.listen(port);
console.log('Magic happens on port ' + port);
