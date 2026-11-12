# Decisiones · Laboratorio 5

## Equipo

Número de equipo: 03

| Código PUCP | Nombre | Rol | Usuario de GitHub |
|---|---|---|---|
| | | Moderador | |
|20216686 |Juan Andrés Bazán Arteaga | Escriba |JuanBa15 |
| | | Abogado del diablo | |
| | | Guardián del tiempo | |
| | | Integrador | |

## A1 · Postmortem

### Resumen

### Impacto

### Línea de tiempo

| Fecha y hora | Hecho |
|---|---|
| | |

### Causas

### Qué funcionó y qué no funcionó

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

- Decisión: El pipeline bloqueará los hallazgos que representen una exposición directa de los comprobantes o una vulnerabilidad de severidad alta o crítica. En Checkov, serán bloqueantes los controles relacionados con el acceso público al bucket y con la política que permite acceso universal: CKV_AWS_53, CKV_AWS_54, CKV_AWS_55, CKV_AWS_56 y CKV_AWS_70. Los demás hallazgos de Checkov se informarán y quedarán registrados para su corrección priorizada. En Trivy, las vulnerabilidades de severidad alta o crítica bloquearán el pipeline; las de severidad media, baja o informativa solo se reportarán.
- Dato del repositorio que la sustenta: El postmortem registra 28 hallazgos de Checkov en total, de los cuales 12 corresponden al bucket de comprobantes. El bucket tiene deshabilitado el bloqueo de acceso público mediante CKV_AWS_53, CKV_AWS_54, CKV_AWS_55 y CKV_AWS_56, y la política de aws_s3_bucket_policy.conciliacion utiliza Principal = "*", detectado por CKV_AWS_70. Esta configuración permitió que cualquier persona pudiera leer los 41 300 comprobantes durante 63 h 25 min. La decisión también se relaciona con la acción del postmortem que exige incorporar los jobs iac y sca al pipeline.
- Alternativa descartada y por qué: Se descarta bloquear todos los hallazgos de Checkov y Trivy sin distinguir su impacto, porque se mezclarían riesgos críticos con incumplimientos de menor prioridad y se podría detener el desarrollo sin una evaluación proporcional. También se descarta permitir todos los hallazgos, porque dejaría pasar nuevamente una exposición pública como la ocurrida con el bucket de comprobantes.
- Posición en minoría: La posición minoritaria sostiene que todos los hallazgos de Checkov deberían bloquear el pipeline y que cualquier vulnerabilidad detectada por Trivy debería detenerlo, independientemente de su severidad. Esta posición ofrece mayor rigidez, pero la decisión principal prioriza el riesgo real: bloquear exposiciones públicas y vulnerabilidades altas o críticas, sin ocultar ni eliminar los hallazgos de menor severidad.

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
