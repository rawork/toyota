(function($) {
    $(function() {

        var popupSlick = $('.modal-members');
        var juriArray = [];

        var galleryContainer = $('.prizes');
        var gallerySlick = false;

        var setArrowVibibility = function(currentSlide, totalSlides) {
            if (currentSlide+1 >= totalSlides) {
                $('.gallery-next').hide();
            } else {
                $('.gallery-next').show();
            }

            if (0 >= currentSlide) {
                $('.gallery-prev').hide();
            } else {
                $('.gallery-prev').show();
            }

            if (1 == totalSlides) {
                $('.gallery-prev').hide();
                $('.gallery-next').hide();
            }
        };

        var modalElementHtml = function (item) {
            return '<div class="juri modal-juri clearfix"><div class="foto modal-foto"><img src="'+item.img+'"></div><div class="modal-info"><div class="name">'+item.name+'</div><div class="activity">'+item.activity+'</div><div class="bio">Биография:<div>'+item.bio+'</div></div><div class="quotation"><div class="quote-pop"><div class="quote-top"></div><div class="quote-content">'+item.quotation+'</div><div class="quote-bottom"></div></div></div></div></div>';
        };

        var setModalArrowVibibility = function(currentSlide, totalSlides) {
            if (currentSlide+1 >= totalSlides) {
                $('.popup-next').hide();
            } else {
                $('.popup-next').show();
            }

            if (0 >= currentSlide) {
                $('.popup-prev').hide();
            } else {
                $('.popup-prev').show();
            }

            if (1 == totalSlides) {
                $('.popup-prev').hide();
                $('.popup-next').hide();
            }
        };

        $(document).on('click', '.tabs li', function(e) {
            e.preventDefault();

            console.log('click tab');
            var that = $(this);
            var id = that.attr('data-id');
            that.addClass('active').siblings().removeClass('active');
            $(id).addClass('active').siblings().removeClass('active');
        });


        $(document).on('click', 'ul.juri .foto a', function(e){
            e.preventDefault();

            if (juriArray.length == 0) {
                $('ul.juri li').each(function(){
                    var member = {};
                    var that  = $(this);
                    member.img = that.find('.foto img').attr('src');
                    member.name = that.find('.info .name').html();
                    member.activity = that.find('.info .activity').html();
                    member.bio = that.find('.info .bio div').html();
                    member.quotation = that.find('.info .quotation').html();
                    juriArray.push(member);
                })

                console.log(juriArray);

            }

            console.log('open modal');

            var pos = parseInt($(this).attr('data-position'));

            popupSlick.empty();

            for (var i in juriArray) {
                popupSlick.append(modalElementHtml(juriArray[i]))
            }

            $('body').addClass('modal-open');
            popupSlick.slick({
                infinite: false,
                dots : false,
                lazyLoad: 'progressive',
                slidesToShow: 1,
                initialSlide: pos,
                adaptiveHeight: true,
                prevArrow: '<button type="button" class="slick-prev popup-prev"><img src="/bundles/public/img/popup_prev.png"></button>',
                nextArrow: '<button type="button" class="slick-next popup-next"><img src="/bundles/public/img/popup_next.png"></button>'
            }).on('afterChange', function(event, slick, currentSlide){
                setModalArrowVibibility(currentSlide, juriArray.length);
            });
            setModalArrowVibibility(pos, juriArray.length);
            $('.modal').show();

            popupSlick.slick('setPosition');

        });

        $(document).on('click', 'a.modal-close', function(e){
            e.preventDefault();
            $(this).parents('.modal').hide();
            popupSlick.slick('unslick');
            $("body").removeClass("modal-open");
        });

        if ($(window).width() >= 900) {
            var prevArrow = '<button type="button" class="slick-prev gallery-prev"><img src="/bundles/public/img/prev.png"></button>';
            var nextArrow = '<button type="button" class="slick-next gallery-next"><img src="/bundles/public/img/next.png"></button>';
        } else {
            var prevArrow = '';
            var nextArrow = '';
        }

        galleryContainer.slick({
            infinite: false,
            dots : false,
            lazyLoad: 'progressive',
            slidesToShow: 1,
            adaptiveHeight: true,
            prevArrow: prevArrow,
            nextArrow: nextArrow
        }).on('afterChange', function(event, slick, currentSlide){
            setArrowVibibility(currentSlide, 3);
        });

        setArrowVibibility(0, 3);

        gallerySlick = true;

    });

})(jQuery);
