
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

function htmlEscape(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}


var addDataToDb = function (data, callback) {

    data = data || [];
    if ( ! !!data.length) return;

    var query = "INSERT INTO example (site_id, name, description, created_at) VALUES ";
    var items = [];

    for(key in data)
    {
        if (! !!data[key]) return false;
        if (! !!data[key].length) return false;
        for (i in data[key])
        {
            items.push(
                "(" + data[key][i].id + ", '" + htmlEscape(data[key][i].name) + "', '"+htmlEscape(data[key][i].description)+"', '" + data[key][i].createdAt + "')"
            );
        }
    }

    if ( ! !!items.length)
        return false;

    query += items.join(', ') + ';';
    connection.query(query, function(err, rows, fields) {
        if (typeof callback == 'function') callback(err, rows, fields);
    });
}

var pageIndex = 0;
var url;

phantom.create(function(err, ph) {

    console.log('Starting scrawling at: ' + startDate.toLocaleString());
    var dataSet = [];

    scanPage(pageIndex);

    function scanPage(pageIndex, isFinish) {

        var isExit = typeof isFinish != 'undefined' && isFinish;

        // dispose of phantomjs if we're done
        if (isExit) {
            elapsed = Date.now() - new Date().setTime(startDate);
            console.log('finishing crawling...');
            ph.exit();
            console.log('Crawling elapsed: ' + elapsed /1000 + ' sec');
            console.log('Records added: ' + totalCount);
            return;
        }

        addDataToDb(dataSet, function(err, rows, fields){
            if ( ! err) {
                console.log('data inserted to DB successfully!!!');
                console.log('Count of inserted items: ' + rows.affectedRows);
                dataSet = [];
                totalCount += rows.affectedRows;
                if (isExit)
                    connection.end();
                return;
            }
            throw err;
        });

        if (isExit)
            return ph.exit();

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
                                $(this).find('.ls-added a[target="_blank"]').remove();

                                var createdAt = $(this).find('.ls-added').text().trim();

                                if ( ! !!createdAt) {
                                    createdAt = (new Date()).getTime();
                                }
                                else {
                                    createdAt = createdAt.match(/:([\s\S]+)$/)[0].trim().substr(1,createdAt.length-1).trim();
                                }

                                temp.push({
                                    'id': $(this).find('.ls-name a').attr('href').match(/[0-9]{1,}$/)[0],
                                    'name': $(this).find('.ls-name a').text(),
                                    'description': $(this).find('.ls-desc').html(),
                                    'createdAt': createdAt
                                });
                            });
//                            console.log($('head title').text());
//                            console.log($('.ls-reliz', body).length);
                            return temp;
                        }, function(err,result){
//                            if ( pageIndex > 14) scanPage(pageIndex, true);
                            if ( ! !!result) scanPage(pageIndex, true);
                                dataSet.push(result);
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
