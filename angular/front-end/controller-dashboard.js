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

var fixImgSlider = function($scope) {
    // jQuery("#" + $scope.key + ' .testimonial-img').each(function() {
    jQuery('.testimonial-img').each(function() {
        var width = jQuery(this).width();
        if (width <= 250) {
            jQuery(this).height(width);
        } else {
            jQuery(this).height(250);
        }
        var a = jQuery(this).height() / jQuery(this).width();
        var img = jQuery(this).find('img').eq(0);
        var b = img.height() / img.width();
        if (a > b) {
            img.css("width", "auto");
            img.css("height", "100%");
        } else {
            img.css("width", "100%");
            img.css("height", "auto");
        }
    })
}

app.controller("dashboardCtrl", function($rootScope, $scope, $http, browser) {
    // var listener = $rootScope.$watch('pageTitle', function() {
    //     if ($rootScope.pageTitle != undefined) {
    //         $rootScope.pageTitle += " - Trang chủ";
    //         listener();
    //     }
    // });
    let params = {
        method: 'POST',
        // url: '/get-slider',
        url: '/data-index',
        data: {
            webname: 'bds-' + $rootScope['web_key'],
        }
    }
    submitFrontEnd(params, $http, function(res) {
        $scope.sliders = res.listSliders;
        $scope.listHotProjects = res.listHotProjects;
        $rootScope.newProducts = res.newProducts;
        console.log(res);

        setTimeout(() => {
            jQuery(".portfolio-details-carousel").owlCarousel({
                autoplay: true,
                dots: true,
                loop: true,
                items: 1
            });
        }, 200);
        // console.log('slider ', res);
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
            $scope.linkViewmore = 'nha-dat-ban';
            let filter_ban = {
                idCategory: "5f2cd118c5f37520ec555734",
                productType: 'hot',
            };
            if ($scope.key == "thue_hot") {
                $scope.linkViewmore = 'nha-dat-cho-thue';
                filter_ban.idCategory = "5f336b87ae16cf08a0b6ee6d";
            }
            GetHotProduct(filter_ban, $http, function(res) {
                $scope.productHot = res;

                setTimeout(function() {
                    // console.log(jQuery('.testimonial-img').eq(0).width());
                    jQuery("#" + $scope.key + " .testimonials-carousel").owlCarousel({
                        autoplay: true,
                        dots: false,
                        loop: true,
                        onInitialized: function(e) {
                            fixImgSlider($scope);
                        },
                        onRefreshed: function(e) {
                            fixImgSlider($scope);
                        },
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
                        }
                    });

                }, 100);

            })
        },

    }
}).directive('newProduct', function() {
    return {
        restrict: 'E',
        scope: {
            title: '@',
            key: "@",
        },
        templateUrl: '/tpls/main/product/directive-new-product.html',
        controller: function($scope, $compile, $http, $rootScope) {
            $scope.linkViewmore = '/san-pham-moi';
            $rootScope.$watch('newProducts', function() {
                $scope.newProducts = $rootScope.newProducts;
            }, true);
            // let filter_ban = {
            //     idCategoryType: "5f166a011ab04a0e50f990b3",
            //     skip: 0,
            //     limit: 6
            // };
            // GetHotProduct(filter_ban, $http, function(res) {
            //     $scope.newProducts = res;
            // })
        },

    }
});