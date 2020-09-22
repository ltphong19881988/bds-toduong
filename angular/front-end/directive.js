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

function isVisible(ele) {
    var style = window.getComputedStyle(ele);
    return style.width !== "0" &&
        style.height !== "0" &&
        style.opacity !== "0" &&
        style.display !== 'none' &&
        style.visibility !== 'hidden';
}

// ------------------------------ ||||------------------------|||| --------------------------- //
// ------------------------------ ||||------------------------|||| --------------------------- //
app.directive('navMenuDirective', function() {
    return {
        restrict: 'E',
        templateUrl: '/tpls/main/menu-pc.html',
        controller: function($scope, $compile, $http) {
            var self = this;
            this.fields = {};
            this.addField = function(field) {
                console.log("New field: ", field);
                self.fields[field.name] = field;
            };
        },
        link: function($scope, $element, $attributes) {
            // console.log(" -- Element ready!");

        }
    }
});


// ========================= ************************ =================================//
// ========================= ************************ =================================//
// ========================= ************************ =================================//
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
        url: '/product/category/all-category?idCategoryType=5f166a011ab04a0e50f990b3',
    }
    submitFrontEnd(params, $http, function(res) {
        // console.log('all category', res); a
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
    if (!isVisible(jQuery("div#listCategory")[0])) jQuery("div#listCategory").show();
    else jQuery("div#listCategory").hide();
}

var initProvince = function($scope, $compile, $http) {
    let params = {
        method: 'POST',
        url: '/sector/filter-all',
        data: {
            type: "1",
            list: [4, 23, 12]
        }
    }
    submitFrontEnd(params, $http, function(provinces) {
        $scope.listProvinces = provinces;
        var abc = provinces.filter(function(obj) {
            return (obj.ID === 4);
        });
        $scope['selectedprovince'] = abc[0].title;
        $scope.searchForm['province'] = abc[0];
        initDistrict($scope, $compile, $http);
        // setAutoComplete('province', $scope, $compile, $http);
    });
}

var initDistrict = function($scope, $compile, $http) {
    if (!$scope.searchForm.province) return;
    let params = {
        method: 'POST',
        url: '/sector/filter-all',
        data: {
            type: "2",
            provinceID: $scope.searchForm.province.ID
        }
    }
    submitFrontEnd(params, $http, function(districts) {
        // setAutoComplete('district', $scope, $compile, $http);
        $scope.listDistricts = districts;

    });
}

var initWard = function($scope, $compile, $http) {
    if (!$scope.searchForm.province || !$scope.searchForm.district) return;
    let params = {
        method: 'POST',
        url: '/sector/filter-all',
        data: {
            type: "3",
            provinceID: $scope.searchForm.province.ID,
            districtID: $scope.searchForm.district.ID,
        }
    }
    submitFrontEnd(params, $http, function(wards) {
        // setAutoComplete('district', $scope, $compile, $http);
        $scope.listWards = wards;
    });
}

var initDirecton = function($scope, $compile, $http) {
    let params = {
        method: 'POST',
        url: '/product/product-type/filter-all',
        data: {
            groupType: "huong-nha",
        }
    }
    submitFrontEnd(params, $http, function(directions) {
        $scope.listDirections = directions;
    });
}


app.directive('searchFormDirective', function() {
    return {
        restrict: 'E',
        templateUrl: '/tpls/main/search-form.html',
        controller: function($scope, $compile, $http) {
            $scope.searchForm = {};
            initCategory($scope, $compile, $http);
            initProvince($scope, $compile, $http);
            initDirecton($scope, $compile, $http);

            $scope.showHideCategory = function() {
                tonggleCategory();
            }

            $scope.selectCategory = function(e) {
                $scope.searchForm["idCategory"] = jQuery(e.currentTarget).data('id');
                jQuery('input[name="idCategory"]').val(jQuery(e.currentTarget).text());

                // var listParent = jQuery(e.currentTarget).parents('.node');
                // for (var i = 0; i < listParent.length; i++) {
                //     if (listParent.eq(i).attr('parent') != "null")
                //         $scope.searchForm["idCategory"].push(listParent.eq(i).attr('parent'));
                // }
                tonggleCategory();
                console.log($scope.searchForm);
            }

            $scope.selectedProvince = function($event, item) {
                $scope['selectedprovince'] = item.title;
                $scope['showlistprovince'] = false;
                $scope.searchForm['province'] = item;
                initDistrict($scope, $compile, $http);
            }

            $scope.selectedDistrict = function($event, item) {
                $scope['selecteddistrict'] = item.title;
                $scope['showlistdistrict'] = false;
                $scope.searchForm['district'] = item;
                initWard($scope, $compile, $http);
            }

            $scope.selectedWard = function($event, item) {
                $scope['selectedward'] = item.title;
                $scope['showlistward'] = false;
                $scope.searchForm['ward'] = item;
            }

            $scope.selectedDirection = function($event, item) {
                $scope['selecteddirection'] = item.name;
                $scope['showlistdirection'] = false;
                $scope.searchForm['direction'] = item;
            }

            $scope.submitSearchForm = function() {
                console.log($scope.searchForm);
                let params = {
                    method: 'POST',
                    url: '/product/search-form',
                    data: {
                        searchForm: $scope.searchForm
                    }
                }
                submitFrontEnd(params, $http, function(res) {
                    console.log('search form', res);
                    if (res.status == false) alert(res.mes);
                    else {
                        window.location = '/' + res.urlRedirect;
                    }
                    // setAutoComplete('province', $scope, $compile, $http);
                });
            }

            var self = this;
            this.fields = {};
            this.addField = function(field) {
                console.log("New field: ", field);
                self.fields[field.name] = field;
            };
        },
        // link: function($scope, $element, $attributes) {
        //     console.log(" -- Element ready!");

        // }
    }
});

app.directive('autoComplete', function($timeout) {
    return function(scope, iElement, iAttrs) {
        // console.log(iElement, iAttrs);
        var key = iAttrs.key;
        var $scope = scope;
        // scope['showlist' + key] = false;

        jQuery('.showlist-' + key).clickOff(function() {
            if ($scope['showlist' + key] == true && document.activeElement != iElement[0]) {
                // console.log('vo', key);
                if ($scope.searchForm[key] && $scope.searchForm[key].title)
                    $scope['selected' + key] = $scope.searchForm[key].title;
                else if ($scope.searchForm[key] && $scope.searchForm[key].name)
                    $scope['selected' + key] = $scope.searchForm[key].name;
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
            // console.log(key, scope['showlist' + key]);
        })
    };
});

app.directive('autoScroll', function($document, $timeout, $location) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            scope.okSaveScroll = true;

            scope.scrollPos = {};

            $document.bind('scroll', function() {
                if (scope.okSaveScroll) {
                    scope.scrollPos[$location.path()] = $(window).scrollTop();
                }
            });

            scope.scrollClear = function(path) {
                scope.scrollPos[path] = 0;
            };

            scope.$on('$locationChangeSuccess', function(route) {
                $timeout(function() {
                    $(window).scrollTop(scope.scrollPos[$location.path()] ? scope.scrollPos[$location.path()] : 0);
                    scope.okSaveScroll = true;
                }, 0);
            });

            scope.$on('$locationChangeStart', function(event) {
                scope.okSaveScroll = false;
            });
        }
    };
});

app.directive('orientimgload', function() {
    return {
        link: function(scope, element, attrs) {
            element.bind("load", function(e) {
                var parent = jQuery(this).parent();
                var a = parent.height() / parent.width();
                var b = jQuery(this).height() / jQuery(this).width();
                var dolechX = jQuery(this).width() - parent.width();
                var dolechY = jQuery(this).height() - parent.height();
                if (a > b) {
                    jQuery(this).css("width", "auto");
                    jQuery(this).css("height", "100%");
                } else {
                    jQuery(this).css("width", "100%");
                    jQuery(this).css("height", "auto");
                    if (dolechY > 0) {
                        jQuery(this).css('margin-top', "-" + dolechY / (jQuery(this).width() / parent.width()) / 2 + "px");
                    }
                }
            });

            angular.element(window).on('resize', function() {
                element.each(function(e) {
                    var parent = jQuery(this).parent();
                    var a = parent.height() / parent.width();
                    var b = jQuery(this).height() / jQuery(this).width();
                    if (a > b) {
                        jQuery(this).css("width", "auto");
                        jQuery(this).css("height", "100%");
                    } else {
                        jQuery(this).css("width", "100%");
                        jQuery(this).css("height", "auto");
                    }
                })
            })
        }
    }
});