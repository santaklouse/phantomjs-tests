
var phantom = require('node-phantom');
//var mysql = require('mysql');

//var connection = mysql.createConnection({
//    database : 'testdb',
//    user     : 'root',
//    password : '312m16'
//});
//connection.connect();

//console.log(client);return;

//connection.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
//    if (err) throw err;
//    console.log('The solution is: ', rows[0].solution);
//});

//connection.end();




var pageIndex = 0;
var url;
//console.log('start phantom.create');
phantom.create(function(err, ph) {
    var dataSet = [];
    scanPage(pageIndex);

    function scanPage(pageIndex) {
        // dispose of phantomjs if we're done
        if (pageIndex > 1) {
            console.log('the end...');
            console.log(dataSet);
            for(key in dataSet)
            {
                for (i in dataSet[key])
                {
                    console.log(dataSet[key][i].id);
                    console.log(dataSet[key][i].name);
                    console.log(dataSet[key][i].createdAt);
                }
            }
            ph.exit();
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
//                                console.log(data.id);
//                                console.log(data.name);
//                                console.log(data.createdAt);
                            });
                            return temp;
                        }, function(result){
                            console.log(result);
                            dataSet.push(result);
                            scanPage(pageIndex);
                        });

                    }, 3000);
                }
                else {
                    console.log('error crawling page ' + url);
                    console.log(status);
//                    page.release();
                }
            });
        });

    }

});
