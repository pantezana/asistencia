# Ruletas interactivas

Una dinámica pertenece a un evento y, opcionalmente, a una sesión. Tiene un título general, nombre de navegador, enlace corto de participantes, pregunta, traducciones o instrucciones por idioma y una o más ruletas independientes.

## Configuración

- Cada ruleta tiene título, duración de giro entre 3 y 60 segundos y entre 2 y 24 opciones. Se pueden configurar hasta 100 ruletas en una dinámica.
- La pizarra asociada reutiliza el límite de caracteres por nota (20 a 5000), la opción de múltiples respuestas y el máximo de respuestas por participante. Si no se ingresa una traducción, se muestra la pregunta principal como instrucción en español.
- Se crean dos enlaces: `/r/:slug` para participantes y `/r/p/:slug` para quien dirige. El segundo enlace incluye un identificador no adivinable y permite iniciar los giros. Debe compartirse solo con la persona encargada de la dinámica.
- Los estados de la dinámica son abierta, cerrada y archivada. Cerrar impide nuevos giros y respuestas. Archivar también oculta los enlaces públicos.

## Giro y sincronización

- El servidor elige una opción mediante un generador aleatorio criptográfico, guarda el valor, el índice, los ángulos y las horas de inicio y fin. El navegador anima el disco con desaceleración bajo una flecha fija durante el tiempo configurado.
- Ambos enlaces consultan el mismo estado cada segundo. Si alguien entra durante el giro, ve el movimiento en curso. Al finalizar se destaca el valor seleccionado. Recargar conserva la posición y el resultado.
- Un giro nuevo reemplaza la selección anterior de esa ruleta. Mientras gira, no se permite iniciar otro giro de la misma ruleta ni editar la configuración de la dinámica. Cambiar las opciones de una ruleta terminada reinicia su selección.

## Navegación y respuestas

- El enlace del participante abre la pizarra para destacar la pregunta y las respuestas. El enlace del administrador abre las ruletas para dirigir los giros. Se muestran hasta cuatro ruletas por página, en dos filas de dos en escritorio; la paginación permite navegar por las demás.
- En la pizarra aparecen la pregunta, las etiquetas de idioma, los resultados seleccionados y las notas con bandera. Se muestran hasta 24 notas por página, en cuatro filas de seis en escritorio. «Ver Ruletas» permite consultar los giros y desde allí volver a la pregunta y las respuestas.
- «Registrar respuesta» abre el formulario de nombre, apellido, país y nota. «Regresar a pizarra de respuestas» vuelve a las notas.
- Las notas permanecen en la pizarra si una ruleta vuelve a girar; el resultado visible siempre refleja la última selección de cada ruleta.
