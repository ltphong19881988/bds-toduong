var getUrlParameter = function(name) {
    var url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function copyToClipboard(elem) {
    // create hidden text element, if it doesn't already exist
    var targetId = "_hiddenCopyText_";
    var isInput = elem.tagName === "INPUT" || elem.tagName === "TEXTAREA";
    var origSelectionStart, origSelectionEnd;
    if (isInput) {
        // can just use the original source element for the selection and copy
        target = elem;
        origSelectionStart = elem.selectionStart;
        origSelectionEnd = elem.selectionEnd;
    } else {
        // must use a temporary form element for the selection and copy
        target = document.getElementById(targetId);
        if (!target) {
            var target = document.createElement("textarea");
            target.style.position = "absolute";
            target.style.left = "-9999px";
            target.style.top = "0";
            target.id = targetId;
            document.body.appendChild(target);
        }
        target.textContent = elem.textContent;
    }
    // select the content
    var currentFocus = document.activeElement;
    target.focus();
    target.setSelectionRange(0, target.value.length);

    // copy the selection
    var succeed;
    try {
        succeed = document.execCommand("copy");
    } catch (e) {
        succeed = false;
    }
    // restore original focus
    if (currentFocus && typeof currentFocus.focus === "function") {
        currentFocus.focus();
    }

    if (isInput) {
        // restore prior selection
        elem.setSelectionRange(origSelectionStart, origSelectionEnd);
    } else {
        // clear temporary content
        target.textContent = "";
    }
    return succeed;
}

function isVisible(ele) {
    var style = window.getComputedStyle(ele);
    return style.width !== "0" &&
        style.height !== "0" &&
        style.opacity !== "0" &&
        style.display !== 'none' &&
        style.visibility !== 'hidden';
}

var menuChanged = function(href) {
    href = href.replace(location.origin, '');
    // console.log(jQuery("#main-menu"));
    jQuery("#main-menu").removeClass("show");
    var listA = jQuery("#main-menu").find("a");
    jQuery("#main-menu").find("li").removeClass("active").removeClass("show");
    jQuery("#main-menu").find("li").find("ul").removeClass("show");
    for (var i = 0; i < listA.length; i++) {
        var a = listA.eq(i);
        // console.log(href, ' - ', a.attr('href'));
        if ((href.indexOf(a.attr("href") + '/') != -1) || (href == a.attr("href"))) {
            var ul = a.parent().parent();
            var li = a.parent();
            // console.log(ul.attr("class"));
            if (ul.hasClass("sub-menu")) {
                // console.log("sub");
                ul.parent().addClass("show").addClass("active");
                ul.addClass("show");
            }
            if (ul.hasClass("navbar-nav")) {
                // console.log("nav");
                li.addClass("active");
            }

        }
    }

}

function compressImage(base64, maxheight, maxwidth, tyle) {
    const canvas = document.createElement('canvas')
    const img = document.createElement('img')

    return new Promise((resolve, reject) => {
        img.src = base64;
        img.onload = function() {
            let width = img.width
            let height = img.height
            const maxHeight = maxheight;
            const maxWidth = maxwidth;

            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height *= maxWidth / width))
                    width = maxWidth
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round((width *= maxHeight / height))
                    height = maxHeight
                }
            }
            canvas.width = width
            canvas.height = height

            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0, width, height)

            resolve(canvas.toDataURL('image/jpeg', tyle))
        }
        img.onerror = function(err) {
            reject(err)
        }

    })
}

var readFileToBase64 = function(ele, callback) {
    if (ele.files && ele.files[0]) {
        var FR = new FileReader();
        FR.onloadend = function() {
            console.log('FR.result')
            callback(FR.result);
        }
        FR.readAsDataURL(ele.files[0]);
    }
}

var convertFiletoBase64 = function(file) {
    return new Promise((resolve, reject) => {
        var fr = new FileReader();
        // fr.onload = resolve;  // CHANGE to whatever function you want which would eventually call resolve
        fr.onload = function found() {
            resolve({ data: fr.result, name: file.name })
        }
        fr.readAsDataURL(file);
    });
}

var imgSrcToBase64 = function(src) {
    return new Promise((resolve, reject) => {
        var img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = function() {
            var canvas = document.createElement('CANVAS');
            var ctx = canvas.getContext('2d');
            var dataURL;
            canvas.height = this.naturalHeight;
            canvas.width = this.naturalWidth;
            ctx.drawImage(this, 0, 0);
            dataURL = canvas.toDataURL();
            resolve(dataURL);
        };
        img.src = src;
        // if (img.complete || img.complete === undefined) {
        //     img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
        //     img.src = src;
        // }
    });
}


jQuery(document).ready(function($) {
    // Copy button click event
    $(document).on("click", ".copyButton", function(e) {
        var copyTarget = $(this).attr('copyTarget');
        copyToClipboard(document.getElementById(copyTarget));
        $("#link-copied-message").show();
        setTimeout(function() {
            $("#link-copied-message").hide();
        }, 1500);
    });

    // Edit Profiles input blur or enter 
    $(document).on("blur", ".editProfiles", function(e) {
        $(this).hide();
        $(this).parent().find("a").find("span").show();
    });
    $(document).on("keyup", ".editProfiles", function(event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            $(this).hide();
            $(this).parent().find("a").find("span").show();
        }
    });

    // Set diable button form submit
    $(document).on("click", ".btn-post-data", function(e) {
        // console.log('con me no');
        $(this).prop('disabled', true);
    });

    $(document).on("click", "[data-toggle='modal']", function(e) {
        jQuery(".modal .modal-body .help-block").remove();
        jQuery(".modal .modal-body").append(`<span class="help-block"></span>`);
    });


})

var submitTransfer = function(formData, $http, callback) {
    $http({
        method: 'POST',
        url: '/admin/transfer',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: formData
    }).then(function successCallback(response) {
        callback(response.data);
    }, function errorCallback(response) {
        callback({ status: false });
    });
}

// =============== Media Controller ============
var listAllFilesAndFolder = function($http, dataPost, callback) {
    $http({
        method: 'POST',
        url: '/admin/media/' + dataPost.type,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        data: dataPost
    }).then(function successCallback(response) {
        callback(response.data);
    }, function errorCallback(response) {
        callback(response);
    });
}

var callEditFolder = function($http, dataPost, callback) {
    $http({
        method: 'POST',
        url: '/admin/media/folder',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        data: dataPost
    }).then(function successCallback(response) {
        callback(response.data);
    }, function errorCallback(response) {
        callback(response);
    });
}

var uploadFiles = function($scope, $http, dataPost, li, callback) {
    $http({
        method: 'POST',
        url: '/admin/media/uploadfile',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        data: dataPost
    }).then(function successCallback(response) {
        $scope.countUpload++;
        li.find("button").remove();
        li.find("img").eq(0).attr("name", '/uploads/media/' + li.find("img").eq(0).attr("name"));
        li.append(`<strong style='font-style: italic; float:right;'>` + response.data.mes + `</strong>`);
        if (response.data.status == true) {
            li.find("strong").css('color', '#28a745');
        } else {
            li.find("strong").css('color', '#e74c3c');
        }
    }, function errorCallback(response) {
        // callback(response);
    });
}

// ================ Category Controlller  ==============
var getAllCategory = function($http, callback) {
    $http({
        method: 'GET',
        url: '/admin/category/all-category',
    }).then(function successCallback(response) {
        callback(response.data);
    }, function errorCallback(response) {
        callback(response.data);
    });
}

var getCategoryInfo = function(formData, $http, callback) {
    $http({
        method: 'GET',
        url: '/admin/category/' + formData._id,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
    }).then(function successCallback(response) {
        callback(response.data);
    }, function errorCallback(response) {
        callback(response.data);
    });
}

var submitAddCategory = function(formData, $http, callback) {
    $http({
        method: 'POST',
        url: '/admin/category/add-category',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8' },
        data: formData
    }).then(function successCallback(response) {
        callback(response.data);
    }, function errorCallback(response) {
        callback({ status: false });
    });
}

var submitEditCategory = function(params, $http, callback) {
    $http({
        method: 'PUT',
        url: '/admin/category/' + params.data._id,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        data: params.data
    }).then(function successCallback(response) {
        callback(response.data);
    }, function errorCallback(response) {
        callback({ status: false });
    });
}
var submitDeleteCategory = function(formData, $http, callback) {
    $http({
        method: 'DELETE',
        url: '/admin/category/' + formData._id,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        data: formData
    }).then(function successCallback(response) {
        callback(response.data);
    }, function errorCallback(response) {
        callback({ status: false });
    });
}

// ================ Product Controlller  ==============

var getAllProduct = function(params, $http, callback) {
    $http({
        method: params.method,
        url: params.url,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        data: params.data
    }).then(function successCallback(response) {
        callback(response.data);
    }, function errorCallback(response) {
        callback({ status: false });
    });
}

// var submitProduct = function(params, $http, callback) {
//     $http({
//         method: params.method,
//         url: '/admin/product/item',
//         headers: { 'Content-Type': 'application/json; charset=utf-8' },
//         data: params.data
//     }).then(function successCallback(response) {
//         callback(response.data);
//     }, function errorCallback(response) {
//         callback({ status: false });
//     });
// }

// ================ Promotion Controlller  ==============

var submitPromotion = function(params, $http, callback) {
    $http({
        method: params.method,
        url: params.url,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        data: params.data
    }).then(function successCallback(response) {
        callback(response.data);
    }, function errorCallback(response) {
        callback({ status: false });
    });
}


// =================
var getcountries = function($http, callback) {
    $http({
        method: 'GET',
        url: '/get-countries',
    }).then(function successCallback(response) {
        callback(response.data);
    }, function errorCallback(response) {});
}

var get2FAInfo = function($http, callback) {
    $http({
        method: 'GET',
        url: '/user/2fa-info',
    }).then(function successCallback(response) {
        callback(response.data);
    }, function errorCallback(response) {});
}

var updateUserProfiles = function(formData, $http, callback) {
    $http({
        method: 'POST',
        url: '/user/profiles',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: formData
    }).then(function successCallback(response) {
        callback(response.data);
    }, function errorCallback(response) {
        callback({ status: false });
    });
}

var changePassword = function(formData, $http, callback) {
    $http({
        method: 'POST',
        url: '/user/change-password',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: formData
    }).then(function successCallback(response) {
        callback(response.data);
    }, function errorCallback(response) {
        callback({ status: false });
    });
}

var getWallet = function($http, callback) {
    $http({
        method: 'GET',
        url: '/wallet/get-wallet',
    }).then(function successCallback(response) {
        callback(response.data);
    }, function errorCallback(response) {
        callback({ status: false });
    });
}

var getInvestmentPackages = function($http, callback) {
    $http({
        method: 'GET',
        url: '/investment/get-investment-packages',
    }).then(function successCallback(response) {
        callback(response.data);
    }, function errorCallback(response) {
        callback({ status: false });
    });
}

var getPackage = function(id, $http, callback) {
    $http({
        method: 'GET',
        url: '/investment/get-package?id=' + id,
    }).then(function successCallback(response) {
        callback(response.data);
    }, function errorCallback(response) {
        callback({ status: false });
    });
}

var getBalance = function($http, callback) {
    $http({
        method: 'GET',
        url: '/investment/get-balance',
    }).then(function successCallback(response) {
        callback(response.data);
    }, function errorCallback(response) {
        callback({ status: false });
    });
}

var createPackage = function(formData, $http, callback) {
    $http({
        method: 'POST',
        url: '/investment/create-package',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: formData
    }).then(function successCallback(response) {
        callback(response.data);
    }, function errorCallback(response) {});
}