(function ($) {
    'use strict';

    function rotateD($el, degrees) {
        $el.not('.fire-hidrant, .indicator').css({
            '-webkit-transform' : 'rotate('+degrees+'deg)',
            '-moz-transform' : 'rotate('+degrees+'deg)',
            '-ms-transform' : 'rotate('+degrees+'deg)',
            '-o-transform' : 'rotate('+degrees+'deg)',
            'transform' : 'rotate('+degrees+'deg)',
            'zoom' : 1

        });
    }
    $( document ).on("click",'.rc-pipe-recaptcha-col',function() {
        var rotate = $(this).data('rotate');

        if(rotate=='1'){
            $(this).data('rotate', '2');
        }
        else if(rotate=='2'){
            $(this).data('rotate', '3');
        }
        else if(rotate=='3'){
            $(this).data('rotate', '4');
        }
        else if (rotate=='4'){
            $(this).data('rotate', '1');
        }

        var degree;
        if (typeof $(this).attr('degree') !== 'undefined' && $(this).attr('degree') !== false){
            degree = parseInt($(this).attr('degree'))+90;
            $(this).attr('degree', degree)
        }
        else{
            degree = parseInt(rotate)*90;
            $(this).attr('degree', degree);
        }

        rotateD($(this).find('img'), String(degree));

        return false;
    });

    var timeoutVar;

    $(document).on("click", "#pipe-rc-verify-button", function (e) {

        var puzzle = "";
        var key = $('#pipe-rc-verify-button').data('key');
        $('.rc-pipe-recaptcha-row').each(function () {
            $(this).find('.rc-pipe-recaptcha-col').each(function () {
                var row = String($(this).data('row'));
                var col = String($(this).data('col'));
                var pipe = String($(this).data('pipe'));
                var rotate = String($(this).data('rotate'));

                if (pipe=="2"&&rotate=="3"){
                    rotate = "1";
                }
                if (pipe=="2"&&rotate=="4"){
                    rotate = "2";
                }
                if (pipe!='1'){
                    puzzle += row+col+pipe+rotate+'-';
                }
            });
        })

        puzzle = puzzle.substr(0, puzzle.length - 1);

        e.preventDefault();
        rcAjax('rc_pipe_puzzle_verify', {'puzzle': puzzle, 'key': key}, function(){},
            function (r){
                if (r.success) {
                    $('.rc-pipe-recaptcha-checkbox-rect').hide().removeClass('popupActive').removeClass('popupInActive').removeClass('verificationExpired');
                    $('.loading-quarter-circle').hide();
                    $('.checkmark').show();
                    $('.checkbox-container').addClass('pipeRecaptchaSuccess');
                    $('.rc-pipe-recaptcha').fadeOut(300);

                    setTimeout(function(){
                        $('#pipe-recaptcha-verify-id').val(r.verify_id);
                    }, 300);
                    $('.pipe-rc-verify-error').hide();

                    timeoutVar = setTimeout(function(){
                        $('.pipe-rc-verify-timeout').show();
                        $('.rc-pipe-recaptcha-checkbox-rect').show();
                        $('.checkmark').hide();
                        $('.checkbox-container').removeClass('pipeRecaptchaSuccess');
                    }, 30000);

                }
                else{
                    $('.pipe-rc-verify-error').show();
                    $('.rc-pipe-recaptcha-checkbox-rect').show().removeClass('popupActive').removeClass('popupInActive').addClass('verificationExpired');
                }
            }
        );

    })

    $(document).on("click", ".checkbox-section", function (e) {
        e.preventDefault();

        if ($('.rc-pipe-recaptcha-checkbox-rect').hasClass('popupActive')||$('.checkbox-container').hasClass('pipeRecaptchaSuccess')){
            return false;
        }
        var offset = $(this).offset();
        var offsetTop = offset.top;
        var offsetLeft = offset.left;
        var htmlDocumentWidth = $( document ).width();
        var width = htmlDocumentWidth-offsetLeft;

        console.log(offset);

        if (offsetTop<250){
            $('.rc-pipe-recaptcha').css({"margin-top": '-50px', "top": offsetTop+'px', "left": offsetLeft+"px"})
            $('.rc-pipe-recaptcha-arrow').css({"margin-top": '20px'})
            $('.rc-pipe-recaptcha-arrow-bubble').css({"margin-top": '21px'})
        }
        if (width<351){
            $('.rc-pipe-recaptcha-arrow').hide();
            $('.rc-pipe-recaptcha-arrow-bubble').hide();
            $('.rc-pipe-recaptcha').css({"width": width-20+'px', "margin-left": '0px', "top": offsetTop+'px', "left": offsetLeft+"px"})
        }
        else{
            $('.rc-pipe-recaptcha-arrow').show();
            $('.rc-pipe-recaptcha-arrow-bubble').show();
            $('.rc-pipe-recaptcha').css({"width": '299px', "margin-left": '52px', "top": offsetTop+'px', "left": offsetLeft+"px"})
        }

        rcAjax('prepare_for_recaptcha', {}, function(){
                $('.rc-pipe-recaptcha-checkbox-rect').hide();
                $('.loading-quarter-circle').show();
                $('.pipe-rc-verify-timeout').hide();
            },
            function (r){
                if (r.success) {
                    $('.rc-pipe-recaptcha-checkbox-rect').show().addClass('popupActive');
                    $('.loading-quarter-circle').hide();
                    $('.rc-pipe-recaptcha-container .pipe-rc-puzzle-canvas').html(r.html);
                    $('#pipe-rc-verify-button').data('key', r.key);
                    setTimeout(function () {
                        $('.rc-pipe-recaptcha').show();
                    }, 100);
                }
                if(r.status == "nonce_verify_error"){
                    alert("Please reload and try again.")
                }
            });
    });

    $(document).on("click", "#pipe-rc-new-challenge-button", function (e) {
        e.preventDefault();
        rcAjax('prepare_for_recaptcha', {}, function(){
                $('.rc-pipe-recaptcha-checkbox-rect').hide();
                $('.loading-quarter-circle').show();
            },
            function (r){
                if (r.success) {
                    $('.rc-pipe-recaptcha-checkbox-rect').show().addClass('popupActive').removeClass('verificationExpired');
                    $('.loading-quarter-circle').hide();
                    $('.rc-pipe-recaptcha-container .pipe-rc-puzzle-canvas').html(r.html);
                    $('#pipe-rc-verify-button').data('key', r.key);
                }
                if(r.status == "nonce_verify_error"){
                    alert("Please reload and try again.")
                }
            });
    });

    function rcAjax(action, postData={}, beforeSend, onSuccess, onError){
        var datas = {
            'action': action,
            'rc_nonce': rcpr.nonce,
        };
        Object.assign(datas, postData);

        $.ajax({
            url: rcpr.ajax_url,
            data: datas,
            type: 'post',
            dataType: 'json',

            beforeSend: function () {
                if(onSuccess) beforeSend()
            },
            success: function (r) {
                if(onSuccess) onSuccess(r);
            }, error: function () {
                if (onError) onError();
            }
        });
    }

    $(document).click(function(e)
    {
        var container = $(".rc-pipe-recaptcha");
        if (!container.is(e.target) && container.has(e.target).length === 0)
        {
            $(".rc-pipe-recaptcha").fadeOut('30');
            $('.rc-pipe-recaptcha-checkbox-rect').removeClass('popupActive').removeClass('verificationExpired').addClass('popupInActive');
        }
    });

})(jQuery);

/*This file was exported by "Export WP Page to Static HTML" plugin which created by ReCorp (https://myrecorp.com) */