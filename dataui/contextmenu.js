(function($) {
    var ulObj, isShow;
    $.fn.contextMenu = function(id, options) {
        $(this).bind('contextmenu', function(e) {
            if($('#' + id).find('li').length == 0) {
                return false;
            }
            ulObj = $('#' + id).bind('click', function(e) {
                e.stopPropagation();
            }).bind('mouseleave', function() {
                setTimeout(function() {
                    if(!isShow) {
                        $('#' + id).hide();
                    }
                    isShow = false;
                }, 600);
            }).bind('mouseenter', function() {
                //$('#' + id).show();
                isShow = true;
            });
            ulObj.addClass('contextmenu').find('li').addClass('contextmenu-item').hover(
                 function() {
                     if(!$(this).hasClass('contextmenu-sep')) {
                         $(this).addClass('contextmenu-active');
                     }
                 },
                 function(){
                     $(this).removeClass('contextmenu-active');
                 }
            ).bind('click', function(e) {
                $('#' + id).hide();
            }).find('span').addClass('contextmenu-text');
            ulObj.find('li').find('img').addClass('contextmenu-icon');

            $('#' + id).find('li.contextmenu-sep').removeClass('contextmenu-item');
            var ulHeight = $('#' + id).height();
            var posX = e.pageX, posY = e.pageY;
            if(options) {
                posX = options.eventPosX ? options.eventPosX : posX;
                posY = options.eventPosY ? options.eventPosY : posY;
            }
            if(posY + ulHeight > $(window).height()) {
                if(posY - ulHeight < 0) {
                    posY = posY - ulHeight/2;
                } else {
                    posY = posY - ulHeight;
                }
            }
            $('#' + id).css({'left':posX,'top':posY}).show();

            return false;
        });


        return this;
    };
})(jQuery);