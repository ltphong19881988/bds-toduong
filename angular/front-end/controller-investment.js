var getAllPackages = function($scope, $http, type, callback) {
    let params = {
        method: 'GET',
        url: '/investment/get-all-packages?type=' + type,
    };
    submitFrontEnd(params, $http, function(res) {
        console.log('all packages of type ', type, res);
        callback(res);
    });
}

var getAllUserInvest = function($scope, $http, callback) {
    let params = {
        method: 'GET',
        url: '/investment/get-all-user-invest',
    };
    submitFrontEnd(params, $http, function(res) {
        // console.log('all user invest', res);
        callback(res);
    });
}

var getListReferralTree = function(id, $http, callback) {
    let params = {
        method: 'GET',
        url: '/investment/get-referral-tree/' + id,
    };
    submitFrontEnd(params, $http, function(res) {
        callback(res);
    });
}

var initInvestTreeParent = function($rootScope, $scope, $http, SharedDataService) {
    let params = {
        method: 'GET',
        url: '/investment/init-invest-tree-parent',
    };

    submitFrontEnd(params, $http, function(res) {
        console.log('tree parent fwe', res);
        // $rootScope.treeparent = res;
        SharedDataService.setData('treeparent', res);
        var abc = [
            { id: 'null', text_1: "you", text_2: "here", check: false, father: null, color: "#2196F3", link: [] }
        ];
        if (res != null) {
            abc[0].id = res._id;
            abc[0].text_1 = res;
            if (res.type == 1) abc[0].color = '#FF6347';
            if ($rootScope.logedUser._id != res.idUser) {
                abc = [];
                // abc[0].color = '#e74c3c';
            }
        } else {
            abc = [];
        }
        if (abc.length > 0)
            InitTree(abc, $rootScope, $scope, $http, SharedDataService);
    });
}

function abc(arr, data_temp, i, nodeData, callback) {
    var flag = arr.length;
    while (i <= arr.length) {
        if (i > arr.length - 1) {
            if (flag == arr.length) {
                xyz(arr, data_temp, 0, nodeData, callback);
            } else {
                callback(arr);
            }
            return;
        }
        if (arr[i].link.indexOf(nodeData.data.id) != -1) {
            // console.log(arr);
            var dauxanh = arr.splice(arr.indexOf(arr[i]), 1);
            data_temp.push(dauxanh[0]);
        } else {
            i++;
        }

    }
}

function xyz(arr, data_temp, i, nodeData, callback) {
    // console.log(data_temp);
    while (i <= data_temp.length) {
        if (i > data_temp.length - 1) {
            callback(arr);
            return;
        }
        if (data_temp[i].link.indexOf(nodeData.data.id) != -1) {
            var dauxanh = data_temp.splice(data_temp.indexOf(data_temp[i]), 1);
            arr.push(dauxanh[0]);
        } else {
            i++;
        }
    }
}

var InitTree = function(initData, $rootScope, $scope, $http, SharedDataService) {
    $scope.investTree = Treeviz.create({
        htmlId: "tree",
        idKey: "id",
        hasFlatData: true,
        relationnalField: "father",
        nodeWidth: 100,
        hasPan: true,
        hasZoom: true,
        nodeHeight: 50,
        mainAxisNodeSpacing: 2,
        isHorizontal: true,
        renderNode: function(node) {
            // if(node.data.display == true){
            return result = "<div class='box' style='cursor:pointer;height:" + node.settings.nodeHeight + "px; width:" + node.settings.nodeWidth + "px;display:flex;flex-direction:column;justify-content:center;align-items:center;background-color:" +
                node.data.color +
                ";border-radius:5px;'><div><strong style='font-size: 10px;'>" + node.data.text_1.username + `</strong>
                    <br/>  <span style='font-size: 10px; margin-top: -30px;' >` + node.data.text_1.package + ` </span>
                </div></div>`;
            // }

        },
        linkWidth: (nodeData) => 2,
        linkShape: "quadraticBeziers",
        linkColor: (nodeData) => "#B0BEC5",
        onNodeClick: (nodeData) => {
            // console.log(nodeData);
            SharedDataService.setData('treeparent', nodeData.data.text_1);
            $rootScope.$apply();

            if (nodeData.data.check == false) {
                getListReferralTree(nodeData.data.id, $http, function(result) {
                    // console.log('getListReferral', result);
                    nodeData.data.check = true;
                    result.forEach(element => {
                        var abc = { id: element._id, text_1: element, text_2: "here", check: false, father: nodeData.data.id, color: "#2196F3", link: [] }
                        if (element.type == 1) {
                            abc.color = '#FF6347';
                        }
                        nodeData.data.link.forEach(l => {
                            abc.link.push(l);
                        });
                        abc.link.push(nodeData.data.id);
                        $scope.treeData.push(abc);
                        $scope.investTree.refresh($scope.treeData);
                    });
                    // console.log('tree', $scope.treeData);
                })
            } else {
                abc($scope.treeData, $scope.tempData, 0, nodeData, function(r) {
                    $scope.investTree.refresh(r);
                })
            }

            // data_3.splice(data_3.indexOf(nodeData.data), 1); 
        }
    });
    $scope.treeData = initData;
    $scope.tempData = [];
    $scope.investTree.refresh($scope.treeData);
}

var getEscrowPrice = function($http, callback) {
    let params = {
        method: 'GET',
        url: '/investment/get-escrow-price'
    };
    submitFrontEnd(params, $http, function(res) {
        console.log('escrow price', res);
        callback(res);
    });
}

app.controller("investmentCtrl", function($rootScope, $scope, $compile, $http, $translate, $location, $routeParams, SharedDataService) {
    // console.log($location);
    $translate('INVEST').then(function(title) {
        $rootScope.pageTitle = $rootScope.siteTitle + ' - ' + title;
    });
    $rootScope.$watch('logedUser', function(value) {
        if (value) {
            // console.log(value);
            if (!value.sponsor) value.sponsor = 'Không có';
        }
    })
    if ($location.$$path == '/investment/index') {

        getAllUserInvest($scope, $http, function(res) {
            res.map(function(item) {
                item.statusText = 'Chưa duyệt';
                if (item.status) item.statusText = 'Đã duyệt';
                // repo.value = repo.name.toLowerCase();
                return item;
            });
            $scope.allUserInvests = res;
        });

    }
    ////  -------   INVESTMENT HISTORY   --------   investment history
    if ($location.$$path == '/investment/history') {
        getAllUserInvest($scope, $http, function(res) {
            res.map(function(item) {
                item.statusText = 'Chưa duyệt';
                if (item.status) item.statusText = 'Đã duyệt';
                item.investPackage['typeText'] = 'Ủy thác đầu tư';
                if (item.investPackage.type == 1) item.investPackage['typeText'] = 'Ký gửi nông sản';
                // repo.value = repo.name.toLowerCase();
                return item;
            });
            $scope.allUserInvests = res;
        });

        $scope.viewDetails = function(item) {
            angular.element(jQuery('#contractImagesView')).html('');
            if (item.contract.images.length > 0) {
                Promise.all(jQuery.map(item.contract.images, async function(src) {
                    // console.log(src.split('/')[4]);
                    var a = await imgSrcToBase64(src);
                    return { data: a, name: src.split('/')[4] };
                })).then((arrayImgs) => {
                    $scope.contractImages = arrayImgs;
                    arrayImgs.forEach(element => {
                        var html = `<div class="imgBlock" img-name="` + element.name + `">
                                        <img src="` + element.data + `" style="max-width: 200px; max-heigh:200px" ng-click="openContractImage($event)"/>
                                    </div>`;
                        angular.element(jQuery('#contractImagesView')).append($compile(html)($scope));
                    });
                })
            }
            $scope.investDetails = item;
        }

        $scope.openContractImage = function(e) {
            var newTab = window.open();
            newTab.document.body.innerHTML = '<img src="' + jQuery(e.currentTarget).attr('src') + '" >';
        }

    }
    ////  -------   escrow   --------   invest 
    if ($location.$$path.indexOf('/investment/escrow') != -1 || $location.$$path.indexOf('/investment/invest') != -1) {
        var type = 0;
        if ($location.$$path.indexOf('/investment/escrow') != -1) type = 1;
        initInvestTreeParent($rootScope, $scope, $http, SharedDataService);
        getAllPackages($scope, $http, type, function(res) {
            $scope.allPackages = res;
            $scope.package = $scope.allPackages[0];
        });
        getEscrowPrice($http, function(res) {
            $scope.escrowPrice = [{
                name: "Hạt tiêu",
                id: res.tieu._id,
                price: res.tieu.value,
                quantity: 0
            }, {
                name: "Hạt điều",
                id: res.dieu._id,
                price: res.dieu.value,
                quantity: 0
            }, {
                name: "Hạt cafe",
                id: res.cafe._id,
                price: res.cafe.value,
                quantity: 0
            }];
            $scope.selectedEscrow = [false, false, false];
        })

    }

    $scope.packageMonth = [{
            name: '9 months',
            val: 9,
            bonus: 2
        },
        {
            name: '15 months',
            val: 15,
            bonus: 2.5
        },
        {
            name: '18 months',
            val: 18,
            bonus: 3
        }
    ];
    $scope.item = $scope.packageMonth[0];


    $scope.changePackage = function(package) {
        package.month = $scope.item.val;
        // console.log(package);
    }

    $scope.changePackageMonth = function(item, package) {
        package.month = item.val;
        // console.log(item, package);
    }

    $scope.submitInvestment = function(package, e) {
        if (!package.month) package.month = 9;
        var r = confirm("Bạn có chắc muốn đăng ký gói " + package.min + 'USD, thời gian đầu tư ' + package.month + ' tháng ?');
        if (r == true) {
            jQuery('#loadingModalTitle').html('Đang xử lý ....');
            jQuery("#loadingModal").modal('show');

            console.log(package);
            let params = {
                method: 'POST',
                url: '/investment/register-package',
                data: {
                    package: package,
                    selectedEscrow: $scope.selectedEscrow,
                    treeparent: SharedDataService.getData('treeparent')
                }
            };
            submitFrontEnd(params, $http, function(res) {
                jQuery('#loadingModalTitle').html(res.mes);
                console.log('create packages', res);
            });
        } else {
            return;
        }

        e.preventDefault();
    }

    $scope.deleteInvest = function(invest, e) {
        console.log(invest);
        var r = confirm("Bạn có chắc muốn hủy đăng ký gói " + invest.investPackage.min + 'USD, thời gian đầu tư ' + invest.investTime.month + ' tháng ?');
        if (r == true) {
            jQuery('#loadingModalTitle').html('Đang xử lý ....');
            jQuery("#loadingModal").modal('show');

            let params = {
                method: 'DELETE',
                url: '/investment/delete-invest-package/' + invest._id,
            };
            submitFrontEnd(params, $http, function(res) {
                jQuery('#loadingModalTitle').html(res.mes);
                console.log('delete packages', res);
            });
        } else {
            return;
        }

        e.preventDefault();
    }



}).service('SharedDataService', function($rootScope) {
    return {
        setData: function(key, value) {
            localStorage.setItem(key, JSON.stringify(value));
            $rootScope.treeparent = value;
        },
        getData: function(key) {
            return JSON.parse(localStorage.getItem(key));
        }
    }

});;