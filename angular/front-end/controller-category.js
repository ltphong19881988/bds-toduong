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
};

var filterUrlCategory = function(params, $rootScope, $scope, $http, MetadataService) {
    submitFrontEnd(params, $http, function(res) {
        console.log('result', res);
        if (params.data.url.indexOf('san-pham-moi') == 0) {
            $scope['cateContent'] = { oneLvlUrl: 'san-pham-moi', title: "Sản phẩm mới" };
            MetadataService.setMetaTags('description', $scope.cateContent.title);
            MetadataService.setMetaTags('keywords', $scope.cateContent.title);
            $scope.products = res;
        } else {
            $scope.cate = res.cate;
            $scope.cateContent = res.cateContent;
            console.log('description', $rootScope['flagSeoInfo']);
            if ($rootScope['flagSeoInfo'] == false) {
                MetadataService.setMetaTags('description', $scope.cateContent.seoDescriptions);
                MetadataService.setMetaTags('keywords', $scope.cateContent.seoKeyWord);
                $rootScope.pageTitle = $rootScope['webName'] + ' - ' + $scope.cateContent.title;
            }

            localStorage.setItem('nearestCate', JSON.stringify(res.cateContent));
            $scope.searchForm["idCategory"] = $scope.cate._id;
            jQuery('input[name="idCategory"]').val($scope.cateContent.title);

            $scope.local = res.local;
            $scope.products = res.results;
            if ($scope.products.length == 0) $scope.loadingText = "Không có sản phẩm phù hợp";
            $scope.pagination.totalItems = res.totalCount;

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
        }

    });
};


app.controller("categoryCtrl", function($rootScope, $scope, $http, $compile, $routeParams, $location, MetadataService) {

    $scope.loadingText = "Đang tải ...";
    $scope.pagination = {
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 0
    };
    if ($routeParams.p) $scope.pagination.currentPage = parseInt($routeParams.p);
    console.log('location', location.pathname, location.pathname.replace(/\//g, ''));
    var extOpts = {};
    var path = location.pathname.replace('/', '').split('/');
    // console.log('path', path, $routeParams);
    var url = path[0];

    let params = {
        method: 'POST',
        url: '/product/filter-url',
        data: {
            url: url,
            skip: ($scope.pagination.currentPage - 1) * $scope.pagination.itemsPerPage,
            limit: $scope.pagination.itemsPerPage,
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

    filterUrlCategory(params, $rootScope, $scope, $http, MetadataService);

    $scope.pageChanged = function() {
        console.log('Page changed to: ' + $scope.pagination.currentPage, location.pathname);
        params.data.skip = ($scope.pagination.currentPage - 1) * $scope.pagination.itemsPerPage;
        params.data.limit = $scope.pagination.itemsPerPage;
        $location.path(location.pathname).search({ p: $scope.pagination.currentPage });
    };

});