/// ==============
var curtoken = localStorage.getItem('token');
if (curtoken) {
    jQuery.ajaxSetup({
        headers: {
            'x-access-token': curtoken
        }
    });
}

angular.module("uib/template/pagination/pagination.html", []).run(["$templateCache", function($templateCache) {
    $templateCache.put("uib/template/pagination/pagination.html",
        "<li role=\"menuitem\" ng-if=\"::boundaryLinks\" ng-class=\"{disabled: noPrevious()||ngDisabled}\" class=\"page-item pagination-first\"><a href ng-click=\"selectPage(1, $event)\" ng-disabled=\"noPrevious()||ngDisabled\" class='page-link' uib-tabindex-toggle>{{::getText('first')}}</a></li>\n" +
        "<li role=\"menuitem\" ng-if=\"::directionLinks\" ng-class=\"{disabled: noPrevious()||ngDisabled}\" class=\"page-item pagination-prev\"><a href ng-click=\"selectPage(page - 1, $event)\" ng-disabled=\"noPrevious()||ngDisabled\" class='page-link' uib-tabindex-toggle>{{::getText('previous')}}</a></li>\n" +
        "<li role=\"menuitem\" ng-repeat=\"page in pages track by $index\" ng-class=\"{active: page.active,disabled: ngDisabled&&!page.active}\" class=\"page-item pagination-page\"><a href ng-click=\"selectPage(page.number, $event)\" class='page-link' ng-disabled=\"ngDisabled&&!page.active\" uib-tabindex-toggle>{{page.text}}</a></li>\n" +
        "<li role=\"menuitem\" ng-if=\"::directionLinks\" ng-class=\"{disabled: noNext()||ngDisabled}\" class=\"page-item pagination-next\"><a href ng-click=\"selectPage(page + 1, $event)\" class='page-link' ng-disabled=\"noNext()||ngDisabled\" uib-tabindex-toggle>{{::getText('next')}}</a></li>\n" +
        "<li role=\"menuitem\" ng-if=\"::boundaryLinks\" ng-class=\"{disabled: noNext()||ngDisabled}\" class=\"page-item pagination-last\"><a href ng-click=\"selectPage(totalPages, $event)\" class='page-link' ng-disabled=\"noNext()||ngDisabled\" uib-tabindex-toggle>{{::getText('last')}}</a></li>\n" +
        "");
}]);


var app = angular.module('frontApp', [
    'ngRoute',
    // 'ngMaterial',
    'ui.router',
    // 'ngAnimate',
    // 'ngSanitize',
    'ui.bootstrap',
    // 'datatables',
    // 'datatables.buttons',
    // 'datatables.light-columnfilter',
    // 'pascalprecht.translate',
]);
app.factory("interceptors", [httpInterceptors]);
app.config(function($routeProvider, $locationProvider, $httpProvider) {
    var listLink = ['gioi-thieu', 'chinh-sach-bao-mat', 'dieu-khoan-su-dung'];
    var $route = $routeProvider.$get[$routeProvider.$get.length - 1]({ $on: function() {} });
    // console.log('route', $route);
    $httpProvider.interceptors.push('interceptors');
    listLink.forEach(element => {
        $routeProvider.when("/" + element, {
            templateUrl: "/tpls/main/one-content.html",
            controller: "oneContentCtrl"
        })
    });
    $routeProvider
        .when("/", {
            templateUrl: "/tpls/main/index.html",
            controller: "dashboardCtrl"
        })
        .when("/news", {
            templateUrl: "/tpls/main/post/cate-page.html",
            controller: "postCategoryCtrl"
        })
        .when("/du-an", {
            templateUrl: "/tpls/main/project/cate-page.html",
            controller: "projectCtrl"
        })
        .when("/news/:page", {
            templateUrl: "/tpls/main/post/cate-page.html",
            controller: "postCategoryCtrl"
        })
        .when("/news/:page[-nr]", {
            templateUrl: "/tpls/main/post/details.html",
            controller: "postDetailCtrl"
        })
        .when("/:page", {
            templateUrl: "/tpls/main/product/cate-page.html",
            controller: "categoryCtrl"
        })
        .when("/:page[-pr]", {
            templateUrl: "/tpls/main/product/details.html",
            controller: "productDetailCtrl"
        });


    // $route.routes['/news/:page'].regexp = /^\/(?:news\/(\d+))$/;
    $route.routes['/news/:page'].regexp = /^\/(?:news)\/(?!.*-nr)([a-z0-9-]{0,999})/;
    $route.routes['/news/:page[-nr]'].regexp = /^\/(?:news)\/(([a-z0-9-]{0,999})-nr[0-9])/;

    // $route.routes['/:page'].regexp = /^((?!news).)*$/;
    $route.routes['/:page'].regexp = /^\/(?!news|.*-pr)([a-z0-9-]{1,999})/;
    $route.routes['/:page[-pr]'].regexp = /([a-z0-9-]{1,999})-pr[0-9]/;



    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    }).hashPrefix('*');



});

// Run a function for init the app ( before content loaded )
app.run(function($rootScope, $window, $http, $location) {
    console.log('app run');
    InitWebsite($rootScope, $http);

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
        // console.log('angular window load, scroll to top');
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

var InitWebsite = function($rootScope, $http) {
    let params = {
        method: 'POST',
        url: '/init-web',
        data: {
            menuDistrict: {
                type: "2",
                provinceID: 4
            },
        }
    }

    submitFrontEnd(params, $http, function(res) {
        console.log('init website', res);
        $rootScope.menuDistrict = res.menuDistrict;

        $rootScope.menuNews = res.listNews;

        $rootScope['pageTitle'] = res.siteConfig.filter(x => x.key == 'web-name-totnhat')[0].value;
        $rootScope['webPhone'] = res.siteConfig.filter(x => x.key == 'phone-number-totnhat')[0];
        $rootScope['webEmail'] = res.siteConfig.filter(x => x.key == 'email-totnhat')[0];
        $rootScope['webAddress'] = res.siteConfig.filter(x => x.key == 'web-address-totnhat')[0];
        $rootScope['logoInfo'] = res.siteConfig.filter(x => x.key == 'logo-info-totnhat')[0];
    });
}

var InitMenuNews = function(arrKQ, listNews, pri) {
    let params = {
        method: 'POST',
        url: '/sector/filter-all',
        data: {
            menuDistrict: {
                type: "2",
                provinceID: 4
            },
        }
    }
    submitFrontEnd(params, $http, function(districts) {
        $rootScope.menuDistrict = districts;
    });
}