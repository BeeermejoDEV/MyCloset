# MyCloset — definición del proyecto

Documento de producto y alcance previo al desarrollo.

**Fecha:** 23 de octubre de 2026, Europe/Madrid.  
**Estado:** definición inicial; aplicación todavía sin implementar.  
**Usuario:** David, para uso personal desde su móvil, principalmente iPhone.

## 1. La idea en una frase

**Tener toda mi ropa en un armario digital, indicar yo mismo qué prendas combinan y guardar conjuntos completos para decidir fácilmente qué ponerme.**

MyCloset debe servir tanto para consultar un conjunto ya pensado como para partir de una prenda concreta y encontrar las combinaciones que David ha aprobado.

La aplicación no necesita saber de moda: necesita recordar bien las decisiones de su usuario y hacerlas fáciles de consultar.

### Ejemplo que resume la idea

David tiene un pantalón de vestir beige. Sabe que combina con una sudadera negra y también con un jersey largo concreto de su armario.

En la aplicación:

1. Registra esas tres prendas, cada una con su propia ficha.
2. Marca que el pantalón beige combina con la sudadera negra.
3. Marca que el pantalón beige combina con el jersey largo.
4. Crea un conjunto con pantalón beige, sudadera negra y unas zapatillas que él elige.
5. Crea otro conjunto con pantalón beige, jersey largo y otro calzado que él elige.
6. Otro día puede abrir sus conjuntos y escoger uno, o abrir el pantalón beige y consultar qué conjuntos guardados lo incluyen.

La aplicación conserva estas decisiones. No inventa que cualquier zapatilla combina con cualquier jersey, ni mezcla automáticamente todas las prendas relacionadas.

## 2. Qué está confirmado y qué es una propuesta

Este documento distingue las peticiones de David de las decisiones que todavía requieren validación. Una propuesta de este archivo no equivale a una preferencia ya confirmada.

### Confirmado por David

- El proyecto se llama **MyCloset**.
- El uso es personal; no se está planteando una aplicación para otros usuarios.
- Debe poder utilizarse desde el móvil.
- Quiere registrar toda su ropa de forma progresiva.
- Él indicará qué prendas combinan con cuáles.
- Quiere crear y consultar conjuntos completos para decidir qué ponerse.
- No quiere IA para reconocer prendas, decidir combinaciones ni generar conjuntos.
- Está haciendo limpia de armario y prevé conservar poca ropa al principio.
- Quiere construir un fondo de armario poco a poco.
- Su prioridad inmediata es tener una base ordenada.
- Antes de desarrollar el MVP, quiere una definición descriptiva y una división clara del proyecto.

### Propuesto en este documento, pendiente de validación

- Construir primero una web adaptada al móvil, con posibilidad de acceso desde un icono en el iPhone.
- Navegación principal dividida en **Qué me pongo**, **Mi ropa** y **Conjuntos**.
- Clasificar las prendas por categoría y tipo, usando atributos y etiquetas para otros detalles.
- Permitir registrar una prenda sin foto para no bloquear el inventario inicial.
- Guardar inicialmente los datos en el dispositivo y ofrecer exportación e importación completas.
- Usar archivado de prendas para conservar conjuntos antiguos sin mostrarlos como opciones actuales.
- Que la primera versión solo muestre conjuntos elegidos y guardados manualmente por David.

## 3. Problema que debe resolver

David puede tener prendas que combinan entre sí y aun así no recordar todas las opciones al vestirse. La ropa distribuida entre perchas, baldas y cajones tampoco permite ver un conjunto completo de un vistazo.

MyCloset debe reducir tres dificultades:

| Dificultad | Respuesta de la aplicación |
|---|---|
| No recordar exactamente qué ropa tengo | Un catálogo visual de prendas reales |
| No recordar con qué me gusta combinar una prenda | Relaciones manuales entre prendas |
| Tener que pensar un conjunto entero cada vez | Una colección de conjuntos ya preparados |

El éxito no se medirá por el número de prendas registradas ni por el tiempo pasado en la aplicación. Se medirá por poder elegir qué ponerse con menos esfuerzo.

### Contexto del armario físico

David dispone de un armario con baldas que puede poner y quitar, otro con cuatro cajones y un espacio debajo de la cama. Plancha su ropa y quiere conservarla presentable hasta ponérsela.

Este contexto explica el proyecto, pero la primera versión no necesita representar muebles, baldas ni cajones. La organización digital debe funcionar aunque cambie dónde guarda la ropa.

## 4. Los tres conceptos principales

### 4.1. Prenda

Es una pieza concreta del armario de David: su sudadera negra, su pantalón beige o sus zapatillas blancas. No es una categoría genérica ni un producto que todavía no posee.

Dos camisetas negras distintas son dos prendas diferentes si David quiere distinguirlas. Deben poder tener el mismo tipo y color sin confundirse.

Cada prenda tiene un identificador interno estable. Su nombre, foto o categoría pueden cambiar sin perder sus combinaciones y conjuntos.

### 4.2. Combinación entre prendas

Es una relación que David guarda entre dos prendas: **«Estas dos prendas me gusta llevarlas juntas»**.

Reglas propuestas:

- La relación funciona en ambos sentidos: si el pantalón combina con la sudadera, la sudadera también muestra el pantalón.
- No se crean relaciones de una prenda consigo misma.
- La misma relación no se guarda dos veces.
- La ausencia de relación significa **«no lo he indicado»**, no **«queda mal»**.
- Quitar una relación no borra ninguna de las prendas.
- Que A combine con B y con C no implica que B combine con C.
- Una relación no se transmite a otras prendas por compartir color, categoría o tipo.

Las relaciones sirven para recuperar ideas aprobadas por David. No constituyen un sistema automático de evaluación de moda.

### 4.3. Conjunto

Es una selección concreta de prendas que David quiere poder recuperar como una unidad.

Ejemplo: pantalón beige + camiseta blanca + sobrecamisa azul + zapatillas blancas.

Un conjunto:

- Guarda referencias a las prendas del catálogo; no crea copias independientes.
- Tiene un nombre que ayuda a reconocerlo.
- Puede contener varias prendas de una misma categoría, como camiseta, jersey y camisa abierta.
- Puede llevar abrigo y accesorios, pero no obliga a incluirlos.
- Puede guardarse aunque David no haya marcado previamente todas las relaciones entre sus prendas: guardarlo expresa su aprobación de ese conjunto concreto.
- No crea automáticamente relaciones entre todas las prendas que contiene.

**Importante:** ver combinaciones de dos prendas y consultar conjuntos completos son funciones distintas. MyCloset necesita ambas.

## 5. Cómo dividir la ropa

### 5.1. Regla de clasificación

La categoría indica **en qué parte del vestuario se utiliza**. El tipo indica **qué prenda es**. Los atributos describen **cómo es**. Las etiquetas indican **cómo o cuándo la usa David**.

No crear una categoría distinta para cada mezcla de tipo, color y estilo. Por ejemplo, «sudadera negra con capucha para diario» es una prenda con varios detalles, no una categoría nueva.

### 5.2. Categorías y tipos iniciales propuestos

| Categoría | Tipos iniciales |
|---|---|
| Parte de arriba | Camiseta, polo, camisa, sobrecamisa, sudadera, jersey, cárdigan, otro |
| Parte de abajo | Vaquero, chino, pantalón de vestir, jogger, pantalón corto, otro |
| Abrigo | Chaqueta, cazadora, abrigo, chaleco, otro |
| Calzado | Zapatillas, zapatos, botas, sandalias, otro |
| Accesorios | Cinturón, gorra, bufanda, reloj, otro |

Esta lista es un punto de partida. Se ajustará al inventario real de David y no pretende cubrir toda la ropa posible.

Hay prendas con clasificación ambigua, como una chaqueta ligera que se usa como sobrecamisa. Se elige una clasificación principal coherente y se mantiene; no se duplica la misma prenda en dos categorías.

La ropa interior y los calcetines no necesitan un inventario individual en el MVP. Si una pieza concreta es importante para formar un conjunto, se decidirá cómo incluirla sin ampliar innecesariamente el formulario.

### 5.3. Atributos y etiquetas

| Dato | Ejemplo | Propuesta de alcance |
|---|---|---|
| Color principal | Negro, beige, azul | MVP, opcional |
| Con capucha | Sí o no | Después del MVP; inicialmente puede aparecer en el nombre |
| Manga | Corta, larga, sin mangas | Después del MVP |
| Largo o corte | Largo, recto, ajustado | Después del MVP |
| Uso o estilo | Diario, arreglado, gimnasio, casa | Después del MVP, si aporta utilidad |
| Temporada | Frío, calor, entretiempo | Después del MVP |

«Jersey de vestir» se registraría como tipo **jersey**, con un nombre reconocible y, cuando existan etiquetas, **arreglado**. «Jersey largo» seguiría siendo un jersey, con el largo como detalle.

Las etiquetas pueden solaparse: una camisa puede servir para diario y para ir arreglado. No deben obligar a elegir una sola ocasión.

### 5.4. Ejemplos de fichas

| Nombre | Categoría | Tipo | Color |
|---|---|---|---|
| Sudadera negra con capucha | Parte de arriba | Sudadera | Negro |
| Jersey largo gris | Parte de arriba | Jersey | Gris |
| Pantalón de vestir beige | Parte de abajo | Pantalón de vestir | Beige |
| Zapatillas blancas | Calzado | Zapatillas | Blanco |

Estos ejemplos son ilustrativos y no certifican el inventario actual de David.

## 6. Ficha de una prenda

### Datos del MVP

| Campo | Obligatorio | Comportamiento |
|---|---|---|
| Nombre | Sí | Texto reconocible, por ejemplo «Pantalón beige de vestir» |
| Categoría | Sí | Una categoría principal |
| Tipo | Sí | Lista dependiente de la categoría, con opción «Otro» |
| Foto | No, según propuesta | Una foto por prenda; se puede añadir o sustituir después |
| Color principal | No | Descriptivo; no determina qué combina |
| Estado | Automático | Activa al crear; puede archivarse |

### Qué se ve al abrir una prenda

1. Foto o marcador visual si todavía no tiene foto.
2. Nombre, categoría, tipo y color cuando esté informado.
3. Sección **«Combina con»**, con las prendas relacionadas.
4. Sección **«Conjuntos con esta prenda»**, con los conjuntos guardados que la incluyen.
5. Acciones para editar, cambiar relaciones y archivar.

No se pedirán precio, tienda, fecha de compra, composición, marca o talla para registrar ropa en esta primera versión. Podrán añadirse más adelante si existe una necesidad concreta.

### Fotografías

- Se seleccionarán desde la fototeca o desde las opciones de captura que ofrezca el móvil.
- Se conservará la proporción de la imagen al mostrarla.
- La aplicación podrá reducir su tamaño para almacenarla; sin alterar colores ni inventar detalles.
- No se eliminará el fondo mediante IA ni se reconocerá automáticamente la prenda.
- El registro seguirá siendo editable si la imagen falla o David decide añadirla más tarde.
- Antes de guardar se debe comprobar que el archivo sea una imagen compatible. Ante un formato no admitido, se mostrará un mensaje claro y se conservará el resto del formulario.

## 7. Marcar qué combina con qué

### Flujo propuesto

1. David abre una prenda.
2. Pulsa **«Editar combinaciones»**.
3. Ve las demás prendas activas de su armario.
4. Puede buscar por nombre y filtrar por categoría.
5. Selecciona las prendas que considera compatibles.
6. Guarda la selección.

Las relaciones existentes aparecen seleccionadas al abrir el editor. Cancelar debe mantenerlas tal como estaban.

### Ejemplo

Desde «Pantalón beige», David selecciona «Sudadera negra» y «Jersey largo gris». Al guardar, esas prendas aparecen en «Combina con». Si abre la sudadera negra, también ve el pantalón beige.

### Qué no debe ocurrir

- La aplicación no relaciona automáticamente todas las prendas negras con el pantalón beige.
- No presenta relaciones no registradas como si David las hubiera aprobado.
- No impide guardar una relación porque ambas prendas pertenezcan a la misma categoría.
- No necesita una valoración del tipo «80 % compatible».

## 8. Crear y mantener conjuntos completos

### Flujo propuesto

1. David pulsa **«Crear conjunto»**.
2. Selecciona prendas de su catálogo, pudiendo filtrar por categoría o buscar por nombre.
3. Las prendas elegidas permanecen visibles en una zona de resumen.
4. Puede retirar cualquiera de ellas sin perder la selección de las demás.
5. Escribe un nombre y guarda el conjunto.

También se puede iniciar desde la ficha de una prenda. En ese caso, la prenda inicial ya aparece seleccionada.

### Papel de las relaciones en el editor

Al partir de una prenda, el editor puede dar acceso directo a **«Combina con esta prenda»**. Este filtro debe identificar claramente qué prenda se está tomando como referencia.

El usuario siempre podrá volver a ver todo el armario. La existencia de una relación ayuda a elegir, pero no bloquea ninguna selección manual.

### Cuándo se considera completo

En el MVP, David decide si el conjunto está listo para usar. No habrá un validador que exija una estructura fija de camiseta, pantalón y zapatos.

Como regla técnica propuesta, un conjunto debe tener nombre y al menos dos prendas distintas para guardarse. Esto evita guardar una selección vacía, pero no certifica que sea un atuendo completo. Antes de implementar se puede ajustar este mínimo si David lo prefiere.

### Ficha y tarjeta del conjunto

- Nombre.
- Composición visual usando las fotos de las prendas.
- Lista de prendas, accesible también por texto.
- Acceso a las fichas individuales.
- Acciones para editar y eliminar.

No se necesita una imagen generada de una persona vestida. Una cuadrícula o composición sencilla con las fotos reales es suficiente.

### Reglas al editar

- No se permite añadir dos veces la misma prenda al mismo conjunto.
- Se permiten varias prendas diferentes del mismo tipo o categoría.
- Cambiar el nombre o la foto de una prenda actualiza su presentación dentro de los conjuntos.
- Editar un conjunto no altera otros conjuntos.
- Quitar una relación entre prendas no borra ni modifica los conjuntos ya guardados.
- Eliminar un conjunto no elimina sus prendas ni sus relaciones.

## 9. Elegir qué ponerse

### Objetivo principal

Que David abra MyCloset y encuentre opciones que ya ha pensado y aprobado, en lugar de empezar a combinar desde cero.

### Flujo A: no tengo una prenda decidida

1. Abre **«Qué me pongo»**.
2. Ve sus conjuntos disponibles.
3. Abre el que le apetezca y consulta sus prendas.

En la primera versión no hace falta un algoritmo que ordene por estilo, temperatura o hábitos. Mostrar los conjuntos guardados de forma clara ya resuelve el problema principal.

### Flujo B: hoy quiero ponerme una prenda concreta

1. Busca la prenda en **«Mi ropa»**.
2. Abre su ficha.
3. Consulta **«Conjuntos con esta prenda»**.
4. Escoge uno de los conjuntos existentes.

Si todavía no hay conjuntos con esa prenda, puede consultar sus relaciones y crear uno manualmente.

### Conjuntos guardados frente a generación por reglas

La primera versión **no combinará automáticamente las relaciones por parejas para inventar conjuntos nuevos**. Mostrar varios conjuntos completos guardados satisface el objetivo inicial sin introducir resultados que David no ha revisado.

Una función futura podría recorrer combinaciones manuales para proponer nuevas selecciones sin IA, pero requeriría definir reglas adicionales sobre capas, calzado y compatibilidad del conjunto entero. No se incluye en este MVP.

## 10. Pantallas y navegación

La navegación se propone para uso con una mano y pantalla pequeña. Debe ser clara sin depender de gestos ocultos ni de mantener pulsados elementos.

| Pantalla | Para qué sirve | Acciones principales |
|---|---|---|
| Qué me pongo | Consultar opciones listas para vestir | Abrir conjuntos disponibles, ir a crear uno si no hay |
| Mi ropa | Ver el inventario activo | Buscar, filtrar, añadir y abrir prendas |
| Ficha de prenda | Consultar una pieza y sus relaciones | Editar, relacionar, ver conjuntos, archivar |
| Alta/edición de prenda | Registrar o corregir sus datos | Escribir nombre, clasificar, añadir foto y guardar |
| Editor de combinaciones | Marcar relaciones manuales | Buscar, seleccionar y guardar |
| Conjuntos | Gestionar la colección completa | Crear, abrir, editar y eliminar |
| Editor de conjunto | Construir una selección concreta | Seleccionar prendas, poner nombre y guardar |
| Archivo | Consultar prendas retiradas | Ver y restaurar |
| Ajustes y copia de seguridad | Mantener los datos recuperables | Exportar e importar |

**Qué me pongo** y **Conjuntos** utilizarán los mismos registros. La diferencia es de propósito: elegir entre opciones actuales frente a gestionar todo lo guardado. No deben convertirse en dos bibliotecas independientes.

### Estados vacíos

- Sin prendas: mostrar **«Añade tu primera prenda»**.
- Con prendas, sin relaciones: explicar que puede marcar qué combina.
- Sin conjuntos: ofrecer **«Crear mi primer conjunto»**.
- Sin resultados de búsqueda: permitir quitar filtros; no aparentar que el armario está vacío.
- Sin conjuntos disponibles por archivado: indicar el motivo y ofrecer ver los conjuntos guardados.

No rellenar el armario con prendas ficticias presentadas como si fueran de David.

## 11. Archivado y cambios en el armario

Durante la limpia puede dejar de usar ropa y más adelante incorporar nuevas prendas. La aplicación debe soportar ese cambio sin perder el historial útil.

### Comportamiento propuesto

- Archivar una prenda la retira de la vista habitual y de los selectores para crear conjuntos nuevos.
- Sus relaciones y conjuntos se conservan.
- Un conjunto con una prenda archivada permanece visible en la biblioteca, con aviso de que contiene ropa archivada.
- Ese conjunto no aparece como opción disponible en **«Qué me pongo»**.
- Restaurar la prenda vuelve a habilitarla; si no quedan otras prendas archivadas, sus conjuntos vuelven a estar disponibles.
- El MVP puede prescindir del borrado definitivo de prendas. Esto simplifica el manejo de referencias y evita perder conjuntos por accidente.

Antes de archivar, conviene mostrar cuántos conjuntos quedarán afectados. El borrado de un conjunto debe pedir confirmación porque elimina la selección guardada.

Marcar ropa como sucia, pendiente de plancha o prestada queda fuera del MVP. Por tanto, **«disponible» en la primera versión significa que todas sus prendas están activas**, no que la aplicación conozca su estado de lavado real.

## 12. Alcance del MVP

### Incluido

| Bloque | Resultado mínimo |
|---|---|
| Catálogo | Crear, consultar y editar prendas; foto opcional; categorías y tipos |
| Consulta | Buscar por nombre y filtrar por categoría |
| Relaciones | Marcar, consultar y quitar combinaciones manuales en ambos sentidos |
| Conjuntos | Crear, consultar, editar y eliminar selecciones con prendas reales |
| Elección | Ver conjuntos disponibles y los que incluyen una prenda concreta |
| Limpia de armario | Archivar y restaurar prendas con comportamiento coherente en conjuntos |
| Persistencia | Mantener los cambios al cerrar y volver a abrir la aplicación |
| Recuperación | Exportar e importar los datos, incluidas las imágenes |
| Móvil | Formularios y navegación utilizables desde iPhone |

### Fuera de esta primera versión

- IA, reconocimiento de prendas y eliminación automática de fondos.
- Generación de atuendos nuevos por IA o por un motor de reglas.
- Prueba virtual sobre una persona o avatar.
- Publicación en la App Store.
- Red social, perfiles públicos o compartir armario con otros usuarios.
- Compras, enlaces a tiendas y recomendaciones de productos.
- Calendario de vestimenta e historial de uso.
- Estadísticas, coste por uso y seguimiento de gasto.
- Tiempo meteorológico y recomendaciones por ubicación.
- Planificación de viajes y maletas.
- Representación de la distribución física de los muebles.
- Sincronización automática entre móvil y ordenador, mientras se mantenga la propuesta de almacenamiento local.

### Después del MVP, si el uso lo justifica

Favoritos, duplicar conjuntos, etiquetas de ocasión, temporadas, filtros por color, estados de lavado, notas sobre ajuste y sincronización privada. No se añadirán por anticipado ni se considerarán requisitos ya aprobados.

## 13. Datos, privacidad y copias

### Propuesta inicial: datos en el dispositivo

Para una primera versión de uso individual, se propone guardar prendas, imágenes, relaciones y conjuntos en el almacenamiento del navegador, mediante IndexedDB.

Ventajas:

- No hace falta crear un sistema de cuentas para el catálogo.
- Las fotos no necesitan enviarse a un servicio externo para clasificarlas.
- El coste y la complejidad iniciales se reducen.

Límites que deben quedar claros:

- Los datos del iPhone y los del ordenador serán independientes.
- Cambiar de navegador, dominio o contexto de instalación puede implicar otro almacén de datos.
- Borrar los datos del sitio o perder el dispositivo puede perder el catálogo si no hay copia.
- No se debe prometer que abrir desde Safari y desde un icono instalado compartirá siempre el mismo almacenamiento sin comprobarlo en el dispositivo objetivo.
- El alojamiento de la web y el almacenamiento del catálogo son decisiones diferentes. Un sitio privado no crea por sí mismo una copia de seguridad ni una sincronización de prendas.

Esta decisión técnica es una propuesta, no una condición expresada por David. Si necesita consultar exactamente el mismo catálogo en varios dispositivos, habrá que plantear sincronización antes de desarrollar.

### Copia de seguridad del MVP

- Exportar un único archivo con versión de formato, prendas, fotos, relaciones y conjuntos.
- No exportar únicamente referencias a imágenes que puedan dejar de existir.
- Importar debe validar el archivo completo antes de modificar el catálogo actual.
- En la primera versión, importar **reemplazará** el catálogo; se avisará y se pedirá confirmación. Fusionar dos catálogos queda fuera de alcance.
- Una importación fallida debe dejar intactos los datos anteriores.
- Tras restaurar una copia, deben conservarse las mismas relaciones y conjuntos.

No se incluirán claves privadas, credenciales ni datos de otras aplicaciones en esas copias.

## 14. Modelo de datos orientativo

Esta sección sirve para implementar después. Los nombres técnicos e identificadores del código se escribirán en inglés. La interfaz para David estará en español.

| Entidad | Campos orientativos | Finalidad |
|---|---|---|
| `Garment` | `id`, `name`, `category`, `type`, `color`, `imageId`, `archived`, `createdAt`, `updatedAt` | Una prenda concreta |
| `GarmentImage` | `id`, `data`, `mimeType`, `width`, `height` | Imagen asociada a la prenda |
| `Compatibility` | `firstGarmentId`, `secondGarmentId` | Relación manual sin dirección |
| `Outfit` | `id`, `name`, `garmentIds`, `createdAt`, `updatedAt` | Conjunto elegido manualmente |
| `Backup` | `schemaVersion`, `exportedAt`, `garments`, `images`, `compatibilities`, `outfits` | Copia completa y restaurable |

### Reglas de integridad

- Los identificadores son únicos y no dependen del nombre visible.
- Toda relación referencia dos prendas existentes y diferentes.
- El orden de las dos prendas no debe crear dos relaciones distintas.
- Los conjuntos no contienen referencias duplicadas ni a prendas inexistentes.
- El archivado conserva las referencias.
- Una imagen sustituida no debe dejar recursos huérfanos innecesarios.
- Cambios relacionados se guardan de forma consistente; un fallo no debe dejar medio conjunto guardado.
- Se reserva una versión de formato para poder evolucionar las copias y los datos locales.

No es necesario fijar ahora un framework. Una web pequeña con almacenamiento local puede resolver este alcance. Se elegirá la estructura de implementación cuando se cierre el documento.

## 15. Requisitos de uso y calidad

### Desde el móvil

- Sin desplazamiento horizontal para completar las tareas principales.
- Botones y controles cómodos de tocar, con etiquetas visibles.
- Formularios que sigan siendo utilizables cuando aparece el teclado.
- Selección de varias prendas con un estado seleccionado claro, no indicado solo por color.
- Navegación que permita volver sin perder cambios silenciosamente.
- Imágenes optimizadas para evitar que el catálogo crezca innecesariamente.

### Guardado y errores

- Guardar debe comunicar éxito o fallo real.
- Si no hay espacio suficiente, mostrar el problema y conservar el formulario.
- Cancelar no debe persistir cambios parciales.
- No perder selecciones al cambiar de filtro dentro del editor de conjuntos.
- Una operación fallida no debe borrar el estado que ya estaba guardado.

### Accesibilidad y claridad

- Texto legible y contraste suficiente.
- Controles asociados a sus etiquetas.
- Nombres de prendas disponibles además de las fotos.
- Navegación posible también con teclado.
- Confirmaciones claras para las acciones que eliminan o reemplazan información.

### Instalación y conexión

Se propone acceso como web desde el iPhone y, si se implementa el soporte necesario, acceso desde un icono en la pantalla de inicio. La ruta de acceso debe comprobarse en un iPhone real antes de darla por terminada.

No se promete funcionamiento sin conexión en el MVP: almacenar datos localmente no garantiza que la aplicación pueda cargarse sin internet. El soporte sin conexión requeriría trabajo y pruebas específicos.

## 16. Criterios de aceptación

El MVP estará listo cuando se pueda completar y verificar este recorrido:

1. Abrirlo desde el móvil sin un catálogo ficticio precargado.
2. Crear pantalón beige, sudadera negra, jersey gris y zapatillas blancas.
3. Añadir fotos a algunas prendas y dejar otra sin foto.
4. Corregir el nombre o la clasificación de una prenda.
5. Marcar pantalón–sudadera y pantalón–jersey como relaciones.
6. Comprobar que la relación aparece desde ambas prendas.
7. Comprobar que sudadera y jersey no se relacionan automáticamente.
8. Crear dos conjuntos distintos que incluyan el mismo pantalón.
9. Crear un conjunto con varias capas de la categoría «Parte de arriba».
10. Consultar los conjuntos desde «Qué me pongo» y desde la ficha del pantalón.
11. Cerrar y volver a abrir la aplicación conservando datos e imágenes.
12. Archivar una prenda: sus conjuntos se conservan, muestran el aviso y dejan de aparecer entre las opciones disponibles.
13. Restaurarla y recuperar la disponibilidad de los conjuntos que corresponda.
14. Eliminar un conjunto sin borrar sus prendas ni relaciones.
15. Exportar una copia completa y restaurarla, comprobando imágenes, prendas, relaciones y conjuntos.
16. Rechazar una copia inválida sin modificar el catálogo existente.
17. Completar los flujos sin recortes de contenido ni controles inaccesibles en la pantalla del móvil.

Las prendas de este recorrido serán datos de prueba, separados del inventario personal real.

## 17. División del trabajo para desarrollar después

| Fase | Trabajo | Condición para pasar a la siguiente |
|---|---|---|
| 1. Cerrar alcance | Revisar categorías, forma de acceso y almacenamiento | Decisiones principales explícitas |
| 2. Diseñar recorridos | Bocetos de catálogo, ficha y editor de conjunto | Se entiende cómo añadir ropa y elegir un conjunto |
| 3. Construir catálogo | Alta, foto, edición, búsqueda, filtros y persistencia | Prendas reales guardadas y recuperables |
| 4. Construir relaciones | Editor y consulta de compatibilidades manuales | Relaciones simétricas y sin duplicados |
| 5. Construir conjuntos | Selección, edición, consulta y borrado | Un conjunto reutiliza las prendas existentes |
| 6. Elegir y mantener | Qué me pongo, conjuntos por prenda, archivado y restauración | Opciones coherentes con las prendas activas |
| 7. Proteger los datos | Exportación, importación y manejo de errores | Copia completa restaurada sin pérdidas |
| 8. Validar en móvil | Recorrido completo, fotos y acceso desde iPhone | Criterios de aceptación superados |

No se desarrollará cada fase como un proyecto independiente. Son bloques para mantener el alcance claro y verificar el comportamiento antes de añadir funciones.

## 18. Decisiones pendientes antes de implementar

| Decisión | Propuesta inicial | Motivo |
|---|---|---|
| Forma de acceso | Web adaptada al móvil | Encaja con el uso personal y evita empezar por una app nativa |
| Almacenamiento | Local con copia exportable | Menor complejidad; requiere aceptar que no habrá sincronización |
| Foto obligatoria | No | Permite registrar ropa poco a poco |
| Clasificación | Categoría + tipo; color opcional | Base sencilla que se puede ampliar |
| Selección de ropa | Manual, con búsqueda y filtros | Respeta las decisiones de David |
| Sugerencias nuevas | Fuera del MVP | Las relaciones por parejas no prueban que un conjunto entero funcione |
| Conjunto completo | David decide; mínimo técnico propuesto de dos prendas | Evita reglas rígidas sobre cómo vestirse |
| Retirar ropa | Archivar y restaurar | Conserva las referencias de conjuntos existentes |

No hace falta responder todas estas preguntas en un único mensaje. Se podrán cerrar revisando el documento y los primeros bocetos.

## 19. Estado actual del proyecto

- Carpeta creada: `MyCloset`.
- Este documento es la especificación inicial para preparar el MVP.
- **23/10/2026: MVP implementado** en `dist/` (HTML + CSS + JS sin dependencias, datos en IndexedDB). Aplica las propuestas de este documento tal cual: web móvil, 3 pestañas + Ajustes, categoría + tipo + color opcional, foto opcional, archivado, mínimo 2 prendas por conjunto, importar = reemplazar.
- Probado en navegador (vista móvil) con datos de prueba: criterios 1-16 OK. Pendiente: criterio 17 y acceso desde icono en un iPhone real.
- Arrancar en local: `node MyCloset/serve.mjs` → `http://localhost:5190` (y la IP de la red local para abrirlo desde el iPhone con la misma wifi).
- **Decidido (23/10/2026):** alojamiento en **GitHub Pages** y datos **solo en el iPhone** (IndexedDB), con copias manuales desde Ajustes. Sin sincronización entre dispositivos.
- La app funciona sin conexión (service worker `dist/sw.js`, primero red y, si no hay, copia guardada).
- Los datos de prueba (`datos-prueba/`) no están en `dist/` y nunca se publican; el botón «Cargar datos de prueba» solo aparece en local.
- El antiguo registro de Sites (`.openai/hosting.json`) queda sin usar y fuera de Git.

## 20. Publicar y usar en el iPhone

Cada `push` a `main` publica `dist/` automáticamente (`.github/workflows/pages.yml`).

**Una sola vez:**

1. En github.com → **New repository** → nombre `MyCloset`, **Public** (Pages gratis exige público; el código es público, tus datos no) y sin README.
2. En la carpeta `MyCloset`:
   ```bash
   git remote add origin https://github.com/BeeermejoDev/MyCloset.git
   git push -u origin main
   ```
3. En el repo → **Settings → Pages → Source: GitHub Actions**. Si la primera publicación falló por esto, en **Actions** vuelve a lanzarla («Re-run»).
4. Al terminar, la app está en `https://beeermejodev.github.io/MyCloset/`.
5. En el iPhone: abrir esa dirección en **Safari** → **Compartir → Añadir a pantalla de inicio**.

**Reglas de uso:**

- Usar siempre el **icono**, no Safari: pueden tener almacenes de datos distintos.
- Exportar copia de vez en cuando (Ajustes → Exportar copia → Guardar en Archivos/iCloud Drive).
- Actualizar la app = cambiar `dist/`, `commit` y `push`. El móvil coge la versión nueva la siguiente vez que la abra con conexión.
