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

var initCategoryNews = function($scope, $compile, $http) {
    let params = {
        method: 'GET',
        url: '/admin/category/all-category?idCategoryType=5f166a011ab04a0e50f990b5',
    }
    submitBackend(params, $http, function(res) {
        console.log('all category', res);
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

var tonggleCategoryPost = function() {
    if (!isVisible(jQuery("#formAddPost div#listCategory")[0])) jQuery("#formAddPost div#listCategory").show();
    else jQuery("#formAddPost div#listCategory").hide();
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

adminApp.controller("postCtrl", function($rootScope, $scope, $http, $compile, $routeParams, DTOptionsBuilder, DTColumnBuilder, DTColumnDefBuilder) {
    // console.log($routeParams);
    $scope.rootFolderPath = 'public/uploads/media/';
    $scope.acviteFolderPath = 'public/uploads/media/';
    $scope.checkSelect = 0;
    $scope.listGallerySelect = [];
    $scope.listImgsPost = [];
    if ($routeParams.action == "add") $rootScope.pageTitle = "Admin - Thêm mới bài viết";
    if ($routeParams.action == "edit") {
        $rootScope.pageTitle = "Admin - Sửa bài viết";
        let params = {
            method: 'GET',
            url: '/admin/post/item/' + $routeParams.postId,
        }
        submitBackend(params, $http, function(res) {
            console.log('get post item', res);
            if (res.visible == 1) $scope.checkVisible = true;
            $scope.postItem = res;
            if (res && res.postContent) {
                setTimeout(() => {
                    CKEDITOR.instances['editorContent'].setData(res.postContent.content);
                    CKEDITOR.instances['editorDescription'].setData(res.postContent.descriptions);
                }, 1000);



            }
            loopSelectedCategory(null, $scope.postItem.category);
            // jQuery('#productCategory option').text(res.category.name);
            // jQuery('#productCategory option').val(res.category._id);
        });
    }

    if ($routeParams.action != null) {
        $scope.postItem = {};
        initCategoryNews($scope, $compile, $http)

        // uploadListener(jQuery("#prepareBtn"), jQuery("#uploadProcess"), $compile, $scope, $http);
        // remove pic from post img
        selectedImgRemoveListener(".postImgs .divImg .fa-close");

        $scope.addImgsToPostNews = function() {
            jQuery("#galleryModal button.close").click();
            appendSelectedImg(jQuery($scope['elementAddImgs']), jQuery("#galleryModal ul#listFiles li.selected img"), 'src');
        }

        // Click to Open modal get pics from gallery
        // Event submit selected images from gallery and add images to main add post content
        jQuery(document).on("click", "#formAddPost button[data-target='#galleryModal']", function() {
            $scope['elementAddImgs'] = jQuery(this).data('content');
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
            

        jQuery("select[name='folderName']").change(function() {
            var abc = jQuery(this).val();
            if (abc != '') abc += "/";
            $scope.acviteFolderPath = $scope.rootFolderPath + abc;
            selectChangeListener($scope, $http, $compile);
        })

        $scope.showHideCategory = function() {
            // jQuery("div.node")[0] is type HTML Element, jQuery("div.node").eq(0) is not T__T
            tonggleCategoryPost();
        }

        $scope.selectCategory = function(e) {
            $scope.postItem["idCategory"] = [jQuery(e.currentTarget).data('id')];
            jQuery('input[name="idCategory"]').val(jQuery(e.currentTarget).text());

            var listParent = jQuery(e.currentTarget).parents('.node');
            for (var i = 0; i < listParent.length; i++) {
                if (listParent.eq(i).attr('parent') != "null")
                    $scope.postItem["idCategory"].push(listParent.eq(i).attr('parent'));
            }
            tonggleCategoryPost();
            // console.log('content', CKEDITOR.instances['editorContent'].getData());
            console.log($scope.postItem);
        }

        $scope.CheckLinkImages = function(e) {
            angular.element("#rewriteLinkImg .modal-body").html('');
            var content = CKEDITOR.instances['editorContent'].getData();
            // console.log(content);
            var listStr = content.match(/src\=([^\s]*)\s/g);
            // console.log('list img', listStr);
            listStr = jQuery.map( listStr, function( x ) {
                return (x.substr(5,x.length - 7));
            });
            var listProcess = [];
            listStr.forEach(element => {
                if(element.indexOf('http') != -1  && element.indexOf('batdongsantotnhat') == -1) {
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
                                path : 'public/uploads/media/autodownload'
                            }
                        }
                        submitBackend(params, $http, function(res) {
                            // console.log('auto download', element, res);
                            resolve({old : element, new : res.replace('public', '')});
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


    } else {
        $scope.dtOptions = DTOptionsBuilder.newOptions()
            .withFnServerData((sSource, aoData, fnCallback, oSettings) => {
                oSettings.jqXHR = $http.post('/admin/post/all-post', {
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
                '4': {
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
                '3': { html: 'input', regexp: true, type: 'text', time: 1000 },
                '5': { html: 'input', regexp: true, type: 'text', time: 1000 },
                '6': { html: 'input', regexp: true, type: 'text' },
            });

        $scope.dtColumns = [
            DTColumnBuilder.newColumn('_id').withTitle('ID').notVisible(),
            DTColumnBuilder.newColumn('nameKey').withTitle('Mã'),
            DTColumnBuilder.newColumn('title').withTitle('Tiêu đề').withOption('width', '35%'),
            DTColumnBuilder.newColumn('categoryName').withTitle('Danh mục'),
            DTColumnBuilder.newColumn('visible').withTitle('Ẩn/Hiện').renderWith(function(data, type, full) {
                if (full.visible == 1) return '<div style="text-align:center;"><i class="fa fa-check-circle green" aria-hidden="true"></i></div>';
                if (full.visible == 0) return '<div style="text-align:center;"><i class="fa fa-minus-circle red" aria-hidden="true"></i></div>';
            }),
            DTColumnBuilder.newColumn('datePost').withTitle('Ngày đăng').renderWith(function(data, type, full) {
                return moment(new Date(full.datePost)).format('DD-MM-YYYY');
            }),
            DTColumnDefBuilder.newColumnDef(0).withTitle('Xử lý').renderWith(render),
        ];

        function render(data, type, full) {
            return ' <button class="btn btn-primary" ng-click="goToEdit(\'' + full._id + '\');"> ' + "EDIT" + '</button>';
        }
    }

    $scope.goToEdit = function(id) {
        // console.log(id);
        window.location = '/admin/post/' + id + '/edit';
    }

    $scope.submitPost = function(e) {
        $scope.postItem.idCategoryType = "5f166a011ab04a0e50f990b5";
        $scope.postItem.postContent.descriptions = CKEDITOR.instances['editorDescription'].getData();
        $scope.postItem.postContent.content = CKEDITOR.instances['editorContent'].getData();
        var ImgElements = jQuery("#postImgs .divImg img");
        var socialImgElements = jQuery("#seoSocialImgs .divImg img");
        if ($scope.checkVisible && $scope.checkVisible == true) {
            $scope.postItem.visible = 1;
        } else {
            $scope.postItem.visible = 0;
        }

        $scope.postItem.pictures = [];
        for (var i = 0; i < ImgElements.length; i++) {
            $scope.postItem.pictures.push(ImgElements.eq(i).attr('src'));
        }
        $scope.postItem.postContent.seoSocial.pictures = [];
        for (var i = 0; i < socialImgElements.length; i++) {
            $scope.postItem.postContent.seoSocial.pictures.push(socialImgElements.eq(i).attr('src'));
        }
        let params = {
            method: 'POST',
            url: '/admin/post/item',
            data: {
                post: $scope.postItem
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
        });
        e.preventDefault();
    }

});