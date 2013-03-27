
var page;
var fs = require('fs');
var pageCount = 0;

scanPage(pageCount);

var dataSet = [];

function scanPage(pageIndex) {
    // dispose of page before moving on
    if (typeof page !== 'undefined')
        page.release();

    //the end
//    var isExit = page.evaluate(function() {
//        var body = $('#body');
//        $("#next", body).remove();
//        if (! !!body.html())
//            return true;
//        return false;
//    });
//    if (isExit) {
//        phantom.exit();
//        return;
//    }

    // dispose of phantomjs if we're done
    if (pageIndex > 2) {

        for(key in dataSet)
        {

            for (i in dataSet[key])
            {
                console.log(dataSet[key][i].id);
                console.log(dataSet[key][i].name);
                console.log(dataSet[key][i].createdAt);
            }
        }
        phantom.exit();
        return;
    }

    pageIndex++;

    // start crawling...
    page = require('webpage').create();

//    page.onConsoleMessage = function(msg) {
//        console.log(msg);
//    };

    var currentPage = 'http://bistracker.org.ua/list.php?page=' + pageIndex;
    page.open(currentPage, function(status) {
        if (status === 'success') {
            window.setTimeout(function() {
                console.log('');
                console.log('crawling page ' + currentPage);
                console.log('');
//                var booksNames =
                dataSet.push(page.evaluate(function() {
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
                    // there are 2 book titles on each page, just put these in an array
//                    return [ $($('h2 a')[0]).attr('title'), $($('h2 a')[1]).attr('title') ];
                }));

//                checkBookName(booksNames[0], currentPage);
//                checkBookName(booksNames[1], currentPage);

                scanPage(pageIndex);
            }, 2500);
        }
        else {
            console.log('error crawling page ' + pageIndex);
            page.release();
        }
    });
}

//// checks for interesting keywords in the book title,
//// and saves the link for us if necessary
//function checkBookName(bookTitle, bookLink) {
//    var interestingKeywords = ['C#','java','nhibernate','windsor','ioc','dependency injection',
//        'inversion of control','mysql'];
//    for (var i=0; i<interestingKeywords.length; i++) {
//        if (bookTitle.toLowerCase().indexOf(interestingKeywords[i]) !== -1) {
//            // save the book title and link
//            var a = bookTitle + ' => ' + bookLink + ';';
//            fs.write('books.txt', a, 'a');
//            console.log(a);
//            break;
//        }
//    }
//}
