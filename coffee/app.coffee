# Node.js sever of @tlas server.
express = require('express')
http = require('http')
async = require('async')
utils = require("./utils")

# Define the app
app = express()

# Global service array. Keep record of all supported service.
services = ['youtube']

# Handle get requests.
app.get "/", (req, res) ->
  # Only proceed with valid params.
  if req.query.lat? and req.query.lng? and req.query.radius
    lat = parseFloat req.query.lat
    lng = parseFloat req.query.lng
    radius = parseFloat req.query.radius
    coord = utils.radiusToBounds lat, lng, radius

    # Build the API function used for mapping.
    APIquery = utils.createQuery coord

    console.log APIquery

    # Async mapping. Query all services asyncly.
    async.map services, APIquery, (err, result)->
      flattened = [].concat.apply([], result)
      console.log flattened
      console.log "#{flattened.length} entries returned"
      responseObj =
        photos: flattened
      res.send responseObj

app.listen process.env.PORT or 8000
console.log "Server running at http://localhost:8000/"
