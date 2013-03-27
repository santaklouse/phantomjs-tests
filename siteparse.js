
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

var dataSet;

var grabPage = function (url, page, ph) {
    return page.open(url, function(err, status) {

        console.log('page.open');

        if ( status === "success" ) {

            console.log('status === "success"');

//                page.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function(err) {
//                console.log('jquery included');
                    //work here
//                });

            setTimeout(function() {
                return page.evaluate(function() {

                        console.log($("head title").html());

//                        var table = $("#releases-table");

//                        $(".indeximg a > img", table).each(function() {
//                            console.log($(this).attr("title"));
//                        });

                        $('').each(function(){
                            dataSet.push({
                                //lalalakokoko
                                //adding data
                            });
                        });
                    },
                    function(err,result) {
                        if (err) {
                            console.log(err);
                            console.log(result);
                        }
                        ph.exit();
                    });
            }, 3000);
        }
    });
}


console.log('start phantom.create');
phantom.create(function(err, ph) {
    console.log('phantom.create');
    return ph.createPage(function(err, page) {
        //From here on in, we can use PhantomJS' API methods
        console.log('createPage');

        page.onConsoleMessage = function(msg) {
            console.log(msg);
        };
        for (var i=1; i <= 10; i++) {
            grabPage('http://bistracker.org.ua/list.php?page=' + i, page, ph);
        }
//        grabPage('http://bistracker.org.ua', page, ph);
    });
});
