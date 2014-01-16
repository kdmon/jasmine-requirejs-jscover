(function() {
    function waitFor(testFx, onReady) {
        var condition = false, interval = setInterval(function() {
            if (!condition) {
                condition = (typeof (testFx) === 'string' ? eval(testFx)
                        : testFx());
            } else {
                if (typeof (onReady) === 'string') {
                    eval(onReady);
                } else {
                    onReady();
                }
                clearInterval(interval);
            }
        }, 100);
    }

    var url  = phantom.args[0];
    var page = require('webpage').create();
    var fs   = require('fs');

    page.onCallback = function(data) {
        if ('jasminelog' === data.message) {
            fs.write('/dev/stdout', data.data.message, 'w');
        }
    };

    page.open(url, function(status) {
        if (status !== "success") {
            phantom.exit(1);
        } else {
            waitFor(function() {
                return page.evaluate(function() {
                    var reporter = window.jsApiReporter;

                    if (!reporter && window.frames[0] && window.frames[0].jsApiReporter) {
                        reporter = window.frames[0].jsApiReporter;
                    }

                    return reporter && reporter.finished;
                });
            }, function() {
                page.evaluate(function() {
                    var jscoverage_report;

                    if (!jscoverage_report && window.frames[0] && window.frames[0].jscoverage_report) {
                        jscoverage_report = window.frames[0].jscoverage_report;
                    }

                    if (jscoverage_report) {
                        jscoverage_report('phantom');
                    }
                });
                phantom.exit(0);
            });
        }
    });
}).call(this);