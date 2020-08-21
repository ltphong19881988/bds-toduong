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


app.controller("oneContentCtrl", function($rootScope, $scope, $http, $compile, $routeParams, MetadataService) {
    $rootScope.pageTitle = "Bất động sản Tô Dương - Dự án";

    console.log('location', location.pathname, '$routeParams', $routeParams);

    let params = {
        method: 'POST',
        url: '/one-content',
        data: {
            url: location.pathname.replace('/', ''),
        }
    };

    submitFrontEnd(params, $http, function(res) {
        console.log(res);
        if (res.status) {
            $scope.oneContent = res.oneContent;
        } else {

        }


    })

});