var getUserInfo = function($scope, $http, callback) {
    let params = {
        method: 'GET',
        url: '/user/user-info',
    };
    submitFrontEnd(params, $http, function(res) {
        callback(res);
    });
}
var getAllCountry = function($http, callback) {
    let params = {
        method: 'POST',
        url: '/countries/all',
        data: { type: 'country' }
    };
    submitFrontEnd(params, $http, function(res) {
        // console.log('all Country', res);
        callback(res);
    });
}

function compressImage(base64) {
    const canvas = document.createElement('canvas')
    const img = document.createElement('img')

    return new Promise((resolve, reject) => {
        img.src = base64;
        img.onload = function() {
            let width = img.width
            let height = img.height
            const maxHeight = 400
            const maxWidth = 400

            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height *= maxWidth / width))
                    width = maxWidth
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round((width *= maxHeight / height))
                    height = maxHeight
                }
            }
            canvas.width = width
            canvas.height = height

            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0, width, height)

            resolve(canvas.toDataURL('image/jpeg', 0.9))
        }
        img.onerror = function(err) {
            reject(err)
        }

    })
}

var setAutoCompleteCountry = function($scope, $timeout, $q) {
    if ($scope.userinfo.country) $scope.userinfo.country.value = $scope.userinfo.country.name.toLowerCase();
    $scope.ctrlCountry = { selectedItem: $scope.userinfo.country };
    $scope.ctrlCountry.searchText = $scope.userinfo.country.name;
    $scope.ctrlCountry.simulateQuery = false;
    $scope.ctrlCountry.isDisabled = false;
    $scope.ctrlCountry.repos = loadAll();
    $scope.ctrlCountry.querySearch = querySearch;
    $scope.ctrlCountry.selectedItemChange = selectedItemChange;
    $scope.ctrlCountry.searchTextChange = searchTextChange;

    function querySearch(query) {
        var results = query ? $scope.ctrlCountry.repos.filter(createFilterFor(query)) : $scope.ctrlCountry.repos,
            deferred;
        if ($scope.ctrlCountry.simulateQuery) {
            deferred = $q.defer();
            $timeout(function() { deferred.resolve(results); }, Math.random() * 1000, false);
            return deferred.promise;
        } else {
            return results;
        }
    }

    function searchTextChange(text) {
        // console.log('Text changed to ' + text);
    }

    function selectedItemChange(item) {
        $scope.userinfo.info.country = item;
    }

    function loadAll() {
        var repos = $scope.allCountry;
        repos.map(function(repo) {
            repo.value = repo.name.toLowerCase();
            return repo;
        });
        return repos;

    }

    function createFilterFor(query) {
        var lowercaseQuery = query.toLowerCase();
        return function filterFn(item) {
            return (item.name.indexOf(lowercaseQuery) >= 0);
        };

    }
}

app.controller("profilesCtrl", function($rootScope, $scope, $http, $translate, $location, $routeParams, $timeout, $q, $log, $compile) {
    $rootScope.pageTitle = "Bazanland - User Profiles";
    if ($location.$$path == '/user/profiles') {
        $rootScope.$watch('logedUser', function(value) {
            if (value) {
                $scope.userinfo = value;
                $rootScope.referralLink = location.host + "/register?refId=" + value.code;
                getAllCountry($http, function(countries) {
                    $scope.allCountry = countries;
                    setAutoCompleteCountry($scope, $http, $timeout, $q);
                })
            }
        })
        cancelP();
    }

    jQuery("#avatarBase64").change(function() {
        readFileToBase64(jQuery(this)[0], async function(result) {
            result = await compressImage(result);
            let params = {
                method: 'POST',
                url: '/user/change-avatar',
                data: {
                    result
                }
            };

            submitFrontEnd(params, $http, function(res) {
                $scope.userinfo.info.avatar = res.path;
                jQuery('#changeAvatar img').attr('src', result);
                jQuery('#changeAvatar img').attr('ng-src', result);
            });
        });
    });
    jQuery("#changeAvatar").hover(function() {
        jQuery("#changeAvatar button").show();
    });
    jQuery("#changeAvatar").mouseleave(function() {
        jQuery("#changeAvatar button").hide();
    });
    jQuery("#changeAvatar button").click(function() {
        jQuery("#avatarBase64").click();
    });

    function preP() {
        jQuery('.editProfiles').show();
        jQuery('.change-info .btn-info').hide();
        jQuery('.card-title .badge').hide();
    }

    $scope.preUpdateProfiles = function() {
        preP();
    }

    function cancelP() {
        jQuery('.editProfiles').hide();
        jQuery('.change-info .btn-info').show();
        jQuery('.card-title .badge').show();
    }

    $scope.cancelUpdate = function() {
        cancelP()
    }

    $scope.changePassword = function(form, event) {
        jQuery('#loadingModalTitle').html('Đang xử lý ....');
        jQuery("#loadingModal").modal('show');
        var formData = form.$$element.serialize();
        changePassword(formData, $http, function(res) {
            console.log(res);
            jQuery('#loadingModalTitle').html(res.mes);
            setTimeout(() => {
                jQuery("#loadingModal").modal('hide');
            }, 2000);
        });
        event.preventDefault();
    }

    $scope.formUpdateProfiles = function(e) {
        // setLoading($compile, $scope);
        jQuery('#loadingModalTitle').html('Đang xử lý ....');
        jQuery("#loadingModal").modal('show');
        let params = {
            method: 'POST',
            url: '/user/user-info',
            data: {
                info: $scope.userinfo.info,
                fullname: $scope.userinfo.fullname,
                bankInfo: $scope.userinfo.bankInfo,
            }
        };

        submitFrontEnd(params, $http, function(res) {
            jQuery('#loadingModalTitle').html(res.mes);
            cancelP();
            setTimeout(() => {
                jQuery("#loadingModal").modal('hide');
            }, 1000);

        });

        // var p1 = $q(function(resolve, reject) {
        //     submitFrontEnd(params, $http, function(res) {
        //         jQuery('#loadingModalTitle').html(res.mes);
        //         setTimeout(() => {
        //             jQuery("#loadingModal").modal('hide');
        //             resolve(res)
        //         }, 1000);

        //     });
        // });
        // p1.then((abc) => {
        //     console.log(abc);
        // })

        // e.preventDefault();
    }
});