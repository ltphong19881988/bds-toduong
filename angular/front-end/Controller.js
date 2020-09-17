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

var submitFrontEnd = function(params, $http, callback) {
    // console.log('submitFrontEnd token', curtoken);
    $http({
        method: params.method,
        url: params.url,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'x-access-token': curtoken
        },
        data: params.data,
        // beforeSend: function() {
        //     console.log('before')
        // },
        // complete: function() {
        //     console.log('complete')
        // }
    }).then(function successCallback(response) {
        callback(response.data);
    }, function errorCallback(response) {
        callback({ status: false });
    });
}

// var setLoading = function($compile, $scope) {
//     var html = `<button type="button" style="display: block;" id="btnLoading" class="btn btn-primary" data-toggle="modal" data-target="#loadingModal">
//                     Launch demo modal
//                 </button>`;
//     angular.element('body').append($compile(html)($scope));
//     jQuery('#btnLoading').click();
//     jQuery('#btnLoading').remove();
// }

var setAutoComplete = function($scope, $http) {
    $scope.names = [];
    // $scope.selected = 'Viet Nam';

    let params = {
        method: 'GET',
        url: '/countries/all',
        data: {
            orderCart: $scope.orderCartEdit
        }
    };
    // Get all countries for autocomplete
    submitFrontEnd(params, $http, function(res) {
        console.log('list country ', res);
        $scope.names = res;
        // $scope.$apply();
    });

    jQuery('.showlist').clickOff(function() {
        if ($scope.showlist == true) {
            console.log('?????');
            $scope.selected = null;
            $scope.showlist = false;
            $scope.$apply();
        }
    });
    $scope.showlist = false;
    $scope.clearList = function() {
        $scope.selected = null;
        $scope.showlist = false;
        $scope.idCountry = null;
    }

    $scope.selectedItem = function($event, name) {
        $scope.selected = name.name;
        $scope.showlist = false;
        $scope.idCountry = name._id;
        console.log(name);
    }
}

var checkReferral = function($scope, $http) {
    var refId = localStorage.getItem('refId');
    if (!refId) {
        console.log('no referral');
    } else {
        console.log(refId);
        $scope.refId = refId;
    }

}

authPage.directive('autoComplete', function($timeout) {
    return function(scope, iElement, iAttrs) {
        iElement.bind("keypress", function(e) {
            scope.showlist = true;
        })
    };
}).controller("registerCtrl", function($scope, $rootScope, $http, $translate) {
    $translate('REGISTER').then(function(title) {
        $rootScope.pageTitle = $rootScope.siteTitle + ' - ' + title;
    });
    // $rootScope.pageTitle = $rootScope.siteTitle + " - ";
    // registerTabChange($scope);
    checkReferral($scope, $http);
    //setAutoComplete($scope, $http);

    $scope.submitRegister = function() {
        jQuery('#loadingModalTitle').html('Đang xử lý ...');
        jQuery("#loadingModal").modal('show');
        let params = {
            method: 'POST',
            url: '/register',
            data: {
                username: $scope.username,
                email: $scope.email,
                password: $scope.password,
                passwordConfirm: $scope.passwordConfirm,
                refId: $scope.refId,
                recaptchaResponse: $("#g-recaptcha-response").val()
            }
        };
        console.log('register data', params.data);
        submitFrontEnd(params, $http, function(res) {
            if (res.status == false) {
                jQuery('#loadingModalTitle').html(res.mes);
            } else {
                jQuery('#loadingModalTitle').html('Đăng ký thành công');
                setTimeout(function() {
                    window.location.href = '/login';
                }, 1500);
                // jQuery('#loadingModalTitle').html('Đăng ký thành công, vui lòng xác thực việc đăng ký qua email: ' + res.user.email);
            }
            console.log('post register response', res);
        });

    };
});

authPage.controller("loginCtrl", function($scope, $rootScope, $http, $translate) {
    $translate('LOGIN').then(function(title) {
        $rootScope.pageTitle = $rootScope.siteTitle + ' - ' + title;
    });
    $scope.submitLogin = function(e) {
        jQuery('#loadingModalTitle').html('Đang xử lý ...');
        jQuery("#loadingModal").modal('show');

        let params = {
            method: 'POST',
            url: '/login',
            data: {
                login: $scope.login,
                password: $scope.password,
                recaptchaResponse: $("#g-recaptcha-response").val()
            }
        };
        submitFrontEnd(params, $http, function(loginResponse) {
            // jQuery("#loadingModal").modal('hide');
            console.log('post login response', loginResponse);
            if (loginResponse.status == true) {
                jQuery('#loadingModalTitle').html('Đăng nhập thành công, vui lòng đợi chuyển trang');
                localStorage.setItem('token', loginResponse.token);
                $("#formLogin")[0].reset();
                var abc = getUrlParameter("redirect");
                if (typeof abc === "undefined" || abc == null) {
                    abc = "/dashboard";
                }
                setTimeout(function() {
                    window.location.href = abc;
                }, 1500);
            } else {
                jQuery('#loadingModalTitle').html(loginResponse.mes);
            }
        });

    };
});

authPage.controller("verifyEmailCtrl", function($rootScope, $scope, $http, $translate) {
    $translate('VERIFY_EMAIL').then(function(title) {
        $rootScope.pageTitle = $rootScope.siteTitle + ' - ' + title;
    });
    $scope.verifyEmail = getCookie('verify-email');

    function getCookie(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    let params = {
        method: 'GET',
        url: '/verify-email-link/' + $scope.verifyEmail,
    };
    submitFrontEnd(params, $http, function(res) {
        $scope.verifyLink = res;
    });

    $scope.resendEmail = function() {
        jQuery('#loadingModalTitle').html('Đang xử lý ...');
        jQuery("#loadingModal").modal('show');
        let params = {
            method: 'POST',
            url: '/resend-verify-email',
            data: { email: $scope.verifyEmail }
        };
        submitFrontEnd(params, $http, function(res) {
            console.log(res);
            jQuery('#loadingModalTitle').html(res.mes);
        });
    }

});

authPage.controller("verify2faCtrl", function($scope, $rootScope, $http) {
    $rootScope.pageTitle = "Bazanland - Verify 2FA";
    $scope.submit2FA = function(e) {
        $(".alert").html("").removeClass("alert-success").removeClass("alert-danger");
        var formData = $("#form2FA").serialize();
        //console.log(formData);
        postVerify2FA(formData, $http, function(loginResponse) {
            if (loginResponse.status == true) {
                localStorage.setItem('token', loginResponse.token);
                $(".alert").addClass("alert-success").html(loginResponse.mes);
                var abc = getUrlParameter("redirect");
                if (typeof abc === "undefined" || abc == null) {
                    abc = "/dashboard";
                }
                setTimeout(function() {
                    window.location.href = abc;
                }, 1500);
            } else {
                $(".alert").addClass("alert-danger").html(loginResponse.mes);
            }
        });
        e.preventDefault();
    };
});


// =========================



app.controller("authenticationCtrl", function($rootScope, $scope, $http) {
    $rootScope.pageTitle = "Bazanland - Two-Factor Authentication";
    get2FAInfo($http, function(result) {
        $scope.authInfo = result;
        if (result.enable2fa === true) {
            jQuery(".card-body").eq(0).html("<h4>You have been enabled 2FA</h4>");
            jQuery("#form2FA .btn").removeClass("btn-success").addClass("btn-danger").html("Disable 2FA");
        }
    });

    $scope.submitAuth = function(e) {
        jQuery(".alert").html("").removeClass('alert-success').removeClass('alert-danger');
        $http({
            method: 'POST',
            url: '/user/verify-auth',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            data: "authToken=" + jQuery("#authToken").val()
        }).then(function successCallback(response) {
            jQuery(".alert").html(response.data.mes);
            if (response.data.status) {
                jQuery(".alert").addClass("alert-success");
                setTimeout(function() { location.reload(); }, 1500);
            } else {
                jQuery(".alert").addClass("alert-danger");
            }
        }, function errorCallback(response) {});
        e.preventDefault();
    }
});