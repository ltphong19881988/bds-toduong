var GetHotProduct = function(filter, $http, callback) {
    let params = {
        method: 'POST',
        url: '/product/filter-product',
        data: {
            filter: filter
        }
    }
    submitFrontEnd(params, $http, function(res) {
        callback(res);
    })
}


app.controller("productDetailCtrl", function($rootScope, $scope, $http, $compile, $routeParams) {
    $rootScope.pageTitle = "Bất động sản Tô Dương - ";
    // console.log('category', $routeParams);
    // console.log('location', location.pathname);
    var abc = location.pathname.split('-pr');
    console.log('abc', abc);
    let params = {
        method: 'GET',
        url: '/product/name-key/' + 'pr' + abc[1],
    };
    submitFrontEnd(params, $http, function(res) {
        console.log('details', res);
        $rootScope.pageTitle += res.productContent.title;
        $scope.product = res;

        setTimeout(function() {
            $(".gallery .owl-carousel").owlCarousel({
                autoPlay: false,
                nav: true,
                navText: ['<i class="fa fa-angle-left" aria-hidden="true"></i>', '<i class="fa fa-angle-right" aria-hidden="true"></i>'],
                // autoHeight: true,
                autoWidth: true,
                margin: 10,
                items: 1,
                onInitialized: function(e) {
                    // jQuery('.owl-nav.disabled').removeClass('disabled');
                },
            });
        }, 300);
    })

    $scope.viewFullImg = function(src) {
        // console.log(src);
        $('body').append(`<div class="search-overly"><img src="` + src + `" style="width:98%; margin-left: 1%; margin-top: 60px;" /></div>`);
        $('body').prepend('<button type="button" class="popup-overlay-close"><i class="icofont-close"></i></button>');
    }

});