/*
 *  Project: LIGA.js
 *  Description: Plugin que integra una serie de funciones y métodos para facilitar la programación de aplicaciones web.
 *  Author: Ing. Oscar Galileo García García
 *  License: BSD-3
 */
;(function ($, window, document, undefined) {
    var pluginName = "LIGA";

    // Constructor
    function Plugin(method, element, options) {
        this.method  = method;
        this.element = element;
        this.options = options;
        this._name   = pluginName;
        if (this[method]) {
            return this[method](this.element, this.options);
        }
    }

    Plugin.prototype = {
        alerta: function(el, options) {
            if (typeof options !== 'object' && typeof options !== 'undefined') options = {msj: String(options)};
            var defaults = {
                //msj : "¡Hola mundo con LIGA.js!"
            };
            options = $.extend( {}, defaults, options );
            alert(options.msj);
            // Sólo disponible cuando se usa $.liga('alerta', ...);
            return 'otra cosa...';
        }
    };

    $[pluginName] = function (method , options) {
        var t = document.body;
        if (!$.data(t, pluginName)) {
            $.data(t, pluginName, new Plugin( undefined, $, options ));
        }
        return $.data(t, pluginName)[method]( $, options );
    };

    $.fn[pluginName] = function (method , options) {
        return this.each(function () {
            if (!$.data(this, pluginName)) {
                $.data(this, pluginName, new Plugin(method, this, options));
            } else {
                $.data(this, pluginName)[method](this, options);
            }
        });
    };

})(jQuery, window, document);