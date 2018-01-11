(function() {

    if (!$('.register-wrap').length) {
        $('#head-wrap1').hide();
        $('#head-wrap2').show();
        $('header').css({
            "pointer-events": "none"
        });
    }

    // REGISTER //
    if ($('.register-wrap').length) {
        if ($('.oops').length) {
            $('#head-wrap1').hide();
            $('#head-wrap2').show();
        } else {
            $('#head-wrap1').show();
            $('.register-wrap').hide();
            $('#head-wrap2').hide();
            $('#head-wrap1').on('click', (e) => {
                $('#eddie-creep')[0].play();
                $('.register-wrap').fadeIn(2000);
                $('#head-wrap1').fadeOut(2000);
                $('#head-wrap2').delay(2000).fadeIn(2000);
            });
        }
    }

    // LOIN //
    if ($('#login-wrap').length) {
        if ($('.oops').length) {
            $('#login-wrap').show();
        } else {
            $('#login-wrap').hide().delay(700).fadeIn(1000);
        }
    }

    // PROFILE //
    if ($('#profile-wrap').length) {
        if($('.oops').length) {
            $('#profile-wrap').show();
        } else {
            $('#profile-wrap').hide().delay(700).fadeIn(1000);
        }
    }

    // SIGNATURE //
    if ($('canvas').length) {
        if($('.oops').length) {
            $('main').show();
        } else {
            $('main').hide().delay(700).fadeIn(1000);
        }
        const sigVal = $('#sigVal');
        const canvas = $('canvas');
        const axlf = $('#axlf');
        const sig = canvas[0].getContext('2d');
        var prevX;
        var prevY;
        function draw(x, y, ifDown) {
            if (ifDown) {
                sig.beginPath();
                sig.lineWidth = $('#size').val();
                sig.strokeStyle = $('#colour').val();
                sig.moveTo(prevX, prevY);
                sig.lineTo(x, y);
                sig.closePath()
                sig.stroke();
            }
            prevX = x;
            prevY = y;
        }
        canvas.on('mousedown', (e) => {
            axlf[0].play();
            draw(e.offsetX, e.offsetY, false);
            canvas.on('mousemove', (e) => {
                draw(e.offsetX, e.offsetY, true);
            }).on('mouseleave', (e) => {
                down = false;
                axlf[0].pause();
                sigVal.val(canvas[0].toDataURL());
                canvas.off('mousemove').off('mouseleave').off('mouseup');
            }).on('mouseup', (e) => {
                down = false;
                axlf[0].pause();
                sigVal.val(canvas[0].toDataURL());
                canvas.off('mousemove').off('mouseleave').off('mouseup');
            });
        });
        $('#clear').on('click', () => {
            sig.clearRect(0,0, 351, 500);
            sigVal.val('');
        });
    }

    // FOOTER //
    $('footer img').on('mouseenter', () => {
        $('#spin')[0].play();
    }).on('mouseleave', () => {
        $('#spin')[0].pause();
    });

}());
