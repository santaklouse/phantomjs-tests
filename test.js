
var page;
var fs = require('fs');
var pageCount = 11;

scanPage(pageCount);

function scanPage(pageIndex) {
    // dispose of page before moving on
    if (typeof page !== 'undefined')
        page.release();

    // dispose of phantomjs if we're done
    if (pageIndex > 13) {
        phantom.exit();
        return;
    }

    pageIndex++;

    // start crawling...
    page = require('webpage').create();
    var currentPage = 'http://bistracker.org.ua/list.php?page=' + pageIndex;

    page.onConsoleMessage = function(msg) {
        console.log(msg);
    };

    page.open(currentPage, function(status) {
        if (status === 'success') {
            window.setTimeout(function() {
                console.log('crawling page ' + pageIndex);

                page.evaluate(function() {
                    console.log($('head title').text());
                    console.log($('.ls-reliz', body).length);
                });
//                checkBookName(booksNames[0], currentPage);
//                checkBookName(booksNames[1], currentPage);

                scanPage(pageIndex);
            }, 3000);
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