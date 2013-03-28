// Print all of the news items on hackernews
var jsdom = require("jsdom");
var fs = require("fs");
var jquery = fs.readFileSync("./jquery.min.js").toString();

//////////////////////////////////////////////////////////////
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
//////////////////////////////////////////////////////////////////////


var addDataToDb = function (data, callback) {

    data = data || [];
    if ( ! !!data.length) return;

    var query = "INSERT INTO example (site_id, name, description, created_at) VALUES ";
    var items = [];

    for(key in data)
    {
        if (! data[key]) return false;
        for (i in data[key])
        {
            if (! data[key]) return false;
            items.push(
                "(" + data[key][i].id + ", '" + data[key][i].name + "', '"+data[key][i].description+"', '" + data[key][i].createdAt + "')"
            );
        }

    }

    if ( ! items.length)
        return false;

    query += items.join(', ') + ';';
    connection.query(query, function(err, rows, fields) {
        if (typeof callback == 'function') callback(err, rows, fields);
    });
}
////////////////////////////////////////////////////////////////////////

var pageIndex = 11;
var url;

console.log('Starting scrawling at: ' + startDate.toLocaleString());
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
        console.log(err);
        throw err;
    });

    // dispose of phantomjs if we're done
    if (typeof isFinish != 'undefined' && isFinish) {
        elapsed = Date.now() - new Date().setTime(startDate);
        console.log('finishing crawling...');
        ph.exit();
        connection.end();
        console.log('Crawling elapsed: ' + elapsed /1000 + ' sec');
        console.log('Records added: ' + totalCount);
        return;
    }

    pageIndex++;




    url = 'http://bistracker.org.ua/list.php?page=' + pageIndex;
    jsdom.env({
        html: url,
        src: [jquery],
        done: function (errors, window) {

            setTimeout(
                function(){
                    var $ = window.$;

                    console.log('crawling page: ' + url);

                    //TODO: add parsing description and other useful info
                    var body = $("#body");
                    var temp = [];
                    $('.ls-reliz', body).each(function(){
                        $(this).find('.ls-added a[target="_blank"]').remove();
                        console.log($(this).find('.ls-added a[target="_blank"]').text());
                        var createdAt = $(this).find('.ls-added').text().match(/:([\s\S]+)$/)[0].trim();

                        temp.push({
                            'id': $(this).find('.ls-name a').attr('href').match(/[0-9]{1,}$/)[0],
                            'name': $(this).find('.ls-name a').text(),
                            'description': $(this).find('.ls-desc').html(),
                            'createdAt': createdAt.substr(1,createdAt.length-1).trim()
                        });
                    });

                    console.log($('head title').text());
                    console.log($('.ls-reliz', body).length);


//            var $ = window.$;
//            console.log("HN Links");
//            $("td.title:not(:last) a").each(function() {
//                console.log(" -", $(this).text());
//            });
//            window.close();
                    if ( pageIndex > 14)
                        return scanPage(pageIndex, true);
                    return scanPage(pageIndex);
                },
                3000
            );

        }
    });
}


