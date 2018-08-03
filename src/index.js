var http = require("http");
var url = require('url');
var fs = require('fs');
var request = require("request");
var MongoClient = require('mongodb').MongoClient;
var mongoUrl = "mongodb://localhost:27017/";
var config = require("./config");
var api = config.api;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
// server
var server = http.createServer((req, res) => {
    var urlString = req.url || "NO URL";
    var parsedUrl = url.parse(urlString, true);
    var path = parsedUrl.pathname || "NO PATH";
    var trimmedPath = path.replace(/^\/+|\/+$/g, "");
    var method = (req.method || "NO METHOD").toUpperCase();
    var parameters = parsedUrl.query;
    var headers = req.headers;

    var options = {
        method: 'POST',
        url: api + '/oauth2/token',
        //    cert: fs.readFileSync('hp_itg.pem'),
        //    ca: [fs.readFileSync('hp1.pem'), fs.readFileSync('hp2.pem')],
        headers:
        {
            Authorization: 'Basic ' + config.passwordApi,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        form:
        {
            grant_type: 'password',
            username: config.username,
            password:config.userPasswd
        }
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);

        console.log(body);
        var token = JSON.parse(body).access_token; 
        var options1 = {
            method: 'GET'
            , url: api + '/api/v1/quotes/'
            , headers: {
                Authorization: 'Bearer ' + token
                , "Content-Type": "application/json"
            }
        }
        console.time("dbsave");
     //   request(options1, function (error, response, body) {
     //       if (error) throw new Error(error);
     //       var products = (JSON.parse(body).Data.$values);
     //       console.log('length ' + products.length);
     //       console.timeEnd("dbsave");
     //       getProducts1(products, 0, token);
     //   });
    });

    var options = {
        method: 'POST',
        url: api + '/oauth2/token',
        //    cert: fs.readFileSync('hp_itg.pem'),
        //    ca: [fs.readFileSync('hp1.pem'), fs.readFileSync('hp2.pem')],
        headers:
        {
            Authorization: 'Basic ' + config.passwordApi,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        form:
        {
            grant_type: 'password',
            username:config.otherUserName,
            password: '***'
        }
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);

        console.log(body);
        var token = JSON.parse(body).access_token; 
        var options1 = {
            method: 'GET'
            , url: api + '/api/v1/quotes/'
            , headers: {
                Authorization: 'Bearer ' + token
                , "Content-Type": "application/json"
            }
        }
        console.time("dbsave");
     //   request(options1, function (error, response, body) {
     //       if (error) throw new Error(error);
     //       var products = (JSON.parse(body).Data.$values);
     //       console.log('length ' + products.length);
     //       console.timeEnd("dbsave");
     //       getProducts1(products, 0, token);
     //   });
    });

    res.write("Hello World!\n");
    res.end();

    console.log(`path: ${trimmedPath}, method: ${method}, parameters: ${JSON.stringify(parameters)}, headers:`, headers);
});

function getProducts(products, range, token) {
    MongoClient.connect(mongoUrl, function (err, db) {
        var dbo = db.db("local");
        products.slice(range, range + 100).forEach(product => {
            var options2 = {
                method: 'GET'
                , url: api + '/api/v1/quotes/' + product.Id
                , headers: {
                    Authorization: 'Bearer ' + token
                    , "Content-Type": "application/json"
                }
            };
            request(options2, function (error, response, body) {
                if (error) {
                    console.error(error);
                    return;
                };
                try {
                    var item = JSON.parse(body).Data;
                    delete item.$id;
                    item.QuoteApprovals = item.QuoteApprovals.$values.map(did);
                    item.QuoteBrokenRules = item.QuoteBrokenRules.$values.map(did);
                    item.QuoteLines = item.QuoteLines.$values.map(did);;
                    item.QuotePromotions = item.QuotePromotions.$values.map(did);;
                    item.QuoteRules = item.QuoteRules.$values.map(did);;
                    item.QuoteTradeInLines = item.QuoteTradeInLines.$values.map(did);;
                    item.RampUpTierTypes = item.RampUpTierTypes.$values.map(did);;
                    item.SummaryLines = item.SummaryLines.$values.map(did);;
                    item.Tiers = item.Tiers.$values.map(did);;
                    item.UserSurveys = item.UserSurveys.$values.map(did);;
                    item.WarningMessages = item.WarningMessages.$values.map(did);;
                    item.PwpMSCPressDates = item.PwpMSCPressDates.$values.map(did);;
                    item.QuoteStatusHistory = item.QuoteStatusHistory.$values.map(did);;
                    console.log(item.Id);
                    if (err) throw err;
                    dbo.collection("Quotes").insert(item, function (err, res) {
                        if (err) throw err;
                        console.log("1 document inserted");
                    });
                } catch (ex) {
                    console.error(ex)
                }
            });
        });
        //    db.close();
    });
    if (range < 5401) {
        setTimeout(_ => getProducts(products, range + 100, token), 300000);
    } else {
        //    db.close();
    }
}
function did(item) {
    delete item.$id;
    return item;
}
server.listen(3000, () => console.log("Server started on port 3000"))
function getProducts1(products, range, token) {
    products.slice(range, range + 1).forEach(product => {
        var options2 = {
            method: 'GET'
            , url: api + '/api/v1/quotes/?Id=' + product.Id + '&ForEdit=False'
            , headers: {
                Authorization: 'Bearer ' + token
                , "Content-Type": "application/json"
            }
        };
        console.time(product.Id);
        request(options2, function (error, response, body) {
            if (error) {
                console.error(error);
                return;
            };
            try {
                console.timeEnd(product.Id);
                var item = JSON.parse(body);
                //   console.log(item.Name);

            } catch (ex) {
                console.error(ex)
            }
        });
    });

    if (range < 5401) {
        setTimeout(_ => getProducts1(products, range + 1, token), 100);
    } else {

    }
}
