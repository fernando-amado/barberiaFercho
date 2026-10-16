# Validación: Frontend formulario público de reservas

**Puntuación:** 9/10
**Veredicto:** APROBADO (probado)

## Criterios de aceptación
| Criterio | Estado | Evidencia |
|---|---|---|
| /reservas público con metadata "Reservar cita" | Cumple | src/app/reservas/page.tsx:7 |
| Campos y límites (nombre 120, tel 7-20 tipo tel, servicio, fecha, hora, notas 500) | Cumple | reserva-form.tsx:117-197 |
| min/max Bogotá + rechazo de domingo antes de enviar | Cumple | reserva-form.tsx:53-55,72-75; horario.ts:32-51 |
| Confirmación con servicio/fecha/hora, pendiente, "Hacer otra reserva" | Cumple | reserva-form.tsx:89-110 |
| 400 details, 409 mensaje, genérico; datos conservados en error | Cumple | reserva-form.tsx:33-39,81-83 (solo se limpian en éxito) |
| Botón deshabilitado y sin doble envío | Cumple | reserva-form.tsx:71,206 |
| Accesibilidad (labels, role=alert, role=status, foco visible) | Cumple | reserva-form.tsx:91,116,200,29 |
| Enlace a /reservas en hero y encabezado (y contacto) | Cumple | hero.tsx:15; encabezado.tsx:25; contacto.tsx:42 |
| build y lint pasan | Cumple | ver Pruebas |

## Hallazgos
- [Baja] reserva-form.tsx:116 — las etiquetas no tienen estilo ni `aria-required`/aviso de obligatorios; solo atributo `required` — opcional añadir indicador visual.
- [Baja] reserva-form.tsx:72 — el error de domingo no se limpia al cambiar de fecha hasta el siguiente envío — opcional.
- [Baja] Foco no se mueve a la confirmación/alerta; role=status/alert lo anuncia, aceptable.
- [Baja] Prueba manual (BD/409/doble clic) no ejecutada; requiere Supabase local.

## Pruebas
| Prueba | Comando / caso | Resultado |
|---|---|---|
| Lint | `npm run lint` | Pasa, sin salida de errores |
| Build | `npm run build` | Pasa; TypeScript OK; ruta `/reservas` estática generada |
| Tests | no hay script `test` en package.json | N/A |
| Casos manuales | envío/409/domingo en navegador | No ejecutados (requieren backend en ejecución) |
