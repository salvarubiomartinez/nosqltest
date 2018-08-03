var MongoClient = require('mongodb').MongoClient;
var request = require("request");
//var api = localhost

var mongoUrl = "mongodb://localhost:27017/";
MongoClient.connect(mongoUrl, function (err, db) {
    if (err) throw err;
    var dbo = db.db("local");
    var query = {};
    dbo.collection("Quotes").find(query).toArray(function (err, items) {
        if (err) throw err;
        console.log(items.length);
        getProducts(items, 1)
    });
});

function getProducts(products, range) {
    products.slice(range, range + 1).forEach(product => {

        var options2 = {
            method: 'GET'
            , url: 'http://localhost:3000/?id=' + product.Id
            , headers: {               
                "Content-Type": "application/json"
            }
        };
        console.time(product.Id);
        request(options2, function (error, response, body) {
            if (error) {
                console.error(error);
                return;
            };
            try {
                var item = JSON.parse(body);
                console.log(item.Name);
                console.timeEnd(product.Id);
            } catch (ex) {
                console.error(ex)
            }
        });
    });

    if (range < 5401) {
        setTimeout(_ => getProducts(products, range + 1), 1);
    } else {

    }
}