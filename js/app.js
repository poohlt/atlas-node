(function() {
  var app, async, buildQuery, createQuery, express, http, queryString, radiusToBounds, request, services;

  express = require('express');

  http = require('http');

  async = require('async');

  request = require('request');

  queryString = require('querystring');

  app = express();

  services = ['panoramio', 'instagram', 'wikipedia', 'youtube'];

  radiusToBounds = function(lat, lng, radius) {
    var angle, lng_delta, result;
    angle = radius / 6371000;
    angle *= 57.2958;
    lng_delta = Math.asin(Math.sin(angle / 57.2958) / Math.cos(lat / 57.2958)) * 57.2958;
    return result = {
      radius: radius,
      lat_orig: lat,
      lng_orig: lng,
      lat_min: lat - angle,
      lat_max: lat + angle,
      lng_min: lng - lng_delta,
      lng_max: lng + lng_delta
    };
  };

  buildQuery = function(service, coord) {
    var queryObj, queryParam, root;
    switch (service) {
      case 'wikipedia':
        queryObj = {
          limit: 20,
          lat: coord.lat_orig,
          lng: coord.lng_orig,
          radius: coord.radius
        };
        root = "http://api.wikilocation.org/articles";
        break;
      case 'instagram':
        queryObj = {
          lat: coord.lat_orig,
          lng: coord.lng_orig,
          distance: coord.radius,
          access_token: "289166499.b87dcae.e7b77bc866f14d7084fb3018e16b38a3"
        };
        root = "https://api.instagram.com/v1/media/search";
        break;
      case 'panoramio':
        queryObj = {
          minx: coord.lng_min,
          miny: coord.lat_min,
          maxx: coord.lng_max,
          maxy: coord.lat_max,
          set: 'public',
          from: 0,
          to: 20,
          size: 'small',
          mapfilter: 'true'
        };
        root = "http://www.panoramio.com/map/get_panoramas.php";
        break;
      case 'youtube':
        queryObj = {
          v: 2,
          alt: 'json',
          location: coord.lat_orig + ',' + coord.lng_orig
        };
        queryObj['max-results'] = 25;
        queryObj['location-radius'] = coord.radius + 'm';
        root = "https://gdata.youtube.com/feeds/api/videos";
        break;
      case 'twitter':
        queryObj = {
          page: 1,
          rpp: 100,
          geocode: coord.lat_orig + "," + coord.lng_orig + "," + (coord.radius / 1000) + 'km'
        };
        root = "http://search.twitter.com/search.json";
    }
    queryParam = queryString.stringify(queryObj);
    return root + '?' + queryParam;
  };

  createQuery = function(coord) {
    return function(service, callback) {
      var queryStr;
      queryStr = buildQuery(service, coord);
      console.log(queryStr);
      return request(queryStr, function(err, queryRes, body) {
        var results;
        if (!err && queryRes.statusCode === 200) {
          results = JSON.parse(body);
          console.log(results);
          return callback(null, results);
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
      coord = radiusToBounds(lat, lng, radius);
      APIquery = createQuery(coord);
      return async.map(services, APIquery, function(err, results) {
        return console.log(results.length);
      });
    }
  });

  app.listen(process.env.PORT || 8000);

  console.log("Server running at http://localhost:8000/");

}).call(this);
