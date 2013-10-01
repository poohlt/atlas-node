(function() {
  var app, async, createQuery, express, http, request, services, utils;

  express = require('express');

  http = require('http');

  async = require('async');

  utils = require("./utils");

  request = require('request');

  app = express();

  services = ['panoramio', 'wikipedia', 'instagram'];

  createQuery = function(coord) {
    return function(service, callback) {
      var queryStr;
      queryStr = utils.buildQuery(service, coord);
      console.log(queryStr);
      return request(queryStr, function(err, queryRes, body) {
        var parsedResult, result;
        if (!err && queryRes.statusCode === 200) {
          result = JSON.parse(body);
          parsedResult = utils.parseResponse(service, result);
          console.log(parsedResult);
          return callback(null, parsedResult);
        }
      });
    };
  };

  app.get("/", function(req, res) {
    var APIquery, coord, lat, lng, radius;
    if ((req.query.lat != null) && (req.query.lng != null) && req.query.radius) {
      lat = parseFloat(req.query.lat);
      lng = parseFloat(req.query.lng);
      radius = parseFloat(req.query.radius);
      coord = utils.radiusToBounds(lat, lng, radius);
      APIquery = createQuery(coord);
      return async.map(services, APIquery, function(err, result) {
        var flattened, responseObj;
        flattened = [].concat.apply([], result);
        console.log(flattened);
        console.log(flattened.length);
        responseObj = {
          photos: flattened
        };
        return res.send(responseObj);
      });
    }
  });

  app.listen(process.env.PORT || 8000);

  console.log("Server running at http://localhost:8000/");

}).call(this);
