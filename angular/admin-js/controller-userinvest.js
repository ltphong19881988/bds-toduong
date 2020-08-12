// ==================== UserInvest Controller ================

var getUserInvestDetails = function($scope, $http, id, callback) {
    let params = {
        method: 'GET',
        url: '/admin/member/user-invest-details/' + id,
    }
    submitBackend(params, $http, function(res) {
        callback(res);
    });
}

function openBase64InNewTab(data, mimeType) {
    if (!mimeType) mimeType = 'data:image/jpeg';
    var byteCharacters = atob(data);
    var byteNumbers = new Array(byteCharacters.length);
    for (var i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    var byteArray = new Uint8Array(byteNumbers);
    var file = new Blob([byteArray], { type: mimeType + ';base64' });
    var fileURL = URL.createObjectURL(file);
    window.open(fileURL);
}

var getEscrowPrice = function($http, callback) {
    let params = {
        method: 'GET',
        url: '/investment/get-escrow-price'
    };
    submitBackend(params, $http, function(res) {
        console.log('escrow price', res);
        callback(res);
    });
}

var InitDataTable = function($scope, $compile, $http, DTOptionsBuilder, DTColumnBuilder, DTColumnDefBuilder) {
    $scope.dtOptions = DTOptionsBuilder
        .newOptions()
        .withFnServerData((sSource, aoData, fnCallback, oSettings) => {
            oSettings.jqXHR = $http.post('/admin/member/all-user-invest', {
                aoData
            }).then((data) => {
                fnCallback(data.data);
            });

        })
        // .withOption('ajax', {
        //     url: '/admin/member/all-user-invest',
        //     type: 'POST',
        // })
        // .withDataProp('data')
        .withOption('serverSide', true)
        .withOption('processing', true)
        // .withOption('stateSave', true)
        .withOption('headerCallback', function(header) {
            $compile(angular.element(header).contents())($scope);
        })
        .withOption('bInfo', false)
        .withOption('searching', true)
        .withOption('createdRow', function(row, data, index) {
            $compile(row)($scope); //add this to compile the DOM
        })
        .withPaginationType('full_numbers')
        .withLightColumnFilter({
            '0': { html: 'input', type: 'datetime' },
            '1': { html: 'input', regexp: true, type: 'text', time: 500 },
            '2': {
                html: 'select',
                values: [{
                    value: '',
                    label: 'Tất cả'
                }, {
                    value: 0,
                    label: 'Ủy thác đầu tư'
                }, {
                    value: 1,
                    label: 'Ký gửi nông sản'
                }],
                width: '100px'
            },
            '3': { html: 'input', regexp: true, type: 'text' },
            '5': { html: 'range', type: 'date', width: '120px' },
            '6': { html: 'range', type: 'date', width: '120px' },
            '4': { html: 'input', type: 'text' },
            '7': {
                html: 'select',
                values: [{
                    value: '',
                    label: 'Tất cả'
                }, {
                    value: 'true',
                    label: 'Đã duyệt'
                }, {
                    value: 'false',
                    label: 'Chưa duyệt'
                }]
            },
            '8': { html: 'label', type: 'text' },

        });
    // .withOption('order', [
    //     [1, 'asc'],
    //     [1, 'asc']
    // ])

    $scope.dtColumns = [
        DTColumnBuilder.newColumn('_id').withTitle('ID').notVisible(),
        DTColumnBuilder.newColumn('user.username').withTitle('Username'),
        DTColumnBuilder.newColumn('investPackage.type').withTitle('Loại').renderWith(function(data, type, full) {
            if (full.investPackage.type == 0) {
                return '<p class="text-red">Hợp tác đầu tư</p>';
            } else if (full.investPackage.type == 1) {
                return '<p class="text-green">Ký gửi nông sản</p>';
            }
        }),
        DTColumnBuilder.newColumn('amount').withTitle('Só tiền'),
        DTColumnBuilder.newColumn('investTime.name').withTitle('Thời gian'),
        // DTColumnBuilder.newColumn('abc').withTitle('Gói').renderWith(function(data, type, full) {
        //     return moment(new Date(full.investPackage.name)).format('DD-MM-YYYY');
        // }),
        DTColumnBuilder.newColumn('datecreate').withTitle('Ngày tạo ').renderWith(function(data, type, full) {
            return moment(new Date(full.datecreate)).format('DD-MM-YYYY HH:mm:ss');
        }),
        DTColumnBuilder.newColumn('dateApproved').withTitle('Ngày duyệt').renderWith(function(data, type, full) {
            return moment(new Date(full.dateApproved)).format('DD-MM-YYYY HH:mm:ss');
        }),
        DTColumnBuilder.newColumn('status').withTitle('Trạng thái').renderWith(function(data, type, full) {
            if (full.status == false) {
                return '<p class="text-red">Chưa duyệt</p>';
            } else if (full.status == true) {
                return '<p class="text-green">Đã duyệt</p>';
            }
        }),
        // DTColumnBuilder.newColumn('dateApproved').withTitle('Ngày duyệt').renderWith(function(data, type, full) {
        //     if (full.dateApproved)
        //         return moment(new Date(full.dateApproved)).format('DD-MM-YYYY');
        //     else
        //         return null;
        // }),
        DTColumnDefBuilder.newColumnDef(0).withTitle('Xử lý').withOption('width', '200px').renderWith(renderAction),
    ];

    function renderAction(data, type, full) {
        var html = ' <button class="btn btn-info" ng-click="viewDetails(\'' + full._id + '\');"> ' + "Xem" + '</button>';
        if (full.status == false) html += ' <button class="btn btn-success" ng-click="approveUserInvest(\'' + full._id + '\');"> ' + "Duyệt" + '</button>';
        return html;
    }



}

adminApp.controller("userInvestCtrl", function($rootScope, $scope, $http, $compile, DTOptionsBuilder, DTColumnBuilder, DTColumnDefBuilder) {
    $rootScope.pageTitle = "Admin - User Invest";

    InitDataTable($scope, $compile, $http, DTOptionsBuilder, DTColumnBuilder, DTColumnDefBuilder);

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




    //   ---   Button function process
    //   ---   Button function process
    function abcxyz(item, id) {
        item['statusText'] = '<span class="text-green">Đã duyệt</span>';
        angular.element(jQuery('#approveBtn')).html('');
        if (!item.status) {
            item['statusText'] = '<span class="text-red">Chưa duyệt</span>';
            // var htmlBTN = `<button class="btn btn-success" ng-click="approveUserInvest('` + id + `');"> Duyệt</button>` ;
            // angular.element(jQuery('#approveBtn')).append($compile(htmlBTN)($scope));
        }
        jQuery('#statusText').html(item['statusText']);
    }

    $scope.viewDetails = function(id) {
        $scope.contractImages = [];
        angular.element(jQuery('#contractImagesView')).html('');
        getUserInvestDetails($scope, $http, id, function(item) {
            if (item.contract.loainongsan && item.contract.loainongsan.length > 0) {
                console.log(item.contract.loainongsan);
                jQuery.map($scope.escrowPrice, function(val, i) {
                    // console.log(val, i);
                    item.contract.loainongsan.forEach(element => {

                        if (element.id == val.id) {
                            console.log(element.id, val.id, i);
                            $scope.selectedEscrow[i] = { name: element.name, id: element.id, price: element.price, quantity: element.quantity };
                            val.quantity = element.quantity;
                        }
                    });
                    // var kk = { name: val.name, id: val.id, price: val.price, quantity: val.quantity };
                })

            }
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
                                        <button type="button" class="close" ng-click="removeContractImage($event)" >
                                            <span aria-hidden="true">×</span>
                                        </button>
                                    </div>`;
                        angular.element(jQuery('#contractImagesView')).append($compile(html)($scope));
                    });
                })
            }
            // console.log($scope.selectedEscrow);
            item.investPackage['typeText'] = 'Ký gửi nông sản';
            if (item.investPackage.type == 0) item.investPackage['typeText'] = 'Ủy thác đầu tư';
            abcxyz(item, id);
            $scope.investDetails = item;
            jQuery("#editUserInvestModal").modal('show');
        })

    }

    $scope.addPicture = function() {
        jQuery('#contractImages').click();
    }

    $scope.fileNameChanged = async function(element) {
        // console.log(element[0].files);
        var files = element[0].files;
        Promise.all(jQuery.map(files, async function(img) {
            img = await convertFiletoBase64(img);
            img.data = await compressImage(img.data, 900, 900, 0.8);
            console.log(img);
            return img;
        })).then((arrayImgs) => {
            $scope.contractImages = arrayImgs;
            arrayImgs.forEach(element => {
                var html = `<div class="imgBlock" img-name="` + element.name + `">
                                <img src="` + element.data + `" style="max-width: 200px; max-heigh:200px" ng-click="openContractImage($event)"/>
                                <button type="button" class="close" ng-click="removeContractImage($event)" >
                                    <span aria-hidden="true">×</span>
                                </button>
                            </div>`;
                angular.element(jQuery('#contractImagesView')).append($compile(html)($scope));
            });
        })

    }

    $scope.openContractImage = function(e) {
        var newTab = window.open();
        newTab.document.body.innerHTML = '<img src="' + jQuery(e.currentTarget).attr('src') + '" >';
    }

    $scope.removeContractImage = function(event) {
        jQuery.each($scope.contractImages, function(i) {
            if ($scope.contractImages[i].name === jQuery(event.currentTarget).parent().attr('img-name')) {
                $scope.contractImages.splice(i, 1);
                return false;
            }
        });
        jQuery(event.currentTarget).parent().remove();
        console.log($scope.contractImages);
    }

    $scope.approveUserInvest = function(id) {

        let params = {
            method: 'POST',
            url: '/admin/member/approve-user-invest/' + id,
            data: { update: { status: true } }
        }
        var r = confirm("Bạn có chắc muốn duyệt");
        if (r == true) {
            jQuery('#loadingModalTitle').html('Loading ....');
            jQuery('#loadingModal').modal('show');
            submitBackend(params, $http, function(res) {
                // abcxyz(item, id);
                jQuery('#loadingModalTitle').html(res.mes);
                // $scope.investDetails = item;
            });
        } else {
            return;
        }

    }

    $scope.updateInvestContract = function(investDetails) {
        // contractImages
        investDetails.contract.loainongsan = $scope.selectedEscrow;
        jQuery('#loadingModalTitle').html('Loading ....');
        jQuery('#loadingModal').modal('show');
        let params = {
            method: 'PUT',
            url: '/admin/member/update-invest-contract/' + investDetails._id,
            data: {
                contract: investDetails.contract,
                images: $scope.contractImages
            }
        }
        console.log(params.data);
        submitBackend(params, $http, function(res) {
            console.log(' response', res);
            jQuery('#loadingModalTitle').html(res.mes);
            // alert(res.mes);
            // if (res.status) window.location.reload();
        });
    }

    $scope.deletePromotion = function(id) {
        var r = confirm("Bạn có chắc muốn xóa");
        if (r == true) {
            let params = {
                method: 'DELETE',
                url: '/admin/promotion/item/' + id,
            }
            submitBackend(params, $http, function(res) {
                console.log('delete promotion response', res);
                alert(res.mes);
                if (res.status) window.location.reload();
            });
        } else {
            return;
        }

    }

});