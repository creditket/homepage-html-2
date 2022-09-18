jQuery(function () {
    jQuery.each(wpml_cookies, function (cookieName, cookieData) {
        document.cookie = cookieName + '=' + cookieData.value + ';expires=' + cookieData.expires + '; path=' + cookieData.path
    });
});

/*This file was exported by "Export WP Page to Static HTML" plugin which created by ReCorp (https://myrecorp.com) */