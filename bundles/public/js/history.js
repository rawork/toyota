(function($) {
    $(function() {




        $('.gallery').slick({
            infinite: false,
            dots : true,
            lazyLoad: 'progressive',
            slidesToShow: 3,
            slidesToScroll: 3,
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
                        dots: true,
                        slidesToShow: 1,
                        slidesToScroll: 1
                    }
                }
                // You can unslick at a given breakpoint now by adding:
                // settings: "unslick"
                // instead of a settings object
            ]
        });

        // Find all YouTube videos
        var $allVideos = $("iframe[src^='https://www.youtube.com']"),

        // The element that is fluid width
            $fluidEl = $(".content");

        // Figure out and save aspect ratio for each video
        $allVideos.each(function() {

            $(this)
                .data('aspectRatio', this.height / this.width)

                // and remove the hard coded width/height
                .removeAttr('height')
                .removeAttr('width');

        });

        // When the window is resized
        // (You'll probably want to debounce this)
        $(window).resize(function() {



            // Resize all videos according to their own aspect ratio
            $allVideos.each(function() {

                var $el = $(this);
                var newWidth = $el.parent().width();


                $el
                    .width(newWidth)
                    .height(newWidth * $el.data('aspectRatio'));
                    //.css('margin-bottom', '20px');

            });

            // Kick off one resize to fix all videos on page load
        }).resize();

        $(document).on('click', 'ul.selector li', function(e){
            e.preventDefault();

            var that = $(this);
            var id = that.attr('data-id');

            that.addClass('active').siblings().removeClass('active');
            $('#year'+id).addClass('active').siblings().removeClass('active');

        });

    });

})(jQuery);

