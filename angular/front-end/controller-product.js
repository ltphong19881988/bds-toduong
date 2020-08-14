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
            jQuery('#big_img').on('load', function() {
                console.log('cac', jQuery('#big_img').width(), jQuery('#big_img').height());
            });
            console.log(jQuery('#big_img').attr('ng-src'));
            $(".gallery .owl-carousel").owlCarousel({
                autoPlay: false,
                navigation: true,
                autoHeight: true,
                autoWidth: true,
                margin: 10,
                transitionStyle: "fade"
            });
        }, 300);
    })

});