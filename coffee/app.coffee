# Node.js sever of @tlas server.
express = require("express")
http = require("http")
request = require('request')
queryString = require('querystring')
app = express()

radiusToBounds = (lat, lng, radius) ->
    angle = radius / 6371000
    angle *= 57.2958
    lng_delta = Math.asin(Math.sin(angle / 57.2958) / Math.cos(lat / 57.2958)) * 57.2958
    result =
        lat_min: lat - angle
        lat_max: lat + angle
        lng_min: lng - lng_delta
        lng_max: lng + lng_delta

app.get "/", (req, res) ->
    if req.query.lat? and req.query.lng? and req.query.radius
        lat = parseFloat req.query.lat
        lng = parseFloat req.query.lng
        radius = parseFloat req.query.radius

        result = radiusToBounds lat, lng, radius
        res.send "lat_ssmin:#{result.lat_min}; lng_max:#{result.lng_max}"

        queryObj =
            limit: 20
            lat: lat
            lng: lng
            radius: radius
        queryParam = queryString.stringify(queryObj)
        root = "http://api.wikilocation.org/articles"
        queryStr = root + '?' + queryParam

        console.log queryStr

        request queryStr, (err, res, body) ->
          if (!err && res.statusCode is 200)
            results = JSON.parse body
            console.log results

app.listen process.env.PORT or 8000
console.log "Server running at http://localhost:8000/"
