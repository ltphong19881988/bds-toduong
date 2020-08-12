// ==================== UserInvest Controller ================

var getTransactionDetails = function($scope, $http, id, callback) {
    let params = {
        method: 'GET',
        url: '/admin/transactions/transaction-details/' + id,
    }
    submitBackend(params, $http, function(res) {
        callback(res);
    });
}

var InitWithdrawTable = function($scope, $compile, $http, DTOptionsBuilder, DTColumnBuilder, DTColumnDefBuilder) {
    $scope.dtOptions = DTOptionsBuilder
        .newOptions()
        .withFnServerData((sSource, aoData, fnCallback, oSettings) => {
            oSettings.jqXHR = $http.post('/admin/transactions/all-user-withdraw', {
                aoData
            }).then((data) => {
                fnCallback(data.data);
            });

        })
        .withOption('serverSide', true)
        .withOption('processing', true)
        .withOption('stateSave', true)
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
                    value: 'cash',
                    label: 'Hoa hồng'
                }, {
                    value: 'commission',
                    label: 'Lãi ngày'
                }]
            },
            '3': { html: 'input', regexp: true, type: 'text' },
            '4': { html: 'input', type: 'text' },
            '5': {
                html: 'select',
                values: [{
                    value: '',
                    label: 'Tất cả'
                }, {
                    value: 0,
                    label: 'Chưa duyệt'
                }, {
                    value: 1,
                    label: 'Đã duyệt'
                }, {
                    value: 2,
                    label: 'Chưa nhập mã xác thực'
                }]
            },

        })
        .withButtons([{
                extend: 'excelHtml5',
                title: '<What ever file name you need>',
                text: 'xuat file',
                exportOptions: { columns: [1, 2, 3, 4, 5] },
                CharSet: "utf8",
                exportData: { decodeEntities: true }
            },
            { extend: 'csv' }
        ]);
    // .withOption('order', [
    //     [1, 'asc'],
    //     [1, 'asc']
    // ])
    $scope.dtColumns = [
        DTColumnBuilder.newColumn('_id').withTitle('ID').notVisible(),
        DTColumnBuilder.newColumn('user.username').withTitle('Username'),
        DTColumnBuilder.newColumn('walletType').withTitle('Loại ví').renderWith(function(data, type, full) {
            var abc = '';
            if (full.walletType == 'cash') abc = 'Hoa hồng';
            if (full.walletType == 'commission') abc = 'Lãi ngày';
            return abc;
        }),
        DTColumnBuilder.newColumn('amount').withTitle('Só tiền'),
        // DTColumnBuilder.newColumn('abc').withTitle('Gói').renderWith(function(data, type, full) {
        //     return moment(new Date(full.investPackage.name)).format('DD-MM-YYYY');
        // }),
        DTColumnBuilder.newColumn('datecreate').withTitle('Ngày tạo').renderWith(function(data, type, full) {
            return moment(new Date(full.datecreate)).format('DD-MM-YYYY');
        }),
        DTColumnBuilder.newColumn('status').withTitle('Trạng thái').renderWith(function(data, type, full) {
            console.log(full.status);
            if (full.status == 0) {
                return '<p class="text-red">Chưa duyệt</p>';
            } else if (full.status == 1) {
                return '<p class="text-green">Đã duyệt</p>';
            } else if (full.status == 2) {
                return '<p class="text-green">Chưa nhập mã xác thực</p>';
            }
        }),
        // DTColumnBuilder.newColumn('dateApproved').withTitle('Ngày duyệt').renderWith(function(data, type, full) {
        //     if (full.dateApproved)
        //         return moment(new Date(full.dateApproved)).format('DD-MM-YYYY');
        //     else
        //         return null;
        // }),
        DTColumnBuilder.newColumn('user.bankInfo.bankName').withTitle('Ngân hàng'),
        DTColumnBuilder.newColumn('user.bankInfo.bankAccountNumber').withTitle('Số tài khoản'),
        DTColumnBuilder.newColumn('user.bankInfo.bankAccountHolder').withTitle('Chủ tài khoản'),
        DTColumnDefBuilder.newColumnDef(0).withTitle('Xử lý').withOption('width', '200px').renderWith(renderAction),
    ];

    function renderAction(data, type, full) {
        var html = ' <button class="btn btn-info" ng-click="viewDetails(\'' + full._id + '\');"> ' + "Xem - Duyệt" + '</button>';
        // if (full.status == false) html += ' <button class="btn btn-success" ng-click="approveUserInvest(\'' + full._id + '\');"> ' + "Duyệt" + '</button>';
        return html;
    }

    function abcxyz(item, id) {
        item['statusText'] = '<span class="text-green">Đã duyệt</span>';
        angular.element(jQuery('#approveBtn')).html('');
        if (item.status) {
            item['statusText'] = '<span class="text-red">Chưa duyệt</span>';
            var htmlBTN = `<button class="btn btn-success" ng-click="approveUserInvest('` + id + `');"> Duyệt</button>`
            angular.element(jQuery('#approveBtn')).append($compile(htmlBTN)($scope));
        }
        jQuery('#statusText').html(item['statusText']);
    }

    $scope.viewDetails = function(id) {
        getTransactionDetails($scope, $http, id, function(res) {
            $scope.tranDetails = res;
            $scope.listStatus = ['Chưa duyệt', 'Đã duyệt', 'Chưa nhập mã xác thực'];
            $scope.model = {
                selectedStatus: $scope.listStatus[res.status]
            }
            jQuery("#editTransactionModal").modal('show');
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

    $scope.updateWithdrawContract = function(tranDetails) {
        var r = confirm("Bạn có chắc muốn thay đổi ? ");
        if (r == true) {
            jQuery('#loadingModalTitle').html('Loading ....');
            jQuery('#loadingModal').modal('show');
            let params = {
                method: 'PUT',
                url: '/admin/transactions/transaction-details/' + tranDetails._id,
                data: {
                    status: $scope.listStatus.indexOf($scope.model.selectedStatus),
                    contract: tranDetails.contract,
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
        } else {
            return;
        }

    }

}

var InitTransactionsTable = function($scope, $compile, $http, DTOptionsBuilder, DTColumnBuilder, DTColumnDefBuilder) {
    $scope.dtOptions = DTOptionsBuilder
        .newOptions()
        .withFnServerData((sSource, aoData, fnCallback, oSettings) => {
            oSettings.jqXHR = $http.post('/admin/transactions/all-transactions-index', {
                aoData
            }).then((data) => {
                console.log(data.data);
                fnCallback(data.data);
            });

        })
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
                    value: 'cash',
                    label: 'Hoa hồng'
                }, {
                    value: 'commission',
                    label: 'Lãi ngày'
                }, {
                    value: 'shopping',
                    label: 'Tiêu dùng'
                }, {
                    value: 'travel',
                    label: 'Du lịch'
                }, {
                    value: 'edu',
                    label: 'Đào tạo'
                }, {
                    value: 'stock',
                    label: 'Điểm BLG'
                }],
                width: '120px'
            },
            '3': {
                html: 'select',
                values: [{
                    value: '',
                    label: 'Tất cả'
                }, {
                    value: 'deposit',
                    label: 'Nạp tiền'
                }, {
                    value: "promotion",
                    label: 'Khuyến mãi'
                }, {
                    value: 'interest',
                    label: 'Lãi ngày'
                }, {
                    value: 'travel',
                    label: 'Du lịch'
                }, {
                    value: 'edu',
                    label: 'Đào tạo'
                }, {
                    value: 'stock',
                    label: 'Điểm BLG'
                }],
                width: '120px'
            },
            '4': { html: 'input', regexp: true, type: 'text' },
            '5': { html: 'range', type: 'date', width: '120px' },
            '6': {
                html: 'select',
                values: [{
                    value: '',
                    label: 'Tất cả'
                }, {
                    value: 0,
                    label: 'Chưa duyệt'
                }, {
                    value: 1,
                    label: 'Đã duyệt'
                }, {
                    value: 2,
                    label: 'Chưa nhập mã xác thực'
                }]
            },

        })
        .withButtons([{
                extend: 'excelHtml5',
                title: '<What ever file name you need>',
                text: 'xuat excel',
                exportOptions: {
                    columns: [1, 2, 3, 4, 5],
                    modifier: {
                        search: 'applied',
                        order: 'applied',
                        page: 'all'
                    }
                },
                CharSet: "utf8",
                exportData: { decodeEntities: true }
            },
            { extend: 'csv' }
        ]);
    // .withOption('order', [
    //     [1, 'asc'],
    //     [1, 'asc']
    // ])
    $scope.dtColumns = [
        DTColumnBuilder.newColumn('_id').withTitle('ID').notVisible(),
        DTColumnBuilder.newColumn('user.username').withTitle('Username'),
        DTColumnBuilder.newColumn('walletType').withTitle('Loại ví').renderWith(function(data, type, full) {
            var abc = '';
            if (full.walletType == 'cash') abc = 'Hoa hồng';
            if (full.walletType == 'commission') abc = 'Lãi ngày';
            if (full.walletType == 'shopping') abc = 'Tiêu dùng';
            if (full.walletType == 'travel') abc = 'Du lịch';
            if (full.walletType == 'edu') abc = 'Đào tạo';
            if (full.walletType == 'stock') abc = 'Điểm BLG';
            return abc;
        }),
        DTColumnBuilder.newColumn('method').withTitle('Loại giao dịch').renderWith(function(data, type, full) {
            var abc = '';
            if (full.method == 'deposit') abc = 'Nạp tiền';
            if (full.method == 'invest') abc = 'Đầu tư';
            if (full.method == "promotion") abc = 'Khuyến mãi';
            if (full.method == 'interest') abc = 'Lãi ngày';
            if (full.method == 'interest per interest') abc = 'Lãi trên lãi';
            if (full.method == 'stock') abc = 'Điểm BLG';
            return abc;
        }),
        DTColumnBuilder.newColumn('amount').withTitle('Só tiền'),
        // DTColumnBuilder.newColumn('abc').withTitle('Gói').renderWith(function(data, type, full) {
        //     return moment(new Date(full.investPackage.name)).format('DD-MM-YYYY');
        // }),
        DTColumnBuilder.newColumn('datecreate').withTitle('Ngày tạo').renderWith(function(data, type, full) {
            return moment(new Date(full.datecreate)).format('DD-MM-YYYY HH:mm:ss');
        }),
        DTColumnBuilder.newColumn('status').withTitle('Trạng thái').renderWith(function(data, type, full) {
            if (full.status == 0) {
                return '<p class="text-red">Chưa duyệt</p>';
            } else if (full.status == 1) {
                return '<p class="text-green">Đã duyệt</p>';
            } else if (full.status == 2) {
                return '<p class="text-green">Chưa nhập mã xác thực</p>';
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

    function abcxyz(item, id) {
        item['statusText'] = '<span class="text-green">Đã duyệt</span>';
        angular.element(jQuery('#approveBtn')).html('');
        if (item.status) {
            item['statusText'] = '<span class="text-red">Chưa duyệt</span>';
            var htmlBTN = `<button class="btn btn-success" ng-click="approveUserInvest('` + id + `');"> Duyệt</button>`
            angular.element(jQuery('#approveBtn')).append($compile(htmlBTN)($scope));
        }
        jQuery('#statusText').html(item['statusText']);
    }

    $scope.viewDetails = function(id) {
        getUserInvestDetails($scope, $http, id, function(item) {
            abcxyz(item, id);
            $scope.investDetails = item;
            jQuery("#editUserInvestModal").modal('show');
        })

    }

}

adminApp.controller("transactionsCtrl", function($rootScope, $scope, $http, $compile, $location, DTOptionsBuilder, DTColumnBuilder, DTColumnDefBuilder) {
    $rootScope.pageTitle = "Admin - Withdraw transaction";

    if ($location.$$url.indexOf('/transactions/withdraw') != -1) {
        InitWithdrawTable($scope, $compile, $http, DTOptionsBuilder, DTColumnBuilder, DTColumnDefBuilder);
    }

    if ($location.$$url.indexOf('/transactions/index') != -1) {
        InitTransactionsTable($scope, $compile, $http, DTOptionsBuilder, DTColumnBuilder, DTColumnDefBuilder);
    }

    // $scope.approveUserInvest = function(id) {
    //     let params = {
    //         method: 'POST',
    //         url: '/admin/member/update-user-invest/' + id,
    //         data: { update: { status: true } }
    //     }
    //     var r = confirm("Bạn có chắc muốn duyệt");
    //     if (r == true) {
    //         submitBackend(params, $http, function(item) {
    //             // abcxyz(item, id);
    //             $scope.investDetails = item;
    //         });
    //     } else {
    //         return;
    //     }

    // }

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