var express = require('express');
var http = require('http');
var app = express();

app.get('/', function(req, res){
    res.send('test param: ' + req.query.id);
});

app.listen(process.env.PORT || 8000);

console.log("Server running at http://localhost:8000/");
