
var phantom = require('node-phantom');
var mysql = require('mysql');

var client = mysql.createConnection({
    database : 'testdb',
    user     : 'root',
    password : '312m16'
});
//console.log(client);return;
//var query = client.query(
//    'INSERT INTO table '+
//        'SET title = ?, text = ?, created = ?',
//    ['another entry', 'because 2 entries make a better test', '2010-08-16 12:42:15']
//);


console.log('start phantom.create');
phantom.create(function(err, ph) {
    console.log('phantom.create');
    return ph.createPage(function(err, page) {

        console.log('createPage');

        page.onConsoleMessage = function(msg) {
            console.log(msg);
        };
//        http://bistracker.org.ua/list.php?page=
        //From here on in, we can use PhantomJS' API methods
        return page.open("http://bistracker.org.ua", function(err, status) {

            console.log('page.open');

            if ( status === "success" ) {

                console.log('status === "success"');

//                page.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function(err) {

//                    console.log('jquery included');

                    setTimeout(function() {
                        return page.evaluate(function() {
                            console.log($("head title").html());
                            var table = $("#releases-table");
                            $(".indeximg a > img", table).each(function() {
                                console.log($(this).attr("title"));
                            });

                            //console.log("$(\"#intro\").text() -> " + $("#intro").text());
                        },
                        function(err,result) {
                            if (err) {
                                console.log(err);
                                console.log(result);
                            }
                            ph.exit();
                        });
                    }, 3000);
//                });
            }
        });
    });
});
