resource "aws_cloudwatch_log_group" "api" {
  name              = "/aws/lambda/${var.proyecto}-api-${var.ambiente}"
  retention_in_days = 7
}

resource "aws_lambda_function" "api" {
  function_name = "${var.proyecto}-api-${var.ambiente}"
  role          = aws_iam_role.api.arn
  package_type  = "Image"
  image_uri     = "${aws_ecr_repository.api.repository_url}:${var.version_imagen}"
  timeout       = 10
  memory_size   = 256

  environment {
    variables = {
      BUCKET_COMPROBANTES = aws_s3_bucket.comprobantes.bucket
    }
  }

  lifecycle {
    ignore_changes = [image_uri]
  }

  depends_on = [aws_cloudwatch_log_group.api]
}

resource "aws_lambda_function_url" "api" {
  # Excepción temporal (DECISIONES.md · Decisión 3). Responsable: líder técnico. Vence: 11/12/2026.
  # Condición: antes del vencimiento la API valida el token de sesión de la app móvil
  # (en el handler o con un autorizador JWT). Si no se cumple, se elimina esta línea y CKV_AWS_258 vuelve a bloquear.
  #checkov:skip=CKV_AWS_258:Excepcion temporal Decision 3 - app movil no firma SigV4 - responsable lider tecnico - vence 11/12/2026
  function_name      = aws_lambda_function.api.function_name
  authorization_type = "NONE"
}
