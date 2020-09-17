app.controller("loginCtrl", function($rootScope, $scope, $http) {
    $rootScope.$watch('logedUser', function(value) {
        if (value) {
            // console.log(value);
            if (!value.sponsor) value.sponsor = 'Không có';
        }
    })
    $scope.login = {username: '', password:''};

    $scope.submitLogin = function(e){
        e.preventDefault();
        console.log($scope.login);
        let params = {
            method: 'POST',
            url: '/login',
            data: {
                login: $scope.login.username,
                password: $scope.login.password,
            }
        };

        submitFrontEnd(params, $http, function(loginResponse) {
            // jQuery("#loadingModal").modal('hide');
            console.log('post login response', loginResponse);
            alert(loginResponse.mes);
            if (loginResponse.status == true) {
                jQuery('#loadingModalTitle').html('Đăng nhập thành công, vui lòng đợi chuyển trang');
                localStorage.setItem('token', loginResponse.token);
                $("#formLogin")[0].reset();
                var abc = getUrlParameter("redirect");
                if (typeof abc === "undefined" || abc == null) {
                    abc = "/admin";
                }
                setTimeout(function() {
                    window.location.href = abc;
                }, 1500);
            } else {
                jQuery('#loadingModalTitle').html(loginResponse.mes);
            }
        });


    }

    

});