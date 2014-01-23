(function() {
  var queryString, request;

  queryString = require('querystring');

  request = require('request');

  exports.radiusToBounds = function(lat, lng, radius) {
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

  exports.buildQuery = function(service, coord) {
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

  exports.createQuery = function(coord) {
    return function(service, callback) {
      var queryStr;
      queryStr = exports.buildQuery(service, coord);
      console.log(queryStr);
      return request(queryStr, function(err, queryRes, body) {
        var parsedResult, result;
        if (!err && queryRes.statusCode === 200) {
          result = JSON.parse(body);
          parsedResult = exports.parseResponse(service, result);
          console.log(parsedResult);
          return callback(null, parsedResult);
        }
      });
    };
  };

  exports.parseResponse = function(service, response) {
    var geoArr, geoStr, item, obj, result, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3;
    result = [];
    switch (service) {
      case 'panoramio':
        _ref = response['photos'];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          obj = {
            service: "panoramio",
            lat: item["latitude"],
            lng: item["longitude"],
            time: item["upload_date"],
            title: item["photo_title"],
            img_url: item["photo_file_url"],
            orig_url: item["photo_url"]
          };
          result.push(obj);
        }
        break;
      case 'wikipedia':
        _ref1 = response['articles'];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          item = _ref1[_j];
          obj = {
            service: "wikipedia",
            lat: item["lat"],
            lng: item["lng"],
            title: item["title"],
            img_url: "http://upload.wikimedia.org/wikipedia/commons/6/63/Wikipedia-logo.png",
            orig_url: item["url"]
          };
          result.push(obj);
        }
        break;
      case 'instagram':
        _ref2 = response['data'];
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          item = _ref2[_k];
          if (item["caption"] && item["caption"]["text"]) {
            obj = {
              service: "instagram",
              lat: item["location"]["latitude"],
              lng: item["location"]["longitude"],
              time: item["created_time"],
              title: item["caption"]["text"],
              img_url: item["images"]["low_resolution"]["url"],
              orig_url: item['link']
            };
            result.push(obj);
          }
        }
        break;
      case 'youtube':
        _ref3 = response['feed']['entry'];
        for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
          item = _ref3[_l];
          if (item['georss$where']['gml$Point']['gml$pos']) {
            geoStr = item['georss$where']['gml$Point']['gml$pos']['$t'];
            geoArr = geoStr.split(' ');
            obj = {
              service: "youtube",
              lat: parseFloat(geoArr[0]),
              lng: parseFloat(geoArr[1]),
              time: item['published']['$t'],
              title: item['title']['$t'],
              img_url: item['media$group']['media$thumbnail'][0]['url'],
              orig_url: item['link'][0]['href']
            };
            result.push(obj);
          }
        }
    }
    return result;
  };

}).call(this);
