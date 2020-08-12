// ==================== slider Controller ================
var getAllSlider = function($scope, $http) {
    let params = {
        method: 'POST',
        url: '/admin/slider/all',
    }
    submitBackend(params, $http, function(res) {
        console.log('all sliders', res);
        $scope.listSliders = res;
    });
}

adminApp.controller("sliderCtrl", function($rootScope, $scope, $compile, $http, DTOptionsBuilder, DTColumnBuilder, DTColumnDefBuilder) {
    $rootScope.pageTitle = "Admin - Config";
    $scope.rootFolderPath = 'public/uploads/media/';
    $scope.acviteFolderPath = 'public/uploads/media/slider-banner/';
    $scope.item = { postType: 2, normalPrice: 1 };
    jQuery('.card-footer .btn-danger').hide();
    jQuery('.card-footer .btn-info').hide();
    jQuery('.card-footer .btn-success').show();
    getAllSlider($scope, $http);

    $scope.prepareGallery = function() {
        listAllFilesAndFolder($http, { value: $scope.acviteFolderPath, type: "list-deep" }, function(response) {
            angular.element(jQuery("#listFiles")).html('');
            response.files.forEach(element => {
                var abc = element.split('\\');
                var html = `<li ng-click="selectImageFromGallery($event)" >
                <img style="max-height:90px;" src="` + ($scope.acviteFolderPath + element).replace(/\\/g, '/').replace('public', '') + `" />
                <p>` + abc[abc.length - 1] + `</p>
        </li>`;
                angular.element(jQuery("#listFiles")).append($compile(html)($scope));
            });
            jQuery('#galleryModal').modal('show');
        })

    }

    $scope.selectImageFromGallery = function(e) {
        // var imgSrc = jQuery(e.currentTarget).find('img').attr('src');
        $scope.item['videoUrl'] = jQuery(e.currentTarget).find('img').attr('src');
        jQuery('#galleryModal').modal('hide');
    }

    $scope.checkVisibleTonggle = function(e) {
        if (jQuery(e.currentTarget).prop('checked')) {
            $scope.item.normalPrice = 1;
        } else {
            $scope.item.normalPrice = 0;
        }
        console.log($scope.item);
    }

    $scope.submitAddSlider = function() {
        jQuery('#loadingModalTitle').html('Loading ....');
        jQuery('#loadingModal').modal('show');
        var params = {
            method: 'POST',
            url: '/admin/slider',
            data: $scope.item
        }
        submitBackend(params, $http, function(result) {
            console.log('add slider', result);
            jQuery('#loadingModalTitle').html(result.mes);
            if (result.status) {
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
            console.log(result);
        })
    }

    $scope.tonggleVisible = function(e, item) {
        jQuery('#loadingModalTitle').html('Loading ....');
        jQuery('#loadingModal').modal('show');
        if (item.normalPrice == 0) item.normalPrice = 1;
        else item.normalPrice = 0;
        var params = {
            method: 'PUT',
            url: '/admin/slider',
            data: item,
        }
        submitBackend(params, $http, function(result) {

            if (result.status) {
                if (item.normalPrice == 0) {
                    result.mes += " : Đã ẩn";
                    jQuery(e.currentTarget).removeClass('btn-success').addClass('btn-dark');
                } else {
                    jQuery(e.currentTarget).removeClass('btn-dark').addClass('btn-success');
                    result.mes += " : Đã hiện";
                }
                // setTimeout(() => {
                //     window.location.reload();
                // }, 1500);
                jQuery('#loadingModalTitle').html(result.mes);
            } else {
                jQuery('#loadingModalTitle').html(result.mes);
            }

        });
        // if (jQuery(e.currentTarget).hasClass('btn-success')) {
        //     jQuery(e.currentTarget).removeClass('btn-success').addClass('btn-dark');
        // } else {
        //     jQuery(e.currentTarget).removeClass('btn-dark').addClass('btn-success');
        // }
        // post to server
    }

    $scope.prepareEdit = function($event, item) {
        $scope.item = item;
        if ($scope.item.normalPrice && $scope.item.normalPrice == 1) {
            jQuery('input[name="checkVisible"]').prop('checked', true);
        } else {
            jQuery('input[name="checkVisible"]').prop('checked', false);
        }
        jQuery('.card-footer .btn-danger').show();
        jQuery('.card-footer .btn-info').show();
        jQuery('.card-footer .btn-success').hide();
    }

    $scope.submitUpdateSlider = function(e) {
        jQuery('#loadingModalTitle').html('Loading ....');
        jQuery('#loadingModal').modal('show');
        // console.log($scope.item);
        var params = {
            method: 'PUT',
            url: '/admin/slider',
            data: $scope.item,
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

    $scope.cancelUpdateSiteConfig = function() {
        $scope.item = { postType: 2, normalPrice: 1 };
        jQuery('.card-footer .btn-danger').hide();
        jQuery('.card-footer .btn-info').hide();
        jQuery('.card-footer .btn-success').show();
    }

    $scope.prepareDelete = function(e, item) {
        var r = confirm("Bạn có chắc muốn xóa ảnh này ?");
        if (r == true) {
            var params = {
                method: 'DELETE',
                url: '/admin/slider',
                data: $scope.item,
            }
        }
    }

});