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


app.controller("postDetailCtrl", function($rootScope, $scope, $http, $compile, $routeParams) {
    $rootScope.pageTitle = "Bất động sản Tô Dương";
    // console.log('category', $routeParams);
    // console.log('location', location.pathname);
    var abc = location.pathname.split('-nr');
    console.log('abc', abc);
    let params = {
        method: 'GET',
        url: '/post/name-key/' + 'nr' + abc[1],
    };
    submitFrontEnd(params, $http, function(res) {
        console.log('details', res);
        $rootScope.pageTitle += ' - ' + res.postContent.title;
        $scope.post = res;
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

    })


});