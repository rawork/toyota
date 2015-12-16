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

            window.location.href = path;
        })


        $('.gallery').slick({
            infinite: false,
            dots : false,
            lazyLoad: 'progressive',
            slidesToShow: 1,
            prevArrow: '<button type="button" class="slick-prev gallery-prev"><img src="/bundles/public/img/prev.png"></button>',
            nextArrow: '<button type="button" class="slick-next gallery-next"><img src="/bundles/public/img/next.png"></button>',
            responsive: [
                {
                    breakpoint: 900,
                    settings: {

                    }
                },
                {
                    breakpoint: 899,
                    settings: {
                        arrows: false,
                        dots: true
                    }
                }
                // You can unslick at a given breakpoint now by adding:
                // settings: "unslick"
                // instead of a settings object
            ]
        })


    });

})(jQuery);

