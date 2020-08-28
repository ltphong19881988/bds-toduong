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


app.controller("productDetailCtrl", function($rootScope, $scope, $http, $compile, $routeParams, MetadataService) {
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
        $scope.nearestCate = JSON.parse(localStorage.getItem('nearestCate'));
        // $scope.nearestCate = res.category.reduce(function(prev, current) {
        //     if (+current.priority > +prev.priority) {
        //         return current;
        //     } else {
        //         return prev;
        //     }
        // });
        $scope.nearestLocal = res.province;
        if (res.district && res.district.link) $scope.nearestLocal = res.district;
        if (res.ward && res.ward.link) $scope.nearestLocal = res.ward;
        if ($scope.product.productContent.seoDescriptions)
            MetadataService.setMetaTags('description', $scope.product.productContent.seoDescriptions);
        else
            MetadataService.setMetaTags('description', $scope.product.productContent.title);
        if ($scope.product.productContent.seoKeyWord)
            MetadataService.setMetaTags('keywords', $scope.product.productContent.seoKeyWord);
        else
            MetadataService.setMetaTags('keywords', $scope.product.productContent.title);

        setTimeout(function() {
            $scope.copyOwl = $('.owl-carousel').clone().prop({
                id: 'copyOwl'
            });
        }, 400);
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
        }, 500);
    })

    $scope.viewFullImg = function(src) {
        // $('body').append(`<div class="search-overly"><img src="` + src + `" style="width:98%; margin-left: 1%; margin-top: 60px;" /></div>`);
        // $('body').prepend('<button type="button" class="popup-overlay-close"><i class="icofont-close"></i></button>');
        // $('.owl-nav').css('positon', 'fixed');
        // $('.owl-nav').css('z-index', '9999989');

        $('body').append(`<div class="search-overly"></div>`);
        $('body').prepend($scope.copyOwl);
        $scope.copyOwl.owlCarousel({
            autoplay: true,
            dots: true,
            loop: true,
            items: 1,
            autoHeight: true,
            onInitialized: function(e) {
                console.log('o a dep trai', $('.owl-loaded .owl-item').width(), $('.owl-loaded .owl-item').height());
                $('.owl-loaded .owl-item img').each(function(e) {
                    console.log($(this).width(), $(this).height());
                });
            },
        });
    }

});