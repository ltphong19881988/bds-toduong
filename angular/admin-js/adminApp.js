var curtoken = localStorage.getItem('token');
if (curtoken) {
    jQuery.ajaxSetup({
        headers: {
            'x-access-token': curtoken
        }
    });
}

var adminApp = angular.module('adminApp', [
    'ngRoute',
    'ui.router',
    'datatables',
    'datatables.buttons',
    'datatables.light-columnfilter',
    'ngMaterial',
    'material.svgAssetsCache'
    // 'ui.bootstrap',
    // 'ui.bootstrap.datetimepicker',
]);

adminApp.config(function($routeProvider, $locationProvider, $stateProvider, $mdDateLocaleProvider) {

    $routeProvider
        .when("/index", {
            templateUrl: "/tpls/admin/dashboard.html",
            controller: "dashboardCtrl"
        })
        .when("/banner-slider", {
            templateUrl: "/tpls/admin/slider.html",
            controller: "sliderCtrl"
        })
        .when("/ads", {
            templateUrl: "/tpls/admin/ads.html",
            controller: "adsCtrl"
        })
        .when("/site-config", {
            templateUrl: "/tpls/admin/site-config.html",
            controller: "siteConfigCtrl"
        })
        .when("/sector", {
            templateUrl: "/tpls/admin/sector/index.html",
            controller: "sectorCtrl"
        })
        .when("/product-type", {
            templateUrl: "/tpls/admin/product/product-type.html",
            controller: "productTypeCtrl"
        })
        .when("/media", {
            templateUrl: "/tpls/admin/media.html",
            controller: "mediaCtrl"
        })
        .when("/url-one-level", {
            templateUrl: "/tpls/admin/one-lvl-url.html",
            controller: "urlOneLevelCtrl"
        })
        .when("/category", {
            templateUrl: "/tpls/admin/category.html",
            controller: "categoryCtrl"
        })
        .when("/post", {
            templateUrl: "/tpls/admin/post/index.html",
            controller: "postCtrl"
        })
        .when("/post/:postId/:action", {
            templateUrl: "/tpls/admin/post/post-details.html",
            controller: "postCtrl",
            params: {
                postId: { squash: true, value: null },
            }
        })
        .when("/project", {
            templateUrl: "/tpls/admin/project/index.html",
            controller: "projectCtrl"
        })
        .when("/project/:projectId/:action", {
            templateUrl: "/tpls/admin/project/project-details.html",
            controller: "projectCtrl",
            params: {
                projectId: { squash: true, value: null },
            }
        })
        .when("/product", {
            templateUrl: "/tpls/admin/product/product.html",
            controller: "productCtrl"
        })
        .when("/product/:productId/:action", {
            templateUrl: "/tpls/admin/product/product-details.html",
            controller: "productCtrl",
            params: {
                productId: { squash: true, value: null },
            }
        })
        .when("/promotion", {
            templateUrl: "/tpls/admin/promotion/index.html",
            controller: "promotionCtrl"
        })
        .when("/order/cart", {
            templateUrl: "/tpls/admin/order/cart-index.html",
            controller: "orderCtrl",
        })
        .when("/video", {
            templateUrl: "/tpls/admin/video/index.html",
            controller: "videoCtrl"
        })
        .when("/notification", {
            templateUrl: "/tpls/admin/notification/index.html",
            controller: "notificationCtrl"
        })
        .when("/member", {
            templateUrl: "/tpls/admin/member/index.html",
            controller: "memberCtrl"
        })
        .when("/moderator", {
            templateUrl: "/tpls/admin/member/moderator.html",
            controller: "memberCtrl"
        })


        
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    }).hashPrefix('*');

    $mdDateLocaleProvider.formatDate = function(date) {

        var day = date.getDate();
        var monthIndex = date.getMonth();
        var year = date.getFullYear();

        return day + '/' + (monthIndex + 1) + '/' + year;

    };

});

// Run a function for init the app ( before content loaded )
adminApp.run(function($rootScope, $http) {

    // getUserInfo($http, function(result){
    //     console.log(result);
    //     $rootScope.userinfo = result;
    //     $rootScope.referralLink = document.location.host + "/register?u=" + $rootScope.userinfo.username;
    // });

    //alert("I'm global foo!");
    $rootScope.$on("$locationChangeStart", function(event, next, current) {
        // handle route changes     
        menuChanged(next);
    });

});


// app.config(['$routeProvider', '$stateProvider' , '$locationProvider', function($routeProvider, $stateProvider, $locationProvider) {
//     //$routeProvider.otherwise('/');

//     $stateProvider
//     .state("/", {
//         url : '/',
//         templateUrl : "/tpls/main/dashboard.html"
//     })
//     .state("abc", {
//         url : '/abc',
//         templateUrl : "/tpls/main/abc.html"
//     })
//     // .when("/green", {
//     //   templateUrl : "green.htm"
//     // })
//     // .when("/blue", {
//     //   templateUrl : "blue.htm"
//     // });
//     $locationProvider.html5Mode({
//         enabled: true,
//         requireBase: false
//       }).hashPrefix('*');
//   }]);