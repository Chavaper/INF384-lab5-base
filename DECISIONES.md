
# Decisiones · Laboratorio 5

## Equipo

Número de equipo: 03

| Código PUCP | Nombre | Rol | Usuario de GitHub |
|---|---|---|---|
| | | Moderador | |
|20216686 |Juan Andrés Bazán Arteaga | Escriba |JuanBa15 |
| | | Abogado del diablo | |
| 20222159| Jorge Vicente | Guardián del tiempo | Kiridas |
| | | Integrador | |

* Anotación: Nuestro compañero Angel Cerdan no cuenta con acceso al repositorio porque su correo es de outlook y el dia de hoy 12/11 se presentaron fallas con el acceso a correos con dicho dominio. 
 
## A1 · Postmortem

### Resumen

Entre el viernes 06/11 a las 17:55 y el lunes 09/11 a las 09:20, el bucket de comprobantes de Monedero Andino permitió lectura pública de sus objetos. El cambio se hizo para dar acceso a un proveedor externo de conciliación con una penalidad contractual por día de retraso. El cambio llegó a producción sin revisión, sin escaneo automático y desde una laptop. Se detectó por un cliente en redes sociales, no por un control del equipo. El bloqueo manual desde la consola contuvo la exposición, pero dejó el código de infra/ desalineado con la realidad y al proveedor sin acceso.

### Impacto

Exposición de datos: el bucket con 41 300 comprobantes (origen, destino, monto y fecha) estuvo abierto 63 h 25 min. Los nombres de archivo son números correlativos, por lo que cualquier persona podía enumerarlos.
Sin trazabilidad: el bucket no tenía registros de acceso, así que no se sabe cuántos comprobantes se descargaron ni quién los descargó.
Negocio: el proveedor de conciliación sigue sin acceso y el contrato mantiene la penalidad por día de retraso.
Operación: el estado real del bucket (bloqueado a mano) no coincide con el código de infra/.

### Línea de tiempo

| Fecha y hora | Hecho |
|---|---|
| Jue 05/11 15:10 | Comercial informa que el proveedor debe leer comprobantes desde el 06/11, con penalidad por día de retraso. |
| Vie 06/11 09:30 | La tarea se asigna a un desarrollador backend, que nunca había modificado infra/. |
| Vie 06/11 16:20 | El desarrollador pide al proveedor el identificador de su cuenta de AWS y no recibe respuesta. |
| Vie 06/11 17:30 | El desarrollador pide revisión por chat. El líder técnico, en reunión, responde que se verá el lunes. |
| Vie 06/11 17:42 | Commit directo a main (bd600fe) que desactiva el bloqueo de acceso público y agrega una política con Principal "*". |
| Vie 06/11 17:55 | Se ejecuta terraform apply desde una laptop. El proveedor confirma acceso. Inicia la exposición. |
| Sáb 07/11 y Dom 08/11 | Sin alertas: no existe monitoreo de la configuración del bucket. |
| Lun 09/11 08:15 | Un cliente publica el link de un comprobante ajeno, encontrado cambiando el número final de la dirección. |
| Lun 09/11 08:50 | Soporte escala a on-call (35 minutos después de la publicación). |
| Lun 09/11 09:20 | On-call activa el bloqueo de acceso público desde la consola. Fin de la exposición. |
| Lun 09/11 09:25 | El proveedor pierde el acceso. |
| Lun 09/11 11:00 | El equipo busca registros de acceso y descubre que no existen. |
| Mar 10/11 10:00 | Gerencia pide informe y plan de prevención. |

### Causas

1. main no tiene branch protection, por lo que un commit directo con cambios de infraestructura no requiere revisión ni checks.
2. La revisión se pidió por chat en horario de reuniones y se postergó sin una regla de qué hacer con un cambio urgente. No existe un camino de excepción formal que equilibre la penalidad contractual con el riesgo.
3. El conocimiento de Terraform está concentrado en una sola persona, ausente por vacaciones, y no hay un segundo revisor capacitado para infra/.
4. El dato del proveedor (su cuenta de AWS) no llegó a tiempo y no había un procedimiento para esperarlo o para dar acceso temporal seguro. La política quedó con Principal "*" en lugar de la cuenta 111122223333 y el rol conciliacion-lectura.
5. El pipeline ci solo ejecuta pruebas unitarias. No analiza infra/ (Checkov habría fallado con 4 checks de bloqueo de acceso público y con el de Principal "*") ni las dependencias.
6. El despliegue se hace con terraform apply a mano desde la laptop de quien cambia, sin pasar por pipeline ni aprobación
7. El bucket no tiene registros de acceso, versionado ni alertas sobre su configuración, por lo que la exposición se detectó por un cliente y no se puede medir
8. Los comprobantes tienen nombres correlativos predecibles, por lo que un solo link válido permite enumerar el resto
9. El rol de la API tiene s3:* y logs:* sobre Resource "*", mucho más amplio de lo necesario

### Qué funcionó y qué no funcionó

Funcionó:
Soporte escaló a on-call y on-call contuvo la exposición en 30 minutos desde la escalación, con una acción simple desde la consola.
El historial de git permitió reconstruir quién cambió qué y cuándo.

No funcionó:
No hubo detección propia: pasaron 63 h 25 min hasta que lo reportó un cliente, y 35 minutos más hasta que soporte escaló.
El bloqueo manual no se reflejó en el código, así que el siguiente terraform apply reabriría el bucket.
La revisión por chat no tuvo un responsable ni un plazo.
No hay registros que permitan dimensionar el incidente.

### Acciones

| Acción | Rol responsable | Fecha límite |
|---|---|---|
| El equipo activará branch protection en main: pull request obligatorio, una aprobación y checks unit, iac y sca en verde. | Líder técnico | 13/11 |
| El equipo alineará infra/ con el estado real: bloqueo de acceso público activo en el código y política restringida a la cuenta 111122223333 y al rol conciliacion-lectura, y la aplicará solo desde pipeline. | Ingeniera de plataforma | 20/11 |
| El equipo agregará los jobs iac (Checkov) y sca (Trivy) al pipeline ci, con política definida de qué bloquea y qué informa. | Desarrolladores backend | 12/11 |
| El equipo reemplazará el terraform apply manual por un despliegue desde pipeline con aprobación. | Ingeniera de plataforma | 27/11 |
| El equipo activará registros de acceso y versionado en el bucket de comprobantes, y una alerta ante cambios en su configuración de acceso público. | Ingeniera de plataforma | 20/11 |
| El equipo cambiará los nombres de comprobante a identificadores no predecibles y entregará acceso de lectura por URL firmada con vencimiento. | Desarrolladores backend | 04/12 |
| El equipo reducirá los permisos del rol de la API a los buckets y grupos de logs que usa. | Desarrolladores backend | 27/11 |
| El equipo definirá un procedimiento de cambio urgente: quién aprueba fuera de horario, plazo máximo de respuesta y suplente del líder técnico. | Líder técnico | 20/11 |
| El equipo capacitará en Terraform a al menos dos desarrolladores backend para que infra/ tenga un segundo revisor. | Ingeniera de plataforma | 11/12 |
| El equipo revisará con el área comercial cómo se obtiene la cuenta del proveedor antes de comprometer fechas, y otorgará el acceso al proveedor solo con su identificador verificado. | Líder técnico | 20/11 |
| El equipo evaluará, con asesoría legal, si corresponde notificar a las personas cuyos comprobantes pudieron quedar expuestas. | Líder técnico | 16/11 |

### Datos del repositorio

- SHA del commit que introdujo el cambio: bd600fe3307d5aa35bb3acbff8df91e0e02fcf35
- Fecha y hora de ese commit: 06/11/2026 17:42 (UTC-05:00), mensaje "feat(infra): lectura de comprobantes para conciliacion"
- Checks de Checkov que fallan sobre el bucket de comprobantes (checkov -d infra, 28 fallidos en total, 12 sobre el bucket):
  Acceso público (aws_s3_bucket_public_access_block.comprobantes): CKV_AWS_53, CKV_AWS_54, CKV_AWS_55, CKV_AWS_56
  Política con Principal "*" (aws_s3_bucket_policy.conciliacion): CKV_AWS_70
  Bucket (aws_s3_bucket.comprobantes): CKV2_AWS_6, CKV_AWS_18, CKV_AWS_21, CKV_AWS_145, CKV_AWS_144, CKV2_AWS_61, CKV2_AWS_62
  
## A2 · Decisiones

### Decisión 1 · Qué bloquea y qué informa

- Decisión: El pipeline bloqueará los hallazgos que representen una exposición directa de los comprobantes o una vulnerabilidad de severidad alta o crítica. En Checkov, serán bloqueantes los controles relacionados con el acceso público al bucket y con la política que permite acceso universal: CKV_AWS_53, CKV_AWS_54, CKV_AWS_55, CKV_AWS_56 y CKV_AWS_70. Los demás hallazgos de Checkov se informarán y quedarán registrados para su corrección priorizada. En Trivy, las vulnerabilidades de severidad alta o crítica bloquearán el pipeline; las de severidad media, baja o informativa solo se reportarán.
- Dato del repositorio que la sustenta: El postmortem registra 28 hallazgos de Checkov en total, de los cuales 12 corresponden al bucket de comprobantes. El bucket tiene deshabilitado el bloqueo de acceso público mediante CKV_AWS_53, CKV_AWS_54, CKV_AWS_55 y CKV_AWS_56, y la política de aws_s3_bucket_policy.conciliacion utiliza Principal = "*", detectado por CKV_AWS_70. Esta configuración permitió que cualquier persona pudiera leer los 41 300 comprobantes durante 63 h 25 min. La decisión también se relaciona con la acción del postmortem que exige incorporar los jobs iac y sca al pipeline.
- Alternativa descartada y por qué: Se descarta bloquear todos los hallazgos de Checkov y Trivy sin distinguir su impacto, porque se mezclarían riesgos críticos con incumplimientos de menor prioridad y se podría detener el desarrollo sin una evaluación proporcional. También se descarta permitir todos los hallazgos, porque dejaría pasar nuevamente una exposición pública como la ocurrida con el bucket de comprobantes.
- Posición en minoría: La posición minoritaria sostiene que todos los hallazgos de Checkov deberían bloquear el pipeline y que cualquier vulnerabilidad detectada por Trivy debería detenerlo, independientemente de su severidad. Esta posición ofrece mayor rigidez, pero la decisión principal prioriza el riesgo real: bloquear exposiciones públicas y vulnerabilidades altas o críticas, sin ocultar ni eliminar los hallazgos de menor severidad.

### Decisión 2 · La vulnerabilidad sin versión corregida

- Decisión: Reemplazar la librería IP
- Dato del repositorio que la sustenta: Trivy reporta `CVE-2024-29415` (HIGH, sin versión corregida) en `ip` 2.0.1, la última versión publicada. La librería se usa en `src/notificaciones.js:20`, función `validarUrlNotificacion`, mediante `ip.isPrivate(host)`, que es el control anti-SSRF de `POST /comercios/notificacion`. La vulnerabilidad es explotable en el repositorio: `https://[::ffff:127.0.0.1]/` y `https://0/` (`0.0.0.0`) son aceptadas como destinos válidos.
- Alternativa descartada y por qué: Bloquear los despliegues hasta que exista una versión corregida. El mantenedor no ha publicado corrección ni fecha, así que el bloqueo sería indefinido. Además, no retira el código vulnerable que ya corre en producción.
- Posición en minoría: El abogado del diablo defendió bloquear. Su argumento es que reemplazar una librería por lógica propia de validación puede introducir un nuevo bypass, como ocurrió con el parche incompleto de `ip` (CVE-2023-42282 → CVE-2024-29415), y que bloquear garantiza que no se despliega código con un hallazgo HIGH.

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