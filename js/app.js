(function() {
  var app, express, http, queryString, radiusToBounds, request;

  express = require("express");

  http = require("http");

  request = require('request');

  queryString = require('querystring');

  app = express();

  radiusToBounds = function(lat, lng, radius) {
    var angle, lng_delta, result;
    angle = radius / 6371000;
    angle *= 57.2958;
    lng_delta = Math.asin(Math.sin(angle / 57.2958) / Math.cos(lat / 57.2958)) * 57.2958;
    return result = {
      lat_min: lat - angle,
      lat_max: lat + angle,
      lng_min: lng - lng_delta,
      lng_max: lng + lng_delta
    };
  };

  app.get("/", function(req, res) {
    var lat, lng, queryObj, queryParam, queryStr, radius, result, root;
    if ((req.query.lat != null) && (req.query.lng != null) && req.query.radius) {
      lat = parseFloat(req.query.lat);
      lng = parseFloat(req.query.lng);
      radius = parseFloat(req.query.radius);
      result = radiusToBounds(lat, lng, radius);
      res.send("lat_ssmin:" + result.lat_min + "; lng_max:" + result.lng_max);
      queryObj = {
        limit: 20,
        lat: lat,
        lng: lng,
        radius: radius
      };
      queryParam = queryString.stringify(queryObj);
      root = "http://api.wikilocation.org/articles";
      queryStr = root + '?' + queryParam;
      console.log(queryStr);
      return request(queryStr, function(err, res, body) {
        var results;
        if (!err && res.statusCode === 200) {
          results = JSON.parse(body);
          return console.log(results);
        }
      });
    }
  });

  app.listen(process.env.PORT || 8000);

  console.log("Server running at http://localhost:8000/");

}).call(this);
