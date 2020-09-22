var getMemberReferralTree = function(id, $http, callback) {
    let params = {
        method: 'GET',
        url: '/user/get-referral-tree/' + id,
    };
    submitFrontEnd(params, $http, function(res) {
        callback(res);
    });
}

var initMemberTree = function($rootScope, $scope, $http) {
    let params = {
        method: 'GET',
        url: '/user/init-member-tree',
    };

    submitFrontEnd(params, $http, function(res) {
        console.log('tree parent', res);
        // $rootScope.treeparent = res;
        // SharedDataService.setData('treeparent', res);
        var abc = [
            { id: res._id._id, text_1: res._id.username, text_2: res.totalAmount, check: false, father: null, color: "#2196F3", link: [] }
        ];
        if (res != null) {
            if (res.type == 1) abc[0].color = '#FF6347';
        } else {
            abc = [];
        }
        console.log('abc', abc);
        if (abc.length > 0)
            InitTreeMember(abc, $rootScope, $scope, $http);
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

var InitTreeMember = function(initData, $rootScope, $scope, $http) {
    $scope.membersTree = Treeviz.create({
        htmlId: "memberTree",
        idKey: "id",
        hasFlatData: true,
        relationnalField: "father",
        nodeWidth: 100,
        hasPan: true,
        hasZoom: true,
        nodeHeight: 50,
        mainAxisNodeSpacing: 2,
        isHorizontal: false,
        renderNode: function(node) {
            // if(node.data.display == true){
            return result = "<div class='box' style='cursor:pointer;height:" + node.settings.nodeHeight + "px; width:" + node.settings.nodeWidth + "px;display:flex;flex-direction:column;justify-content:center;align-items:center;background-color:" +
                node.data.color +
                ";border-radius:5px;'><div><strong style='font-size: 10px;'>" + node.data.text_1 + `</strong>
                    <br/>  <span style='font-size: 10px; margin-top: -30px;' >` + node.data.text_2 + ` </span>
                </div></div>`;
            // }

        },
        linkWidth: (nodeData) => 2,
        linkShape: "quadraticBeziers",
        linkColor: (nodeData) => "#B0BEC5",
        onNodeClick: (nodeData) => {
            // console.log(nodeData);
            // SharedDataService.setData('treeparent', nodeData.data.text_1);
            $rootScope.$apply();

            if (nodeData.data.check == false) {
                getMemberReferralTree(nodeData.data.id, $http, function(result) {
                    // console.log('getListReferral', result);
                    nodeData.data.check = true;
                    result.forEach(element => {
                        var abc = { id: element._id._id, text_1: element._id.username, text_2: element.totalAmount, check: false, father: nodeData.data.id, color: "#2196F3", link: [] }
                        if (element.type == 1) {
                            abc.color = '#FF6347';
                        }
                        nodeData.data.link.forEach(l => {
                            abc.link.push(l);
                        });
                        abc.link.push(nodeData.data.id);
                        $scope.treeData.push(abc);
                        $scope.membersTree.refresh($scope.treeData);
                    });
                    // console.log('tree', $scope.treeData);
                })
            } else {
                abc($scope.treeData, $scope.tempData, 0, nodeData, function(r) {
                    $scope.membersTree.refresh(r);
                })
            }

            // data_3.splice(data_3.indexOf(nodeData.data), 1); 
        }
    });
    $scope.treeData = initData;
    $scope.tempData = [];
    $scope.membersTree.refresh($scope.treeData);
}

app.controller("membersCtrl", function($rootScope, $scope, $http, $translate, $location, $routeParams) {
    // console.log($location);
    $translate('MEMBER').then(function(title) {
        // $rootScope.pageTitle = $rootScope.siteTitle + ' - ' + title;
    });
    $rootScope.$watch('logedUser', function(value) {
        if (value) {
            console.log(value);
            if (!value.sponsor) value.sponsor = 'Không có';
        }
    })
    initMemberTree($rootScope, $scope, $http);



    $scope.submitInvestment = function(package, e) {
        jQuery('#loadingModalTitle').html('Đang xử lý ....');
        jQuery("#loadingModal").modal('show');
        if (!package.month) package.month = 9;
        console.log(package);
        let params = {
            method: 'POST',
            url: '/investment/register-package',
            data: {
                package: package,
                treeparent: SharedDataService.getData('treeparent')
            }
        };
        submitFrontEnd(params, $http, function(res) {
            jQuery('#loadingModalTitle').html(res.mes);
            console.log('create packages', res);
        });

        e.preventDefault();
    }





});