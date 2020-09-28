var submitFrontEnd = function(params, $http, callback) {
    $http({
        method: params.method,
        url: params.url,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'x-access-token': curtoken
        },
        data: params.data,
        // beforeSend: function() {
        //     console.log('before')
        // },
        // complete: function() {
        //     console.log('complete')
        // }
    }).then(function successCallback(response) {
        callback(response.data);
    }, function errorCallback(response) {
        callback({ status: false });
    });
}


app.controller("postCategoryCtrl", function($rootScope, $scope, $http, $compile, $routeParams, $location, MetadataService) {
    $scope.loadingText = "Đang tải ...";
    $scope.pagination = {
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 0
    };
    if ($routeParams.p) $scope.pagination.currentPage = parseInt($routeParams.p);
    // console.log('location', location.pathname, '$routeParams', $routeParams);
    if (location.pathname == "/news") location.href = "/news/tin-tuc";

    let params = {
        method: 'POST',
        url: '/post/filter-url',
        data: {
            url: $routeParams.page,
            skip: ($scope.pagination.currentPage - 1) * $scope.pagination.itemsPerPage,
            limit: $scope.pagination.itemsPerPage,
        }
    };

    submitFrontEnd(params, $http, function(res) {
        console.log(res);

        if (res.status) {
            $scope.listPosts = res.listPost;
            $scope.postCategory = res.category;
            $scope.pagination.totalItems = res.totalCount;

            jQuery('html, body').animate({
                scrollTop: 0
            }, 1500, 'easeInOutExpo');
        } else {

        }

    })

    $scope.pageChanged = function() {
        console.log('Page changed to: ' + $scope.pagination.currentPage, location.pathname);
        params.data.skip = ($scope.pagination.currentPage - 1) * $scope.pagination.itemsPerPage;
        params.data.limit = $scope.pagination.itemsPerPage;
        $location.path(location.pathname).search({ p: $scope.pagination.currentPage });
        
    };

});