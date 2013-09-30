# Node.js sever of @tlas server.
express = require('express')
http = require('http')
async = require('async')
request = require('request')
queryString = require('querystring')

app = express()

services = ['panoramio','instagram', 'wikipedia', 'youtube']

radiusToBounds = (lat, lng, radius) ->
    angle = radius / 6371000
    angle *= 57.2958
    lng_delta = Math.asin(Math.sin(angle / 57.2958) / Math.cos(lat / 57.2958)) * 57.2958
    result =
        radius: radius
        lat_orig: lat
        lng_orig: lng
        lat_min: lat - angle
        lat_max: lat + angle
        lng_min: lng - lng_delta
        lng_max: lng + lng_delta

buildQuery = (service, coord) ->
    switch service
        when 'wikipedia'
            queryObj =
                limit: 20
                lat: coord.lat_orig
                lng: coord.lng_orig
                radius: coord.radius
            root = "http://api.wikilocation.org/articles"
        when 'instagram'
            queryObj =
                lat: coord.lat_orig
                lng: coord.lng_orig
                distance: coord.radius
                access_token: "289166499.b87dcae.e7b77bc866f14d7084fb3018e16b38a3"
            root = "https://api.instagram.com/v1/media/search"
        when 'panoramio'
            queryObj =
                minx: coord.lng_min
                miny: coord.lat_min
                maxx: coord.lng_max
                maxy: coord.lat_max
                set: 'public'
                from: 0
                to: 20
                size: 'small'
                mapfilter: 'true'
            root = "http://www.panoramio.com/map/get_panoramas.php"
        when 'youtube'
            queryObj =
                v: 2
                alt: 'json'
                location: coord.lat_orig + ',' + coord.lng_orig
            queryObj['max-results'] = 25
            queryObj['location-radius'] = coord.radius + 'm'
            root = "https://gdata.youtube.com/feeds/api/videos"
        when 'twitter'
            queryObj =
                page: 1
                rpp: 100
                geocode: coord.lat_orig + "," + coord.lng_orig + "," + (coord.radius/1000) + 'km'
            root = "http://search.twitter.com/search.json"

    queryParam = queryString.stringify(queryObj)
    return root + '?' + queryParam

createQuery = (coord) ->
    return (service, callback)->
        queryStr = buildQuery service, coord
        console.log queryStr

        request queryStr, (err, queryRes, body) ->
            if (!err && queryRes.statusCode is 200)
                results = JSON.parse body
                console.log results
                callback null, results

app.get "/", (req, res) ->
    if req.query.lat? and req.query.lng? and req.query.radius
        lat = parseFloat req.query.lat
        lng = parseFloat req.query.lng
        radius = parseFloat req.query.radius
        coord = radiusToBounds lat, lng, radius

        APIquery = createQuery coord

        async.map services, APIquery, (err, results)->
            console.log results.length

app.listen process.env.PORT or 8000
console.log "Server running at http://localhost:8000/"
