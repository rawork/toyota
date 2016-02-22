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
        var picturesArray = [];
        var popupSlick = $('.modal-pictures');


        var mobileTotalPictures = 0;
        var mobileCurrentPicture = 0;
        var mobileLoadedPages = 0;
        var mobilePictures = [];
        var mobilePageLimit = 50;

        var elementHtml = function(item, pos) {
            return '<div class="picture"><div class="img"><a href="" data-position="'+pos+'" data-id="'+item.id+'"><img class="display-xs" data-lazy="'+ item.picture_big +'"><img class="display-md" data-lazy="'+ item.picture_main +'"></a></div>'+(item.nomination ? '<div class="nomination">'+item.nomination+'</div>' : '')+'<div class="person">'+item.person+ ', ' + item.age +'</div><div class="city">' + item.city + '</div><div class="name">'+item.name+'</div>' + '<div class="picture-vote"><div class="likes">' + item.likes + '</div><button data-id="'+item.id+'" '+(item.vote ? 'class="inactive"' : '')+'></button></div>' + (parseInt(item.position) > 0 ? '<div class="place">'+item.position+' место</div>' : '' )+'<div class="idea"><span class="red">Идея</span>' + item.idea + '</div></div>';
        };

        var elementMobileHtml = function(item, pos) {
            return '<div class="img"><a href="" data-position="'+pos+'" data-id="'+item.id+'"><img class="display-xs" src="'+ item.picture_big +'"></a></div>'+(item.nomination ? '<div class="nomination">'+item.nomination+'</div>' : '')+'<div class="person">'+item.person+ ', ' + item.age +'</div><div class="city">' + item.city + '</div><div class="name">'+item.name+'</div>' + '<div class="picture-vote"><div class="likes">' + item.likes + '</div><button data-id="'+item.id+'" '+(item.vote ? 'class="inactive"' : '')+'></button></div>' + (parseInt(item.position) > 0 ? '<div class="place">'+item.position+' место</div>' : '' )+'<div class="idea"><span class="red">Идея</span>' + item.idea + '</div>';
        };

        var modalElementHtml = function (item) {
            //console.log(item.nomination);
            var text = '<a href="#" class="popup-prev"></a> <a href="#" class="popup-next"></a>';
            return '<div class="modal-picture"><img data-lazy="'+item.picture_big+'">'+(parseInt(item.position) > 0 || item.nomination ? '<div class="place-container"><div class="place"><span>'+(parseInt(item.position) > 0 ? item.position+' место' : (item.nomination ? item.nomination : ''))+'</span></div></div>' : '') + '<div class="picture-vote"><div class="likes">' + item.likes + '</div><button data-id="'+item.id+'" '+(item.vote ? 'class="inactive"' : '')+'></button></div>' +'<div class="title">'+item.name+'</div><div class="person">'+item.person+' ('+item.city+'), '+item.age+'</div><div class="idea"><span class="red">Идея</span>'+item.idea+'</div></div>';
        };

        var shuffle = function(o) {
            var j, x, i;
            for (i = o.length; i; i -= 1) {
                j = Math.floor(Math.random() * i);
                x = o[i-1];
                o[i-1] = o[j];
                o[j] = x;
            }

            return o;
        };


        var buildGallery = function() {

            var windowWidth = $(this).width();

            if (900 > windowWidth) {
                buildMobileGallery();
                return;
            }

            var category = parseInt(galleryContainer.attr('data-category'));
            var currentPicture = parseInt(galleryContainer.attr('data-picture'));
            var person = $('#person').val();
            var city = $('#city').val();

            if (currentCategory != category || currentPerson != person || currentCity != city) {
                filterChanged = true;
                currentCategory = category;
                currentPerson = person;
                currentCity = city;
            }

            if (!filterChanged)  {
                return;
            }

            if ($('.noload').length > 0) {
                return;
            }

            $('.preloader').show();
            $('#pictures').hide();

            console.log('ajax request ', Date.now());

            $.post(isArchive ? '/ajax/picture/archive' : '/ajax/picture', {category: category, person: person, city: city},
                function(data){

                    console.log('ajax responce',  Date.now());

                    if (data.pictures != undefined) {

                        picturesArray = [];

                        for (i in data.pictures) {
                            picturesArray.push(data.pictures[i]);
                        }

                        shuffle(picturesArray);
                        //console.log(picturesArray);

                        if (gallerySlick) {
                            galleryContainer.slick('unslick');
                        }
                        galleryContainer.empty();

                        var currentElement = 1;
                        var maxElement = 0;


                        if (windowWidth >= 900) {
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
                        }

                        console.log('end build html', Date.now());

                        // hide vote block
                        if (data.vote_disabled || isArchive) {
                            $('.picture-vote').css({visibility: 'hidden'});
                            $('#modal-gallery .share').hide();
                        }

                        if (data.gallery_disabled && !isArchive) {
                            $('body').addClass('modal-open');
                            $('#modal-closed').show();
                        }

                        //console.log(totalSlides, typeof totalSlides, totalSlides > 0);

                        if (totalSlides > 0) {
                            $('#picture-counter').show();
                        } else {
                            $('#picture-counter').hide();
                        }
                        filterChanged = false;
                        console.log('start init slick',  Date.now());
                        initSliderPlugin(windowWidth);
                        console.log('stop init slick',  Date.now());
                        if (currentPicture) {
                            $('.picture .img a[data-id='+currentPicture+']').trigger('click');
                        }
                        $('.preloader').hide();

                    }
                }, "json");
        };

        var buildMobileGallery = function() {

            $('.preloader').show();
            $('#pictures').hide();

            var category = parseInt(galleryContainer.attr('data-category'));
            var person = $('#person').val();
            var city = $('#city').val();

            if (currentCategory != category || currentPerson != person || currentCity != city) {
                filterChanged = true;
                currentCategory = category;
                currentPerson = person;
                currentCity = city;
            }

            if (!filterChanged)  {
                return;
            }

            //console.log('mobile ajax request',  Date.now());

            $.post('/ajax/picture', {category: category, person: person, city: city, limit: mobilePageLimit, page: mobileLoadedPages},
                function(data){

                    //console.log(data);

                    //console.log('mobile ajax response',  Date.now());

                    if (data.pictures != undefined) {

                        mobilePictures = [];

                        for (var i in data.pictures) {
                            mobilePictures.push(data.pictures[i]);
                        }

                        shuffle(mobilePictures);

                        mobileLoadedPages = 1;

                        //console.log('mobile', mobilePageLimit, mobilePictures);

                        mobileTotalPictures =  data.total;
                        mobileCurrentPicture = 0;
                        galleryContainer.empty();
                        galleryContainer.append('<div class="picture">' + elementMobileHtml(mobilePictures[0], 0) +'</div>');

                        var pic = mobilePictures[0];
                        setGraph(pic['id'], pic['name'], pic['person'], pic['age'], pic['city'], pic['picture_main']);

                        $('#slide-current').html(mobileCurrentPicture+1);
                        $('#slide-total').html(mobileTotalPictures);

                        // hide vote block
                        if (data.vote_disabled || isArchive) {
                            $('.picture-vote').css({visibility: 'hidden'});
                            $('.share').hide();
                        }

                        if (data.gallery_disabled && !isArchive) {
                            $('body').addClass('modal-open');
                            $('#modal-closed').show();
                        }

                        if (mobileTotalPictures > 0) {
                            $('#picture-counter').show();
                        } else {
                            $('#picture-counter').hide();
                        }

                        filterChanged = false;
                        $('.preloader').hide();
                        $('#pictures').show();

                    }
                }, "json");
        };

        var clickMobilePicture = function(el, e){
            var that = $(el);

            $('.preloader').show();
            $('#pictures').hide();

            var category = parseInt(galleryContainer.attr('data-category'));
            var person = $('#person').val();
            var city = $('#city').val();

            if (e.clientX > $(window).width()/2 && mobileTotalPictures-1 > mobileCurrentPicture) {
                mobileCurrentPicture = mobileCurrentPicture + 1;
            } else if (mobileCurrentPicture > 0) {
                mobileCurrentPicture = mobileCurrentPicture - 1;
            } else {
                $('.preloader').hide();
                $('#pictures').show();
                return;
            }

            if (!(mobileCurrentPicture in mobilePictures)) {
                $.post('/ajax/picture', {category: category, person: person, city: city, limit: mobilePageLimit, page: mobileLoadedPages},
                    function(data){

                        //console.log(data);

                        var tempArray = [];

                        for (var i in data.pictures) {
                            tempArray.push(data.pictures[i]);
                        }

                        shuffle(tempArray);
                        mobilePictures.concat(tempArray);

                        mobileLoadedPages = mobileLoadedPages + 1;

                        //console.log(mobilePictures);

                        mobileTotalPictures =  data.total;

                        galleryContainer.find('.picture').html(elementMobileHtml(mobilePictures[mobileCurrentPicture], mobileCurrentPicture));

                        var pic = mobilePictures[mobileCurrentPicture];
                        setGraph(pic['id'], pic['name'], pic['person'], pic['age'], pic['city'], pic['picture_main']);

                        $('#slide-current').html(mobileCurrentPicture+1);
                        $('#slide-total').html(mobileTotalPictures);

                        if (data.vote_disabled || isArchive) {
                            $('.picture-vote').css({visibility: 'hidden'});
                            $('.share').hide();
                        }

                        $('.preloader').hide();
                        $('#pictures').show();

                    }, "json")
            } else {
                galleryContainer.find('.picture').html(elementMobileHtml(mobilePictures[mobileCurrentPicture]));

                var pic = mobilePictures[mobileCurrentPicture];
                setGraph(pic['id'], pic['name'], pic['person'], pic['age'], pic['city'], pic['picture_main']);

                $('#slide-current').html(mobileCurrentPicture+1);
                $('.preloader').hide();
                $('#pictures').show();
            }

        };

        var setGraph = function(picture_id, picture_name, person, age, city, picture) {
            var currentUrl = window.location.protocol + '//' + window.location.host + '/pictures/' +picture_id;


            var url = $('meta[property="og:url"]').attr('content', currentUrl);
            var title = $('meta[property="og:title"]').attr('content', picture_name);
            var description = $('meta[property="og:description"]').attr('content', person+', '+age+', '+city);
            var image = $('meta[property="og:image"]').attr('content', window.location.protocol + '//' + window.location.host + picture);

            window.history.pushState({currentSlide: picture_id},'', '/pictures/' + picture_id);
        }

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
                lazyLoad: 'ondemand', //progressive
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
            $('#pictures').show();

            gallerySlick = true;
            galleryContainer.slick('setPosition');
        };

        $(document).on('click', '.tabs li', function(e) {
            var that = $(this);
            var id = that.attr('data-id');
            that.addClass('active').siblings().removeClass('active');
            galleryContainer.attr('data-category', id);
            buildGallery();
            $.scrollTo('.pictures-container', 1000);
        });

        $(document).on('click', '.btn-picture-search', function(e) {
            e.preventDefault();
            buildGallery();
        });

        $(document).on('click', '.picture .img a', function(e) {
            e.preventDefault();

            if ($(window).width() < 900) {
                clickMobilePicture(this, e);
                return;
            }

            ga('send', 'event', 'gallery', 'popup');

            var pos = parseInt($(this).attr('data-position'));

            popupSlick.empty();

            for (i in picturesArray) {
                popupSlick.append(modalElementHtml(picturesArray[i]))
            }

            $('body').addClass('modal-open');
            popupSlick.slick({
                infinite: false,
                dots : false,
                lazyLoad: 'ondemand', //progressive
                slidesToShow: 1,
                initialSlide: pos,
                adaptiveHeight: true,
                prevArrow: '<button type="button" class="slick-prev popup-prev"><img src="/bundles/public/img/popup_prev.png"></button>',
                nextArrow: '<button type="button" class="slick-next popup-next"><img src="/bundles/public/img/popup_next.png"></button>'
            }).on('afterChange', function(event, slick, currentSlide){
                setModalArrowVibibility(currentSlide, picturesArray.length);

                var pic = picturesArray[currentSlide];
                setGraph(pic['id'], pic['name'], pic['person'], pic['age'], pic['city'], pic['picture_main']);

            });
            $('#modal-gallery').show();

            popupSlick.slick('setPosition');

            var pic = picturesArray[pos];
            setGraph(pic['id'], pic['name'], pic['person'], pic['age'], pic['city'], pic['picture_main']);

        });

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

            //console.log('vote click', 'picture - ' + picture);

            $.post('/pictures/vote', {picture: picture}, function(data) {
                if (data.voted ) {
                    if (that.hasClass('inactive')) {
                        that.removeClass('inactive');
                    } else {
                        that.addClass('inactive');
                    }
                    that.siblings('.likes').html(data.likes);
                } else if (data.redirect) {
                    //console.log(data);
                    var url = data.redirect;
                    $.get(url, { "_": $.now() },function(data){
                        $('#modal-auth .modal-content').html(data);
                        $('body').addClass('modal-open');
                        $('#modal-auth').show();
                    })

                } else {
                    //console.log(data.message);
                }
            });
        });

        var popupwindow = function(url, title, w, h) {
            var left = (screen.width/2)-(w/2);
            var top = (screen.height/2)-(h/2);
            return window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
        };

        $(document).on('click', '.modal-dialog-auth form a:not(.dynamic), .nologin-controls a', function(e){
            e.preventDefault();

            var that = $(this);

            var url = that.attr('href');

            $.get(url, { "_": $.now() }, function(data){
                $('#modal-auth .modal-content').html(data);
            })
        });

        $(document).on('click', '.modal-dialog-auth form a.dynamic', function(e){
            e.preventDefault();

            var that = $(this);

            var block = that.attr('href');

            $(block).show();

        });

        $(document).on('submit', '.modal-dialog-auth form', function(e){
            e.preventDefault();

            var that = $(this);
            var url = that.attr('action');
            var params = {};
            var formdata = that.serializeArray();
            that.find('.message.message-error').hide();

            $.each(formdata, function(i, field) {
                params[field.name] = field.value;
            });

            $.post(url, params, function(data){
                //console.log(data);
                if (data.status) {

                    if (data.task == 'redirect') {
                        $.get(data.redirect, { "_": $.now() }, function(data){
                            $('#modal-auth .modal-content').html(data);
                        });
                        return;
                    }

                    if (data.task == 'reload') {
                        window.location.reload();
                        return;
                    }

                    if (data.task == 'message') {
                        $('#modal-auth .modal-content').html('<div class="text-center">' + data.message + '</div>');
                    }

                    if (data.task == 'close') {
                        $('#modal-auth a.modal-close').trigger('click');
                    }

                    if (data.picture) {
                        $('.picture-vote button[data-id='+data.picture+']').trigger('click');
                    }

                    $('.account-control').trigger('check');

                } else {
                    that.find('.message.message-error').html(data.message);
                    that.find('.message.message-error').show();
                    //console.log(data.message);
                }
            });
        });

        $(document).on('click', '.modal-dialog-auth .social-selector a', function(e){
            e.preventDefault();

            var that = $(this);
            var url = that.attr('href');

            popupwindow(url, 'Social OAuth', 640, 420);
        });

        $(document).on('click', '.btn-user-login', function(e){
            e.preventDefault();

            var url = '/pictures/login';

            $.get(url, { "_": $.now() }, function(data){
                $('#modal-auth .modal-content').html(data);
                $('body').addClass('modal-open');
                $('#modal-auth').show();
            });
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

        $(document).on('check', '.account-control', function(e){

            var that = $(this);

            $.get('/pictures/user', { "_": $.now() }, function(data){
                that.after(data.content).remove();
            })
        })


        $(document).on('click', '.btn-share-vk', function(e) {
            e.preventDefault();

            var url = $('meta[property="og:url"]').attr('content');
            var title = $('meta[property="og:title"]').attr('content');
            var description = $('meta[property="og:description"]').attr('content');
            var image = $('meta[property="og:image"]').attr('content');

            popupwindow(Share.vkontakte(url,title,image,description), 'VK Share Page', 626, 426);
        });

        $(document).on('click', '.btn-share-fb', function(e) {
            e.preventDefault();

            var url = $('meta[property="og:url"]').attr('content');

            popupwindow(Share.facebook(url), 'Facebook Share Page', 626, 426);
        })

    });

})(jQuery);

Share = {
    vkontakte: function(purl, ptitle, pimg, text) {
        url  = 'http://vkontakte.ru/share.php?';
        url += 'url='          + encodeURIComponent(purl);
        url += '&title='       + encodeURIComponent(ptitle);
        url += '&description=' + encodeURIComponent(text);
        url += '&image='       + encodeURIComponent(pimg);
        url += '&noparse=true';
        return url;
    },
    facebook: function(purl) {
        url  = 'http://www.facebook.com/sharer.php?src=100';
        url += '&u='       + encodeURIComponent(purl);
        return url;
    }

};

function openProfileForm(picture) {
    $('.account-control').trigger('check');
    try {
        $('.picture-vote button[data-id='+picture+']').trigger('click');
    } catch (err) {
        console.log(err);
        var url = '/pictures/profile';

        $.get(url, { "_": $.now() }, function(data){
            $('#modal-auth .modal-content').html(data);
            $('body').addClass('modal-open');
            $('#modal-auth').show();
        })

    }

}

function closeAuthForm(picture) {
    $('.account-control').trigger('check');
    $('#modal-auth a.modal-close').trigger('click');
    try {
        $('.picture-vote button[data-id=' + picture + ']').trigger('click');
    } catch (err) {
        console.log(err);
    }
}