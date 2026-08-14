# Formulario de Prueba: Inauguración OTCA

## 1. Evento de prueba

Nombre del evento:

**Inauguración: Comunidad de Práctica en Manejo Forestal Comunitario Amazónico, en el marco de la OTCA**

Este será el primer evento de prueba del sistema **Asistencia**.

Condiciones iniciales:

- El evento tendrá 5 módulos.
- El evento tendrá 14 fechas o sesiones.
- Las fechas y horas reales fueron extraídas del archivo `SESIONES_EVENTO.xlsx`.
- Cada sesión iniciará con estado `closed`, según el cronograma fuente.
- Cada sesión iniciará con asistencia `closed`.
- La apertura y cierre de asistencia se controlará de forma independiente por sesión.

Archivo semilla:

- `seeds/primer-evento-inauguracion-otca.json`

Cronograma documentado:

- `docs/cronograma-prueba-inauguracion-otca.md`

## 2. Fuente de datos

La estructura del formulario y los catálogos iniciales fueron extraídos del archivo:

`C:\Users\USUARIO\Downloads\FormularioAsistencia.xlsx`

El libro contiene:

- Hoja `formulario`.
- 13 hojas de catálogos.
- 4 secciones de formulario.
- 28 campos de formulario.

## 3. Secciones del formulario

El formulario de asistencia se divide en 4 secciones:

- Datos generales.
- Ubicación.
- Actividad.
- Organización.

Estas secciones deben mantenerse como agrupadores visuales y funcionales en el formulario público y en la configuración administrativa del formulario.

## 4. Campos del formulario

| N.º | Sección | Campo | Tipo UI | Catálogo |
| --- | --- | --- | --- | --- |
| 1 | Datos generales | Tipo Doc.Identidad | Select | `tipodocumento` |
| 2 | Datos generales | Número Documento | Textbox |  |
| 3 | Datos generales | Nombres | Textbox |  |
| 4 | Datos generales | Paterno | Textbox |  |
| 5 | Datos generales | Materno | Textbox |  |
| 6 | Datos generales | Sexo | Select | `sexo` |
| 7 | Datos generales | Fecha Nac | Selector de fecha |  |
| 8 | Datos generales | Correo Electrónico | Textbox |  |
| 9 | Datos generales | Celular | Textbox |  |
| 10 | Datos generales | Tipo Participante | Select | `tipoparticipante` |
| 11 | Datos generales | Etnia | Select | `etnia` |
| 12 | Ubicación | País | Select | `pais` |
| 13 | Ubicación | Departamento | Select | `departamento` |
| 14 | Ubicación | Provincia | Select | `provincia` |
| 15 | Ubicación | Distrito | Select | `distrito` |
| 16 | Ubicación | Dirección | Textbox |  |
| 17 | Actividad | Actividad del Productor | Select | `actividadproductor` |
| 18 | Actividad | Producto Agrario | Select | `prodagrario` |
| 19 | Actividad | Productos Pecuario | Select | `prodpecuario` |
| 20 | Actividad | Productos Forestales | Select | `prodforestal` |
| 21 | Organización | Pertenece a Organización | Radio button |  |
| 22 | Organización | Tipo de Organización | Select | `tipoorganizacion` |
| 23 | Organización | RUC | Textbox |  |
| 24 | Organización | Organización | Textbox |  |
| 25 | Organización | País | Select | `pais` |
| 26 | Organización | Departamento | Select | `departamento` |
| 27 | Organización | Provincia | Select | `provincia` |
| 28 | Organización | Distrito | Select | `distrito` |

## 5. Claves internas sugeridas

Para evitar colisiones entre campos repetidos, las claves internas deben incluir la sección.

Ejemplos:

- `ubicacion_pais`
- `ubicacion_departamento`
- `organizacion_pais`
- `organizacion_departamento`

El seed del formulario ya usa esta convención.

## 6. Tipos de campo normalizados

Los tipos detectados en el Excel deben normalizarse así:

| Tipo en Excel | Tipo interno sugerido |
| --- | --- |
| Textbox | `text` |
| Combo SELECT | `select` |
| Selector de Fecha | `date` |
| Radio Bottom (SI - NO) | `radio` |

Nota: el texto `Radio Bottom` se interpreta como `Radio button`.

## 7. Catálogos extraídos

Los campos tipo `select` deben tomar sus opciones desde catálogos mantenibles.

Archivo semilla de catálogos:

- `seeds/catalogos-formulario-asistencia.json`

Resumen:

| Catálogo | Hoja origen | Registros activos |
| --- | --- | ---: |
| `tipodocumento` | `tipodocumento` | 4 |
| `sexo` | `sexo` | 3 |
| `tipoparticipante` | `tipoparticipante` | 13 |
| `etnia` | `etnia` | 4 |
| `pais` | `pais` | 217 |
| `departamento` | `departamento` | 25 |
| `provincia` | `provincia` | 196 |
| `distrito` | `distrito` | 1891 |
| `actividadproductor` | `actividadproductor` | 13 |
| `prodagrario` | `prodagrario` | 22 |
| `prodpecuario` | `prodpecuario` | 13 |
| `prodforestal` | `prodforestal` | 17 |
| `tipoorganizacion` | `tipoorganizacion` | 6 |

## 8. Mantenimiento de catálogos

La sección **Configuración > Catálogo** debe permitir administrar los valores de los catálogos.

Funcionalidad mínima:

- Ver catálogos disponibles.
- Ver elementos por catálogo.
- Agregar elementos.
- Actualizar nombre y descripción.
- Activar elementos.
- Desactivar elementos.
- Evitar eliminar físicamente elementos ya usados por formularios o registros.

Reglas:

- Los catálogos deben manejar estado activo/inactivo.
- Los formularios públicos solo deben mostrar elementos activos.
- Los reportes deben conservar el valor histórico aunque un elemento del catálogo sea desactivado posteriormente.
- Para catálogos jerárquicos, el sistema debe respetar la dependencia entre país, departamento, provincia y distrito.

## 9. Catálogos jerárquicos de ubicación

Los catálogos de ubicación vienen relacionados:

- `departamento` depende de `pais`.
- `provincia` depende de `departamento`.
- `distrito` depende de `provincia`.

En el formulario público, estos campos deben comportarse como selects dependientes:

1. Al seleccionar país, se filtran departamentos.
2. Al seleccionar departamento, se filtran provincias.
3. Al seleccionar provincia, se filtran distritos.

Esta lógica aplica tanto para la sección **Ubicación** como para la sección **Organización**.

## 10. Reglas iniciales del formulario

- Todos los campos extraídos del Excel se consideran obligatorios inicialmente, hasta que se defina una matriz final de obligatoriedad.
- El participante se identifica por tipo y número de documento.
- Si el participante ya existe, el formulario debe precargar o reutilizar sus datos generales.
- Si el participante no existe, debe completar los datos generales y luego registrar asistencia.
- El registro de asistencia solo se permite si la sesión está abierta.
- El mismo participante no puede registrar doble asistencia en la misma sesión.
- El campo `Pertenece a Organización` debe aceptar `SI` o `NO`.
- Si el participante responde `NO`, se debe evaluar si los campos de organización pasan a ser opcionales. Esta regla queda pendiente de confirmación.

## 11. Título dinámico de bienvenida

El formulario debe mostrar un título dinámico combinando evento y sesión.

Plantilla sugerida:

`Bienvenido a {{event.title}} - {{session.title}}: {{session.theme}}`

Ejemplo:

`Bienvenido a Inauguración: Comunidad de Práctica en Manejo Forestal Comunitario Amazónico, en el marco de la OTCA - Sesión 1: Institucionalidad, gobernanza y marco legal del sector forestal y de fauna silvestre I (3 países)`

## 12. Enlace corto y QR

Para el evento de prueba se propone el slug inicial:

`inauguracion-otca`

El enlace corto final dependerá del dominio de despliegue en Cloudflare.

Reglas:

- El enlace corto debe apuntar al formulario público del evento.
- El QR debe apuntar al enlace corto.
- El acceso público no debe requerir login.
- El formulario debe validar en backend que la sesión esté abierta antes de registrar asistencia.

## 13. Pendientes para completar el evento

Antes de publicar el formulario se requiere definir:

- Campos obligatorios definitivos.
- Comportamiento de campos de organización cuando `Pertenece a Organización` sea `NO`.
- Usuario administrador o supervisor propietario del evento de prueba.
