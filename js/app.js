(function() {
  var app, express, http, radiusToBounds;

  express = require("express");

  http = require("http");

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
    var lat, lng, radius, result;
    if ((req.query.lat != null) && (req.query.lng != null) && req.query.radius) {
      lat = parseFloat(req.query.lat);
      lng = parseFloat(req.query.lng);
      radius = parseFloat(req.query.radius);
      result = radiusToBounds(lat, lng, radius);
      return res.send("lat_min:" + result.lat_min + "; lng_max:" + result.lng_max);
    }
  });

  app.listen(process.env.PORT || 8000);

  console.log("Server running at http://localhost:8000/");

}).call(this);
