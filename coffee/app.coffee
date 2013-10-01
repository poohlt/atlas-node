# Node.js sever of @tlas server.
express = require('express')
http = require('http')
async = require('async')
utils = require("./utils")
request = require('request')

# Define the app
app = express()

# Global service array. Keep record of all supported service.
services = ['panoramio', 'wikipedia', 'instagram']

# Higher order function that return a function for mapping. The returned function calles and API and handles the response data.
createQuery = (coord) ->
  return (service, callback)->
    queryStr = utils.buildQuery service, coord
    console.log queryStr

    request queryStr, (err, queryRes, body) ->
      if (!err && queryRes.statusCode is 200)
        result = JSON.parse body
        parsedResult = utils.parseResponse service, result
        console.log parsedResult
        callback null, parsedResult

# Handle get requests.
app.get "/", (req, res) ->
  # Only proceed with valid params.
  if req.query.lat? and req.query.lng? and req.query.radius
    lat = parseFloat req.query.lat
    lng = parseFloat req.query.lng
    radius = parseFloat req.query.radius
    coord = utils.radiusToBounds lat, lng, radius

    # Build the API function used for mapping.
    APIquery = createQuery coord

    # Async mapping. Query all services asyncly.
    async.map services, APIquery, (err, result)->
      flattened = [].concat.apply([], result)
      console.log flattened
      console.log flattened.length
      responseObj =
        photos: flattened
      res.send responseObj

app.listen process.env.PORT or 8000
console.log "Server running at http://localhost:8000/"
