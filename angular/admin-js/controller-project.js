jQuery.fn.clickOff = function(callback, selfDestroy) {
    var clicked = false;
    var parent = this;
    var destroy = selfDestroy || true;

    parent.click(function() {
        clicked = true;
    });

    jQuery(document).click(function(event) {
        if (!clicked) {
            callback(parent, event);
        }
        if (destroy) {
            //parent.clickOff = function() {};
            //parent.off("click");
            //$(document).off("click");
            //parent.off("clickOff");
        };
        clicked = false;
    });
};

var setAutoComplete = function(key, $scope, $compile, $http) {
    $scope['showlist' + key] = false;

    jQuery('.showlist-' + key).clickOff(function() {
        if ($scope['showlist' + key] == true) {
            if ($scope[key])
                $scope['selected' + key] = $scope[key].title;
            else
                $scope['selected' + key] = null;
            $scope['showlist' + key] = false;
            $scope.$apply();
        }
    });

    // $scope.clearList = function() {
    //     $scope['selected' + key] = null;
    //     $scope['showlist' + key] = false;
    // }

    $scope.selectedItem = function($event, item) {
        $scope['selected' + key] = item.title;
        $scope['showlist' + key] = false;
        $scope[key] = item;
        // console.log(item);
        if (key == 'province')
            initDistrict($scope, $compile, $http);
    }
}

var initProvince = function($scope, $compile, $http) {
    let params = {
        method: 'POST',
        url: '/admin/sector/filter-all',
        data: {
            type: "1"
        }
    }
    submitBackend(params, $http, function(provinces) {
        $scope.listProvinces = provinces;
        // setAutoComplete('province', $scope, $compile, $http);
    });
}

var initDistrict = function($scope, $compile, $http) {
    if (!$scope.projectItem.province) return;
    let params = {
        method: 'POST',
        url: '/admin/sector/filter-all',
        data: {
            type: "2",
            provinceID: $scope.projectItem.province.ID
        }
    }
    submitBackend(params, $http, function(districts) {
        // setAutoComplete('district', $scope, $compile, $http);
        $scope.listDistricts = districts;
    });
}

var initWard = function($scope, $compile, $http) {
    if (!$scope.projectItem.province || !$scope.projectItem.district) return;
    let params = {
        method: 'POST',
        url: '/admin/sector/filter-all',
        data: {
            type: "3",
            provinceID: $scope.projectItem.province.ID,
            districtID: $scope.projectItem.district.ID,
        }
    }
    submitBackend(params, $http, function(wards) {
        // setAutoComplete('district', $scope, $compile, $http);
        $scope.listWards = wards;
    });
}

var initDirecton = function($scope, $compile, $http) {
    let params = {
        method: 'POST',
        url: '/admin/product-type/filter-all',
        data: {
            groupType: "huong-nha",
        }
    }
    submitBackend(params, $http, function(directions) {
        $scope.listDirections = directions;
    });
}


adminApp.controller("projectCtrl", function($rootScope, $scope, $http, $compile, $routeParams, DTOptionsBuilder, DTColumnBuilder, DTColumnDefBuilder) {
    // console.log($routeParams);
    $scope.rootFolderPath = 'public/uploads/media/';
    $scope.acviteFolderPath = 'public/uploads/media/';
    $scope.checkSelect = 0;
    $scope.listGallerySelect = [];
    $scope.listImgsPost = [];
    if ($routeParams.action == "add") $rootScope.pageTitle = "Admin - Thêm mới sản phẩm";
    if ($routeParams.action == "edit") {
        $rootScope.pageTitle = "Admin - Sửa sản phẩm";
        let params = {
            method: 'GET',
            url: '/admin/project/item/' + $routeParams.projectId,
        }
        submitBackend(params, $http, function(res) {
            console.log('get project item', res);
            if (res.hot == true) {
                $scope.checkHot = true;
            }
            if (res.visible == 1) $scope.checkVisible = true;
            $scope.projectItem = res;
            if (res && res.projectContent) {
                setTimeout(() => {
                    CKEDITOR.instances['editorDescription'].setData(res.projectContent.descriptions);
                    CKEDITOR.instances['editorContent'].setData(res.projectContent.content);
                }, 100);

            }

            if ($scope.projectItem.province)
                $scope['selectedprovince'] = $scope.projectItem.province.title;
            if ($scope.projectItem.district)
                $scope['selecteddistrict'] = $scope.projectItem.district.title;
            if ($scope.projectItem.ward)
                $scope['selectedward'] = $scope.projectItem.ward.title;
            if ($scope.projectItem.direction)
                $scope['selecteddirection'] = $scope.projectItem.direction.name;

        });
    }

    if ($routeParams.action != null) {
        $scope.projectItem = {};
        initProvince($scope, $compile, $http);
        initDirecton($scope, $compile, $http);

        uploadListener(jQuery("#prepareBtn"), jQuery("#uploadProcess"), $compile, $scope, $http);
        // remove pic from projects img
        selectedImgRemoveListener("#projectImgs .divImg .fa-close");

        $scope.addImgsToPost = function() {
            jQuery("#uploadModal button.close").click();
            appendSelectedImg(jQuery("#projectImgs"), jQuery("#uploadProcess ul li img"), 'name');
        }

        // Click to Open modal get pics from gallery
        jQuery(document).on("click", "#formAddProject button[data-target='#galleryModal']", function() {
            selectChangeListener($scope, $http, $compile);
        })

        // Event click slect or diselect images from modal gallery list
        jQuery(document).on("click", "#galleryModal #listFiles li", function(e) {
                var abc = jQuery(this).find('img').eq(0).attr('src');
                if ($scope.listGallerySelect.indexOf(abc) == -1) {
                    $scope.listGallerySelect.push(abc);
                    jQuery(e.currentTarget).addClass('selected');
                } else {
                    $scope.listGallerySelect.splice($scope.listGallerySelect.indexOf(abc), 1);
                    jQuery(this).removeClass('selected');
                };
                // console.log($scope.listGallerySelect);
            })
            // Event submit selected images from gallery and add images to main add project content

        jQuery(document).on("click", "#galleryModal .btn-primary", function() {

        })

        jQuery("select[name='folderName']").change(function() {
            var abc = jQuery(this).val();
            if (abc != '') abc += "/";
            $scope.acviteFolderPath = $scope.rootFolderPath + abc;
            selectChangeListener($scope, $http, $compile);
        });

        $scope.selectedProvince = function($event, item) {
            $scope['selectedprovince'] = item.title;
            $scope['showlistprovince'] = false;
            $scope.projectItem['province'] = item;
            initDistrict($scope, $compile, $http);
        }

        $scope.selectedDistrict = function($event, item) {
            $scope['selecteddistrict'] = item.title;
            $scope['showlistdistrict'] = false;
            $scope.projectItem['district'] = item;
            initWard($scope, $compile, $http);
        }

        $scope.selectedWard = function($event, item) {
            $scope['selectedward'] = item.title;
            $scope['showlistward'] = false;
            $scope.projectItem['ward'] = item;
        }

        $scope.selectedDirection = function($event, item) {
            $scope['selecteddirection'] = item.name;
            $scope['showlistdirection'] = false;
            $scope.projectItem['direction'] = item;
        }

    } else {
        $scope.dtOptions = DTOptionsBuilder.newOptions()
            .withFnServerData((sSource, aoData, fnCallback, oSettings) => {
                oSettings.jqXHR = $http.post('/admin/project/all-project', {
                    aoData
                }).then((data) => {
                    fnCallback(data.data);
                });
            })
            .withOption('serverSide', true)
            .withOption('processing', true)
            .withOption('stateSave', true)
            .withOption('bInfo', false)
            .withOption('searching', true)
            // .withOption('order', [
            //     [0, 'asc'],
            //     [1, 'asc']
            // ])
            .withOption('createdRow', function(row, data, index) {
                $compile(row)($scope); //add this to compile the DOM
            })
            .withPaginationType('full_numbers')
            .withLightColumnFilter({
                '0': { html: 'input', type: 'datetime' },
                '1': {
                    html: 'select',
                    values: [{
                        value: '',
                        label: 'Tất cả'
                    }, {
                        value: false,
                        label: 'Thường'
                    }, {
                        value: true,
                        label: 'Hot'
                    }],
                    width: '80px'
                },
                '2': { html: 'input', regexp: true, type: 'text', time: 500 },
                // '3': { html: 'input', regexp: true, type: 'datetime' },
                '3': { html: 'input', regexp: true, type: 'text', time: 1000 },
                '4': { html: 'input', regexp: true, type: 'text', time: 1000 },
                '5': { html: 'input', regexp: true, type: 'text' },
                '6': {
                    html: 'select',
                    values: [{
                        value: '',
                        label: 'Tất cả'
                    }, {
                        value: 0,
                        label: 'Ẩn'
                    }, {
                        value: 1,
                        label: 'Hiện'
                    }]
                },
            });

        $scope.dtColumns = [
            DTColumnBuilder.newColumn('_id').withTitle('ID').notVisible(),
            // DTColumnBuilder.newColumn('nameKey').withTitle('Mã'),
            DTColumnBuilder.newColumn('hot').withTitle('Hot'),
            DTColumnBuilder.newColumn('title').withTitle('Tiêu đề').withOption('width', '35%'),
            // DTColumnBuilder.newColumn('datecreate').withTitle('Ngày tạo').renderWith(function(data, type, full) {
            //     return moment(new Date(full.datecreate)).format('DD-MM-YYYY');
            // }),
            DTColumnBuilder.newColumn('province.title').withTitle('Tỉnh thành'),
            DTColumnBuilder.newColumn('district.title').withTitle('Quận huyện'),
            DTColumnBuilder.newColumn('datecreate').withTitle('Ngày đăng').renderWith(function(data, type, full) {
                return moment(new Date(full.datecreate)).format('DD-MM-YYYY');
            }),
            DTColumnBuilder.newColumn('visible').withTitle('Ẩn/Hiện').renderWith(function(data, type, full) {
                if (full.visible == 1) return '<div style="text-align:center;"><i class="fa fa-check-circle green" aria-hidden="true"></i></div>';
                if (full.visible == 0) return '<div style="text-align:center;"><i class="fa fa-minus-circle red" aria-hidden="true"></i></div>';
            }),
            DTColumnDefBuilder.newColumnDef(0).withTitle('Xử lý').renderWith(render),
        ];

        function render(data, type, full) {
            return ' <button class="btn btn-primary" ng-click="goToEdit(\'' + full._id + '\');"> ' + "EDIT" + '</button>';
        }
    }

    $scope.goToEdit = function(id) {
        // console.log(id);
        window.location = '/admin/project/' + id + '/edit';
    }

    $scope.submitProject = function(e) {
        // $scope.projectItem.idCategoryType = "5f166a011ab04a0e50f990b3";
        $scope.projectItem.projectContent.descriptions = CKEDITOR.instances['editorDescription'].getData();
        $scope.projectItem.projectContent.content = CKEDITOR.instances['editorContent'].getData();
        var ImgElements = jQuery("#projectImgs .divImg img");
        if ($scope.checkHot && $scope.checkHot == true) {
            $scope.projectItem.hot = true;
        } else {
            $scope.projectItem.hot = false;
        }
        if ($scope.checkVisible && $scope.checkVisible == true) {
            $scope.projectItem.visible = 1;
        } else {
            $scope.projectItem.visible = 0;
        }

        $scope.projectItem.pictures = [];
        for (var i = 0; i < ImgElements.length; i++) {
            console.log(ImgElements.eq(i).attr('src'));
            $scope.projectItem.pictures.push(ImgElements.eq(i).attr('src'));
        }
        let params = {
            method: 'POST',
            url: '/admin/project/item',
            data: {
                project: $scope.projectItem
            }
        }
        if ($routeParams.action == "edit") params.method = "PUT";
        console.log(params);
        submitBackend(params, $http, function(res) {
            alert(res.mes);
            if (res.status == true) {
                window.location.reload();
            }
            console.log(res);
            // setAutoComplete('province', $scope, $compile, $http);
        });
        e.preventDefault();
    }





}).directive('autoComplete', function($timeout) {
    return function(scope, iElement, iAttrs) {
        // console.log(iElement, iAttrs);
        var key = iAttrs.key;
        var $scope = scope;

        jQuery('.showlist-' + key).clickOff(function() {
            // console.log(document.activeElement, iElement);
            if ($scope['showlist' + key] == true && document.activeElement != iElement.context) {
                // console.log('vo', $scope.listProvinces);
                if ($scope.projectItem[key] && $scope.projectItem[key].title)
                    $scope['selected' + key] = $scope.projectItem[key].title;
                else if ($scope.projectItem[key] && $scope.projectItem[key].name)
                    $scope['selected' + key] = $scope.projectItem[key].name;
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
});