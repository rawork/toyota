function showPopup() {
	$('#modalDialog').modal('show');
}

function hidePopup() {
	$('#modalDialog').modal('hide');
}

function emptySelect(inputId) {
	$('#'+inputId).val(0);
	$('#'+inputId+'_title').html('Не выбрано');
}

function makePopupChoice(inputId) {
	value = $('#popupChoiceId').val();
	valueTitle = $('#popupChoiceTitle').html();
	type = $('#'+inputId+'_type').val();
	if (type == 'many') {
		text = '<div>'+valueTitle+' <input type="radio" name="'+inputId+'_default" value="'+value+'" class="selected-default" data-input-id="'+inputId+'"> По умолчанию <a href="#" class="selected-remove" data-input-id="'+inputId+'"><i class="glyphicon glyphicon-remove"></i></a></div>';
		if ($('input[name|="'+inputId+'_default"]').length == 0) {
			$('#'+inputId+'_title').html(text);
			$('#'+inputId).val(value);
			$('input[name|="'+inputId+'_default"]').first().prop('checked', true);
		} else {
			$('#'+inputId+'_title').append(text);
		}
		ids = new Array();
		$('input[name|="'+inputId+'_default"]').each(function (index, domElement){
			if ($(domElement).val() != $('#'+inputId).val()) {
				ids.push($(domElement).val());
			}
		});
		$('#'+inputId+'_extra').val(ids.join());
	} else {
		$('#'+inputId).val(value);
		text = '<div>'+valueTitle+' <a href="#" class="selected-remove" data-input-id="'+inputId+'"><i class="glyphicon glyphicon-remove"></i></a></div>';
		$('#'+inputId+'_title').html(text);
	}
	hidePopup();
}

function choiceList(input_id) {
    ids = new Array();
    titles = new Array();
    $("input.popup-item:checked").each(function (index, domElement) {
        id = $(domElement).val();
        title = $('#itemTitle' + id).html();
        ids.push(id);
        titles.push(title);
    });
    $('#'+input_id).val(ids.join());
    $('#'+input_id+'_title').val(titles.join(', '));
    hidePopup();
}

/* ajax */
function showSelectDialog(inputId, tableName, fieldName, dbId, title){
	$.post(prj_ref+"/admin/dialog/select", {input_id: inputId, table_name: tableName, field_name: fieldName, entity_id: dbId, title : title},
	function(data){
		$('#popupTitle').html(data.title);
		$('#popupButtons').html(data.button);
		$('#popupContent').html(data.content);
		$('.popup-item').on("click", function(event){
			$('#popupChoiceId').val($(this).prop('rel'));
			$('#popupChoiceTitle').html($(this).html());
		});	
		showPopup();
	}, "json");
}

function showPage(divId, tableName, fieldName, entityId, page) {
	$.post(prj_ref+"/admin/dialog/selectpage", {div_id: divId, table_name: tableName, field_name: fieldName, entity_id: entityId, page: page},
	function(data){
		$('#' + divId).html(data.content);
		$('.popup-item').on("click", function(event){
			$('#popupChoiceId').val($(this).prop('rel'));
			$('#popupChoiceTitle').html($(this).html());
		});
	}, "json");
}

function showTreeDialog(inputId, tableName, fieldName, dbId, title){
	checkedId = dbId;
	$.post(prj_ref + "/admin/dialog/tree", {input_id: inputId, table_name: tableName, field_name: fieldName, entity_id: dbId, title : title},
	function(data){
		$('#popupTitle').html(data.title);
		$('#popupButtons').html(data.button);
		$('#popupContent').html(data.content);
		$("#navigation").treeview({
			persist: "location",
			collapsed: true,
			unique: true
		});
		$('.popup-item').on("click", function(event){
			$('#popupChoiceId').val($(this).prop('rel'));
			$('#popupChoiceTitle').html($(this).html());
		});
		showPopup();
	}, "json");
}

function showListDialog(inputId, table_name, field_name, value){
    $.post(prj_ref + "/admin/dialog/list", {input_id: inputId, table_name: table_name, field_name: field_name, value: value},
        function(data){
            $('#popupTitle').html(data.title);
            $('#popupButtons').html(data.button);
            $('#popupContent').html(data.content);
            showPopup();
        }, "json");
}

function showTemplateDialog(name) {
	id = $('#'+name+'_version')[0].options[$('#'+name+'_version')[0].selectedIndex].value;
	if (id) {
		$.post(prj_ref + "/admin/dialog/template", {version_id: id},
		function(data){
			$('#popupTitle').html(data.title);
			$('#popupButtons').html(data.button);
			$('#popupContent').html(data.content);
			showPopup();
		}, "json");
	} else {
		alert('Не выбрана версия!');
	}
}

/* end ajax */


function setupCalendar() {
	for (var name in calendars) {
		time = (calendars[name] ? ' ' + calendars[name] : '')
		Calendar.setup({
			inputField : name, 
			ifFormat : "%d.%m.%Y" + time, 
			showsTime : time ? true : false, 
			button : "trigger_" + name, 
			align : "Br", 
			singleClick : true,
			timeFormat : 24,
			firstDay : 1
		});
	}
}

function emptyDateSearch(name){
	$('#'+name+'_beg').val('');
	$('#'+name+'_end').val('');
	return false;
}

(function($) {
    $(function() {

        $(document).on('click', '.btn-submit', function (e) {
            var mode = parseInt($(this).attr('data-mode'));

            if (mode) {
                $('input#utype').val(mode);
            }

            $('#entityForm').submit();
        });

        $(document).on('click', '#state-menu-icon', function(e){
            e.preventDefault();

            var that = $(this);

            if ($('.statebar').css('left') == '-260px') {
                $('.container').css('position', 'absolute')
                    .animate({
                        right: '-260px'
                    }, 200);

                $('.statebar').animate({
                    left: '0px'
                }, 200);
                that.hide();
            } else {
                $('.container')
                    .animate({
                        right: 'auto'
                    }, 200)
                    .css('position', 'static');

                $('.statebar').animate({
                    left: '-260px'
                }, 200);
                that.show();
            }
        });

        $(document).on('click', '.statebar a.close', function(e) {
            e.preventDefault();

            $('#state-menu-icon').trigger('click');
        });

        $(document).on('click', '#btn-filter-cancel', function(e) {
            e.preventDefault();
            $('#filter-type').val($(this).attr('data-type'));
            $('#form-filter').submit();
        });

        $(document).on('click', '#btn-group-delete', function(e) {
            e.preventDefault();
            elements = $(".list-checker:checked");
            if (elements.length <= 0) {
                alert('Не выбраны элементы для удаления');
                return false;
            }

            if (confirm('Уверены, что хотите удалить выделенные записи?')) {
                ids = new Array();
                elements.each(function (index, domElement) {
                    id = $(domElement).val();
                    ids.push(id);
                });
                $('#ids').val(ids.join());
                path = location.href.split('?');
                $('#frmGroupUpdate').prop('action', path[0] + '/groupdelete').submit();
            }

            return false;
        });

        $(document).on('click', '#btn-group-save, #btn-group-edit', function(e) {
            e.preventDefault();
            var checkElements = $(this).attr('data-check') == 'true';
            elements = $(".list-checker:checked");
            if (checkElements && elements.length <= 0) {
                alert('Не выбраны элементы для редактирования');
                return;
            }

            if (checkElements) {
                ids = new Array();
                elements.each(function (index, domElement) {
                    id = $(domElement).val();
                    ids.push(id);
                });
                $('input[name="edited"]').val(0);
                $('#ids').val(ids.join());
            }

            $('#frmGroupUpdate').submit();

        });

        $('input.clPicker').colorPicker();

        $(document).on('click', 'a.state', function () {
            $('#waiting').show(0);
            var state = $(this).attr('data-state');
            var module = $(this).attr('data-module');

            $.post(prj_ref + "/admin/statemenu/"+ state + (module ? "/" + module : ''), {},
                function(data){
                    if (data.error) {
                        window.location.reload();
                        return;
                    }

                    $('#moduleMenu').html(data.content);
                    $('#waiting').hide(0);
                    if ($('.statebar').css('left') == '-260px') {
                        $('.container').css('position', 'absolute')
                            .animate({
                                right: '-260px'
                            }, 200);

                        $('.statebar').animate({
                            left: '0px'
                        }, 200);
                        $('#state-menu-icon').hide();
                    }
                }, "json");
        });

        $(document).on('click', 'a.module', function () {
            $('#waiting').show();
            var module = $(this).attr('data-module');
            tablelist = $('#table-menu-'+module);
            if (tablelist.html() == '') {
                $.post(prj_ref + "/admin/modulemenu/" + module, {},
                    function(data){
                        if (data.alertText) {
                            window.location.reload();
                        } else {
                            tablelist.html(data.content);
                            tablelist.show();
                        }
                        $('#waiting').hide();
                    }, "json");
            } else if (tablelist.css('display') == 'none') {
                tablelist.show();
                $('#waiting').hide();
            } else {
                tablelist.hide();
                $('#waiting').hide();
            }
        });

        $(document).on('change', '#select-rpp', function (e) {
            $('#waiting').show();
            var that = $(this);
            var tableName = that.attr('data-table');
            var url = that.attr('data-url');
            var rpp = that.val();
            $.post(url, {table: tableName, rpp: rpp},
                function(data){
                    $('#waiting').hide();
                    window.location.reload();
                }, "json");
        });

        $(document).on('click', '.entity-delete-link', function (e) {
            e.preventDefault();
            var url = $(this).attr('data-url');
            if (confirm('Уверены, что хотите удалить запись?')) {
                window.location = url;
            } else {
                return false;
            }
        });

        $(document).on('click', '.entity-copy-link', function (e) {
            e.preventDefault();

            var url = $(this).attr('data-url');
            $.post(url, {},
                function(data){
                    $('#popupTitle').html(data.title);
                    $('#popupButtons').html(data.button);
                    $('#popupContent').html(data.content);
                    showPopup();
                }, "json");
        });

        $(document).on('click', '.btn-copy', function (e) {

            var ref = '/' + $(this).attr('data-id') + '/copy';
            var quantity = parseInt($('#copy-amount').val());

            if (quantity > 0 && quantity < 11) {
                hidePopup();
                path = location.href.split('?');
                window.location = path[0] + ref + '/' + quantity + (1 in path ? '?'+ path[1] : '');
            } else {
                $('#copy-input').addClass('has-error');
                $('#copy-help').html('Введите число от 1 до 10');
            }
        });

        $('.btn-create-backup').bind('click', function() {
            var url = $(this).attr('data-url');
            $('#waiting').show();
            $("#archive_info").addClass('closed').empty();
            $.post(url, {},
                function(data){
                    $('#waiting').hide();
                    window.location.reload();
                }, "json");
        });

        $('.btn-clear-cache').bind('click', function() {
            var url = $(this).attr('data-url');
            $('#waiting').show();
            $("#cache_info").addClass('closed').empty();
            $.post(url, {},
                function(data){
                    $("#cache_info").html(data.content).removeClass('closed');
                    $('#waiting').hide();
                }, "json");
        });

        $(document).on('click', '.delete', function (e) {
            e.preventDefault();

            var id = $(this).attr('data-id');
            var url = $(this).attr('data-url');

            console.log(id, url);

            $.post(url, {id: id},
                function(data){
                    if (data.error) {
                        alert(data.error);
                    } else {
                        $('#file_'+id).remove();
                    }
                }, "json");
        });

        $('.btn-add-input').bind('click', function() {
            var name = $(this).attr('data-name');
            $('#'+name+'_input').append('<br><input name="'+name+'[]" type="file">');
        });

        $('.select-type').bind('change', function (){
            var types = ['image', 'gallery', 'enum', 'select', 'select_list', 'select_tree'];
            var type = $(this).val();
            console.log(type, $.inArray(type, types));
            if ($.inArray(type, types) > -1) {
                $('#add_select_values').css('display', 'table-row');
                $('#add_params').css('display', 'table-row');
            } else {
                $('#add_select_values').hide();
                $('#add_params').hide();
            }
        });


        $('.multi').MultiFile({
            accept:'jpg|gif|png|rar|zip|pdf|flv|ppt|xls|doc',
            max:10,
            remove:'удалить',
            file:'$file',
            selected:'Выбраны: $file',
            denied:'Неверный тип файла: $ext!',
            duplicate:'Этот файл уже выбран:\n$file!'
        });

        $("#waiting").ajaxStart(function(){
            $(this).show();
        })
            .ajaxComplete(function(){
                $(this).hide();
            });

        $('#uploadForm').ajaxForm({
            beforeSubmit: function(a,f,o) {
                o.dataType = "html";
                $('#uploadOutput').html('Отправка данных...');
            },
            success: function(data) {
                var out = $('#uploadOutput');
                out.html('');
                if (typeof data == 'object' && data.nodeType)
                    data = elementToString(data.documentElement, true);
                else if (typeof data == 'object')
                    data = objToString(data);
                out.append('<div>'+ data +'</div>');
                $('a.MultiFile-remove').click();
                $('#updatelistbtn').click();
            }
        });

        setupCalendar();

        $('#list-checker').on('click', function () {
            if ($(this).prop('checked')) {
                $(".list-checker").prop('checked', true);
            } else {
                $(".list-checker").prop('checked', false);
            }
        });

        $('a.filemanager-link').click(function(e){
            e.preventDefault();
            var that = $(this);
            var iframe = $('<iframe frameborder="0"></iframe>');
            iframe.attr('src', that.attr('href'));
            $('#popupContent').html(iframe[0].outerHTML);
            $('#popupTitle').html(that.html());
            $('.modal-content').css('width', '800px');
            $('.modal-body').css('padding', '0');
            $('.modal-footer').css('margin-top', '0');
            $('.modal-footer').css('padding', '0');
            $('#modalDialog').modal({show:true});

        })

        $(document).on('click', 'a.locale', function(){
            $('#formLocale input[name=locale]').val($(this).attr('data-locale'));
            $('#formLocale').submit();
        });

        $(document).on('click', '.selected-default', function(e){
            var that = $(this);
            var inputId = that.attr('data-input-id');
            if (that.prop('checked')) {
                $('#'+inputId).val(that.val());
                ids = new Array();
                $('input[name|="'+inputId+'_default"]').each(function (index, domElement){
                    if ($(domElement).val() != that.val()) {
                        ids.push($(domElement).val());
                    }
                });
                $('#'+inputId+'_extra').val(ids.join());
            }
        });

        $(document).on('click', 'a.selected-remove', function(e){
            e.preventDefault();
            var inputId = $(this).attr('data-input-id');
            var checked = $(this).prev().prop('checked');
            $(this).parent().remove();
            if (checked) {
                if (firstElement = $('input[name|="'+inputId+'_default"]').first()) {
                    firstElement.prop('checked', true);
                    $('#'+inputId).val(firstElement.val());
                }
            }
            ids = new Array();
            $('input[name|="'+inputId+'_default"]').each(function (index, domElement){
                if ($(domElement).val() != $('#'+inputId).val()) {
                    ids.push($(domElement).val());
                }
            });
            if ($('input[name|="'+inputId+'_default"]').length == 0) {
                $('#'+inputId).val(0);
                $('#'+inputId+'_title').html('Не выбрано');
                $('#'+inputId+'_extra').val('');
            }
            $('#'+inputId+'_extra').val(ids.join());
        });

    });

})(jQuery);

