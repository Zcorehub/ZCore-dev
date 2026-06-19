export interface UserFacingError {
  title: string
  description: string
  code?: string
}

export function mapApiError(
  statusCode: number,
  message?: string
): UserFacingError {
  const normalized = (message ?? "").toLowerCase()

  if (statusCode === 401 && normalized.includes("signature")) {
    return {
      code: "INVALID_SIGNATURE",
      title: "Firma no válida",
      description:
        "No pudimos verificar tu firma. Revisa que tu wallet esté en la red correcta e intenta de nuevo.",
    }
  }

  if (statusCode === 404) {
    return {
      code: "NOT_FOUND",
      title: "Wallet no registrada",
      description: "Esta wallet aún no tiene cuenta en ZCore. Regístrate primero.",
    }
  }

  if (statusCode === 429) {
    return {
      code: "RATE_LIMITED",
      title: "Demasiados intentos",
      description: "Espera un momento antes de volver a intentar.",
    }
  }

  if (statusCode === 503 && normalized.includes("attestation")) {
    return {
      code: "ATTESTATION_UNAVAILABLE",
      title: "Attestation no disponible",
      description:
        "La attestation on-chain aún no está configurada en este entorno.",
    }
  }

  if (statusCode >= 500) {
    return {
      code: "SERVER_ERROR",
      title: "Servicio no disponible",
      description:
        "El servidor no está disponible temporalmente. Intenta de nuevo en unos minutos.",
    }
  }

  if (statusCode === 0) {
    return {
      code: "NETWORK_ERROR",
      title: "Error de conexión",
      description: "No se pudo conectar con la API. Verifica tu conexión a internet.",
    }
  }

  return {
    code: "UNKNOWN",
    title: "Algo salió mal",
    description: message ?? "Ocurrió un error inesperado. Intenta de nuevo.",
  }
}

export function formatUserFacingError(error: UserFacingError): string {
  return `${error.title}. ${error.description}`
}
