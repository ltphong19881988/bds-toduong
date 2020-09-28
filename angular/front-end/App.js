/// ==============
var curtoken = localStorage.getItem('token');
if (curtoken) {
    jQuery.ajaxSetup({
        headers: {
            'x-access-token': curtoken
        }
    });
}

function getRandomArbitrary(min, max) {
    return Math.ceil(Math.random() * (max - min) + min);
}

function getRandomArr(arr, num){
    if(num >= arr.length) return arr;
    var length = arr.length - 1;
    var kq = [];
    while(kq.length < num){
        var abc = getRandomArbitrary(0, length);
        if(kq.indexOf(arr[abc]) == -1) kq.push(arr[abc]);
    }
    return kq;
}

var getUrlParameter = function(name) {
    var url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
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
        .when("/login", {
            templateUrl: "/tpls/main/login.html",
            controller: "loginCtrl"
        })
        .when("/news", {
            templateUrl: "/tpls/main/post/cate-page.html",
            controller: "postCategoryCtrl"
        })
        .when("/du-an", {
            templateUrl: "/tpls/main/project/cate-page.html",
            controller: "projectCtrl"
        })
        .when("/du-an/:page", {
            templateUrl: "/tpls/main/project/details.html",
            controller: "projectDetailCtrl"
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
    });
    $locationProvider.hashPrefix('!'); // Ban đầu là hashPrefix('*');        



});

// Run a function for init the app ( before content loaded )
app.run(function($rootScope, $window, $http, $location, MetadataService, SEOService) {
    // console.log('app run'); fe
    $rootScope['web_key'] = 'totnhat';
    if (location.hostname.indexOf('totnhat.vn') != -1)
        $rootScope['web_key'] = 'totnhat';
    InitWebsite($rootScope, $http);
    if ($window.innerWidth >= 992)
        $rootScope.postCateContentNumer = 340;
    if ($window.innerWidth < 992)
        $rootScope.postCateContentNumer = 280;
    if ($window.innerWidth <= 450)
        $rootScope.postCateContentNumer = 120;

    // $rootScope.$on('$viewContentLoaded', function() {
    //     //do your will
    //     // console.log('viewContentLoaded');
    // });

    $rootScope.$on('$locationChangeStart', function() {
        // console.log('locationChangeStart', location);
        $rootScope['locationChangeStart'] = location.href;
    });

    $rootScope.$on('$locationChangeSuccess', function() {
        // get SEO infomation by ajax
        // console.log('locationChangeSuccess', location);
        $rootScope['locationChangeSuccess'] = location.href;
        if ($rootScope['locationChangeSuccess'] != $rootScope['locationChangeStart']) {
            console.log('angularjs router change href', location.pathname);
            getSeoInfo(location.pathname, $http, function(res) {
                // console.log('getSeoInfo', res);
                if (res.status) {
                    SEOService.setMetaTags(res.seoInfo);
                }
            })
        } else {
            // console.log('web được tải lại');
        }

    });

    angular.element($window).bind('resize', function() {
        if ($window.innerWidth >= 992) {
            $rootScope.postCateContentNumer = 340;
            jQuery('#main-left').attr("class", "col-lg-9");
            jQuery('#main-right').css("display", "block");
            jQuery('#main-right').attr("class", "col-lg-3");
        }

        if ($window.innerWidth < 992) {
            $rootScope.postCateContentNumer = 280;
            jQuery('#main-left').attr("class", "col-md-12");
            jQuery('#main-right').css("display", "none");
        }
        if ($window.innerWidth <= 450)
            $rootScope.postCateContentNumer = 120;

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
        $rootScope.listAds = res.listAds;
        $rootScope['adsLeft'] = res.listAds.filter(x => (x.position == 'left' && x.videoTitle == 'bds-' + $rootScope['web_key']))[0];
        $rootScope['adsRight'] = res.listAds.filter(x => (x.position == 'right' && x.videoTitle == 'bds-' + $rootScope['web_key']))[0];
        var arr =  res.listAds.filter(x => (x.position == 'center' && x.videoTitle == 'bds-' + $rootScope['web_key']));
        $rootScope['adsCenter'] = getRandomArr(arr, 1);
        console.log("$rootScope['adsCenter']", arr);


        // $rootScope['pageTitle'] = res.siteConfig.filter(x => x.key == 'web-name-' + $rootScope['web_key'])[0].value;
        $rootScope['webName'] = res.siteConfig.filter(x => x.key == 'web-name-' + $rootScope['web_key'])[0].value;
        $rootScope['webPhone'] = res.siteConfig.filter(x => x.key == 'phone-number-' + $rootScope['web_key'])[0];
        $rootScope['webEmail'] = res.siteConfig.filter(x => x.key == 'email-' + $rootScope['web_key'])[0];
        $rootScope['webAddress'] = res.siteConfig.filter(x => x.key == 'web-address-' + $rootScope['web_key'])[0];
        $rootScope['logoInfo'] = res.siteConfig.filter(x => x.key == 'logo-info-' + $rootScope['web_key'])[0];
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

var getSeoInfo = function(url, $http, callback) {
    let params = {
        method: 'POST',
        url: '/seo-info',
        data: {
            url: url
        }
    }
    submitFrontEnd(params, $http, function(res) {
        callback(res);
    });
}