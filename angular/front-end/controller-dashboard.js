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

app.controller("dashboardCtrl", function($rootScope, $scope, $http) {
    $rootScope.pageTitle = "Bất động sản Tô Dương - Trang chủ";
    let params = {
        method: 'POST',
        url: '/get-slider',
    }
    submitFrontEnd(params, $http, function(res) {
        $scope.sliders = res;
        setTimeout(() => {
            jQuery(".portfolio-details-carousel").owlCarousel({
                autoplay: true,
                dots: true,
                loop: true,
                items: 1
            });
        }, 100);


        console.log('slider ', res);
    })

}).directive('hotProduct', function() {
    return {
        restrict: 'E',
        scope: {
            title: '@',
            key: "@"
        },
        templateUrl: '/tpls/main/product/directive-hot-product.html',
        controller: function($scope, $compile, $http) {
            let filter_ban = {
                idCategory: "5f2cd118c5f37520ec555734",
                productType: 'hot',
            };
            if ($scope.key == "thue_hot") {
                filter_ban.idCategory = "5f336b87ae16cf08a0b6ee6d";
            }
            GetHotProduct(filter_ban, $http, function(res) {
                $scope.productHot = res;
                $scope.linkViewmore = '#';

                setTimeout(function() {
                    // console.log(jQuery('.testimonial-img').eq(0).width());
                    jQuery("#" + $scope.key + " .testimonials-carousel").owlCarousel({
                        autoplay: true,
                        dots: true,
                        loop: true,
                        responsive: {
                            0: {
                                items: 1
                            },
                            768: {
                                items: 2
                            },
                            992: {
                                items: 3
                            },
                            1200: {
                                items: 4
                            }
                        }
                    });
                }, 100);

                setTimeout(function() {

                    jQuery("#" + $scope.key + ' .testimonial-img').each(function() {
                        var width = jQuery(this).width();
                        jQuery(this).height(width);
                        if (jQuery(this).find('img').eq(0).height() < jQuery(this).find('img').eq(0).width()) {
                            jQuery(this).find('img').eq(0).css("width", "auto");
                            jQuery(this).find('img').eq(0).css("height", "100%");
                        }
                        // console.log(jQuery(this).find('img').eq(0).width(), jQuery(this).find('img').eq(0).height());
                    })
                }, 500);

            })
        },

    }
}).directive('newProduct', function() {
    return {
        restrict: 'E',
        scope: {
            title: '@',
            key: "@"
        },
        templateUrl: '/tpls/main/product/directive-new-product.html',
        controller: function($scope, $compile, $http) {
            $scope.linkViewmore = '#';
            let filter_ban = {
                idCategoryType: "5f166a011ab04a0e50f990b3",
                skip: 0,
                limit: 6
            };
            GetHotProduct(filter_ban, $http, function(res) {
                $scope.newProducts = res;
                // console.log($scope.newProducts);
                setTimeout(function() {
                    jQuery("#" + $scope.key + ' .pi-img').each(function() {
                        if (jQuery(this).find('img').eq(0).height() < jQuery(this).find('img').eq(0).width()) {
                            jQuery(this).find('img').eq(0).css("width", "auto");
                            jQuery(this).find('img').eq(0).css("height", "100%");
                        } else {
                            jQuery(this).find('img').eq(0).css("width", "100%");
                            jQuery(this).find('img').eq(0).css("height", "auto");
                        }
                    })
                }, 100);

            })
        },

    }
});


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
    })

});