var express = require('express');
var http = require('http');
var app = express();

app.get('/', function(req, res){
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.end("Hello World from express\n");
});

app.listen(8000);

console.log("Server running at http://localhost:8000/");
