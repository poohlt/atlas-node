# Node.js sever of @tlas server.
express = require("express")
http = require("http")
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
    res.send "test param: " + req.query.id

app.listen process.env.PORT or 8000
console.log "Server running at http://localhost:8000/"
