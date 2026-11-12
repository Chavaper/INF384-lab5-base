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

- Decisión: El pipeline debe bloquear los hallazgos de Checkov que permitan exposición pública del bucket de comprobantes. Los demás hallazgos de infraestructura se reportarán como informativos mientras el equipo evalúa su corrección. Trivy debe bloquear vulnerabilidades de severidad alta o crítica presentes en las dependencias utilizadas por la aplicación
- Dato del repositorio que la sustenta: En infra/s3.tf, el bucket aws_s3_bucket.comprobantes permite explícitamente acceso público: (1) block_public_acls = false; (2) block_public_policy = false; (3) ignore_public_acls = false; (4) restrict_public_buckets = false; (5) Política Principal = "*"; (6) Acción s3:GetObject. Esto permite que cualquier usuario lea los comprobantes almacenados. Además, package-lock.json contiene versiones antiguas de lodash e ip, por lo que sus vulnerabilidades deben ser evaluadas por Trivy.
- Alternativa descartada y por qué: Se descarta bloquear absolutamente todos los hallazgos de Checkov y Trivy, porque eso podría detener el desarrollo por problemas que no representan una exposición inmediata o que requieren una decisión posterior, como la vulnerabilidad sin versión corregida de la decisión 2. También se descarta permitir todos los hallazgos, porque dejaría pasar el bucket de comprobantes públicamente accesible.
- Posición en minoría: La posición minoritaria sostiene que todos los hallazgos de seguridad deberían bloquear el pipeline desde el primer momento, incluso los informativos. Sin embargo, la posición principal considera que el bloqueo debe priorizar riesgos explotables y directamente relacionados con la confidencialidad de los comprobantes, manteniendo trazabilidad de los demás hallazgos.

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
