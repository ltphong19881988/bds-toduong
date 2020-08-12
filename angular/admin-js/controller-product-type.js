// ==================== dashboard Controller ================

adminApp.controller("productTypeCtrl", function($rootScope, $scope, $compile, $http, DTOptionsBuilder, DTColumnBuilder, DTColumnDefBuilder) {
    $rootScope.pageTitle = "Admin - Product Type";

    $scope.dtOptions = DTOptionsBuilder
        .newOptions()
        .withFnServerData((sSource, aoData, fnCallback, oSettings) => {
            oSettings.jqXHR = $http.post('/admin/product-type/all', {
                aoData
            }).then((data) => {
                fnCallback(data.data);
            });

        })
        .withOption('serverSide', true)
        .withOption('processing', true)
        .withOption('stateSave', true)
        // .withOption('headerCallback', function(header) {
        //     $compile(angular.element(header).contents())($scope);
        // })
        .withOption('bInfo', false)
        .withOption('searching', true)
        .withOption('createdRow', function(row, data, index) {
            $compile(row)($scope); //add this to compile the DOM
        })
        .withPaginationType('full_numbers')
        .withLightColumnFilter({
            '0': { html: 'input', type: 'datetime' },
            '1': { html: 'input', regexp: true, type: 'text', time: 500 },
            '2': { html: 'input', regexp: true, type: 'text', time: 500 },
            '3': { html: 'input', regexp: true, type: 'text' },
            '4': { html: 'input', regexp: true, type: 'text' },
            '5': { html: 'input', regexp: true, type: 'text' },
        });
    // .withOption('order', [
    //     [1, 'asc'],
    //     [1, 'asc']
    // ])
    $scope.dtColumns = [
        DTColumnBuilder.newColumn('_id').withTitle('ID').notVisible(),
        DTColumnBuilder.newColumn('groupType').withTitle('groupType'),
        DTColumnBuilder.newColumn('dataType').withTitle('dataType'),
        DTColumnBuilder.newColumn('value').withTitle('Giá trị'),
        DTColumnBuilder.newColumn('name').withTitle('Hiển thị'),
        DTColumnBuilder.newColumn('priority').withTitle('Thứ tự'),
        DTColumnDefBuilder.newColumnDef(0).withTitle('Xử lý').withOption('width', '200px').renderWith(renderAction),
    ];

    function renderAction(data, type, full) {
        $scope.allConfig[full._id] = full;
        var html = "<button class='btn btn-info' ng-click=\"preUpdate(allConfig['" + full._id + "'])\"> " + "Sửa" + "</button>";
        return html;
    }

    $scope.allConfig = [];
    jQuery('.card-footer .btn-danger').hide();
    jQuery('.card-footer .btn-info').hide();

    $scope.submitAddProductType = function() {
        jQuery('#loadingModalTitle').html('Loading ....');
        jQuery('#loadingModal').modal('show');
        var params = {
            method: 'POST',
            url: '/admin/product-type/item',
            data: {
                groupType: $scope.item.groupType,
                dataType: $scope.item.dataType,
                name: $scope.item.name,
                value: $scope.item.value,
                priority: $scope.item.priority,
            }
        }
        submitBackend(params, $http, function(result) {
            jQuery('#loadingModalTitle').html(result.mes);
            if (result.status) {
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
            console.log(result);
        })
    }

    $scope.submitUpdateSiteConfig = function() {
        jQuery('#loadingModalTitle').html('Loading ....');
        jQuery('#loadingModal').modal('show');
        var params = {
            method: 'PUT',
            url: '/admin/product-type/item',
            data: {
                _id: $scope.item._id,
                groupType: $scope.item.groupType,
                dataType: $scope.item.dataType,
                name: $scope.item.name,
                value: $scope.item.value,
                priority: $scope.item.priority,
            }
        }
        submitBackend(params, $http, function(result) {
            jQuery('#loadingModalTitle').html(result.mes);
            if (result.status) {
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
            console.log(result);
        })
    }

    $scope.preUpdate = function(item) {
        // console.log(item);
        jQuery('.card-footer .btn-danger').show();
        jQuery('.card-footer .btn-info').show();
        jQuery('.card-footer .btn-success').hide();
        $scope.item = item;
        if (item.dataType == 'object') $scope.value = JSON.stringify(item.value);
    }

    $scope.cancelUpdateSiteConfig = function() {
        $scope.item = {};
        // $scope.groupType = '';
        // $scope.dataType = '';
        // $scope.item.name = '';
        // $scope.item.value = '';
        // $scope.item.priority = '';
        jQuery('.card-footer .btn-danger').hide();
        jQuery('.card-footer .btn-info').hide();
        jQuery('.card-footer .btn-success').show();
    }

});