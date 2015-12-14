(function($) {
    $(function() {

        var startBuildGallery = false;
        var galleryType = 0;
        var galleryContainer = $('.pictures');
        var gallerySlick = false;
        var currentCategory = 0;
        var currentPerson = '';
        var currentCity = '';
        var filterChanged = true;

        var currentSlide = 0;
        var totalSlides = 0;

        var elementHtml = function(item) {
            return '<div class="picture"><div class="img"><div class="picture-vote">Голосовать</div><img data-lazy="'+ item.picture_value.extra.main.path +'"></div><div class="person">'+item.person+ ', ' + item.age +'</div><div class="city">' + item.city + '</div><div class="name">'+item.name+'</div>'+(parseInt(item.position) > 0 ? '<div class="place">'+item.position+' место</div>' : '' )+'<div class="idea">Идея:<br>' + item.idea + '</div></div>';
        };

        var buildGallery = function() {

            var windowWidth = $(this).width();

            var category = parseInt(galleryContainer.attr('data-category'));
            var person = $('#person').val();
            var city = $('#city').val();

            if (currentCategory != category || currentPerson != person || currentCity != city) {
                filterChanged = true;
                currentCategory = category;
                currentPerson = person;
                currentCity = city;
            }

            if (windowWidth >= 900 && galleryType == 900 && !filterChanged)  {
                return;
            } else if (windowWidth >= 600 && windowWidth < 900 && galleryType == 600 && !filterChanged) {
                return;
            } else if (windowWidth < 600 && galleryType == 320 && !filterChanged) {
                return;
            }

            $.post('/ajax/picture', {category: category, person: person, city: city},
                function(data){
                    if (data.pictures != undefined) {

                        if (gallerySlick) {
                            galleryContainer.slick('unslick');
                        }
                        galleryContainer.empty();

                        var currentElement = 1;
                        var maxElement = 0;

                        if (windowWidth > 900) {
                            maxElement = 6;
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
                        if (totalSlides > 0) {
                            $('#picture-counter').show();
                        } else {
                            $('#picture-counter').hide();
                        }
                        filterChanged = false;
                        initSliderPlugin(windowWidth);
                    }
                });
        };

        var setArrowVibibility = function(currentSlide, totalSlides) {
            if (currentSlide+1 >= totalSlides) {
                $('.slick-next').hide();
            } else {
                $('.slick-next').show();
            }

            if (0 >= currentSlide) {
                $('.slick-prev').hide();
            } else {
                $('.slick-prev').show();
            }

            if (1 == totalSlides) {
                $('.slick-prev').hide();
                $('.slick-next').hide();
            }
        }

        var initSliderPlugin = function(windowWidth) {
            if (windowWidth >= 900) {
                var prevArrow = '<button type="button" class="slick-prev"><img src="/bundles/public/img/prev.png"></button>';
                var nextArrow = '<button type="button" class="slick-next"><img src="/bundles/public/img/next.png"></button>';
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
                setArrowVibibility(currentSlide, totalSlides);
                $('#slide-current').html(currentSlide+1);
            });;

            $('#slide-current').html(currentSlide);
            $('#slide-total').html(totalSlides);
            setArrowVibibility(0, totalSlides);

            gallerySlick = true;
        }

        $(window).on('resize', function(e){
            buildGallery();
        });

        $(document).on('click', '.tabs li', function(e) {
            var that = $(this);
            var id = that.attr('data-id');
            that.addClass('active').siblings().removeClass('active');
            galleryContainer.attr('data-category', id);
            buildGallery();
        });

        $(document).on('click', '.btn-picture-search', function(e) {
            e.preventDefault();
            buildGallery();
        });


        buildGallery();
    });

})(jQuery);

