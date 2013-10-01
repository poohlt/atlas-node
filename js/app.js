(function() {
  var app, async, express, http, services, utils;

  express = require('express');

  http = require('http');

  async = require('async');

  utils = require("./utils");

  app = express();

  services = ['panoramio', 'wikipedia', 'instagram'];

  app.get("/", function(req, res) {
    var APIquery, coord, lat, lng, radius;
    if ((req.query.lat != null) && (req.query.lng != null) && req.query.radius) {
      lat = parseFloat(req.query.lat);
      lng = parseFloat(req.query.lng);
      radius = parseFloat(req.query.radius);
      coord = utils.radiusToBounds(lat, lng, radius);
      APIquery = utils.createQuery(coord);
      return async.map(services, APIquery, function(err, result) {
        var flattened, responseObj;
        flattened = [].concat.apply([], result);
        console.log(flattened);
        console.log("" + flattened.length + " entries returned");
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
