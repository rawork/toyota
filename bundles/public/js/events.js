(function($) {
    $(function() {

        var currentMonth = $('#months').attr('data-current');
        $('.month'+currentMonth).addClass('active').siblings('.month').removeClass('active');

    });

})(jQuery);

