(function($) {
    $(function() {

        var startBuildGallery = false;
        var galleryType = 0;
        var galleryContainer = $('.pictures');
        var gallerySlick = false;

        var currentSlide = 0;
        var totalSlides = 0;

        var elementHtml = function(item) {
            return '<div class="picture"><div class="img"><div class="picture-vote">Голосовать</div><img data-lazy="'+ item.picture_value.extra.main.path +'"></div><div class="person">'+item.person+ ', ' + item.age +'</div><div class="city">' + item.city + '</div><div class="name">&laquo;'+item.name+'&raquo;</div></div>';
        };

        var buildGallery = function(windowWidth) {

            console.log('build', windowWidth);

            if (windowWidth >= 900 && galleryType == 900) {
                return;
            } else if (windowWidth >= 600 && windowWidth < 900 && galleryType == 600) {
                return;
            } else if (windowWidth < 600 && galleryType == 320) {
                return;
            }

            $.post('/ajax/picture', {category: 1, name: '', city: ''},
                function(data){
                    if (data.pictures != undefined) {

                        if (gallerySlick) {
                            $('.pictures').slick('unslick');
                        }
                        galleryContainer.empty();

                        var currentElement = 1;
                        var maxElement = 0;

                        if (windowWidth > 900) {
                            maxElement = 6;
                            totalSlides =  Math.ceil(Object.keys(data.pictures).length / maxElement);
                            console.log(data.pictures, maxElement, totalSlides);
                            currentSlide = 1;
                            for (var i in data.pictures) {
                                if (currentElement == 1) {
                                    var newBlock = $('<div></div>');
                                }

                                newBlock.append(elementHtml(data.pictures[i]));

                                if (currentElement >= maxElement) {
                                    galleryContainer.append(newBlock.get(0).outerHTML);
                                    currentElement = 1;
                                    continue;
                                }
                                currentElement = currentElement + 1;
                            }
                            if (currentElement > 1) {
                                galleryContainer.append(newBlock.get(0).outerHTML);
                            }
                            galleryType = 900;
                        } else if (windowWidth > 600) {
                            maxElement = 2;
                            totalSlides =  Math.ceil(Object.keys(data.pictures).length / maxElement);
                            currentSlide = 1;
                            for (var i in data.pictures) {
                                if (currentElement == 1) {
                                    var newBlock = $('<div></div>');
                                }

                                newBlock.append(elementHtml(data.pictures[i]));

                                if (currentElement >= maxElement) {
                                    galleryContainer.append(newBlock.get(0).outerHTML);
                                    currentElement = 1;
                                    continue;
                                }
                                currentElement = currentElement + 1;
                            }
                            if (currentElement > 1) {
                                galleryContainer.append(newBlock.get(0).outerHTML);
                            }

                            galleryType = 600;
                        } else {
                            totalSlides =  Object.keys(data.pictures).length;
                            currentSlide = 1;
                            for (var i in data.pictures) {
                                galleryContainer.append(elementHtml(data.pictures[i]));
                            }

                            galleryType = 320;
                        }

                        initSliderPlugin(windowWidth);
                    }
                });
        };

        var initSliderPlugin = function(windowWidth) {
            console.log('startinit', windowWidth);

            if (windowWidth >= 900) {
                var prevArrow = '<button type="button" class="slick-prev"><img src="/bundles/public/img/prev.png"></button>';
                var nextArrow = '<button type="button" class="slick-next"><img src="/bundles/public/img/next.png"></button>';
            } else {
                var prevArrow = '';
                var nextArrow = '';
            }

            $('.pictures').slick({
                dots : false,
                lazyLoad: 'progressive',
                slidesToShow: 1,
                adaptiveHeight: true,
                prevArrow: prevArrow,
                nextArrow: nextArrow
            }).on('afterChange', function(event, slick, currentSlide){
                console.log(currentSlide);
                $('#slide-current').html(currentSlide+1);
            });;

            console.log(currentSlide, totalSlides);

            $('#slide-current').html(currentSlide);
            $('#slide-total').html(totalSlides);

            gallerySlick = true;
        }

        $(window).on('resize', function(e){
            buildGallery($(this).width());
        });

        buildGallery($(window).width());

    });

})(jQuery);

