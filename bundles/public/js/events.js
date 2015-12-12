(function($) {
    $(function() {

        var currentMonth = $('.months').attr('data-current');
        console.log(currentMonth);
        $('.month'+currentMonth).addClass('active').siblings('.month').removeClass('active');
        
    });

})(jQuery);

