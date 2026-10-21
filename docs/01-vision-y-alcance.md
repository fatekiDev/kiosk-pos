# kiosko-pos: Visión y alcance de la demo

**Versión:** 0.2 (borrador) · **Fecha:** 20-10-2026 · **Equipo:** Vicente Garin, Benjamin Concha, Jose Guanel

## 1. Resumen
kiosko-pos es un sistema de punto de venta (POS) e inventario de escritorio para un
negocio pequeño. Permite vender escaneando códigos de barras, controlar el stock de cada
producto, mostrar un comprobante y revisar el cierre de caja y reportes.
Funciona en un solo PC, sin internet y sin conexión al SII (requisito del cliente).

## 2. Propósito de este documento
Definir qué construiremos para la **demo**, qué supuestos hicimos al no haber levantado
requisitos formales, y qué debemos validar con el cliente al presentarla.
Una vez validada la demo se redactará el alcance definitivo y la cotización.

## 3. Objetivos de la demo
- Mostrar un flujo de venta completo y fluido: escanear, cobrar, ver comprobante.
- Mostrar que el stock se actualiza solo con cada venta.
- Mostrar al dueño que tiene control: reportes, stock bajo y cierre de caja.
- Obtener del cliente la retroalimentación que define el alcance final.

## 4. Usuarios
| Rol | Qué hace |
|---|---|
| Dueño | Administra productos, precios, compras y reportes |
| Cajero | Registra ventas y mermas; no modifica precios ni stock manualmente |

## 5. Alcance de la demo

### 5.1 Incluido
- Inicio de sesión con roles.
- Gestión de productos (código de barras, categoría, costo, precio, stock mínimo).
- Venta con carrito: escaneo o búsqueda, cantidades, total, método de pago, vuelto.
- Descuento automático de stock al vender.
- Vista previa del comprobante en pantalla o PDF.
- Cierre de caja básico.
- Resumen: stock bajo, valor del inventario y ventas del día.
- Datos de ejemplo cargados para la presentación.

### 5.2 No incluido en la demo (posible versión 1)
- Impresión real en impresora térmica.
- Importación de productos desde Excel/CSV.
- Respaldos automáticos.
- Gestión de usuarios y cambio de clave desde la interfaz.
- Instalador para Windows.
- Reportes avanzados (por categoría, por fechas).

### 5.3 Fuera de alcance
- Conexión con el SII y emisión de boleta o factura electrónica. El comprobante es
  **interno y no tributario**; la obligación tributaria es responsabilidad del cliente.
- Venta online, multi-sucursal o sincronización en la nube.
- Contabilidad, remuneraciones o facturación a proveedores.
- Requisitos normativos específicos de farmacia (recetas, medicamentos controlados).

## 6. Supuestos (no validados con el cliente)
| # | Supuesto | Si es falso... |
|---|---|---|
| S1 | Opera con un solo PC con Windows | Cambia la arquitectura (red/nube) |
| S2 | Los productos tienen código de barras | Hay que agregar etiquetas o búsqueda manual |
| S3 | El lector funciona como teclado (lo habitual) | Se requiere integración especial |
| S4 | La impresora es térmica compatible con ESC/POS | Solo podremos importar reportes o usar PDF |
| S5 | Una sola caja y un cajero a la vez | Hay que manejar concurrencia y turnos |
| S6 | Solo medios de pago simples; los terminales de tarjeta son independientes | Cambia el alcance de pagos |
| S7 | No hay venta a crédito (fiado) ni promociones complejas | Se suman módulos y tiempo |
| S8 | Todo se vende por unidad, no a granel ni por peso | Hay que soportar cantidades decimales |

## 7. Por validar con el cliente durante la demo
Anotar las respuestas textuales en `docs/03-notas-demo.md`.

1. ¿Qué modelo es la máquina de boletas, el lector y el computador? (pedir fotos)
2. ¿Todos sus productos tienen código de barras? ¿Cuántos productos son?
3. ¿Vende solo kiosco o tiene otras áreas (ferretería, farmacia, variedades)?
4. ¿Qué medios de pago acepta? ¿Fía a clientes?
5. ¿Hace promociones o vende a granel?
6. ¿Cómo lleva hoy el stock? ¿Existe una planilla para importar?
7. ¿Qué quiere ver al final del día?
8. ¿Para cuándo lo necesita y quién valida los avances?
9. ¿Tiene claro que el comprobante no reemplaza la boleta electrónica del SII?

## 8. Guion de la demo (5 a 10 minutos)
1. Ingresar como cajero y hacer una venta de 3 a 5 productos con el lector.
2. Cobrar en efectivo con vuelto y mostrar el comprobante.
3. Mostrar que el stock bajó en el producto vendido.
4. Ingresar como dueño: crear un producto nuevo y cambiar un precio.
5. Mostrar el resumen: ventas del día, stock bajo y valor del inventario.
6. Hacer el cierre de caja.
7. Abrir la conversación sobre la sección 7.

## 9. Riesgos
| Riesgo | Impacto | Mitigación |
|---|---|---|
| Los supuestos no se cumplen | Alto | Validarlos en la demo antes de cotizar |
| El cliente asume que la demo es el producto final | Alto | Aclarar qué falta (sección 5.2) y que el alcance se cierra después |
| Expectativa de que reemplaza la boleta del SII | Alto | Dejarlo claro en la demo y en el contrato |
| Fallo del lector o de la demo en vivo | Medio | Probar antes, tener datos de ejemplo y una grabación de respaldo |
| Dar precio o plazo sin alcance definido | Alto | No cotizar en la demo; cotizar después con el alcance cerrado |

## 10. Criterios de éxito de la demo
- Una venta de 5 productos se completa sin errores y en menos de 30 segundos.
- El cliente entiende y valida el flujo de venta.
- Salimos con respuestas a al menos las preguntas 1, 2, 3, 4 y 9 de la sección 7.
- El cliente acepta recibir una cotización con el alcance definitivo.

## 11. Próximos pasos tras la demo
1. Documentar las respuestas del cliente y actualizar supuestos y alcance.
2. Redactar los requisitos y las historias de usuario definitivas.
3. Enviar la cotización con alcance, plazo, garantía y condiciones.
4. Firmar el contrato antes de desarrollar la versión 1.