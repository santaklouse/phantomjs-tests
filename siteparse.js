
var phantom = require('node-phantom');
var mysql = require('mysql');

var connection = mysql.createConnection({
    database : 'testdb',
    user     : 'root',
    password : '312m16'
});
connection.connect();

var startDate = new Date();
var elapsed;
var totalCount = 0;

console.log('Starting scrawling at: ' + startDate.toLocaleString());

var addDataToDb = function (data, callback) {

    if ( ! !!data.length) return;

    var query = "INSERT INTO example (site_id, name, created_at) VALUES ";
    var items = [];
    for(key in data)
    {
        for (i in data[key])
        {
            items.push(
                "(" + data[key][i].id + ", '" + data[key][i].name + "', '" + data[key][i].createdAt + "')"
            );
        }

    }
    query += items.join(', ') + ';';

    connection.query(query, function(err, rows, fields) {
        if (typeof callback == 'function') callback(err, rows, fields);
    });
}


var pageIndex = 0;
var url;
//console.log('start phantom.create');
phantom.create(function(err, ph) {

    var dataSet = [];

    scanPage(pageIndex);

    function scanPage(pageIndex, isFinish) {

        addDataToDb(dataSet, function(err, rows, fields){
            if ( ! err) {
                console.log('data inserted to DB successfully!!!');
                console.log('Count of inserted items: ' + rows.affectedRows);
                dataSet = [];
                totalCount += rows.affectedRows;
                return;
            }
            throw err;

        });

        // dispose of phantomjs if we're done
        if (typeof isFinish != 'undefined' && isFinish) {
            elapsed = Date.now().toString() - new Date().setTime(startDate.toString());
            console.log('finishing crawling...');
            ph.exit();
            connection.end();
            console.log('Loading time ' + elapsed + ' msec');
            console.log('Records added: ' + totalCount);
            return;
        }
        pageIndex++;

        ph.createPage(function(err, page) {
            url = 'http://bistracker.org.ua/list.php?page=' + pageIndex;
            return page.open(url, function(err, status) {

                console.log('crawling page: ' + url);

                page.onConsoleMessage = function(msg) {
                    console.log(msg);
                };

                if ( status === "success" ) {
                    setTimeout(function() {
                        return page.evaluate(function() {
                            //TODO: add parsing description and other useful info
                            var body = $("#body");
                            var temp = [];
                            $('.ls-reliz', body).each(function(){
                                $(this).find('.ls-added a').remove();
                                var createdAt = $(this).find('.ls-added').text().match(/:([\s\S]+)$/)[0].trim();
                                temp.push({
                                    'id': $(this).find('.ls-name a').attr('href').match(/[0-9]{1,}$/)[0],
                                    'name': $(this).find('.ls-name a').text(),
                                    'createdAt': createdAt.substr(1,createdAt.length-1).trim()
                                });
                            });
                            return temp;
                        }, function(err,result){

                            dataSet.push(result);
                            if ( ! !!result) scanPage(pageIndex, true);
                            if (err)
                                console.log(err);
                            scanPage(pageIndex);
                        });

                    }, 3000);
                }
                else {
                    console.log('error crawling page ' + url);
                    console.log(status);
                }
            });
        });

    }

});
