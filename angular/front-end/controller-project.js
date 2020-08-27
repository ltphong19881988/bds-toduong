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
                local: $routeParams.local,
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


app.controller("projectDetailCtrl", function($rootScope, $scope, $http, $compile, $routeParams) {
    $rootScope.pageTitle = "Bất động sản Tô Dương - ";
    console.log('key', $routeParams);
    // console.log('location', location.pathname);
    var abc = $routeParams.page.split('-pj');
    console.log('abc', abc);
    let params = {
        method: 'GET',
        url: '/project/name-key/' + 'pj' + abc[1],
    };
    submitFrontEnd(params, $http, function(res) {
        console.log('details project', res);
        $rootScope.pageTitle += res.projectContent.title;
        $scope.project = res;
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

        setTimeout(function() {
            $(".portfolio-details-carousel").owlCarousel({
                autoplay: true,
                dots: true,
                loop: true,
                items: 1,
                onInitialized: function(e) {
                    console.log('o a dep trai', $('.owl-loaded .owl-item').width());
                    $('.owl-loaded .owl-item').css('height', ($('.owl-loaded .owl-item').width() / 2 + 50) + 'px');
                    $('.owl-loaded .owl-item img')
                },
            });
        }, 500);
    })

    $scope.viewFullImg = function(src) {
        // console.log(src);
        $('body').append(`<div class="search-overly"><img src="` + src + `" style="width:98%; margin-left: 1%; margin-top: 60px;" /></div>`);
        $('body').prepend('<button type="button" class="popup-overlay-close"><i class="icofont-close"></i></button>');
    }

});