// ==================== Members Controller ================
var getUserInfo = function(id, $http, callback) {
    let params = {
        method: 'GET',
        url: '/admin/member/user-info/' + id,
    };
    submitBackend(params, $http, function(res) {
        console.log('user ', res);
        callback(res);
    });
}

var getAllRoles = function($http, callback) {
    let params = {
        method: 'GET',
        url: '/admin/member/all-roles',
    };
    submitBackend(params, $http, function(res) {
        console.log('all roles ', res);
        callback(res);
    });
}


var InitMembersTable = function($scope, $compile, $http, DTOptionsBuilder, DTColumnBuilder, DTColumnDefBuilder) {
    $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withFnServerData((sSource, aoData, fnCallback, oSettings) => {
            oSettings.jqXHR = $http.post('/admin/member/all-members', {
                aoData
            }).then((data) => {
                fnCallback(data.data);
            });

        })
        .withOption('serverSide', true)
        .withOption('processing', true)
        .withOption('bInfo', false)
        .withOption('searching', true)
        .withOption('createdRow', function(row, data, index) {
            $compile(row)($scope); //add this to compile the DOM
        })
        .withLightColumnFilter({
            '0': { html: 'input', type: 'datetime' },
            '1': { html: 'input', regexp: true, type: 'text', time: 500 },
            '2': { html: 'input', regexp: true, type: 'text', time: 500 },
            '3': { html: 'input', type: 'datetime' },
            '4': {
                html: 'select',
                values: [{
                    value: '',
                    label: 'Tất cả'
                }, {
                    value: false,
                    label: 'No'
                }, {
                    value: true,
                    label: 'Yes'
                }]
            },
            '5': {
                html: 'select',
                values: [{
                    value: '',
                    label: 'Tất cả'
                }, {
                    value: false,
                    label: 'No'
                }, {
                    value: true,
                    label: 'Yes'
                }]
            },
            '6': { html: 'label', type: 'text' },

        });
    // .withOption('order', [
    //     [1, 'asc'],
    //     [1, 'asc']
    // ])
    // .withPaginationType('full_numbers');
    $scope.dtColumns = [
        DTColumnBuilder.newColumn('_id').withTitle('ID').notVisible(),
        DTColumnBuilder.newColumn('username').withTitle('Username'),
        DTColumnBuilder.newColumn('email').withTitle('Email'),
        DTColumnBuilder.newColumn('datecreate').withTitle('Ngày đăng ký').renderWith(function(data, type, full) {
            return moment(new Date(full.datecreate)).format('DD-MM-YYYY');
        }),
        DTColumnBuilder.newColumn('verifyEmail').withTitle('Xác thực email').renderWith(function(data, type, full) {
            if (full.verifyEmail == false) {
                return '<p class="text-red">No</p>';
            } else if (full.verifyEmail == true) {
                return '<p class="text-green">Yes</p>';
            }
        }),
        DTColumnBuilder.newColumn('verifyPhone').withTitle('Xác thực thông tin').renderWith(function(data, type, full) {
            if (full.verifyPhone == false) {
                return '<p class="text-red">No</p>';
            } else if (full.verifyPhone == true) {
                return '<p class="text-green">Yes</p>';
            }
        }),
        // DTColumnBuilder.newColumn('price').withTitle('Giá trị'),
        // DTColumnBuilder.newColumn('type').withTitle('Loại mã').renderWith(function(data, type, full) {
        //     if (full.type == 0) {
        //         return ' VND';
        //     } else if (full.type == 1) {
        //         return ' %';
        //     }
        // }),
        // DTColumnBuilder.newColumn('datecreate').withTitle('Ngày tạo'),
        DTColumnDefBuilder.newColumnDef(0).withTitle('Xử lý').renderWith(renderAction),
    ];

    function renderAction(data, type, full) {
        return ' <button class="btn btn-info" ng-click="viewMemberDetails(\'' + full._id + '\');"> ' + "Xem" + '</button>' +
            ' <button class="btn btn-danger" ng-click="deleteUser(\'' + full._id + '\');"> ' + "Xóa" + '</button>';
    }
}

var InitModsTable = function($scope, $compile, $http, DTOptionsBuilder, DTColumnBuilder, DTColumnDefBuilder) {
    $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withFnServerData((sSource, aoData, fnCallback, oSettings) => {
            oSettings.jqXHR = $http.post('/admin/member/all-mods', {
                aoData
            }).then((data) => {
                fnCallback(data.data);
            });

        })
        .withOption('serverSide', true)
        .withOption('processing', true)
        .withOption('bInfo', false)
        .withOption('searching', true)
        .withOption('createdRow', function(row, data, index) {
            $compile(row)($scope); //add this to compile the DOM
        })
        .withLightColumnFilter({
            '0': { html: 'input', type: 'datetime' },
            '1': { html: 'input', regexp: true, type: 'text', time: 500 },
            '2': { html: 'input', regexp: true, type: 'text', time: 500 },
            '3': { html: 'input', type: 'datetime' },
            '4': {
                html: 'select',
                values: [{
                    value: '',
                    label: 'Tất cả'
                }, {
                    value: false,
                    label: 'No'
                }, {
                    value: true,
                    label: 'Yes'
                }]
            },
            '5': {
                html: 'select',
                values: [{
                    value: '',
                    label: 'Tất cả'
                }, {
                    value: false,
                    label: 'No'
                }, {
                    value: true,
                    label: 'Yes'
                }]
            },
            '6': { html: 'label', type: 'text' },

        });
    // .withOption('order', [
    //     [1, 'asc'],
    //     [1, 'asc']
    // ])
    // .withPaginationType('full_numbers');
    $scope.dtColumns = [
        DTColumnBuilder.newColumn('_id').withTitle('ID').notVisible(),
        DTColumnBuilder.newColumn('username').withTitle('Username'),
        DTColumnBuilder.newColumn('email').withTitle('Email'),
        DTColumnBuilder.newColumn('datecreate').withTitle('Ngày đăng ký').renderWith(function(data, type, full) {
            return moment(new Date(full.datecreate)).format('DD-MM-YYYY');
        }),
        DTColumnBuilder.newColumn('verifyEmail').withTitle('Xác thực email').renderWith(function(data, type, full) {
            if (full.verifyEmail == false) {
                return '<p class="text-red">No</p>';
            } else if (full.verifyEmail == true) {
                return '<p class="text-green">Yes</p>';
            }
        }),
        DTColumnBuilder.newColumn('verifyPhone').withTitle('Xác thực thông tin').renderWith(function(data, type, full) {
            if (full.verifyPhone == false) {
                return '<p class="text-red">No</p>';
            } else if (full.verifyPhone == true) {
                return '<p class="text-green">Yes</p>';
            }
        }),
        // DTColumnBuilder.newColumn('price').withTitle('Giá trị'),
        // DTColumnBuilder.newColumn('type').withTitle('Loại mã').renderWith(function(data, type, full) {
        //     if (full.type == 0) {
        //         return ' VND';
        //     } else if (full.type == 1) {
        //         return ' %';
        //     }
        // }),
        // DTColumnBuilder.newColumn('datecreate').withTitle('Ngày tạo'),
        DTColumnDefBuilder.newColumnDef(0).withTitle('Xử lý').renderWith(renderAction),
    ];

    function renderAction(data, type, full) {
        return ' <button class="btn btn-info" ng-click="viewModDetails(\'' + full._id + '\');"> ' + "Xem - Sửa" + '</button>' +
            ' <button class="btn btn-danger" ng-click="deleteModUser(\'' + full._id + '\');"> ' + "Xóa" + '</button>';
    }
}

adminApp.controller("memberCtrl", function($rootScope, $scope, $http, $compile, $location, DTOptionsBuilder, DTColumnBuilder, DTColumnDefBuilder) {
        $rootScope. = "Admin - Members";

        if ($location.$$path.indexOf('/member') != -1) {
            InitMembersTable($scope, $compile, $http, DTOptionsBuilder, DTColumnBuilder, DTColumnDefBuilder);
        }

        if ($location.$$path.indexOf('/moderator') != -1) {
            getAllRoles($http, function(res) {
                $scope.selectedRoles = res;
            })
            InitModsTable($scope, $compile, $http, DTOptionsBuilder, DTColumnBuilder, DTColumnDefBuilder);
        }


        $scope.viewMemberDetails = function(id) {
            getUserInfo(id, $http, function(res) {
                $scope.user = res;
                jQuery('#editModal').modal('show');
            })
        }


        $scope.viewModDetails = function(id) {
            getUserInfo(id, $http, function(res) {
                $scope.user = res;
                jQuery.map($scope.selectedRoles, function(val, i) {
                    $scope.user.roles.forEach(element => {
                        if (element._id == val._id) {
                            val.action = element.action;
                        }
                    });
                    return val;
                })
                jQuery('#editModal').modal('show');
            })

        }

        $scope.UpdateUserModerator = function() {
            let params = {
                method: 'PUT',
                url: '/admin/member/user-info/' + $scope.user._id,
                data: {
                    roles: $scope.selectedRoles,
                }
            };
            submitBackend(params, $http, function(res) {
                console.log('update mod response ', res);
                alert(res.mes);
                if (res.status) $scope.user = res.user;
            });
        }

    })
    .directive('editMemberTemplate', function() {
        return {
            restrict: 'E',
            templateUrl: '/tpls/admin/member/edit-member.html'
        };
    })
    .directive('editModTemplate', function() {
        return {
            restrict: 'E',
            templateUrl: '/tpls/admin/member/edit-mod.html'
        };
    });