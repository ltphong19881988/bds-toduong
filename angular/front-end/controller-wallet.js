// Wallet Controller
var getWalletTransactions = function(data, $http, callback) {
    let params = {
        method: 'POST',
        url: '/wallet/wallet-transactions',
        data: data
    };
    // console.log(params);
    // Get all countries for autocomplete
    submitFrontEnd(params, $http, function(res) {
        callback(res);
    });
}

var getWalletBalance = function(data, $http, callback) {
    let params = {
        method: 'POST',
        url: '/wallet/wallet-balance',
        data: data
    };
    // console.log(params);
    // Get all countries for autocomplete
    submitFrontEnd(params, $http, function(res) {
        // console.log('wallet balance', data.walletType, res);
        callback(res);
    });
}

var getAllWalletBalance = function($scope, $http) {
    var cashOptions = { currencyType: 'USD', walletType: 'cash', method: '', methodType: '' };
    getWalletBalance(cashOptions, $http, function(result) {
        $scope.cashBalance = result;
    });

    var commissionOptions = { currencyType: 'USD', walletType: 'commission', method: '', methodType: '' };
    getWalletBalance(commissionOptions, $http, function(result) {
        $scope.commissionBalance = result;
    });

    var shoppingOptions = { currencyType: 'USD', walletType: 'shopping', method: '', methodType: '' };
    getWalletBalance(shoppingOptions, $http, function(result) {
        $scope.shoppingBalance = result;
    });

    var travelOptions = { currencyType: 'USD', walletType: 'travel', method: '', methodType: '' };
    getWalletBalance(travelOptions, $http, function(result) {
        $scope.travelBalance = result;
    });

    var eduOptions = { currencyType: 'USD', walletType: 'edu', method: '', methodType: '' };
    getWalletBalance(eduOptions, $http, function(result) {
        $scope.eduBalance = result;
    });

    var stockOptions = { currencyType: 'USD', walletType: 'stock', method: '', methodType: '' };
    getWalletBalance(stockOptions, $http, function(result) {
        $scope.stockBalance = result;
    });
}

var InitTransactionsTable = function($scope, $compile, $http, DTOptionsBuilder, DTColumnBuilder, DTColumnDefBuilder) {
    $scope.dtOptions = DTOptionsBuilder
        .newOptions()
        .withFnServerData((sSource, aoData, fnCallback, oSettings) => {
            oSettings.jqXHR = $http.post('/wallet/wallet-transactions/', {
                aoData,
                transopt: $scope.transopt
            }).then((data) => {
                console.log(data.data);
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
        .withPaginationType('full_numbers');

    $scope.dtColumns = [
        DTColumnBuilder.newColumn('_id').withTitle('ID').notVisible(),
        DTColumnBuilder.newColumn('datecreate').withTitle('Ngày tạo').renderWith(function(data, type, full) {
            return moment(new Date(full.datecreate)).format('DD-MM-YYYY HH:mm:ss');
        }),
        DTColumnBuilder.newColumn('method').withTitle('Loại giao dịch').renderWith(function(data, type, full) {
            var abc = '';
            if (full.method == 'commission') abc = 'Hoa hồng';
            if (full.method == 'deposit') abc = 'Nạp tiền';
            if (full.method == 'invest') abc = 'Đầu tư';
            if (full.method == "promotion") abc = 'Khuyến mãi';
            if (full.method == 'interest') abc = 'Lãi ngày';
            if (full.method == 'interest per interest') abc = 'Lãi trên lãi';
            if (full.method == 'stock') abc = 'Điểm BLG';
            return full.method;
        }),
        DTColumnBuilder.newColumn('methodType').withTitle('Ghi chú').renderWith(function(data, type, full) {
            return full.methodType;
        }),
        DTColumnBuilder.newColumn('amount').withTitle('Só tiền'),
        // DTColumnBuilder.newColumn('abc').withTitle('Gói').renderWith(function(data, type, full) {
        //     return moment(new Date(full.investPackage.name)).format('DD-MM-YYYY');
        // }),

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

var InitWithdrawTable = function($scope, $compile, $http, DTOptionsBuilder, DTColumnBuilder, DTColumnDefBuilder) {
    $scope.dtOptions = DTOptionsBuilder
        .newOptions()
        .withFnServerData((sSource, aoData, fnCallback, oSettings) => {
            oSettings.jqXHR = $http.post('/wallet/wallet-transactions/', {
                aoData,
                transopt: $scope.withdrawopt
            }).then((data) => {
                console.log(data.data);
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
        .withPaginationType('full_numbers');

    $scope.dtColumns = [
        DTColumnBuilder.newColumn('_id').withTitle('ID').notVisible(),
        DTColumnBuilder.newColumn('datecreate').withTitle('Ngày tạo').renderWith(function(data, type, full) {
            return moment(new Date(full.datecreate)).format('DD-MM-YYYY HH:mm:ss');
        }),
        DTColumnBuilder.newColumn('method').withTitle('Loại giao dịch').renderWith(function(data, type, full) {
            var abc = '';
            if (full.method == 'commission') abc = 'Hoa hồng';
            if (full.method == 'deposit') abc = 'Nạp tiền';
            if (full.method == 'invest') abc = 'Đầu tư';
            if (full.method == "promotion") abc = 'Khuyến mãi';
            if (full.method == 'interest') abc = 'Lãi ngày';
            if (full.method == 'interest per interest') abc = 'Lãi trên lãi';
            if (full.method == 'stock') abc = 'Điểm BLG';
            return full.method;
        }),
        DTColumnBuilder.newColumn('methodType').withTitle('Ghi chú').renderWith(function(data, type, full) {
            return full.methodType;
        }),
        DTColumnBuilder.newColumn('amount').withTitle('Só tiền'),
        // DTColumnBuilder.newColumn('abc').withTitle('Gói').renderWith(function(data, type, full) {
        //     return moment(new Date(full.investPackage.name)).format('DD-MM-YYYY');
        // }),

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

app.controller("walletCtrl", function($rootScope, $scope, $compile, $http, $translate, $routeParams, $location, DTOptionsBuilder, DTColumnBuilder, DTColumnDefBuilder) {
    // console.log($routeParams, $location);
    $translate('WALLET').then(function(title) {
        $rootScope.pageTitle = $rootScope.siteTitle + ' - ' + title;
    });
    if ($location.$$url.indexOf('/wallet/index') != -1) {
        getAllWalletBalance($scope, $http);

    }
    if ($location.$$url.indexOf('/wallet/details') != -1) {
        // console.log($routeParams.walletType);
        $scope.walletTypeText = 'Ví hoa hồng';
        if ($routeParams.walletType == 'commission') $scope.walletTypeText = 'Ví lãi ngày';
        if ($routeParams.walletType == 'shopping') $scope.walletTypeText = 'Ví tiêu dùng';
        if ($routeParams.walletType == 'travel') $scope.walletTypeText = 'Ví du lịch';
        if ($routeParams.walletType == 'education') $scope.walletTypeText = 'Ví đào tạo';
        if ($routeParams.walletType == 'stock') $scope.walletTypeText = 'Điểm tích lũy (BLG)';

        var options = { currencyType: 'USD', walletType: $routeParams.walletType, method: '', methodType: '' };

        getWalletBalance(options, $http, function(result) {
            $scope.balance = result;
        });
        $scope.transopt = { currencyType: 'USD', walletType: $routeParams.walletType };
        if ($routeParams.walletType == 'education') $scope.transopt.walletType = 'edu';
        InitTransactionsTable($scope, $compile, $http, DTOptionsBuilder, DTColumnBuilder, DTColumnDefBuilder);
        // getWalletTransactions(transopt, $http, function(result) {
        //     $scope.transactions = result;
        //     // console.log('trans', result);
        // })
    }
    if ($location.$$url.indexOf('/wallet/withdraw') != -1) {
        var cashOptions = { currencyType: 'USD', walletType: 'cash', method: '', methodType: '' };
        getWalletBalance(cashOptions, $http, function(result) {
            $scope.cashBalance = result;
        });
        var commissionOptions = { currencyType: 'USD', walletType: 'commission', method: '', methodType: '' };
        getWalletBalance(commissionOptions, $http, function(result) {
            $scope.commissionBalance = result;
        });
        $scope.withdrawopt = { currencyType: 'USD', method: 'withdraw' };

        InitWithdrawTable($scope, $compile, $http, DTOptionsBuilder, DTColumnBuilder, DTColumnDefBuilder);







        // getWalletTransactions({ transopt: withdrawopt }, $http, function(result) {
        //     jQuery.map(result, function(item) {
        //         if (item.walletType == 'cash') item.walletType = "Hoa hồng";
        //         if (item.walletType == 'commission') item.walletType = "Lãi ngày";
        //         item['statusText'] = "Chưa duyệt";
        //         if (item.status == 1) item['statusText'] = "Đã duyệt";
        //         return item;
        //     });
        //     $scope.withdrawTransactions = result;
        //     console.log('withdraw trans', result);
        // })
        $scope.cashWithdrawAmount = 0;
        $scope.commissionWithdrawAmount = 0;
    }


    // getUSDWalletHistories($http, function(result) {
    //     $scope.histories = result;
    // });
    $scope.deposit = function(pair, event) {
        jQuery("#depositQrCode").html("");
        $scope.selectedpair = pair;
        for (var i = 0; i < $scope.listCurrencies.length; i++) {
            if ($scope.listCurrencies[i].pair == pair) $scope.selectedpairAddress = $scope.listCurrencies[i].address;
        }

        var options = {
            // render method: 'canvas', 'image' or 'div'
            render: 'image',

            // offset in pixel if drawn onto existing canvas
            left: 0,
            top: 0,

            // size in pixel
            size: 200,

            // code color or image element
            fill: '#000',

            // background color or image element, null for transparent background
            background: null,

            // content
            text: $scope.selectedpairAddress,

            // corner radius relative to module width: 0.0 .. 0.5
            radius: 0,
            mode: 0,

            mSize: 0.1,
            mPosX: 0.5,
            mPosY: 0.5,

            label: 'no label',
            fontname: 'sans',
            fontcolor: '#000',

        }
        if ($scope.selectedpairAddress == "generate failed") {
            $scope.selectedpairAddress += " .Please reload the page or try again later. If you can't fix it, contact support for helping."
        } else {
            jQuery("#depositQrCode").qrcode(options);
        }
    }

    $scope.submitWithdraw = function(type) {
        jQuery('#loadingModalTitle').html('Đang xử lý ....');
        jQuery("#loadingModal").modal('show');
        console.log(type, $scope[type + 'WithdrawAmount']);
        let params = {
            method: 'POST',
            url: '/wallet/with-draw',
            data: {
                type: type,
                currencyType: 'USD',
                amount: $scope[type + 'WithdrawAmount']
            }
        };
        submitFrontEnd(params, $http, function(res) {
            jQuery('#loadingModalTitle').html(res.mes);
            console.log('withdraw response', res);
        });
        event.preventDefault();
    }

    $scope.preEmailVerify = function(item, event) {
        $scope.item = item;

    }

    $scope.resendVerifyEmail = function() {
        let params = {
            method: 'POST',
            url: '/wallet/resend-withdraw-code',
            data: {
                item: $scope.item,
            }
        };
        submitFrontEnd(params, $http, function(res) {
            console.log('withdraw response', res);
        });
    }

    $scope.submitVerifyEmail = function() {
        jQuery('#loadingModalTitle').html('Đang xử lý ....');
        jQuery("#loadingModal").modal('show');
        console.log($scope.item, $scope.withdrawVerifyCode);
        let params = {
            method: 'POST',
            url: '/wallet/verify-withdraw-code',
            data: {
                item: $scope.item,
                code: $scope.withdrawVerifyCode
            }
        };
        submitFrontEnd(params, $http, function(res) {
            jQuery('#loadingModalTitle').html(res.mes);
            console.log('withdraw response', res);
        });
    }

});