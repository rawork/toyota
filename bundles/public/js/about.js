(function($) {
    $(function() {

        $(document).on('click', '.tabs li', function(e) {
            var that = $(this);
            var id = that.attr('data-id');
            that.addClass('active').siblings().removeClass('active');
            $('#tab'+id).addClass('active').siblings().removeClass('active');
        });

    });

})(jQuery);
