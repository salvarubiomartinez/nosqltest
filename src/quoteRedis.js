var http = require("http");
var url = require('url');
var redis = require('redis');
var client = redis.createClient();
var http = require("http");
var url = require('url');

client.on('connect', function () {
    console.log('Redis client connected');
});

client.on('error', function (err) {
    console.log('Something went wrong ' + err);
});

var server = http.createServer((req, res) => {
    var urlString = req.url || "NO URL";
    var parsedUrl = url.parse(urlString, true);    
    var parameters = parsedUrl.query;    
    res.setHeader("Content-Type", "application/json");
    client.get(parameters.id, function (error, result) {
        if (error) {
            console.log(error);
            throw error;
        }       
        res.write(result);
        res.end();
    });
});

server.listen(3000, () => console.log("Server started on port 3000"));
