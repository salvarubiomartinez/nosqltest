var http = require("http");
var url = require('url');
var sql = require('mssql');
var config = require('./config');

const connectionString = config.connectionString;
const config = config.sqlConfig;

const sqlserver = sql.connect(connectionString);
const query = "SELECT * FROM [Quotes] WHERE Id = @quoteId; " +
                    " SELECT ql.*, ProductLineId, p.Name as ProductName, p.PartNumber as ProductPartNumber, p.ProductTypeId, pt.Name as ProductTypeName, p.ProductLineId, pl.Name as ProductLineName FROM QuoteLines ql " +
                    " INNER JOIN Products p " +
                    " on p.Id = ql.ProductId " +
                    " INNER JOIN ProductTypes pt " +
                    " on p.ProductTypeId = pt.Id " +
                    " INNER JOIN ProductLines pl " +
                    " on p.ProductLineId = pl.Id " +
                    " WHERE QuoteId = @quoteId AND ql.IsDeleted = 0; " +
                    "SELECT * FROM QuoteRules WHERE QuoteId = @quoteId AND IsDeleted = 0; " +
                    "SELECT* FROM QuotePromotions WHERE QuoteId = @quoteId AND IsDeleted = 0; " +
                    "SELECT * FROM SummaryLines WHERE QuoteId = @quoteId AND IsDeleted = 0;" +
                    "SELECT * FROM Tiers WHERE QuoteId = @quoteId AND IsDeleted = 0;" +
                    "SELECT * FROM WarningMessages WHERE QuoteId = @quoteId AND IsDeleted = 0;" +
                    "SELECT * FROM Prices p " +
                    "INNER JOIN Products pr " +
                    "on p.ProductId = pr.Id " +
                    "INNER JOIN QuoteLines ql " +
                    "on pr.Id = ql.ProductId " +
                    "WHERE QuoteId = @quoteId AND ql.IsDeleted = 0 AND p.ToUtc is null; " +
                    "SELECT * FROM Prices p " +
                    "INNER JOIN Tiers t " +
                    "on p.TierId = t.Id " +
                    "WHERE t.QuoteId = @quoteId AND t.IsDeleted = 0 AND p.ToUtc is null; ";


var server = http.createServer((req, res) => {
    var urlString = req.url || "NO URL";
    var parsedUrl = url.parse(urlString, true);
    var path = parsedUrl.pathname || "NO PATH";
    var trimmedPath = path.replace(/^\/+|\/+$/g, "");
    var method = (req.method || "NO METHOD").toUpperCase();
    var parameters = parsedUrl.query;
    var headers = req.headers;
    res.setHeader("Content-Type", "application/json");

    console.log(`path: ${trimmedPath}, method: ${method}, parameters:`, parameters, `headers:`, headers);

    sqlserver
        .then(pool => {
            return pool.request()
                .input('quoteId', sql.Int, parameters.id)
                .query(query)
        }).then(result => {
            res.write(JSON.stringify(result.recordsets));
            res.end();
        }).catch(err => {
            console.error(err);
            res.write(JSON.stringify(err));
            res.end()
        });

    sql.on('error', err => {
        console.error(err);
        res.write(JSON.stringify(err));
        res.end()
    })

});

server.listen(3000, () => console.log("Server started on port 3000"))


