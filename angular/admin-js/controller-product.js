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
    return new Promise((resolve) => {
        let params = {
            method: 'GET',
            url: '/admin/category/all-category?idCategoryType=5f166a011ab04a0e50f990b3',
        }
        submitBackend(params, $http, function(res) {
            $scope.arrCategory = res;
            var xxx = [...res];
            $scope.arrCategoryTemp = xxx;
            // console.log('all category', $scope.arrCategory);
            var html = `
            <div class="node" parent="null" >
                <ul style="list-style: none;">
                </ul>
            </div>
            `;
            angular.element("#listCategory").append($compile(html)($scope));
            resolve();
            shiftCategoryArr(res, $scope, $compile);
        });
    })

}

var tonggleCategory = function() {
    if (!isVisible(jQuery("div#listCategory")[0])) jQuery("div#listCategory").show();
    else jQuery("div#listCategory").hide();
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
    return new Promise((resolve) => {
        let params = {
            method: 'POST',
            url: '/admin/sector/filter-all',
            data: {
                type: "1"
            }
        }
        submitBackend(params, $http, function(provinces) {
            $scope.listProvinces = provinces;
            resolve()
                // setAutoComplete('province', $scope, $compile, $http);
        });
    });

}

var initDistrict = function($scope, $compile, $http) {
    // if (!$scope.productItem.province) return;
    if (!$scope.selectedprovince) return;
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
    return new Promise((resolve) => {
        let params = {
            method: 'POST',
            url: '/admin/product-type/filter-all',
            data: {
                groupType: "huong-nha",
            }
        }
        submitBackend(params, $http, function(directions) {
            $scope.listDirections = directions;
            resolve();
        });
    });

}

var initProductType = function($scope, $compile, $http) {
    return new Promise((resolve) => {
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
            resolve();
        });
    });

}

adminApp.controller("productCtrl", function($rootScope, $scope, $http, $compile, $routeParams, DTOptionsBuilder, DTColumnBuilder, DTColumnDefBuilder) {
    // console.log($routeParams);
    $scope.rootFolderPath = 'public/uploads/media/';
    $scope.acviteFolderPath = 'public/uploads/media/';
    $scope.checkSelect = 0;
    $scope.listGallerySelect = [];
    $scope.listImgsPost = [];

    if ($routeParams.action != null) {
        $scope.productItem = { pictures: [], productContent: { seoSocial: {} } };
        $scope.tempImage = [];
        var promiseF = [];
        promiseF.push(initCategory($scope, $compile, $http));
        promiseF.push(initProvince($scope, $compile, $http));
        promiseF.push(initDirecton($scope, $compile, $http));
        promiseF.push(initProductType($scope, $compile, $http));
        // IF this is ADD product
        if ($routeParams.action == "add") {
            // $scope.productItem = {};
            var xxx = localStorage.getItem('addProductTemp');
            if (xxx && xxx.length > 50) {
                $scope.productItem = JSON.parse(xxx);
                console.log('tìm nháp addProductTemp', $scope.productItem);
            }
            $rootScope.pageTitle = "Admin - Thêm mới sản phẩm";
            var listenerTemProduct = setInterval(function() {
                if ($scope.productItem.productContent.title && $scope.productItem.idCategory.length > 0) {
                    var xxx = JSON.stringify($scope.productItem);

                    localStorage.setItem("addProductTemp", xxx);
                    clearInterval(listenerTemProduct);
                }
            }, 60000);
        }
        // IF this is EDIT product
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
                    setTimeout(() => {
                        CKEDITOR.instances['editorDescription'].setData(res.productContent.descriptions);
                        CKEDITOR.instances['editorContent'].setData(res.productContent.content);
                    }, 1000);
                    if (!$scope.productItem.productContent.seoSocial) {
                        $scope.productItem.productContent.seoSocial = {};
                    }
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
        Promise.all(promiseF).then(() => {

            if ($routeParams.action == "add" && JSON.stringify($scope.productItem).length > 50) {
                console.log($scope.productItem);
                if ($scope.productItem.province)
                    $scope['selectedprovince'] = $scope.productItem.province.title;
                if ($scope.productItem.district)
                    $scope['selecteddistrict'] = $scope.productItem.district.title;
                if ($scope.productItem.ward)
                    $scope['selectedward'] = $scope.productItem.ward.title;
                if ($scope.productItem.direction)
                    $scope['selecteddirection'] = $scope.productItem.direction.name;
                // console.log('$scope.arrCategoryTemp', $scope.arrCategoryTemp);
                var xyz = $scope.arrCategoryTemp.filter(element => element._id == $scope.productItem.idCategory[0])[0];
                jQuery('input[name="idCategory"]').val(xyz.name);

                $scope.$apply();
            }
        })

        jQuery('#uploadProcess .btn-success').prop('disabled', true);




        // Click to Open modal get pics from gallery
        // Event submit selected images from gallery and add images to main add product content
        jQuery(document).on("click", "#formAddProduct button[data-target='#galleryModal']", function() {
            $scope['elementAddImgs'] = jQuery(this).data('content');
            jQuery("#galleryModal .modal-footer .btn-primary").prop('disabled', false);
            selectChangeListener($scope, $http, $compile);
        })

        $scope.addImgsToProduct = function(e) {
            jQuery(e.currentTarget).prop('disabled', true);
            jQuery("#galleryModal button.close").click();
            appendSelectedImg(jQuery($scope['elementAddImgs']), jQuery("#galleryModal ul#listFiles li.selected img"), 'src');
        }

        // uploadListener(jQuery("#prepareBtn"), jQuery("#uploadProcess"), $compile, $scope, $http);
        // remove pic from products img
        $scope.removeProductImage = function(e, type, index) {
            console.log('type, index ', type, index);
            // var img = jQuery(e.currentTarget).parent().parent().find('img').eq(0);
            // console.log(img, $scope.productItem.pictures, $scope.productItem.pictures.indexOf(img.attr('src')));
            // $scope.productItem.pictures.splice($scope.productItem.pictures.indexOf(img.attr('src')), 1);
            if (type == "product")
                $scope.productItem.pictures.splice(index, 1);
            if (type == "social") {

                $scope.productItem.productContent.seoSocial.pictures.splice(index, 1);
            }

        };
        // selectedImgRemoveListener(".postImgs .divImg .fa-close");


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
        });

        $scope.prepareUpload = function(type) {
            jQuery("#uploadBtn_" + type).val(null);
            jQuery("#uploadBtn_" + type).click();

        }

        var DARK = async function(file, $scope, type) {
            console.log($scope.productItem.pictures);
            // var base64_data = await convertFiletoBase64(file); // {data(base64), name}
            var objectUrl_Blob = URL.createObjectURL(file); // blob:....
            // var yolo = await imgSrcToBase64(objectUrl); // base64
            console.log('blob', objectUrl_Blob);
            if (type == 'product')
                $scope.productItem.pictures.push(objectUrl_Blob);
            if (type == 'social') {
                if (!$scope.productItem.productContent.seoSocial.pictures)
                    $scope.productItem.productContent.seoSocial['pictures'] = [];
                $scope.productItem.productContent.seoSocial.pictures.push(objectUrl_Blob);
            }

        }

        $scope.selectedFilesUpLoad = function(element, type) {
            console.log('chonj anh tai len loai ', type);
            // console.log(jQuery(element).val(), element.files);
            var promise = [];
            if (!$scope.productItem.pictures) $scope.productItem['pictures'] = [];
            for (var i = element.files.length - 1; i >= 0; i--) {
                var file = element.files[i];
                // $scope.productItem.pictures.push(dark);
                // promise.push(doAddImageToElement(file, jQuery("#uploadProcess"), $scope, $compile));
                promise.push(DARK(file, $scope, type));
            }
            Promise.all(promise).then((value) => {
                // jQuery('#uploadProcess .btn-success').prop('disabled', false);
                $scope.$apply();
                // console.log($scope.productItem.pictures.filter(x => x.indexOf('blob') != -1));
            });
            // addImageToElement(Array.prototype.slice.call(element.files).splice(0, element.files.length), jQuery("#uploadProcess"), $scope, $compile);
        }


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
            if ($routeParams.action == "add" && $scope.productItem.productContent.title && $scope.productItem.idCategory.length > 0) {
                var xxx = JSON.stringify($scope.productItem);
                console.log('lưu lai addProductTemp', xxx);
                localStorage.setItem("addProductTemp", xxx);
            }
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

        $scope.CheckLinkImages = function(e) {
            angular.element("#rewriteLinkImg .modal-body").html('');
            var content = CKEDITOR.instances['editorContent'].getData();
            // console.log(content);
            var listStr = content.match(/src\=([^\s]*)\s/g);
            // console.log('list img', listStr);
            listStr = jQuery.map(listStr, function(x) {
                return (x.substr(5, x.length - 7));
            });
            var listProcess = [];
            listStr.forEach(element => {
                if (element.indexOf('http') != -1 && element.indexOf('batdongsantotnhat') == -1) {
                    var html = `<div class="form-group"> 
                                <span> ` + element + ` </span> <br/>
                                <span> Đang xử lý ... </span>
                            </div>`;
                    angular.element("#rewriteLinkImg .modal-body").append($compile(html)($scope));
                    var p = new Promise(resolve => {
                        let params = {
                            method: 'POST',
                            url: '/admin/download-img',
                            data: {
                                link: element,
                                path: 'public/uploads/media/autodownload'
                            }
                        }
                        submitBackend(params, $http, function(res) {
                            // console.log('auto download', element, res);
                            resolve({ old: element, new: res.replace('public', '') });
                        });
                    })
                    listProcess.push(p);
                }

            });
            alert('đang xử lý');
            Promise.all(listProcess).then(results => {
                results.forEach(item => {
                    content = content.replace(item.old, item.new);
                });
                CKEDITOR.instances['editorContent'].setData(content);
                alert("Đã xong");
            }).catch(err => {
                console.log('promise all error', err);
            })


        }

        // Process upload image, support for Process_Add_UploadImage() function
        var do_Upload_Product_Image = function(proImage, index, productID, type) {
            console.log('proImage', proImage);
            return new Promise(async(resolve, reject) => {
                if (proImage.indexOf('uploads/media') != -1) {
                    console.log('deo lam');
                    resolve({ index: index, replace: null });
                } else {
                    var yolo = '';
                    console.log('lam thi lam')
                    if (proImage.indexOf('blob') != -1) {
                        yolo = await imgSrcToBase64(proImage);
                    } else {
                        yolo = proImage;
                    }
                    let params = {
                        method: 'POST',
                        url: '/admin/media/upload-product-img',
                        data: {
                            type: "upload",
                            path: 'public/uploads/media/autoupload/',
                            productID: productID,
                            img: {
                                data: yolo,
                                name: ''
                            }
                        }
                    }
                    submitBackend(params, $http, function(res) {
                        console.log(res);
                        if (res.status) {
                            resolve({ index: index, type: type, replace: res.imageName.replace('public', '') });
                        } else {
                            resolve({ index: index, type: type, replace: null });
                        }
                        // setAutoComplete('province', $scope, $compile, $http);
                    });
                }

            });

        }

        // Upload all images if post ADD action
        var Process_Add_UploadImage = function($scope, res) {
            console.log('$scope.productItem.pictures truoc', $scope.productItem.pictures);
            // $scope.productItem.productContent = res.productContent;
            // console.log('$scope.productItem result', res);
            var promiseD_U = [];
            for (var i = $scope.productItem.pictures.length; i--; i >= 0) {
                promiseD_U.push(do_Upload_Product_Image($scope.productItem.pictures[i], i, res.product._id, 'product'));
            }
            if ($scope.productItem.productContent.seoSocial && $scope.productItem.productContent.seoSocial.pictures) {
                for (var i = $scope.productItem.productContent.seoSocial.pictures.length; i--; i >= 0) {
                    promiseD_U.push(do_Upload_Product_Image($scope.productItem.productContent.seoSocial.pictures[i], i, res.product._id, 'social'));
                }
            }
            Promise.all(promiseD_U).then((values) => {
                console.log('values', values);
                values.forEach(element => {
                    if (element.replace != null) {
                        if (element.type == 'product')
                            $scope.productItem.pictures[element.index] = element.replace;
                        if (element.type == 'social')
                            $scope.productItem.productContent.seoSocial.pictures[element.index] = element.replace;
                    }
                });
                console.log('$scope.productItem.pictures sau ', $scope.productItem.pictures);
                console.log('$scope.productItem.productContent.seoSocial ', $scope.productItem.productContent.seoSocial);
                if (!$scope.productItem.productContent.seoSocial.pictures || $scope.productItem.productContent.seoSocial.pictures.length == 0) {
                    console.log('cap nhat lai anh cua productContent seo social');
                    $scope.productItem.productContent.seoSocial.pictures = $scope.productItem.pictures;
                }
                // Update product picture array 
                let params = {
                    method: 'POST',
                    url: '/admin/product/update-field',
                    data: {
                        id: res.product._id,
                        update: {
                            pictures: $scope.productItem.pictures
                        },
                        seoPic: $scope.productItem.productContent.seoSocial.pictures
                    }
                }
                submitBackend(params, $http, function(resUpdate) {
                    console.log(resUpdate);
                    if (resUpdate.status) {
                        console.log('ok hết, xóa temp');
                        localStorage.setItem("addProductTemp", null);
                        console.log(localStorage.getItem('addProductTemp'));
                    }
                    // setAutoComplete('province', $scope, $compile, $http);
                });
            })
        }

        $scope.submitProduct = function(e) {
            $scope.productItem.idCategoryType = "5f166a011ab04a0e50f990b3";
            $scope.productItem.productContent.descriptions = CKEDITOR.instances['editorDescription'].getData();
            $scope.productItem.productContent.content = CKEDITOR.instances['editorContent'].getData();
            var ImgElements = jQuery("#productImgs .divImg img");
            var socialImgElements = jQuery("#seoSocialImgs .divImg img");
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

            // $scope.productItem.pictures = [];
            // for (var i = 0; i < ImgElements.length; i++) {
            //     $scope.productItem.pictures.push(ImgElements.eq(i).attr('src'));
            // }
            // if (!$scope.productItem.productContent.seoSocial) $scope.productItem.productContent.seoSocial = {};
            // $scope.productItem.productContent.seoSocial.pictures = [];
            // for (var i = 0; i < socialImgElements.length; i++) {
            //     $scope.productItem.productContent.seoSocial.pictures.push(socialImgElements.eq(i).attr('src'));
            // }
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
                console.log(res);
                if (res.status == true) {
                    if($routeParams.action == "add")
                        $scope.productItem._id = res.product._id;
                    // do upload image
                    if ($scope.productItem.pictures.length > 0 && $routeParams.action == "add") {
                        Process_Add_UploadImage($scope, res);
                    } else {
                        alert('Không có ảnh để upload');
                    }

                    // window.location.reload();
                }

                // setAutoComplete('province', $scope, $compile, $http);
            });
            e.preventDefault();
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
                '1': { html: 'input', regexp: true, type: 'text', time: 500 },
                '2': { html: 'input', regexp: true, type: 'text', time: 500 },
                // '3': { html: 'input', regexp: true, type: 'datetime' },
                '3': { html: 'input', regexp: true, type: 'text', time: 1000 },
                '4': { html: 'input', regexp: true, type: 'text', time: 1000 },
                '5': { html: 'input', regexp: true, type: 'text', time: 1000 },
                '6': { html: 'input', regexp: true, type: 'text' },
                '7': {
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
            DTColumnBuilder.newColumn('district.title').withTitle('Quận huyện').renderWith(function(data, type, full) {
                if (full.district && full.district.title) return full.district.title;
                else return "";
            }),
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
            var html = ' <button class="btn btn-primary" ng-click="goToEdit(\'' + full._id + '\');"> ' + "EDIT" + '</button>' +
                ' <button class="btn btn-danger" ng-click="deleteProduct(\'' + full._id + '\', \'' + full.title + '\');"> ' + "DELETE" + '</button>';
            return html;
        }
    }

    $scope.goToEdit = function(id) {
        // console.log(id);
        window.location = '/admin/product/' + id + '/edit';
    }


    $scope.deleteProduct = function(id, title) {
        var r = confirm("Bạn có chắc muốn xóa : " + title);
        if (r == true) {
            let params = {
                method: 'DELETE',
                url: '/admin/product/item/' + id,
            }
            submitBackend(params, $http, function(res) {
                console.log(res);
                alert(res.mes);
                if (res.status == true) {
                    // window.location.reload();
                }
            });
        } else {

        }
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