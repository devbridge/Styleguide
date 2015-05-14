var express = require('express');
var router = express.Router();
var request = require('request');
var jf = require('jsonfile');
var walkPath = './snippets';
var snippets = [];
var snippetsJson;
var fileJson = './snippets.json';

router.get('/', function (req, res) {
    var urls = ['http://localhost:8080/snippets/snippet1.html', 'http://localhost:8080/snippets/snippet2.html'];

    var snippetsViewForm = function() {
        return JSON.parse(snippetsJson);
    };

    var __request = function(urls, callback) {

        'use strict';

        var results = {},
            t = urls.length,
            c = 0,
            handler = function(error, response, body) {

                var url = response.request.uri.href;

                results[url] = {
                    error: error,
                    response: response,
                    body: body
                };

                if (++c === urls.length) {
                    callback(results);
                }

            };

        while (t--) {
            request(urls[t], handler);
        }
    };

/**
* Handle multiple requests at once
* @param urls [array]
* @param callback [function]
* @requires request module for node ( https://github.com/mikeal/request )
*/
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
})

module.exports = router;