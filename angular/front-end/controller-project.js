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


app.controller("projectCtrl", function($rootScope, $scope, $http, $compile, $routeParams, MetadataService) {
    $rootScope.pageTitle = "Bất động sản Tô Dương - Dự án";

    console.log('location', location.pathname, '$routeParams', $routeParams);
    // if (location.pathname == "/news") location.href = "/news/tin-tuc";
    if ($routeParams.page == null) {
        $scope.pagination = {
            currentPage: 1,
            itemsPerPage: 10,
            totalItems: 0
        };
        let params = {
            method: 'POST',
            url: '/project/filter-url',
            data: {
                url: $routeParams.page,
                skip: ($scope.pagination.currentPage - 1) * $scope.pagination.itemsPerPage,
                limit: $scope.pagination.itemsPerPage,
            }
        };

        submitFrontEnd(params, $http, function(res) {
            console.log(res);
            if (res.status) {
                $scope.listProject = res.results;
                // MetadataService.setMetaTags('description', $scope.cateContent.title);
                // MetadataService.setMetaTags('keywords', $scope.cateContent.title);
                if ($scope.listProject.length == 0) $scope.loadingText = "Không có dự án phù hợp";
                $scope.pagination.totalItems = res.totalCount;
            } else {

            }


        })
    }


});