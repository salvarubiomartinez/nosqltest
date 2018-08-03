var http = require("http");
var url = require('url');
var request = require("request");
var MongoClient = require('mongodb').MongoClient;
var redis = require('redis');
var client = redis.createClient();

client.on('connect', function() {
    console.log('Redis client connected');
});

client.on('error', function (err) {
    console.log('Something went wrong ' + err);
});


var mongoUrl = "mongodb://localhost:27017/";
MongoClient.connect(mongoUrl, function (err, db) {
//    var server = http.createServer((req, res) => {
//        var urlString = req.url || "NO URL";
//        var parsedUrl = url.parse(urlString, true);
//        var path = parsedUrl.pathname || "NO PATH";
//        var trimmedPath = path.replace(/^\/+|\/+$/g, "");
//        var method = (req.method || "NO METHOD").toUpperCase();
//        var parameters = parsedUrl.query;
//        var headers = req.headers;

        if (err) throw err;
        var dbo = db.db("local");
        //console.log(parameters);
        var query = { };
        dbo.collection("Quotes").find(query).toArray(function (err, items) {
            if (err) throw err;
            console.log("response");            
            console.log(items.length);                
            items.forEach(item => {
                client.set(item.Id, JSON.stringify(item), redis.print);
                console.log(item.Id)
            });        
        });
//    });

 //   server.listen(3000, () => console.log("Server started on port 3000"))
});

