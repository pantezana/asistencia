# Especificacion del editor dinamico de modelos de formulario

## 1. Objetivo

Permitir que un administrador gestione realmente la estructura de los modelos de formulario despues de clonarlos o crearlos.

El usuario debe poder:

- Crear, editar, activar, archivar y clonar modelos.
- Incorporar o excluir secciones dentro de un modelo.
- Incorporar o excluir controles dentro de una seccion.
- Definir la posicion exacta de una seccion o control.
- Reutilizar preguntas existentes desde una paleta central.
- Evitar duplicados reales dentro del mismo modelo, permitiendo reutilizar el mismo control global cuando represente preguntas distintas.
- Mantener trazabilidad cuando un modelo ya fue usado en asistencias.

Esta funcionalidad convierte a los modelos en una mascara dinamica y reutilizable, separada del evento y de la publicacion publica.

## 2. Conceptos

### 2.1 Modelo de formulario

Estructura reutilizable que contiene secciones, controles, orden, reglas y catalogos asociados.

Ejemplos:

- `Formulario de asistencia - Inauguracion OTCA`
- `Formulario de asistencia - Simplificado`
- `Formulario de asistencia - Plantilla FDC_Rango_Edad`

Un modelo puede estar asociado a cero, uno o muchos eventos.

### 2.2 Seccion de formulario

Agrupador logico y visual de controles.

Ejemplos:

- `Documento`
- `Datos generales`
- `Ubicacion`
- `Actividad`
- `Organizacion`

Cada seccion debe tener:

- Identificador interno estable.
- Nombre visible.
- Descripcion opcional.
- Orden.
- Estado dentro del modelo: incluido o excluido.

### 2.3 Elemento o control

Pregunta reutilizable disponible para incorporarse a modelos.

Ejemplos:

- `Numero de documento`
- `Nombres`
- `Correo Electronico`
- `Tipo Participante`
- `Entidad`
- `Rango de edad`

Cada control debe tener:

- Identificador interno estable.
- Etiqueta visible.
- Tipo de control.
- Catalogo asociado, si aplica.
- Reglas de validacion.
- Reglas de obligatoriedad.
- Configuracion adicional.
- Estado: activo, inactivo o archivado.

### 2.4 Instancia de control en un modelo

Uso concreto de un control global dentro de un modelo.

Un mismo control global puede aparecer mas de una vez en un modelo si cada aparicion representa una pregunta distinta para el usuario.

Ejemplos validos:

- Control global `fecha` usado como `Fecha de Nacimiento`.
- Control global `fecha` usado como `Fecha de Inscripcion`.
- Control global `fecha` usado como `Fecha de Entrega`.
- Control global `departamento` usado como `Departamento de residencia`.
- Control global `departamento` usado como `Departamento del lugar de trabajo`.

Cada instancia debe tener:

- Identificador propio: `field_instance_id`.
- Referencia al control global: `control_id`.
- Etiqueta visible propia.
- Clave de respuesta propia: `field_key`.
- Seccion donde se ubica.
- Orden.
- Reglas propias de obligatoriedad y visibilidad.

### 2.5 Paleta de controles

Biblioteca central de preguntas disponibles para construir modelos.

La paleta no registra respuestas ni asistencia. Solo define controles reutilizables.

Un modelo usa referencias o copias versionadas de estos controles, segun la regla de versionado definida.

## 3. Tipos de controles soportados

Inicialmente deben soportarse:

- `text`: caja de texto.
- `number`: caja numerica.
- `date`: selector de fecha.
- `select`: lista desplegable con catalogo.
- `radio`: opciones excluyentes.
- `search-select`: selector con busqueda para catalogos grandes.
- `computed` o `readonly`: campo calculado o informativo, si se requiere mas adelante.

Reglas:

- Todo control tipo `select`, `radio` o `search-select` debe poder apuntar a un catalogo.
- Los catalogos grandes deben renderizarse con busqueda.
- Los catalogos jerarquicos, como departamento-provincia-distrito, deben conservar sus dependencias.

## 4. Gestion de la paleta de controles

Debe existir una seccion administrativa para gestionar la paleta.

Funciones:

- Listar controles disponibles.
- Crear nuevo control.
- Editar etiqueta, descripcion, tipo, catalogo y validaciones.
- Activar, inactivar o archivar controles.
- Consultar en que modelos esta usado un control.

Reglas:

- No se debe eliminar fisicamente un control usado por modelos o asistencias.
- Un control inactivo no debe poder agregarse a nuevos modelos.
- Un control archivado se conserva solo para trazabilidad historica.
- Si se modifica un control usado por modelos activos, el sistema debe crear una nueva version o pedir confirmacion de alcance.

## 5. Gestion de secciones

Debe existir una paleta o mantenedor de secciones reutilizables.

Funciones:

- Crear nueva seccion.
- Editar nombre visible y descripcion.
- Activar, inactivar o archivar secciones.
- Incorporar una seccion a un modelo.
- Excluir una seccion de un modelo.
- Reordenar secciones dentro del modelo.

Reglas:

- No debe permitirse incorporar dos veces la misma seccion en el mismo modelo.
- No debe permitirse excluir una seccion si contiene controles obligatorios activos sin confirmar el impacto.
- Al excluir una seccion se excluyen sus controles del modelo, pero no se eliminan de la paleta.
- Si una seccion fue usada para capturar asistencia historica, debe conservarse en los reportes historicos mediante versionado o snapshot.

## 6. Edicion de contenido de un modelo

La pantalla de edicion de modelo debe permitir trabajar en dos zonas:

- Estructura actual del modelo.
- Paleta de secciones y controles disponibles.

Funciones minimas:

- Agregar seccion.
- Quitar seccion.
- Agregar control a una seccion.
- Definir la etiqueta visible de la instancia al agregar un control.
- Quitar control de una seccion.
- Cambiar orden de secciones.
- Cambiar orden de controles dentro de una seccion.
- Editar propiedades del control dentro del modelo.
- Guardar cambios como borrador.
- Publicar o activar version del modelo.

## 7. Regla de posicion

Al incorporar una seccion o control, el usuario debe poder definir su ubicacion.

Opciones recomendadas:

- Al inicio.
- Al final.
- Antes de una seccion/control existente.
- Despues de una seccion/control existente.

Regla tecnica:

- El sistema debe manejar `order_index` decimal o recalculable para evitar errores al insertar entre elementos.
- Al guardar, el sistema puede normalizar los indices a numeros enteros consecutivos.

Ejemplo:

Agregar el control `Rango de edad`:

- Seccion destino: `Datos generales`.
- Posicion: despues de `Fecha de Nacimiento`.

Resultado:

1. Nombres.
2. Apellido Paterno.
3. Apellido Materno.
4. Sexo.
5. Fecha de Nacimiento.
6. Rango de edad.
7. Correo Electronico.

## 8. Regla anti duplicados

Dentro de un mismo modelo:

- Si se agrega el mismo control global con la misma etiqueta visible normalizada, se considera duplicado y no debe permitirse.
- Si se agrega el mismo control global con una etiqueta visible distinta, se considera una nueva pregunta y debe permitirse.
- Si se agrega una seccion global con el mismo titulo visible normalizado, se considera duplicado y no debe permitirse.
- Si se agrega una seccion global con un titulo visible distinto, se considera una nueva instancia de seccion y puede permitirse.
- La validacion debe revisar la combinacion `control_id + etiqueta_visible_normalizada` para controles.
- La validacion debe revisar la combinacion `section_id + titulo_visible_normalizado` para secciones.
- La comparacion debe ignorar mayusculas, espacios repetidos y acentos cuando se use para detectar duplicados operativos.

Mensaje sugerido:

`Este control ya existe en el modelo con la misma etiqueta. Si representa otra pregunta, cambie la etiqueta visible antes de agregarlo.`

Ejemplos:

- No permitido: control global `departamento` + etiqueta `Departamento`, agregado dos veces.
- Permitido: control global `departamento` + etiqueta `Departamento de residencia`.
- Permitido: control global `departamento` + etiqueta `Departamento del lugar de trabajo`.
- No permitido: control global `fecha` + etiqueta `Fecha`, agregado dos veces.
- Permitido: control global `fecha` + etiqueta `Fecha de Nacimiento`.
- Permitido: control global `fecha` + etiqueta `Fecha de Inscripcion`.
- Permitido: control global `fecha` + etiqueta `Fecha de Entrega`.

Regla para reportes:

- Cuando haya varias instancias del mismo control global, los reportes deben usar la etiqueta visible de la instancia.
- Si dos etiquetas pudieran generar columnas ambiguas, el reporte debe prefijar la seccion: `Ubicacion - Departamento de residencia`.

## 9. Propiedades editables del control dentro de un modelo

Un control puede tener una definicion global, pero cada instancia dentro de un modelo puede requerir ajustes.

Propiedades globales:

- Clave.
- Tipo base.
- Catalogo base.
- Validacion tecnica principal.

Propiedades configurables por modelo:

- Etiqueta visible.
- Clave interna de respuesta derivada de la etiqueta o definida manualmente.
- Texto de ayuda.
- Obligatoriedad.
- Visibilidad.
- Orden.
- Seccion donde aparece.
- Reglas condicionales.
- Placeholder.

Esto permite que un mismo control exista en la paleta, pero pueda convertirse en varias preguntas distintas dentro de un modelo sin romper otros modelos.

Regla de clave interna:

- Cada instancia debe tener un `field_key` unico dentro del modelo o version.
- El `field_key` no debe depender solo del `control_key` global.
- Si el usuario agrega varias fechas, deben generarse claves como `fecha_nacimiento`, `fecha_inscripcion` o `fecha_entrega`.
- Si el usuario agrega varias ubicaciones, deben generarse claves como `departamento_residencia` o `departamento_lugar_trabajo`.

## 10. Versionado y seguridad historica

La edicion de modelos debe proteger los datos ya capturados.

Reglas:

- Si un modelo no tiene asistencias registradas, se puede editar directamente.
- Si un modelo ya fue usado en asistencias, los cambios estructurales deben crear una nueva version.
- Las asistencias historicas deben conservar referencia a la version usada al momento del registro.
- Los reportes deben leer las respuestas segun la version del modelo con la que fueron capturadas.

Cambios estructurales:

- Agregar seccion.
- Quitar seccion.
- Agregar control.
- Quitar control.
- Cambiar tipo de control.
- Cambiar catalogo asociado.
- Cambiar reglas condicionales fuertes.

Cambios menores:

- Corregir etiqueta.
- Corregir texto de ayuda.
- Cambiar descripcion.

Los cambios menores pueden aplicarse a la version actual si no afectan interpretacion de datos.

## 11. Nuevo control requerido: Rango de edad

Debe incorporarse a la paleta de controles un nuevo control:

- Nombre visible: `Rango de edad`.
- Clave sugerida: `rango_edad`.
- Tipo: `select`.
- Catalogo asociado: `rangoedad`.
- Obligatorio por defecto: configurable; para el modelo `Formulario de asistencia - Plantilla FDC_Rango_Edad` debe ser obligatorio si el usuario asi lo define al incorporarlo.
- Ubicacion sugerida inicial: seccion `Datos generales`, despues de `Fecha de Nacimiento`.

Catalogo inicial `rangoedad`:

| Identificador | Denominacion |
| --- | --- |
| `menos_18` | `menos de 18 años` |
| `18_30` | `18 a 30 años` |
| `31_55` | `31 a 55 años` |
| `56_mas` | `56 años a más` |

Reglas:

- El valor almacenado debe ser el identificador.
- En el formulario publico debe mostrarse la denominacion.
- En reportes Excel debe mostrarse la denominacion, no el identificador.
- El catalogo debe quedar disponible para mantenimiento desde Configuracion > Catalogo.
- Las denominaciones visibles deben almacenarse y mostrarse en UTF-8 para evitar errores como `aÃ±os` o `mÃ¡s`.

## 12. Caso funcional: editar Plantilla FDC_Rango_Edad

Modelo:

`Formulario de asistencia - Plantilla FDC_Rango_Edad`

Necesidad:

- Quitar un control existente.
- Agregar el nuevo select `Rango de edad`.

Flujo esperado:

1. El administrador ingresa a `Formularios`.
2. Selecciona el modelo.
3. Abre el editor de estructura.
4. En la seccion correspondiente, selecciona el control a excluir.
5. El sistema pide confirmacion si el modelo esta asociado a eventos o usado en asistencias.
6. El administrador abre la paleta de controles.
7. Busca `Rango de edad`.
8. Selecciona seccion destino y posicion.
9. El sistema valida que no exista ya en el modelo la misma combinacion control global + etiqueta visible.
10. El administrador guarda como borrador o publica una nueva version.

Resultado esperado:

- El modelo queda con la estructura actualizada.
- Si el modelo estaba asociado a eventos, las nuevas asistencias usan la nueva version solo cuando se publique.
- El enlace y QR de los eventos asociados no cambian.

## 13. Reglas de UI recomendadas

La pantalla debe ser clara para usuarios no tecnicos.

Zonas:

- Encabezado del modelo: nombre, descripcion, estado, uso en eventos, version.
- Panel izquierdo: estructura actual por secciones.
- Panel derecho: paleta de secciones y controles.
- Panel de propiedades: edicion del elemento seleccionado.

Acciones:

- `Agregar seccion`.
- `Agregar control`.
- `Editar etiqueta de pregunta`.
- `Quitar del modelo`.
- `Mover arriba`.
- `Mover abajo`.
- `Insertar antes de`.
- `Insertar despues de`.
- `Guardar borrador`.
- `Publicar version`.

Alertas:

- Duplicado.
- Modelo usado por eventos.
- Modelo con asistencias historicas.
- Control con catalogo inactivo.
- Seccion vacia.

## 14. Modelo de datos recomendado

Tablas conceptuales:

- `form_templates`
- `form_template_versions`
- `form_sections`
- `form_controls`
- `form_template_version_sections`
- `form_template_version_fields`
- `catalogs`
- `catalog_items`

Responsabilidades:

- `form_sections`: paleta global de secciones.
- `form_controls`: paleta global de controles.
- `form_template_versions`: version publicada o borrador de un modelo.
- `form_template_version_sections`: secciones incluidas en una version.
- `form_template_version_fields`: controles incluidos en cada seccion y su configuracion local.

Reglas de unicidad recomendadas:

- `form_template_version_fields` debe impedir duplicados por `template_version_id + control_id + normalized_label`.
- `form_template_version_fields` debe exigir `field_key` unico por `template_version_id`.
- `form_template_version_sections` debe impedir duplicados por `template_version_id + section_id + normalized_title`.
- `form_template_version_sections` debe exigir una clave de instancia unica cuando una seccion global se use mas de una vez con titulos distintos.

Campos importantes para `form_controls`:

- `id`
- `control_key`
- `label`
- `field_type`
- `catalog_key`
- `default_required`
- `validation_rules`
- `default_config`
- `status`

Campos importantes para `form_template_version_fields`:

- `id`
- `template_version_id`
- `section_instance_id`
- `control_id`
- `field_key`
- `label_override`
- `normalized_label`
- `is_required`
- `order_index`
- `visibility_rules`
- `validation_rules_override`
- `config_override`
- `status`

## 15. APIs esperadas

Endpoints sugeridos:

- `GET /api/admin/form-controls`
- `POST /api/admin/form-controls`
- `PUT /api/admin/form-controls/:id`
- `GET /api/admin/form-sections`
- `POST /api/admin/form-sections`
- `PUT /api/admin/form-sections/:id`
- `GET /api/admin/form-templates/:id/structure`
- `POST /api/admin/form-templates/:id/sections`
- `DELETE /api/admin/form-templates/:id/sections/:sectionInstanceId`
- `POST /api/admin/form-templates/:id/fields`
- `DELETE /api/admin/form-templates/:id/fields/:fieldInstanceId`
- `PUT /api/admin/form-templates/:id/fields/:fieldInstanceId`
- `PUT /api/admin/form-templates/:id/reorder`
- `POST /api/admin/form-templates/:id/publish`

Regla importante:

Las operaciones del editor deben trabajar sobre una version borrador cuando el modelo ya tenga uso historico.

## 16. Criterios de aceptacion

- Se puede ver una paleta de secciones.
- Se puede ver una paleta de controles.
- Se puede agregar una seccion nueva a un modelo.
- Se puede excluir una seccion del modelo.
- Se puede agregar un control existente a una seccion del modelo.
- Se puede excluir un control del modelo.
- Se puede definir posicion al agregar secciones o controles.
- No se permite agregar el mismo control global con la misma etiqueta visible dentro del mismo modelo.
- Se permite agregar el mismo control global varias veces si cada instancia tiene una etiqueta visible distinta y un `field_key` unico.
- No se permite agregar la misma seccion global con el mismo titulo visible dentro del mismo modelo.
- Se permite agregar la misma seccion global varias veces si cada instancia tiene un titulo visible distinto.
- El reporte diferencia correctamente controles repetidos por su etiqueta visible y, si hace falta, por la seccion.
- Existe el catalogo `rangoedad` con sus cuatro opciones iniciales.
- Existe el control `Rango de edad` en la paleta.
- El control `Rango de edad` puede agregarse al modelo `Formulario de asistencia - Plantilla FDC_Rango_Edad`.
- El formulario publico renderiza el nuevo control cuando el modelo publicado lo incluye.
- El reporte Excel muestra la denominacion seleccionada para `Rango de edad`.
- Cambiar la estructura del modelo no cambia el enlace ni el QR de los eventos asociados.

## 17. Recomendacion de implementacion incremental

Para reducir riesgo, implementar en este orden:

1. Migraciones para paleta de secciones, paleta de controles y catalogo `rangoedad`.
2. Seed inicial de controles existentes hacia la paleta.
3. Lectura de estructura desde modelo actual y paleta.
4. UI de solo lectura mejorada para entender secciones y controles.
5. Agregar/quitar controles en modelo sin versionado complejo, solo para modelos sin asistencias.
6. Agregar/quitar secciones.
7. Reordenamiento.
8. Versionado para modelos usados historicamente.
9. Publicacion de version y asociacion con eventos.
10. Ajuste de reportes para resolver nuevas respuestas dinamicas por version.

Esta ruta permite entregar valor rapido sin romper los formularios publicos actuales.
