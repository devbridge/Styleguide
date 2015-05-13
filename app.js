var express = require('express');
var request = require('request');
var http = require('http');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var jf = require('jsonfile');
var routes = require('./routes');
var cheerio = require('cheerio');
var port = process.env.PORT || 8080;
var users = require('./routes/user');

var app = express();
var fs = require('fs');

var walkPath = './snippets';
var snippets = [];
var snippetsJson;
var fileJson = './snippets.json';

var replacementPatternStart = '// @import (.*?) //';
var replacementPatternEnd = '// @endimport //';
var pattern = new RegExp('(' + replacementPatternStart.replace('/', '\/') + ')(\n|\r|.)*?(' + replacementPatternEnd.replace('/', '\/') + ')', 'gi');

/**
* Handle multiple requests at once
* @param urls [array]
* @param callback [function]
* @requires request module for node ( https://github.com/mikeal/request )
*/

var __request = function (urls, callback) {

    'use strict';

    var results = {}, t = urls.length, c = 0,
        handler = function (error, response, body) {

            var url = response.request.uri.href;

            results[url] = { error: error, response: response, body: body };

            if (++c === urls.length) { callback(results); }

        };

    while (t--) { request(urls[t], handler); }
};

var snippetsViewForm = function () {
    return JSON.parse(snippetsJson);
}

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

app.get('/scrape', function (req, res) {
    var urls = ['http://localhost:8080/snippets/snippet1.html', 'http://localhost:8080/snippets/snippet2.html'];

    __request(urls, function(responses) {
        var filteredHTml = [];
        var url, response;
        for (url in responses) {
            // reference to the response object
            response = responses[url];

            // find errors
            if (response.error) {
                console.log("Error", url, response.error);
                return;
            }

            // render body
            if (response.body) {
                console.log("Render", url, response.body);
                var filters;
                var htmlBody = response.body;
                console.log('-/-/-/-/-/-/-/-/-/-');
                filters = htmlBody.match("<!-- snippet:start [\\d\\D]*?<!-- snippet:end -->", "gi");
                filteredHTml.push(filters);
            }
        }
        var a = {
            snippets: filteredHTml
        };
        res.json(a);

        // json write fs
        jf.writeFile(fileJson, snippetsJson, function (err) {
            console.log(err);
            snippetsJson = JSON.stringify(a);
            snippetsViewForm();
        });
        /*if (!error) {
            var filteredHTml = html;
            console.log(filteredHTml);
            var a = {
                snippet: html
            };
            res.json(a);

            // json write fs
            jf.writeFile(fileJson, snippetsJson, function (err) {
                console.log(err);
                snippetsJson = JSON.stringify(a);
                snippetsViewForm();
            });
        } else {
            console.log(error);
        }*/
    });
});

app.get('/snippets/*', function (req, res) {
    console.log(req);
    res.sendfile(__dirname + req.path);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(app.router);

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
