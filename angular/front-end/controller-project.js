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
    if (location.pathname == "/news") location.href = "/news/tin-tuc";

    let params = {
        method: 'POST',
        url: '/post/filter-url',
        data: {
            url: $routeParams.page,
        }
    };

    submitFrontEnd(params, $http, function(res) {
        console.log(res);
        if (res.status) {
            $scope.listPosts = res.listPost;
            $scope.postCategory = res.category;
        } else {

        }


    })

});