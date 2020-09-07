var initProvinceURL = function($scope, $compile, $http) {
    let params = {
        method: 'POST',
        url: '/admin/sector/filter-all',
        data: {
            type: "1"
        }
    }
    submitBackend(params, $http, function(provinces) {
        $scope.listProvinces = provinces;
    });
}

var initDistrictURL = function($scope, $compile, $http) {
    if (!$scope.province) return;
    let params = {
        method: 'POST',
        url: '/admin/sector/filter-all',
        data: {
            type: "2",
            provinceID: $scope.province.ID
        }
    }
    submitBackend(params, $http, function(districts) {
        $scope.listDistricts = districts;
    });
}

var initWardURL = function($scope, $compile, $http) {
    if (!$scope.province || !$scope.district) return;
    let params = {
        method: 'POST',
        url: '/admin/sector/filter-all',
        data: {
            type: "3",
            provinceID: $scope.province.ID,
            districtID: $scope.district.ID,
        }
    }
    submitBackend(params, $http, function(wards) {
        $scope.listWards = wards;
    });
}

var createUrlFromCateAndLocal = function($scope, local) {
    if ($scope.post) {
        if (!$scope.urlItem.local)
            $scope.urlItem['oneLvlUrl'] = $scope['post'].postContent.oneLvlUrl;
        else
            $scope.urlItem['oneLvlUrl'] = $scope['post'].postContent.oneLvlUrl + '-' + $scope.urlItem.local.link;
    } else {
        if ($scope.urlItem.local)
            $scope.urlItem['oneLvlUrl'] = $scope.urlItem.local.link;
    }

}

// ==================== One Level Url Controller ================

adminApp.controller("urlOneLevelCtrl", function($rootScope, $scope, $compile, $http, DTOptionsBuilder, DTColumnBuilder, DTColumnDefBuilder) {
    $rootScope.pageTitle = "Admin - urlOneLevelCtrl";
    jQuery('.card-footer .btn-danger').hide();
    jQuery('.card-footer .btn-info').hide();
    $scope.allUrlItem = [];
    $scope.urlItem = {};

    initCategory($scope, $compile, $http);
    initProvince($scope, $compile, $http);

    $scope.showHideCategory = function() {
        tonggleCategory();
    }

    $scope.selectCategory = function(e) {
        $scope.urlItem["idCategory"] = jQuery(e.currentTarget).data('id');
        jQuery('input[name="idCategory"]').val(jQuery(e.currentTarget).text());
        tonggleCategory();
        let params = {
            method: 'GET',
            url: '/admin/category/get-post-content/' + jQuery(e.currentTarget).data('id'),
        }
        submitBackend(params, $http, function(res) {
            // console.log('post content category', res);
            $scope['post'] = res;
            createUrlFromCateAndLocal($scope);
        });
    }

    $scope.selectedProvince = function($event, item) {
        $scope['selectedprovince'] = item.title;
        $scope['showlistprovince'] = false;
        $scope.urlItem['local'] = item;
        $scope['province'] = item;
        initDistrictURL($scope, $compile, $http);
        createUrlFromCateAndLocal($scope);
    }

    $scope.selectedDistrict = function($event, item) {
        $scope['selecteddistrict'] = item.title;
        $scope['showlistdistrict'] = false;
        $scope.urlItem['local'] = item;
        $scope['district'] = item;
        initWardURL($scope, $compile, $http);
        createUrlFromCateAndLocal($scope);
    }

    $scope.selectedWard = function($event, item) {
        $scope['selectedward'] = item.title;
        $scope['showlistward'] = false;
        $scope.urlItem['local'] = item;
        $scope['ward'] = item;
        createUrlFromCateAndLocal($scope);
    }

    $scope.submitOneLvlUrl = function(e, action) {
        $scope.urlItem.descriptions = CKEDITOR.instances['editorDescriptionUrl'].getData();
        $scope.urlItem.content = CKEDITOR.instances['editorContentUrl'].getData();
        console.log($scope.urlItem, action);

        let params = {
            method: 'POST',
            url: '/admin/one-lvl-url',
            data: $scope.urlItem
        }
        if (action == "edit") params.method = 'PUT';
        submitBackend(params, $http, function(res) {
            alert(res.mes);
            if (res.status == true) {
                window.location.reload();
            }
            console.log(res);
        });
        e.preventDefault();
    }


    $scope.preUpdate = function(item) {
        console.log(item);
        jQuery('.card-footer .btn-danger').show();
        jQuery('.card-footer .btn-info').show();
        jQuery('.card-footer .btn-success').hide();
        let params = {
            method: 'GET',
            url: '/admin/category/get-post-content/' + item.idCategory,
        }
        submitBackend(params, $http, function(res) {
            $scope['post'] = res;
        });
        $scope.urlItem = item;
        jQuery('input[name="idCategory"]').val(item.category.name);
        if (item.content) {
            setTimeout(() => {
                CKEDITOR.instances['editorDescriptionUrl'].setData(item.descriptions);
                CKEDITOR.instances['editorContentUrl'].setData(item.content);
            }, 200);

        }
        if (item.local.provinceID && item.local.provinceID != -1) {
            // console.log($scope.listProvinces);
            var checkProvince = $scope.listProvinces.filter(x => x.ID == item.local.provinceID)[0];
            // console.log('province selected', checkProvince);
            $scope['selectedprovince'] = checkProvince.title;
            $scope['showlistprovince'] = false;
            $scope['province'] = checkProvince;

            initDistrictURL($scope, $compile, $http);
            var listenerDistrict = $scope.$watch('listDistricts', function() {
                // console.log($scope.listDistricts, item.local.districtID, item.local.districtID)
                if ($scope.listDistricts && item.local.districtID) {
                    var checkDistrict;
                    if (item.local.districtID == -1)
                        checkDistrict = $scope.listDistricts.filter(x => x.ID == item.local.ID)[0];
                    else {
                        checkDistrict = $scope.listDistricts.filter(x => x.ID == item.local.districtID)[0];
                        $scope['district'] = checkDistrict;
                        initWardURL($scope, $compile, $http);
                        var listenerWard = $scope.$watch('listWards', function() {
                            if ($scope.listWards && item.local.ID) {
                                var checWard = $scope.listWards.filter(x => x.ID == item.local.ID)[0];
                                console.log('checWard', checWard);
                                $scope['selectedward'] = checWard.title;
                                $scope['showlistward'] = false;
                                $scope['ward'] = checWard;
                                jQuery('input[key="ward"]').val(checWard.title);
                                listenerWard();
                            }
                        })
                    }
                    console.log('checkDistrict', checkDistrict);
                    $scope['selecteddistrict'] = checkDistrict.title;
                    $scope['showlistdistrict'] = false;
                    jQuery('input[key="district"]').val(checkDistrict.title);
                    listenerDistrict();
                    // initWardURL($scope, $compile, $http);
                }

            });

        }
        // $scope.configKey = item.key;
        // $scope.configType = item.type;
        // $scope.configValue = item.value;
        // if (item.type == 'object') $scope.configValue = JSON.stringify(item.value);
    }

    $scope.cancelUpdateOneLvlUrl = function() {
        $scope.urlItem = {};
        CKEDITOR.instances['editorDescriptionUrl'].setData('');
        CKEDITOR.instances['editorContentUrl'].setData('');
        jQuery('.card-footer .btn-danger').hide();
        jQuery('.card-footer .btn-info').hide();
        jQuery('.card-footer .btn-success').show();
    }

    // Data table angularjs
    $scope.dtOptions = DTOptionsBuilder
        .newOptions()
        .withFnServerData((sSource, aoData, fnCallback, oSettings) => {
            oSettings.jqXHR = $http.post('/admin/all-one-lvl-url', {
                aoData
            }).then((data) => {
                fnCallback(data.data);
            });

        })
        .withOption('serverSide', true)
        .withOption('processing', true)
        .withOption('stateSave', true)
        // .withOption('headerCallback', function(header) {
        //     $compile(angular.element(header).contents())($scope);
        // })
        .withOption('bInfo', false)
        .withOption('searching', true)
        .withOption('createdRow', function(row, data, index) {
            $compile(row)($scope); //add this to compile the DOM
        })
        .withPaginationType('full_numbers')
        .withLightColumnFilter({
            '0': { html: 'input', type: 'datetime' },
            '1': { html: 'input', regexp: true, type: 'text', time: 500 },
            '2': { html: 'input', regexp: true, type: 'text', time: 500 },
            '3': { html: 'input', regexp: true, type: 'text', time: 500 },
        });
    // .withOption('order', [
    //     [1, 'asc'],
    //     [1, 'asc']
    // ])
    $scope.dtColumns = [
        DTColumnBuilder.newColumn('_id').withTitle('ID').notVisible(),
        DTColumnBuilder.newColumn('oneLvlUrl').withTitle('Đường link một cấp'),
        // DTColumnBuilder.newColumn('languageCode').withTitle('Ngôn ngữ'),
        DTColumnBuilder.newColumn('category.name').withTitle('Danh mục'),
        DTColumnBuilder.newColumn('local.title').withTitle('Khu vực').renderWith(function(data, type, full) {
            if (full.local && full.local.title) return full.local.title;
            else return '';
        }),
        DTColumnDefBuilder.newColumnDef(0).withTitle('Xử lý').withOption('width', '200px').renderWith(function(data, type, full) {
            $scope.allUrlItem[full._id] = full;
            var html = "<button class='btn btn-info' ng-click=\"preUpdate(allUrlItem['" + full._id + "'])\"> " + "Sửa" + "</button>";
            return html;
        }),
    ];



}).directive('autoCompleteUrl', function($timeout) {
    return function(scope, iElement, iAttrs) {
        // console.log(iElement, iAttrs);
        var key = iAttrs.key;
        var $scope = scope;

        jQuery('.showlist-' + key).clickOff(function() {
            // console.log(document.activeElement, iElement);
            if ($scope['showlist' + key] == true && document.activeElement != iElement.context) {
                // console.log('vo', $scope.listProvinces);
                if ($scope[key] && $scope[key].title)
                    $scope['selected' + key] = $scope[key].title;
                else if ($scope[key] && $scope[key].name)
                    $scope['selected' + key] = $scope[key].name;
                else
                    $scope['selected' + key] = undefined;
                $scope['showlist' + key] = false;
                $scope.$apply();
            }
        });

        iElement.bind("keypress", function(e) {
            scope['showlist' + key] = true;
        });
        iElement.bind("focus", function(e) {
            scope['showlist' + key] = true;

        })
    };
});;