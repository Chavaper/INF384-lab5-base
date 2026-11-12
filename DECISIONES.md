# Decisiones · Laboratorio 5

## Equipo 3

Número de equipo: 3

| Código PUCP | Nombre | Rol | Usuario de GitHub |
|---|---|---|---|
| | | Moderador | |
| | | Escriba | |
| | | Abogado del diablo | |
| | | Guardián del tiempo | |
| | | Integrador | |

## A1 · Postmortem

### Resumen

El viernes 06/11 se aplicó un cambio en `infra/s3.tf` (commit `bd600fe`) para que el proveedor de conciliación leyera los comprobantes. El cambio desactivó el bloqueo de acceso público y agregó una política `Principal = "*"` con `s3:GetObject`. El bucket quedó abierto a cualquier persona en internet. Se detectó el lunes 09/11 por una publicación de un cliente en redes sociales. On-call bloqueó el acceso desde la consola; el código sigue sin corregir.

### Impacto

- 41 300 comprobantes expuestos públicamente durante 63 h 25 min (vie 06/11 17:55 – lun 09/11 09:20).
- No se puede saber cuántos se descargaron ni quién: el bucket no tiene registros de acceso.
- Al menos un comprobante ajeno publicado en redes sociales.
- El proveedor de conciliación perdió el acceso desde el lunes 09:25; corre la penalidad contractual por día de retraso.
- Deriva entre `infra/` y AWS: un nuevo `terraform apply` volvería a abrir el bucket.

### Línea de tiempo

| Fecha y hora | Hecho |
|---|---|
| Jue 05/11 · 15:10 | Comercial informa que el proveedor debe leer comprobantes desde el viernes 06/11, con penalidad por día de retraso. |
| Vie 06/11 · 09:30 | La tarea se asigna a un desarrollador backend. La ingeniera de plataforma está de vacaciones. |
| Vie 06/11 · 16:20 | Se pide al proveedor el ID de su cuenta AWS. No responde. |
| Vie 06/11 · 17:30 | Se pide revisión por chat. El líder técnico, en reunión, responde "dale, lo vemos el lunes". |
| Vie 06/11 · 17:42 | Commit directo a `main` (`bd600fe`) en `infra/s3.tf`. |
| Vie 06/11 · 17:55 | `terraform apply` desde una laptop. Inicia la exposición. El proveedor confirma acceso. |
| Sáb 07/11 – Dom 08/11 | Sin alertas. No hay monitoreo de configuración del bucket. |
| Lun 09/11 · 08:15 | Un cliente publica el link de un comprobante ajeno obtenido cambiando el número de la URL. **Detección.** |
| Lun 09/11 · 08:50 | Soporte escala a on-call. |
| Lun 09/11 · 09:20 | On-call activa el bloqueo de acceso público desde la consola. Fin de la exposición. `infra/` no se modifica. |
| Lun 09/11 · 09:25 | El proveedor pierde el acceso. |
| Lun 09/11 · 11:00 | Se buscan registros de acceso. El bucket no los tiene. |
| Mar 10/11 · 10:00 | Gerencia pide informe y plan de prevención. |

### Causas

- **Técnica:** La única forma de dar acceso sin el ID de cuenta AWS del proveedor era abrir el bucket a `Principal = "*"`. Además, los comprobantes tienen URLs predecibles (número correlativo), así que cualquiera podía recorrerlos cambiando el número.
- **Proceso:** `main` no tiene protección de rama. Un cambio en `infra/` se pudo subir con commit directo y una aprobación informal por chat ("lo vemos el lunes"), sin pull request ni revisión.
- **Pipeline:** `ci.yml` solo ejecuta `npm test`. No hay `terraform plan`, Checkov ni otro análisis de `infra/`. Además, `terraform apply` se ejecuta desde laptops, fuera del pipeline.
- **Detección:** No hay monitoreo ni alertas sobre la configuración del bucket (acceso público, política). Tampoco hay registros de acceso. La exposición la detectó un cliente 63 h después.
- **Organización:** Solo una persona del equipo sabe Terraform, y estaba de vacaciones. Se asignó un cambio de infraestructura a alguien sin experiencia en `infra/`, con un plazo de un día y penalidad contractual, un viernes por la tarde, sin respaldo hasta el lunes.

### Qué funcionó y qué no funcionó

**Funcionó**

- Soporte escaló a on-call en 35 min.
- On-call tenía acceso a la consola y contuvo la exposición 30 min después del escalamiento.
- El historial de Git permite identificar el commit exacto y su contenido.

**No funcionó**

- `main` acepta commits directos: el cambio no tuvo revisión real ni pull request.
- El pipeline no analiza `infra/`; ningún check detuvo un bucket público.
- `terraform apply` se ejecuta desde laptops, fuera del pipeline.
- Sin monitoreo de configuración: 63 h sin alertas; la detección vino de un cliente.
- Sin registros de acceso en el bucket: el alcance real es desconocido.
- La contención se hizo solo en consola: el código sigue inseguro y el proveedor quedó sin acceso.
- Conocimiento de Terraform concentrado en una sola persona, sin respaldo durante su ausencia.
- Faltaba un dato del proveedor (ID de cuenta AWS) y no hubo un camino seguro alternativo ni escalamiento del plazo.

### Acciones

| Acción | Rol responsable | Fecha límite |
|---|---|---|
| | | |

### Datos del repositorio

- SHA del commit que introdujo el cambio:
- Fecha y hora de ese commit:
- Checks de Checkov que fallan sobre el bucket de comprobantes:

## A2 · Decisiones

### Decisión 1 · Qué bloquea y qué informa

- Decisión:
- Dato del repositorio que la sustenta:
- Alternativa descartada y por qué:
- Posición en minoría:

### Decisión 2 · La vulnerabilidad sin versión corregida

- Decisión:
- Dato del repositorio que la sustenta:
- Alternativa descartada y por qué:
- Posición en minoría:

### Decisión 3 · La Function URL sin autenticación

- Decisión:
- Dato del repositorio que la sustenta:
- Alternativa descartada y por qué:
- Posición en minoría:

## A3 · Dato nuevo

- Qué cambia en el postmortem:
- Qué cambia en las decisiones:
- Respuesta del equipo al pedido recibido:

## Parte B · Evidencia

| Evidencia | Link |
|---|---|
| Run fallido: el gate detiene el bucket público | |
| Run en verde en `main` después de las correcciones | |
| Pull requests del equipo | |

## Declaración de uso de IA

Herramientas usadas y para qué se usó cada una:
