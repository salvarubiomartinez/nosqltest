var http = require("http");
var url = require('url');
var request = require("request");
var MongoClient = require('mongodb').MongoClient;
var mongoUrl = "mongodb://localhost:27017/";
MongoClient.connect(mongoUrl, function (err, db) {
    var server = http.createServer((req, res) => {
        var urlString = req.url || "NO URL";
        var parsedUrl = url.parse(urlString, true);
        var path = parsedUrl.pathname || "NO PATH";
        var trimmedPath = path.replace(/^\/+|\/+$/g, "");
        var method = (req.method || "NO METHOD").toUpperCase();
        var parameters = parsedUrl.query;
        var headers = req.headers;

        if (err) throw err;
        var dbo = db.db("local");
        //console.log(parameters);
        var query = { Id: Number(parameters.id) };
        dbo.collection("Quotes").findOne(query, function (err, item) {
            if (err) throw err;
            // console.log(items);
            console.log(`path: ${trimmedPath}, method: ${method}, parameters:`, parameters, `headers:`, headers);
            res.setHeader("Content-Type", "application/json");
            if (item) {
                var productsIds = item.QuoteLines.map(ql => ql.ProductId);
                //console.log(productsIds);
                var prodQuery = {
                    Id: {
                        $in: productsIds
                    }
                };
                //     prodQuery["Id"] = { $in: productsIds }
                dbo.collection("Product").find(prodQuery).toArray(function (err, products) {
                    //console.log(products)
                    item.QuoteLines.map(ql => Object.assign(ql, {
                        Product: products.find(prod => prod.Id === ql.ProductId)
                    }));
                    var rulesIds = item.QuoteRules.map(qr => qr.RuleId);
                    dbo.collection("Rule").find({ Id: { $in: rulesIds } }).toArray(function (err, rules) {
                        item.QuoteRules.map(qr => Object.assign(qr, {
                            Rule: rules.find(rule => rule.Id === qr.RuleId)
                        }));

                        res.write(JSON.stringify(item));
                        res.end();
                        //    db.close();
                    });
                });
            } else {
                res.write(JSON.stringify("nothing"));
                res.end();
                //          db.close();
            }
        });
    });
    server.listen(3000, () => console.log("Server started on port 3000"))
});

