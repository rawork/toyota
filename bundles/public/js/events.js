(function($) {
    $(function() {

        var currentMonth = $('.months').attr('data-current');
        var calendarYear = $('.calendar-year');
        var minYear = parseInt(calendarYear.attr('data-min'));
        var maxYear = parseInt(calendarYear.attr('data-max'));
        var currentYear = parseInt(calendarYear.text());

        var checkMonth = function(year) {
            if (currentYear != year) {
                $('.month').removeClass('active');
            } else {
                $('.month'+currentMonth).addClass('active').siblings('.month').removeClass('active');
            }
        }

        $('.month'+currentMonth).addClass('active').siblings('.month').removeClass('active');

        $('.calendar-year-prev').on('click', function(e){
            e.preventDefault();
            var selectedYear = parseInt(calendarYear.text());
            if (selectedYear <= minYear) {
                return;
            } else {
                selectedYear = selectedYear - 1;
                calendarYear.text(selectedYear);
                checkMonth(selectedYear);
            }
        });

        $('.calendar-year-next').on('click', function(e){
            e.preventDefault();
            var selectedYear = parseInt(calendarYear.text());
            if (selectedYear >= maxYear) {
                return;
            } else {
                selectedYear = selectedYear + 1;
                calendarYear.text(selectedYear);
                checkMonth(selectedYear);
            }
        });

        $('.month').on('click', function(e){
            e.preventDefault();

            var selectedYear = parseInt(calendarYear.text());
            var selectedMonth = parseInt($(this).attr('data-value'));

            var path = '/events/'+selectedYear+'/'+selectedMonth;

            console.log(path);

            window.location.href = path;
        })



    });

})(jQuery);

