var shiftCategoryArr = function(arr, $scope, $compile) {
    var p = new Promise((resolve, reject) => {
        // console.log(arr[0].idParent);
        if (!arr[0].idParent) {
            arr[0].idParent = "null";
        }
        // html = `<li ng-click="selectCategory('` + arr[0]._id + `')" > ` + arr[0].name + `</li><li>` +
        //     `<div class="node" parent="` + arr[0]._id + `" >
        //                     <ul style="list-style: none;">
        //                     </ul>
        //                 </div>
        //             </li>`;
        html = `<li ng-click="selectCategory($event)" data-id="` + arr[0]._id + `"> ` + arr[0].name + `</li><li>` +
            `<div class="node" parent="` + arr[0]._id + `" >
                            <ul style="list-style: none;">
                            </ul>
                        </div>
                    </li>`;
        var webEle = jQuery('.node[parent="' + arr[0].idParent + '"] > ul');
        resolve(angular.element(webEle).append($compile(html)($scope)));
    })

    p.then(() => {
        arr.shift();
        if (arr.length == 0) {
            jQuery('div.node').each(function() {
                if (jQuery(this).find('ul li').length == 0) {
                    jQuery(this).parent().hide();
                }
            })
            return;
        } else {
            shiftCategoryArr(arr, $scope, $compile);
        }
    })

}

var initCategory = function($scope, $compile, $http) {
    let params = {
        method: 'GET',
        url: '/admin/category/all-category?idCategoryType=5f166a011ab04a0e50f990b3',
    }
    submitBackend(params, $http, function(res) {
        // console.log('all category', res);
        $scope.arrCategory = res;
        var html = `
            <div class="node" parent="null" >
                <ul style="list-style: none;">
                </ul>
            </div>
            `;
        angular.element("#listCategory").append($compile(html)($scope));
        shiftCategoryArr(res, $scope, $compile);
    });
}

var tonggleCategory = function() {
    if (!isVisible(jQuery("#formAddProduct div#listCategory")[0])) jQuery("#formAddProduct div#listCategory").show();
    else jQuery("#formAddProduct div#listCategory").hide();
}

var loopSelectedCategory = function(idParent, arrCate) {
    var abc = arrCate.filter(element => element.idParent == idParent);
    if (abc.length > 0) {
        loopSelectedCategory(abc[0]._id, arrCate);
    } else {
        var xyz = arrCate.filter(element => element._id == idParent)[0];
        jQuery('input[name="idCategory"]').val(xyz.name);
    }
}

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
    if (!$scope.productItem.province) return;
    let params = {
        method: 'POST',
        url: '/admin/sector/filter-all',
        data: {
            type: "2",
            provinceID: $scope.productItem.province.ID
        }
    }
    submitBackend(params, $http, function(districts) {
        // setAutoComplete('district', $scope, $compile, $http);
        $scope.listDistricts = districts;
    });
}

var initWard = function($scope, $compile, $http) {
    if (!$scope.productItem.province || !$scope.productItem.district) return;
    let params = {
        method: 'POST',
        url: '/admin/sector/filter-all',
        data: {
            type: "3",
            provinceID: $scope.productItem.province.ID,
            districtID: $scope.productItem.district.ID,
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

var initProductType = function($scope, $compile, $http) {
    let params = {
        method: 'POST',
        url: '/admin/product-type/filter-all',
        data: {
            groupType: "productType",
        }
    }
    submitBackend(params, $http, function(productType) {
        // console.log('productType', productType);
        $scope.productTypeHot = productType.filter(type => type.value == 'hot')[0];
    });
}

adminApp.controller("productCtrl", function($rootScope, $scope, $http, $compile, $routeParams, DTOptionsBuilder, DTColumnBuilder, DTColumnDefBuilder) {
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
            url: '/admin/product/item/' + $routeParams.productId,
        }
        submitBackend(params, $http, function(res) {
            console.log('get product item', res);
            if (res.productType && res.productType.filter(type => type.value == 'hot').length > 0) {
                $scope.checkHot = true;
            }
            if (res.visible == 1) $scope.checkVisible = true;
            $scope.productItem = res;
            if (res && res.productContent) {
                CKEDITOR.instances['editorDescription'].setData(res.productContent.descriptions);
                CKEDITOR.instances['editorContent'].setData(res.productContent.content);
            }
            loopSelectedCategory(null, $scope.productItem.category);
            if ($scope.productItem.province)
                $scope['selectedprovince'] = $scope.productItem.province.title;
            if ($scope.productItem.district)
                $scope['selecteddistrict'] = $scope.productItem.district.title;
            if ($scope.productItem.ward)
                $scope['selectedward'] = $scope.productItem.ward.title;
            if ($scope.productItem.direction)
                $scope['selecteddirection'] = $scope.productItem.direction.name;
            jQuery('#productCategory option').text(res.category.name);
            jQuery('#productCategory option').val(res.category._id);
        });
    }

    if ($routeParams.action != null) {
        $scope.productItem = {};
        initCategory($scope, $compile, $http);
        initProvince($scope, $compile, $http);
        initDirecton($scope, $compile, $http);
        initProductType($scope, $compile, $http);

        uploadListener(jQuery("#prepareBtn"), jQuery("#uploadProcess"), $compile, $scope, $http);
        // remove pic from products img
        selectedImgRemoveListener("#productImgs .divImg .fa-close");

        $scope.addImgsToPost = function() {
            jQuery("#uploadModal button.close").click();
            appendSelectedImg(jQuery("#productImgs"), jQuery("#uploadProcess ul li img"), 'name');
        }

        // Click to Open modal get pics from gallery
        jQuery(document).on("click", "#formAddProduct button[data-target='#galleryModal']", function() {
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
            // Event submit selected images from gallery and add images to main add product content

        jQuery(document).on("click", "#galleryModal .btn-primary", function() {

        })

        jQuery("select[name='folderName']").change(function() {
            var abc = jQuery(this).val();
            if (abc != '') abc += "/";
            $scope.acviteFolderPath = $scope.rootFolderPath + abc;
            selectChangeListener($scope, $http, $compile);
        })

        $scope.showHideCategory = function() {
            // jQuery("div.node")[0] is type HTML Element, jQuery("div.node").eq(0) is not T__T
            tonggleCategory();
        }

        $scope.selectCategory = function(e) {
            $scope.productItem["idCategory"] = [jQuery(e.currentTarget).data('id')];
            jQuery('input[name="idCategory"]').val(jQuery(e.currentTarget).text());

            var listParent = jQuery(e.currentTarget).parents('.node');
            for (var i = 0; i < listParent.length; i++) {
                if (listParent.eq(i).attr('parent') != "null")
                    $scope.productItem["idCategory"].push(listParent.eq(i).attr('parent'));
            }
            tonggleCategory();
            console.log($scope.productItem);
        }

        $scope.selectedProvince = function($event, item) {
            $scope['selectedprovince'] = item.title;
            $scope['showlistprovince'] = false;
            $scope.productItem['province'] = item;
            initDistrict($scope, $compile, $http);
        }

        $scope.selectedDistrict = function($event, item) {
            $scope['selecteddistrict'] = item.title;
            $scope['showlistdistrict'] = false;
            $scope.productItem['district'] = item;
            initWard($scope, $compile, $http);
        }

        $scope.selectedWard = function($event, item) {
            $scope['selectedward'] = item.title;
            $scope['showlistward'] = false;
            $scope.productItem['ward'] = item;
        }

        $scope.selectedDirection = function($event, item) {
            $scope['selecteddirection'] = item.name;
            $scope['showlistdirection'] = false;
            $scope.productItem['direction'] = item;
        }

    } else {
        $scope.dtOptions = DTOptionsBuilder.newOptions()
            .withFnServerData((sSource, aoData, fnCallback, oSettings) => {
                oSettings.jqXHR = $http.post('/admin/product/all-product', {
                    aoData
                }).then((data) => {
                    fnCallback(data.data);
                });
            })
            .withOption('serverSide', true)
            .withOption('processing', true)
            .withOption('stateSave', true)
            .withOption('bInfo', false)
            .withOption('searching', false)
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
                '1': { html: 'input', regexp: true, type: 'text', time: 500 },
                '2': { html: 'input', regexp: true, type: 'text', time: 500 },
                // '3': { html: 'input', regexp: true, type: 'datetime' },
                '3': { html: 'input', regexp: true, type: 'text', time: 500 },
                '4': { html: 'input', regexp: true, type: 'text', time: 500 },
                '5': { html: 'input', regexp: true, type: 'text' },
                '6': { html: 'input', regexp: true, type: 'text' },
            });

        $scope.dtColumns = [
            DTColumnBuilder.newColumn('_id').withTitle('ID').notVisible(),
            // DTColumnBuilder.newColumn('nameKey').withTitle('Mã'),
            DTColumnBuilder.newColumn('productType').withTitle('Loại BDS').renderWith(function(data, type, full) {
                var text = '';
                full.productType.forEach(element => {
                    text += element.value + ', '
                });
                return text;
            }),
            DTColumnBuilder.newColumn('title').withTitle('Tiêu đề').withOption('width', '35%'),
            DTColumnBuilder.newColumn('categoryName').withTitle('Danh mục'),
            // DTColumnBuilder.newColumn('datecreate').withTitle('Ngày tạo').renderWith(function(data, type, full) {
            //     return moment(new Date(full.datecreate)).format('DD-MM-YYYY');
            // }),
            DTColumnBuilder.newColumn('province.title').withTitle('Tỉnh thành'),
            DTColumnBuilder.newColumn('district.title').withTitle('Quận huyện'),
            DTColumnBuilder.newColumn('datecreate').withTitle('Ngày đăng').renderWith(function(data, type, full) {
                return moment(new Date(full.datecreate)).format('DD-MM-YYYY');
            }),
            DTColumnDefBuilder.newColumnDef(0).withTitle('Xử lý').renderWith(render),
        ];

        function render(data, type, full) {
            return ' <button class="btn btn-primary" ng-click="goToEdit(\'' + full._id + '\');"> ' + "EDIT" + '</button>';
        }
    }

    $scope.goToEdit = function(id) {
        // console.log(id);
        window.location = '/admin/product/' + id + '/edit';
    }

    $scope.submitProduct = function(e) {
        $scope.productItem.idCategoryType = "5f166a011ab04a0e50f990b3";
        $scope.productItem.productContent.descriptions = CKEDITOR.instances['editorDescription'].getData();
        $scope.productItem.productContent.content = CKEDITOR.instances['editorContent'].getData();
        var ImgElements = jQuery("#productImgs .divImg img");
        if ($scope.checkHot && $scope.checkHot == true) {
            $scope.productItem.productType = [$scope.productTypeHot];
        } else {
            $scope.productItem.productType = [];
        }
        if ($scope.checkVisible && $scope.checkVisible == true) {
            $scope.productItem.visible = 1;
        } else {
            $scope.productItem.visible = 0;
        }

        $scope.productItem.pictures = [];
        for (var i = 0; i < ImgElements.length; i++) {
            console.log(ImgElements.eq(i).attr('src'));
            $scope.productItem.pictures.push(ImgElements.eq(i).attr('src'));
        }
        let params = {
            method: 'POST',
            url: '/admin/product/item',
            data: {
                product: $scope.productItem
            }
        }
        if ($routeParams.action == "edit") params.method = "PUT";
        // console.log(params);
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
                if ($scope.productItem[key] && $scope.productItem[key].title)
                    $scope['selected' + key] = $scope.productItem[key].title;
                else if ($scope.productItem[key] && $scope.productItem[key].name)
                    $scope['selected' + key] = $scope.productItem[key].name;
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