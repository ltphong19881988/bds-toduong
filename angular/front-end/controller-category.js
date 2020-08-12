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


app.controller("categoryCtrl", function($rootScope, $scope, $http, $compile, $routeParams, MetadataService) {
    $rootScope.pageTitle = "Bất động sản Tô Dương - Category";

    // console.log('location', location.pathname, location.pathname.replace(/\//g, ''));
    var extOpts = {};
    var path = location.pathname.replace('/', '').split('/');
    console.log('path', path, $scope.seoDescription);
    var url = path[0];

    let params = {
        method: 'POST',
        url: '/product/filter-url',
        data: {
            url: url,
        }
    };
    if (path.length == 5) {
        extOpts['acreage'] = path[1];
        extOpts['price'] = path[2];
        extOpts['room'] = path[3];
        extOpts['direction'] = path[4];
        params.data['extOpts'] = extOpts;
    } else {
        if (path.length > 1) location.href = "/" + url;
    }
    submitFrontEnd(params, $http, function(res) {
        console.log('result', res);
        $scope.cate = res.cate;
        $scope.cateContent = res.cateContent;
        $scope.searchForm["idCategory"] = $scope.cate._id;
        jQuery('input[name="idCategory"]').val($scope.cateContent.title);

        $scope.local = res.local;
        $scope.products = res.result;
        MetadataService.setMetaTags('description', $scope.cateContent.title);
        MetadataService.setMetaTags('keywords', $scope.cateContent.title);
        if (res.redirect) {
            var redirectLink = "";
            if (res.postContent) redirectLink += res.postContent.oneLvlUrl;
            if (res.local) {
                redirectLink += "-" + res.local.link;
            }
            if (path.length == 5) {
                redirectLink += '/' + path[1] + '/' + path[2] + '/' + path[3] + '/' + path[4];
            }
            console.log(redirectLink);
            window.location.href = '/' + redirectLink;
        }
    });


});