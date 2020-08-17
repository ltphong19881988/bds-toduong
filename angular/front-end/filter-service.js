app.service('MetadataService', function($rootScope, $window) {
    return {
        setMetaTags: function(key, value) {
            // console.log($window.document.getElementsByName(key));
            $window.document.getElementsByName(key)[0].content = value;
        },
        getMetaTags: function(key) {
            return $window.document.getElementsByName(key)[0].content;
        }
    }

});

app.service('browser', ['$window', function($window) {

    return function() {

        var userAgent = $window.navigator.userAgent;

        var browsers = { chrome: /chrome/i, safari: /safari/i, firefox: /firefox/i, ie: /internet explorer/i };

        for (var key in browsers) {
            if (browsers[key].test(userAgent)) {
                return key;
            }
        };

        return 'unknown';
    }

}]);

app.filter("trust", ['$sce', function($sce) {
    return function(htmlCode) {
        return $sce.trustAsHtml(htmlCode);
    }
}]);

app.filter("productPrice", ['$sce', function($sce) {
    return function(htmlCode) {
        var chuoi = htmlCode.toString();
        var pre = "";
        if (chuoi.length > 6 && chuoi.length < 10) {
            htmlCode = htmlCode / 1000000;
            pre = " triệu";
        }
        if (chuoi.length >= 10) {
            htmlCode = htmlCode / 1000000000;
            pre = " tỷ";
        }
        // console.log(htmlCode.toString().length);
        return htmlCode + pre;
    }
}]);

app.filter("titleFilter", ['$sce', function($sce) {
    return function(htmlCode) {
        if (htmlCode.length > 120) htmlCode = htmlCode.substr(0, 120) + ' **';
        return htmlCode;
    }
}]);