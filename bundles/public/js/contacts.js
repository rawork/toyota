(function($) {
    $(function() {

        var canvasOffsetX = -40;
        var canvasOffsetY = 224;
        var canvasOffsetX1200 = 150;

        var cities = {};
        var dealers = {};


        $.get($('#map-city').attr('data-url'),
            function(data){
                if (data.cities) {
                    cities = data.cities;
                }
            });


        var buildList = function (container, cityId) {
            var currentDealers = dealers[cityId];
            console.log(currentDealers);
            var $container = $(container);
            $container.empty();
            $.each(currentDealers, function(key, value) {
                $container
                    .append($('<li></li>')
                        .html('<div class="title">'+value.name+'</div><div class="info">ВРЕМЯ РАБОТЫ<br>'+value.openhour+'<br><strong>Тел.</strong>: '+value.phone+'<br><strong>Адрес</strong>: '+value.address+'<br><strong>E-mail</strong>: <a href="'+value.email+'">'+value.email+'</a></div><a class="roadmap-link" href="'+value.site+'">Схема проезда</a><div class="service">Предоставляемые услуги:<br>- продажа новых а/м Toyota<br>- тюнинг<br>- слесарный ремонт<br>- trade-in<br>- аренда авто<br>- страхование<br>- кредит<br></div><a class="site-link" href="'+value.site+'">Перейти на сайт дилерского центра</a>'));
            });
        };

        $(document).on('click', 'a.modal-close', function(e){
            e.preventDefault();
            $(this).parents('.modal').hide();
            $("body").removeClass("modal-open")
        });

        $(document).on('click', '#map-dot', function(e) {
            e.preventDefault();

            var that = $(this);
            var cityId = that.attr('data-id');

            var dataUrl = $('#dealer').attr('data-url');
            if (dealers[cityId] != undefined) {
                buildList('#dealer', cityId);
                $('#myModal').show();
                $("body").addClass("modal-open");
                return;
            }
            $.post(dataUrl, {id: cityId},
                function(data){
                    if (data.dealers) {
                        dealers[cityId] = data.dealers;
                        buildList('#modal-dealers ul', cityId);
                        $('#myModal').show();
                        $("body").addClass("modal-open");
                    }
                });
        });

        if(jQuery().selectize) {
            $('.map select').selectize({
                allowEmptyOption: true,
                placeholder: 'Начните вводить название города',
                onChange: function(value) {
                    if (!value.length) {
                        $('#map-dot').hide();
                        return;
                    }
                    var cityData = cities[value];

                    if ($('.map-canvas').is(':visible')) {
                        $('#map-dot')
                            .removeClass()
                            .addClass('map-dot')
                            .addClass('map-dot'+value)
                            .attr('data-id', value)
                            .css({
                                'left': canvasOffsetX + (1200 <= $(window).width() ? canvasOffsetX1200 : 0) + parseInt(cityData.offsetx),
                                'top': canvasOffsetY + parseInt(cityData.offsety)
                        })
                            .show()
                            .find('span').html(cityData['name']);
                            $.scrollTo('.map-canvas', 1000);

                    } else {

                        var dataUrl = $('#dealer').empty().attr('data-url');
                        if (dealers[value] != undefined) {
                            buildList('#dealer', value);
                            $('ul#dealer').show();
                            $.scrollTo('ul#dealer', 1000);
                            return;
                        }
                        $.post(dataUrl, {id: value},
                            function(data){
                                if (data.dealers) {
                                    dealers[value] = data.dealers;
                                    buildList('#dealer', value);
                                    $('ul#dealer').show();
                                    $.scrollTo('ul#dealer', 1000);
                                }
                            });


                    }

                }
            });
        }

    });

})(jQuery);
