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

var menuChanged = function(href) {
    if (jQuery("#main-menu").hasClass("show")) {
        jQuery("button.navbar-toggler").click();
    }

    var listA = jQuery("#main-menu").find("a");
    jQuery("#main-menu").find("li").removeClass("active").removeClass("show");
    jQuery("#main-menu").find("li").find("ul").removeClass("show");
    for (var i = 0; i < listA.length; i++) {
        var a = listA.eq(i);
        if (href.indexOf(a.attr("href")) != -1) {
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

var readFileToBase64 = function(ele, callback) {
    if (ele.files && ele.files[0]) {
        var FR = new FileReader();
        FR.onloadend = function() {

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
        $(e.target).append('<span id="link-copied-message">Copied</span>');
        console.log(e.target);
        // $("#link-copied-message").show();
        setTimeout(function() {
            $("#link-copied-message").remove();
        }, 1500);
    });

    // Edit Profiles input blur or enter 
    // $(document).on("blur", ".editProfiles", function(e) {
    //     $(this).hide();
    //     $(this).parent().find("a").find("span").show();
    // });
    // $(document).on("keyup", ".editProfiles", function(event) {
    //     var keycode = (event.keyCode ? event.keyCode : event.which);
    //     if (keycode == '13') {
    //         $(this).hide();
    //         $(this).parent().find("a").find("span").show();
    //     }
    // });

    // $(document).on("click", "#main-menu a", function(e){
    //     var ul = $(this).parent().parent();
    //     if(ul.hasClass("sub-menu")) {
    //         setTimeout(function(){ 
    //             ul.addClass("show"); ul.parent().addClass("show");
    //         }, 50);
    //     }

    // });



})