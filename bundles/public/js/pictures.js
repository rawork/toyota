(function($) {
    $(function() {

        if (navigator.appVersion.indexOf("Win")!=-1)
        {
            $('#modal-gallery .modal-dialog').css('margin-left','-438px');
        }

        var startBuildGallery = false;
        var galleryType = 0;
        var galleryContainer = $('.pictures');
        var gallerySlick = false;
        var currentCategory = 0;
        var currentPerson = '';
        var currentCity = '';
        var filterChanged = true;
        var isArchive = parseInt($('#pictures').attr('data-archive'));

        var currentSlide = 0;
        var totalSlides = 0;
        var picturesObj = {};
        var picturesArray = [];
        var popupSlick = $('.modal-pictures');

        var elementHtml = function(item, pos) {
            return '<div class="picture"><div class="img"><a href="" data-position="'+pos+'" data-id="'+item.id+'" data-category="'+item.age_id+'"><img class="display-xs" data-lazy="'+ item.picture_value.extra.big.path +'"><img class="display-md" data-lazy="'+ item.picture_value.extra.main.path +'"></a></div>'+(item.nomination ? '<div class="nomination">'+item.nomination+'</div>' : '')+'<div class="person">'+item.person+ ', ' + item.age +'</div><div class="city">' + item.city + '</div><div class="name">'+item.name+'</div>' + '<div class="picture-vote"><div class="likes">' + item.likes + '</div><button data-id="'+item.id+'" '+(item.vote ? 'class="inactive"' : '')+'></button></div>' + (parseInt(item.position) > 0 ? '<div class="place">'+item.position+' место</div>' : '' )+'<div class="idea"><span class="red">Идея</span>' + item.idea + '</div></div>';
        };

        var modalElementHtml = function (item) {
            //console.log(item.nomination);
            var text = '<a href="#" class="popup-prev"></a> <a href="#" class="popup-next"></a>';
            return '<div class="modal-picture"><img src="'+item.picture_value.extra.big.path+'">'+(parseInt(item.position) > 0 || item.nomination ? '<div class="place-container"><div class="place"><span>'+(parseInt(item.position) > 0 ? item.position+' место' : (item.nomination ? item.nomination : ''))+'</span></div></div>' : '') + '<div class="title">'+item.name+'</div><div class="person">'+item.person+' ('+item.city+'), '+item.age+'</div><div class="idea"><span class="red">Идея</span>'+item.idea+'</div></div>';
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

            $.post(isArchive ? '/ajax/picture/archive' : '/ajax/picture', {category: category, person: person, city: city},
                function(data){
                    if (data.pictures != undefined) {

                        picturesObj = data.pictures;
                        picturesArray = [];

                        for (i in picturesObj) {
                            picturesArray.push(picturesObj[i]);
                        }

                        //console.log(picturesArray);

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
                            for (var i in picturesArray) {
                                if (currentElement == 1) {
                                    var newBlock = $('<div></div>');
                                }

                                newBlock.append(elementHtml(picturesArray[i], i));

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
                            for (var i in picturesArray) {
                                if (currentElement == 1) {
                                    var newBlock = $('<div></div>');
                                }

                                newBlock.append(elementHtml(picturesArray[i], i));

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
                            for (var i in picturesArray) {
                                galleryContainer.append(elementHtml(picturesArray[i], i));
                            }

                            galleryType = 320;
                        }

                        // hide vote block
                        if (data.vote_disabled || isArchive) {
                            $('.picture-vote').css({visibility: 'hidden'});
                        }

                        //console.log(totalSlides, typeof totalSlides, totalSlides > 0);

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

        var initSliderPlugin = function(windowWidth) {
            if (windowWidth >= 900) {
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
                setArrowVibibility(currentSlide, totalSlides);
                $('#slide-current').html(currentSlide+1);
            });

            $('#slide-current').html(currentSlide);
            $('#slide-total').html(totalSlides);
            setArrowVibibility(0, totalSlides);
            //$('.picture-counter').show();

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
            $.scrollTo('#pictures', 1000);
        });

        $(document).on('click', '.btn-picture-search', function(e) {
            e.preventDefault();
            buildGallery();
        });

        $(document).on('click', '.picture .img a', function(e) {
            e.preventDefault();

            ga('send', 'event', 'gallery', 'popup');

            if ($(window).width() < 900) {
                return;
            }

            var pos = parseInt($(this).attr('data-position'));

            popupSlick.empty();

            for (i in picturesArray) {
                popupSlick.append(modalElementHtml(picturesArray[i]))
            }

            //var picture = picturesArray[pos];

            //var img = new Image();
            //img.src = picture.picture_value.extra.big.path;
            //
            //$('.modal-picture img').attr('src', picture.picture_value.extra.big.path);
            //$('.modal-picture .title').html(picture.name);
            //if (0 < parseInt(picture.position)) {
            //    $('.modal-picture .place span').html(picture.position+' место').show();
            //    $('.modal-picture .place').show();
            //} else {
            //    $('.modal-picture .place').hide();
            //}
            //
            //$('.modal-picture .person').html(picture.person+'('+picture.city+'), '+picture.age);
            //$('.modal-picture .idea').html('Идея:<br>'+ picture.idea);
            //if (pos <= 0) {
            //    $('.popup-prev').hide();
            //} else {
            //    $('.popup-prev').show();
            //}
            //if (pos >= picturesArray.length-1) {
            //    $('.popup-next').hide();
            //} else {
            //    $('.popup-next').show();
            //}
            //
            //$('.popup-prev').attr('data-position', pos-1);
            //$('.popup-next').attr('data-position', pos+1);

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
                setModalArrowVibibility(currentSlide, picturesArray.length);
            });
            $('#modal-gallery').show();

            popupSlick.slick('setPosition');

        });

        //$(document).on('click', '.picture-vote', function(e) {
        //    e.preventDefault();
        //    var that = $(this);
        //    var picture = that.attr('data-id');
        //
        //    $.post('/pictures/vote', {picture: picture}, function(data) {
        //        if (data.voted ) {
        //            //$('.picture-vote').css({display: 'none'});
        //            that.hide();
        //            //alert(data.message);
        //            that.parent().find('.name').after('<div class="picture-vote-res"></div>');
        //        } else {
        //            console.log(data.message);
        //        }
        //    });
        //});

        $(document).on('click', 'a.modal-close', function(e){
            e.preventDefault();
            $(this).parents('.modal').hide();
            $("body").removeClass("modal-open");
            if ($(this).parents('.modal').get(0).id == 'modal-gallery') {
                popupSlick.slick('unslick');
            }
        });

        buildGallery();


        // auth functions

        $(document).on('click', '.picture-vote button', function(e) {
            e.preventDefault();
            var that = $(this);
            var picture = that.attr('data-id');

            console.log('vote click');

            $.post('/pictures/vote', {picture: picture}, function(data) {
                if (data.voted ) {
                    that.addClass('inactive');
                    that.siblings('.likes').html(data.likes);
                } else if (data.redirect) {
                    console.log(data);
                    var url = data.redirect;
                    $.get(url, { "_": $.now() },function(data){
                        $('#modal-auth .modal-content').html(data);
                        $('body').addClass('modal-open');
                        $('#modal-auth').show();
                    })

                } else {
                    console.log(data.message);
                }
            });
        });

        var popupwindow = function(url, title, w, h) {
            var left = (screen.width/2)-(w/2);
            var top = (screen.height/2)-(h/2);
            return window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
        };

        $(document).on('click', '.modal-dialog-auth form a', function(e){
            e.preventDefault();

            var that = $(this);

            var url = that.attr('href');

            $.get(url, { "_": $.now() }, function(data){
                $('#modal-auth .modal-content').html(data);
            })
        });

        $(document).on('submit', '.modal-dialog-auth form', function(e){
            e.preventDefault();

            var that = $(this);
            var url = that.attr('action');
            var params = {};
            var formdata = that.serializeArray();

            $.each(formdata, function(i, field) {
                params[field.name] = field.value;
            });

            $.post(url, params, function(data){
                console.log(data);
                if (data.status) {
                    $('#modal-auth .social-title').remove();
                    $('#modal-auth .social-selector').remove();
                    $('#modal-auth form').remove();
                    $('#modal-auth .modal-content').append('<div class="text-center">' + data.message + '</div>');
                    if (data.redirect) {
                        $.get(data.redirect, { "_": $.now() }, function(data){
                            $('#modal-auth .modal-content').html(data);
                        })
                    } else if (data.reload) {
                        window.location.reload();
                    }
                } else {
                    console.log(data.message);
                }
            });
        });

        $(document).on('click', '.modal-dialog-auth .social-selector a', function(e){
            e.preventDefault();

            var that = $(this);
            var url = that.attr('href');

            popupwindow(url, 'Social OAuth', 640, 420);
        });

        $(document).on('click', 'input[type=checkbox]+label', function(e){
            var that = $(this);
            var checkbox = that.prev();

            checkbox.prop('checked', !checkbox.prop('checked'));
            if (checkbox.attr('name') == 'is_driver') {
                if (checkbox.prop('checked')) {
                    $('input[name=auto_brand]').show();
                    $('input[name=auto_model]').show();
                } else {
                    $('input[name=auto_brand]').hide();
                    $('input[name=auto_model]').hide();
                }
            }
        });


    });

})(jQuery);

