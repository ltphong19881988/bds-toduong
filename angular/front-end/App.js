/// ==============
var curtoken = localStorage.getItem('token');
if (curtoken) {
    jQuery.ajaxSetup({
        headers: {
            'x-access-token': curtoken
        }
    });
}


var app = angular.module('frontApp', [
    'ngRoute',
    // 'ngMaterial',
    'ui.router',
    // 'datatables',
    // 'datatables.buttons',
    // 'datatables.light-columnfilter',
    // 'pascalprecht.translate',
]);
app.factory("interceptors", [httpInterceptors]);
app.config(function($routeProvider, $locationProvider, $httpProvider) {
    var $route = $routeProvider.$get[$routeProvider.$get.length - 1]({ $on: function() {} });
    // console.log('route', $route);
    $httpProvider.interceptors.push('interceptors');
    $routeProvider
        .when("/", {
            templateUrl: "/tpls/main/index.html",
            controller: "dashboardCtrl"
        })
        .when("/:page[-pr]", {
            templateUrl: "/tpls/main/product/details.html",
            controller: "productDetailCtrl"
        })
        .when("/:page[-nr]", {
            templateUrl: "/tpls/main/product/details.html",
            controller: "postDetailCtrl"
        })
        .when("/portfolio", {
            templateUrl: "/tpls/main/portfolio.html",
            controller: "portfolioCtrl"
        })
        .when("/:page", {
            templateUrl: "/tpls/main/product/cate-page.html",
            controller: "categoryCtrl"
        })


    $route.routes['/:page'].regexp = /([a-z0-9-]{1,999})/;
    $route.routes['/:page[-pr]'].regexp = /([a-z0-9-]{1,999})-pr[0-9]/;
    $route.routes['/:page[-nr]'].regexp = /([a-z0-9-])-nr[0-9]/;

    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    }).hashPrefix('*');



});

// Run a function for init the app ( before content loaded )
app.run(function($rootScope, $window, $http, $location) {
    console.log('app run');
    InitSiteConfig($rootScope, $http);
    InitMenuDistricts($rootScope, $http);

    $rootScope.$on('$viewContentLoaded', function() {
        //do your will
        // console.log('viewContentLoaded');
    });
    angular.element($window).bind('resize', function() {
        if ($window.innerWidth < 992) {
            jQuery('#main-left').attr("class", "col-md-12");
            jQuery('#main-right').css("display", "none");
        }
        if ($window.innerWidth >= 992) {
            jQuery('#main-left').attr("class", "col-lg-9");
            jQuery('#main-right').css("display", "block");
            jQuery('#main-right').attr("class", "col-lg-3");
        }
        // console.log($window.innerWidth);
    });

    angular.element($window).on('load', function() {
        console.log('angular window load, scroll to top');
        angular.element('html, body').animate({
            scrollTop: 0
        }, 1500, 'easeInOutExpo');
    })
});


function httpInterceptors() {
    return {
        // if beforeSend is defined call it
        'request': function(request) {
            if (request.beforeSend)
                request.beforeSend();
            return request;
        },
        // if complete is defined call it
        'response': function(response) {
            if (response.config.complete)
                response.config.complete(response);
            return response;
        }
    };
}

var InitSiteConfig = function($rootScope, $http) {
    let params = {
        method: 'POST',
        url: '/site-config',
        data: {}
    }

    submitFrontEnd(params, $http, function(res) {
        // console.log('site-config', res);
        $rootScope['pageTitle'] = res.filter(x => x.key == 'web-name-totnhat')[0].value;
        $rootScope['webPhone'] = res.filter(x => x.key == 'phone-number-totnhat')[0];
        $rootScope['webEmail'] = res.filter(x => x.key == 'email-totnhat')[0];
        $rootScope['webAddress'] = res.filter(x => x.key == 'web-address-totnhat')[0];
        $rootScope['logoInfo'] = res.filter(x => x.key == 'logo-info-totnhat')[0];
    });
}

var InitMenuDistricts = function($rootScope, $http) {
    let params = {
        method: 'POST',
        url: '/sector/filter-all',
        data: {
            type: "2",
            provinceID: 4
        }
    }
    submitFrontEnd(params, $http, function(districts) {
        $rootScope.menuDistrict = districts;
    });
}