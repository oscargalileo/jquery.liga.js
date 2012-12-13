jquery.liga.js
==============

El proyecto LIGA presenta jquery.liga.js, que no sólo es un plugin para JQuery, es toda una suite de funcionalidades que facilitan el desarrollo de aplicaciones web, mediante la implementación de:

  * Mensajes emergentes animados,
  * Ventanas de alerta personalizables,
  * Ventanas de confirmación (preguntas),
  * Almacenamiento local de datos (localStorage y cookies),
  * Notificaciones de escritorio (Webkit),
  * Validación local de formularios y envío AJAX,
  * Gestión del historial AJAX,
  * Seguimiento de formularios y reproducción de sonidos (próximamente),
  * Tablas editables (próximamente).

Entre sus principales características destaca su compatibilidad con los estilos de JQuery UI, basta con cargar alguno de sus temas para disfrutar de esta característica.

La biblioteca es compatible con los navegadores web más modernos y JQuery 1.8 o superior, cualquier problema encontrado puede contactarnos mediante comentarios al presente documento o escribiendo en el Blog oficial:
http://unhiloenlared.blogspot.mx/

Su uso por defecto es muy fácil, además permite configurar todos los elementos rápidamente, manual: http://goo.gl/Gxwp1

Resumen de la API:

$('selector').liga('mensaje', config);
$.liga('alerta', config);
$.liga('pregunta', config);
$.liga('memoria', llave, valor[, expira]);
$.liga('notificacion', config);
$('form').liga('AJAX', config);

Gestión del historial AJAX
$.liga('historial', contenedores);
$.liga('cargar', 'id_del_contenedor/otro_pametro=su valor');
$.liga('actualizar', 'id_del_contenedor[/parametros]');
