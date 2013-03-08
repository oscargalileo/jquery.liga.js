(function($) {
    // Funciones auxiliares
    // DIV que bloquea otros elementos con los alert y preguntas
    function bloqueador() {
        return $('<div />').addClass('bloquea').css(
            {width   : '105%',
            height   : '105%',
            margin   : '-10px',
            position : 'fixed',
            'z-index': 10,
            opacity  : '0.6',
            filter   : 'alpha(opacity = 60)'}
        );
    }
    // Centra un alerta y pregunta
    function centrar(ven) {
        var iz    = $(window).width()/2;
        var ar    = $(window).height()/2;
        var msjIz = ven.outerWidth()/2;
        var msjAr = ven.outerHeight()/2;
        if ((msjIz*2)>((iz*2)*0.5)) {
            ven.animate({position:'fixed', left:5, top :5, right:5});
        } else {
            ven.css({position:'fixed', left:iz-msjIz, top :(ar-msjAr)*0.4});
        }
    }
    // Valida los campos de un formulario a partir de sus reglas
    function validar(input, regla, forma) {
        var valido = true;
        var valor  = input.val();
        if (window.FormData) {
          if (input.attr('type') == 'file') {
           var campo = input.get(0);
           var files = campo.files;
           for (var i = 0; i < files.length; i++) {
            if (files[i].name && files[i].size) { 
             // Tamaño del archivo
             if ((regla['tamin'] && files[i].size < regla['tamin']) || (regla['tamax'] && files[i].size > regla['tamax'])) {
              return false;
             }
             // Tipo de archivo o extensión
             var ext = files[i].name.substring(files[i].name.lastIndexOf('.')+1);
             if (regla['patron']) {
              var pat = regla['patron']['length'] ? regla['patron'] : [regla['patron']];
              var val = false;
              for (var j in pat) {
                  if (pat[j].test(ext) || (files[i].type && pat[j].test(files[i].type))) {
                      val = true;
                  }
              }
              if (!val) {
                  return false;
              }
             }
            }
           }
           return true;
          }
        }
        // Patrones
        if (regla['patron']) {
            var pat = regla['patron']['length'] ? regla['patron'] : [regla['patron']];
            var val = false;
            for (var i in pat) {
                if (pat[i].test(valor)) {
                    val = true;
                }
            }
            if (!val) {
                valido = false;
            }
        }
        // Rango numérico
        if (regla['mayor']) {
            if (isNaN(valor) || valor <= regla['mayor']) {
                valido = false;
            }
        }
        if (regla['menor']) {
            if (isNaN(valor) || valor >= regla['menor']) {
                valido = false;
            }
        }
        // Condición personalizada
        if (regla['cond']) {
            var campos = forma.serializeArray();
            var form = {};
            for (var i in campos) {
                form[campos[i]['name']] = campos[i]['value'];
            }
            try {
                valido = eval('('+regla['cond']+')');
            } catch(e) {
                $.error('Error al evaluar la condición "'+regla['cond']+'"');
                valido = false;
            }
        }
        return valido;
    }
    // Crea un objeto a partir del hash
    function obj2Hash(cad) {
        var hash = (cad) ? cad : parent.location.hash;
        // Quitar el # del principio si está
        hash = (hash.indexOf('#') == 0) ? hash.substring(1) : hash;
        // Separa el hash en partes con delimitadores / y // ejemplo: #id/url//otroID/variables
        hash = hash.split('//');
        // Recorro el hash para armar un objeto
        var objHash = {};
        for (var i in hash) {
            var datos = hash[i].split('/');
            if (datos[0] && datos[1]) {
                var id    = datos[0];
                var vars  = datos[1];
                for (var j=2;j<datos.length;j++) {
                    vars += '/'+datos[j];
                }
                objHash[id] = vars;
            }
        }
        return objHash;
    }
    // Se ejecuta cuando el hash de la página cambia
    function procesarHash() {
        var objHash = obj2Hash();
        var recep = $('body').data('historialLIGA');
        for (var id in recep) {
            if (objHash[id]) {
                // Se carga lo del hash
                var rece = $('#'+id).data('historialLIGA');
                if (rece['actual'] != objHash[id]) {
                    cargar(id, rece['url'], objHash[id], rece['func']);
                    rece['actual'] = objHash[id];
                    $('#'+id).data('historialLIGA', rece);
                }
            } else {
                // Se carga por defecto de recep
                var hist = $('#'+id).data('historialLIGA');
                if (hist['actual'] != hist['param']) {
                    cargar(id, hist['url'], hist['param'], hist['func']);
                    hist['actual'] = hist['param'];
                    $('#'+id).data('historialLIGA', hist);
                }
            }
        }
    }
    // Carga datos asíncronamente dentro del contenedor id (con gestor de caché)
    function cargar(id, url, vars, func) {
        // Aquí se checa la caché
        var cont = $('#'+id);
        var hist = cont.data('historialLIGA');
        var cach = cont.data(vars);
        if (hist['cache'] && cach) {
            cont.html(cach);
            // Se ejecuta la función de respuesta personalizada
            if (func) {
                func(resp);
            }
        } else {
            // Se carga del servidor (pendiente la gestión de errores ajax)
            cont.liga('mensaje', {msj:'<span class="ui-icon ui-icon-info" style="float: left; margin-right: .3em;"></span> Cargando', seg: 0, btn:false});
            // Soporte para distinta URL a la que trae por defecto el contenedor (con dos puntos)
            if (vars.indexOf(':') === 0) {
                url  = encodeURI(vars.substring(1));
                // (Pendiente) Luego separar las variables por si se quiere enviar por POST
                vars = '';
            }
            // (Pendiente) Utilizar $.ajax para enviar por otro método
            cont.load(url, encodeURI(vars), function(resp) {
                // Aquí se guarda la caché si está activada para el contenedor
                if (hist['cache']) {
                    cont.data((vars) ? vars : decodeURI(':'+url), resp);
                }
                // Se ejecuta la función de respuesta personalizada
                if (func) {
                    func(resp);
                }
            });
        }
    }
    // Todos los métodos y funciones desde el namespace liga
    var methods = {
        alerta : function(options) {
            if (typeof options !== 'object') options = {msj: String(options)};
            var settings = $.extend( {
                msj : ' ',
                tit : '¡Atención!',
                'class' : 'alerta',
                vel : 'fast',
                btn : 'Cerrar',
                fijo: true,
                func: function () {}
            }, options);
            // Capa para bloquear otros elementos de la página
            var div = bloqueador();
            $('body').prepend(div);
            // Cuadro de título de la alerta
            var tit = $('<div />').addClass('titAlerta ui-widget-header').html('<span class="ui-icon ui-icon-notice" style="float: left; margin-right: .3em;"></span>'+settings['tit']);
            // Botón para cerrar la ventana de alerta
            var btn = $('<button />').addClass('cerrarMsjAlerta btn1').html(settings['btn']).click(function (e) {
                $(this).parent().slideUp(settings['vel'], function () {
                    settings['func']();
                    div.remove();
                    $(this).remove();
                });
                e.preventDefault();
            });
            // Mensaje del alerta
            var msj = $('<div />').addClass('contAlerta').html(settings['msj']);
            // Armamos el rompecabezas en la ventana
            var ven = $('<div />').addClass(settings['class']+' ui-widget-content').prepend(tit, msj, btn);
            $('body').prepend(ven);
            // Centramos la alerta en la ventana
            centrar(ven);
            // Hacemos que la ventana aparezca
            ven.slideDown(settings['vel'], function () {
                btn.focus();
                // Se centra otra vez por si varió el tamaño
                centrar(ven);
                $(window).resize(function() {
                    centrar(ven);
                });
                // Si está disponible JQuery UI Draggable se podrá mover
                if ($.isFunction( $.fn.draggable )) {
                    ven.draggable({handle:'.titAlerta', scroll:false, revert: settings['fijo']});
                    $('.titAlerta', ven).css({cursor:'move'}).disableSelection();
                }
            });
            return ven;
        },
        pregunta : function(options) {
            if (typeof options !== 'object') options = {msj: String(options)};
            var settings = $.extend( {
                msj : ' ',
                tit : 'Confirmación',
                'class' : 'alerta',
                vel : 'fast',
                btnS: 'Sí',
                btnN: 'No',
                fijo: true,
                funcS: function () {},
                funcN: function () {}
            }, options);
            // Capa para bloquear otros elementos de la página
            var div = bloqueador();
            $('body').prepend(div);
            // Cuadro de título de la pregunta
            var tit = $('<div />').addClass('titAlerta ui-widget-header').html('<span class="ui-icon ui-icon-help" style="float: left; margin-right: .3em;"></span>'+settings['tit']);
            // Botón para responde "sí"
            var btS = $('<button />').addClass('cerrarMsjAlerta btn1').html(settings['btnS']).click(function (e) {
                settings['funcS']();
                $(this).parent().slideUp(settings['vel'], function () {
                    div.remove();
                    $(this).remove();
                });
                e.preventDefault();
            });
            var btN = $('<button />').addClass('cerrarMsjAlerta btn2').html(settings['btnN']).click(function (e) {
                settings['funcN']();
                $(this).parent().slideUp(settings['vel'], function () {
                    div.remove();
                    $(this).remove();
                });
                e.preventDefault();
            });
            // Texto de la pregunta
            var msj = $('<div />').addClass('contAlerta').html(settings['msj']);
            // Armamos el rompecabezas en la ventana
            var ven = $('<div />').addClass(settings['class']+' ui-widget-content').prepend(tit, msj, btS, btN);
            $('body').prepend(ven);
            // Centramos la alerta en la ventana
            centrar(ven);
            // Hacemos que la ventana aparezca
            ven.slideDown(settings['vel'], function () {
                btN.focus();
                $(window).resize(function() {
                    centrar(ven);
                });
                // Si está disponible JQuery UI Draggable se podrá mover
                if ($.isFunction( $.fn.draggable )) {
                    ven.draggable({handle:'.titAlerta', scroll:false, revert: settings['fijo']});
                    $('.titAlerta', ven).css({cursor:'move'}).disableSelection();
                }
            });
            return ven;
        },
        memoria : function(llave, valor, expira) {
            if (typeof llave === 'string' && llave !== '') {
                if (window.localStorage && expira === undefined) {
                    // Usamos memoria local
                    if (valor === null) {
                        window.localStorage.removeItem(llave);
                        return true;
                    }
                    if (valor === undefined)
                        return window.localStorage.getItem(llave);
                    if (valor !== null && valor !== undefined)
                        window.localStorage.setItem(llave, valor);
                } else {
                    // Usamos cookies
                    if (valor) {
                        var fecha = new Date();
                        expira = !isNaN(expira) ? expira : 365;
                        fecha.setTime(fecha.getTime()+(expira*24*60*60*1000));
                        expira = '; expires='+fecha.toGMTString();
                        document.cookie = llave+"="+valor+expira+"; path=/";
                    } else {
                        if (valor === null) {
                            // Se borra
                            return $.liga('guardar',llave, ' ', -1);
                        }
                        llave = llave+'=';
                        var ck = document.cookie.split(';');
                        for(var i=0;i < ck.length;i++) {
                            var c = ck[i];
                            while(c.charAt(0)==' ') c = c.substring(1,c.length);
                            if(c.indexOf(llave) == 0) return c.substring(llave.length,c.length);
                        }
                        // No la encontró
                        return null;
                    }
                }
                return valor;
            }
            return false;
        },
        notificacion :  function(options) {
            if (typeof options !== 'object') options = {msj: String(options)};
            var settings = $.extend( {
                msj : ' ',
                tit : 'Notificación',
                img : 'http://4.bp.blogspot.com/-6hx-qdNb8XU/T4nW4Q-Qf4I/AAAAAAAAAWs/IY0z6IPpbyQ/s200/LIGA.PNG',
                seg : 10,
                alt : 'body',
                func: function () {},
                funClic: function () {}
            }, options);
            // Si las notificaciones no están disponibles se muestran alertas
            if(!window.webkitNotifications) {
                settings['msj'] = '<img src="'+settings['img']+'" width="35" height="35" style="float: left;" /> '+settings['msj'];
                return $(settings['alt']).liga('mensaje', settings);
            }
            var per = window.webkitNotifications.checkPermission();
            if (per == 2) {
                settings['msj'] = '<img src="'+settings['img']+'" width="35" height="35" style="float: left;" /> '+settings['msj'];
                return $(settings['alt']).liga('mensaje', settings);
            }
            // Solicita el permiso y lanza la primera notificación
            if(per > 0) {
                window.webkitNotifications.requestPermission(function() {
                    return $.liga('notificacion', settings);
                });
            } else {
                var notif = window.webkitNotifications.createNotification(settings['img'], settings['tit'], settings['msj']);
                notif.onclose = settings['func'];
                notif.onclick = settings['funClic'];
                /*notif.onerror = function() {
                    $(settings['alt']).liga('mensaje', settings);
                }*/
                notif.show();
                if(settings['seg']) {
                    setTimeout(function() {
                        notif.cancel();
                    }, settings['seg']*1000);
                }
            }
            return notif;
        },
        mensaje : function(options) {
            if (typeof options !== 'object') options = {msj: String(options)};
            var settings = $.extend( {
                msj : ' ',
                tit : 'Mensaje',
                'class' : 'msj1 ui-state-highlight',
                vel : 'fast',
                seg : 10,
                btn : '&nbsp;X&nbsp;',
                conservar: true,
                func: function () {}
            }, options);
            return this.each(function() {
                // Botón de cerrar
                var btn = '';
                if (settings['btn']) {
                    btn = $('<button />').addClass('cerrarMsj').html(settings['btn']).click(function(e) {
                        $(this).parent().slideUp(settings['vel'], function() {
                            settings['func']();
                            $(this).remove();
                        });
                        e.preventDefault();
                    }).attr('title', 'Cerrar mensaje');
                }
                // Contenedor del mensaje
                var cont = $('<div />').addClass(settings['class']+' ui-widget-content')
                                       .attr('title', settings['tit']).css({display:'none'})
                                       .append(btn, settings['msj']);
                // Si es body colocarlo en un DIV flotante (crearlo si no existe)
                if($(this).context.tagName === 'BODY') {
                    var div = $('#LIGADIVFLOTANTE'); 
                    if (div.length == 0) {
                     div = $('<div />').attr('id', 'LIGADIVFLOTANTE').css({width:'400px',position:'fixed','left':'50%'});
                     $('body').prepend(div.css({position:'fixed','margin-left':'-200px'}));
                    }
                    div.prepend(cont);
                } else {
                    $(this).prepend(cont);
                }
                cont.fadeIn(settings['vel'], function() {
                    if (settings['btn']) {
                        btn.focus();
                    }
                    if (settings['seg']) {
                        var obj = $(this);
                        var idt = setTimeout(function() {
                            obj.fadeOut(settings['vel'], function() {
                                settings['func']();
                                $(this).remove();
                            });
                        }, settings['seg']*1000);
                        if (settings['conservar']) {
                            // Si el ratón pasa por arriba no desaparecerá hasta que oprima cerrar
                            obj.mousemove(function() {
                                clearTimeout(idt);
                            });
                        }
                    }
                });
            });
        },
        AJAX : function(options) {
            var settings = $.extend( {
                url : '',
                reg : {},
                fil : {},
                seg : 10,
                func: function (resp) {
                    settings['mensajes'](resp);
                },
                error:function (msj, input, form, quitar) {
                    $('.error', input.parent()).remove();
                    if (!quitar) {
                        var span= $('<span />').addClass('error ui-widget-content ui-state-error')
                         .css({display:'none'})
                         .html('<span class="ui-icon ui-icon-alert" style="float: left; margin-right: .3em;"></span>'+msj);
                        input.parent().append(span.fadeIn('medium'));
                        input.one('change', function() {
                            var nom = input.attr('name');
                            if (settings['reg'][nom]['requerido'] || input.val() !=='' || settings['reg'][nom]['numin']) {
                                if(validar(input, settings['reg'][nom], form) === true) {
                                    settings['error'](msj, input, form, true);
                                } else {
                                    settings['error'](msj, input, form, false);
                                }
                            } else {
                                settings['error'](msj, input, form, true);
                            }
                        });
                    }
                },
                reset:function(forma, e) {
                    $('.error', forma).fadeOut('fast', function() {
                        $(this).remove();
                    });
                },
                mensajes:function (conf) {
                    $('body').liga('mensaje', conf);
                }
            }, options);
            return this.each(function() {
                var forma = $(this);
                var formh = this;
                settings['url'] = (forma.attr('action')) ? forma.attr('action') : settings['url'];
                forma.submit(function(e) {
                    // Dejamos que reset borre los errores si hay
                    forma.bind('reset', function(e) {
                        settings['reset'](forma, e);
                    });
                    // Recorremos los campos para validar con las reglas
                    var campos  = forma.serializeArray();
                    var validos = true;
                    var form = {};
                    for (var i in campos) {
                        var campo = campos[i]['name'];
                        var valor = campos[i]['value'];
                        var input = $('[name='+campo+']', forma);
                        input.unbind('change');
                        // Si tiene regla lo valida
                        if (settings['reg'][campo]) {
                            var regla = settings['reg'][campo];
                            var msj = (regla['msj']) ? regla['msj'] : 'El campo '+campo+' no es válido';
                            if (regla['requerido']) {
                                if (valor !== '') {
                                    if (!validar(input, regla, forma)) {
                                        settings['error'](msj, input, forma);
                                        validos = false;
                                    }
                                } else {
                                    settings['error'](msj, input, forma);
                                    validos = false;
                                }
                            } else {
                                if (valor !== '') {
                                    if (!validar(input, regla, forma)) {
                                        settings['error'](msj, input, forma);
                                        validos = false;
                                    }
                                }
                            }
                        }
                        // Si tiene filtro lo aplica
                        if (settings['fil'][campo]) {
                         form[campo] = valor;
                         formh[campo].value = settings['fil'][campo](valor); 
                        }
                    }
                    // Recorremos los campos de tipo archivo
                    var archivos = false;
                    var campos = $(':file', forma);
                    var conAPI = true;
                    if (window.FormData) {
                      campos.each(function() {
                       var campo = this;
                       $(campo).unbind('change');
                       // Si tiene regla lo valida
                       if (settings['reg'][campo.name]) {
                        var regla = settings['reg'][campo.name];
                        var msj   = (regla['msj']) ? regla['msj'] : 'Archivo(s) inválido(s) en el campo '+campo.name;
                        var files = this.files;
                        if (files.length > 0) {
                         archivos = true;
                         if (!validar($(campo), regla, forma)) {
                          settings['error'](msj, $(campo), forma);
                          validos = false;
                         }
                        } else {
                         if (regla['numin'] && files.length < regla['numin']) {
                           settings['error'](msj, $(campo), forma);
                           validos = false;
                          }
                        }
                       }
                      });
                    } else if(campos.size() > 0) {
                     conAPI = false;
                    }
                    if (validos) {
                        $('.error', forma).remove();
                        // Registro el envío en una cola para este formulario
                        var datos = forma.serialize();
                        if (! forma.data(datos)) {
                            settings['mensajes']({msj:'<span class="ui-icon ui-icon-info" style="float: left; margin-right: .3em;"></span> Enviando información al servidor', seg: 2, conservar:false});
                            forma.data(datos, true);
                            if (conAPI) {
                              // Realizo la petición asíncrona
                              var metodo = (forma.attr('method').toUpperCase() == 'POST') ? 'POST' : 'GET';
                              var formD;
                              var config = {
                               url    : settings['url'],
                               timeout: settings['seg']*1000,
                               type   : metodo
                              };
                              if (archivos && window.FormData) {
                               formD = new FormData(formh);
                               settings['mensajes']({msj:'<span class="ui-icon ui-icon-info" style="float: left; margin-right: .3em;"></span> Subiendo <progress id="LIGAprogress"><em id="progreso"></em></progress>', seg:5, conservar:true});
                               config['contentType'] = false;
                               config['processData'] = false;
                               config['cache'] = false;
                               config['xhr'] = function() {
                                // Barra de progreso
                                var xhr = $.ajaxSettings.xhr();
                                if(xhr.upload){
                                 var barra = $('progress#LIGAprogress');
                                 var prog = $('#progreso');
                                 xhr.upload.addEventListener('progress', function(e) {
                                  if(e.lengthComputable) {
                                   barra.attr({value:e.loaded, max:e.total});
                                   prog.text(e.loaded+' de '+e.total);
                                   if (e.loaded >= e.total) {
                                    barra.parent().fadeOut(function() {
                                     $(this).remove();
                                    });
                                   }
                                  }
                                 }, false);
                                }
                                return xhr;
                               };
                              } else {
                               formD = $(formh).serialize();
                              }
                              config['data'] = formD;
                              $.ajax(config).always(function(resp) {
                                // Se remueve de la cola de peticiones
                                forma.removeData(datos);
                               }).done(function(resp) {
                                // Respuesta satisfactoria
                                settings['func'](resp);
                               }).fail(function(resp, err, error) {
                                var msjs = {
                                 'Not Found' : 'Recurso no encontrado en el servidor',
                                 'timeout'   : 'Se superó el tiempo de espera'
                                };
                                var msj = (msjs[error]) ? msjs[error] : 'Error en el servidor';
                                settings['func']({msj:'<span class="ui-icon ui-icon-alert" style="float: left; margin-right: .3em;"></span>'+msj+', inténtelo de nuevo más tarde', seg:0, tit:err, 'class':'msj2 ui-state-error'});
                               });
                             } else {
                                // Técnica del iFrame oculto para IE9 y anteriores
                                var iframe = $('<iframe />').css({width:0, height:0, display:'none'}).attr('name', 'LIGAreceptor');
                                $('body').append(iframe);
                                forma.attr('target', 'LIGAreceptor').attr('enctype', 'multipart/form-data');
                                forma.unbind('submit');
                                forma.submit();
                                iframe.load(function() {
                                    var resp = iframe.contents();
                                    settings['func']($('body', resp).html());
                                    forma.removeData(datos);
                                    forma.liga('AJAX', settings);
                                });
                             }
                        } else {
                            settings['mensajes']({msj:'<span class="ui-icon ui-icon-alert" style="float: left; margin-right: .3em;"></span> Procesando la información, espere por favor', seg:2, conservar:false, 'class':'msj2 ui-state-error'});
                        }
                    }
                    // Se restauran los valores originales
                    for (var campo in settings['fil']) {
                     formh[campo].value = form[campo];
                    }
                    e.preventDefault();
                });
            });
        },
        historial:function(options) {
            if (typeof options !== 'object') return this;
            var recep = {};
            for (var id in options) {
                // Guardo la configuración en cada contenedor
                options[id]['actual'] = '';
                $('#'+id).data('historialLIGA', options[id]);
                recep[id] = true;
            }
            // Guardo la lista de los contenedores válidos
            $('body').data('historialLIGA', recep);
            // Se procesa el hash por primera vez
            procesarHash();
            // Por el momento sólo en navegadores modernos
            window.onhashchange = procesarHash;
            return this;
        },
        cargar : function(options) {
            if (typeof options !== 'string') return this;
            // Hash de la URL
            var delHash = obj2Hash();
            // Hash que se quiere agregar
            var carHash = obj2Hash(options);
            var hash    = '';
            // Agregamos lo que ya estaba en el hash
            for (var id in delHash) {
                if (!carHash[id] || (carHash[id] == delHash[id])) {
                    hash += (hash == '') ? id+'/'+delHash[id] : '//'+id+'/'+delHash[id];
                }
            }
            // Agregamos lo que está por cargarse
            for (var id in carHash) {
                if (carHash[id] != delHash[id]) {
                    // Codificamos las variables como URI
                    hash += (hash == '') ? id+'/'+carHash[id] : '//'+id+'/'+carHash[id];
                }
            }
            // Cambiamos el hash
            parent.location.href = '#'+hash;
            return this;
        },
        actualizar : function(options) {
            if (typeof options !== 'string') return this;
            var id = (options.indexOf('/') > -1) ? options.substring(0, options.indexOf('/')) : options;
            var hs = (options.indexOf('/') > -1) ? options.substring(options.indexOf('/')+1) : false;
            var ob = $('#'+id);
            var hi = ob.data('historialLIGA');
            if (hi) {
                // Remuevo la cache
                if (hs) {
                    // Sólo del hash
                    ob.removeData(hs);
                } else {
                    // Toda la cache
                    ob.removeData();
                    ob.data('historialLIGA', hi);
                }
            }
            return this;
        }
    };
    // Llamar métodos desde el objeto JQuery
    $.liga = function(method) {
        if ( methods[method] ) {
            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.alerta.apply( this, arguments );
        } else {
            $.error( 'Función ' +  method + ' no existe en $.liga' );
            return this;
        }
    };
    // Llamar métodos desde un elemento de la página
    $.fn.liga = function(method) {
        if ( methods[method] ) {
            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.mensaje.apply( this, arguments );
        } else {
            $.error( 'Función ' +  method + ' no existe en $("selector").liga' );
            return this;
        }
    };
})(jQuery);
