# Flujo del Sistema

## Casos de uso del usuario (cliente final)

1. Se identifica con su wallet.
2. Llena el formulario con su información personal.
3. Autoriza que la API genere su scoring.
4. Autoriza que su score sea enviado al prestamista.

## Casos de uso del prestamista (plataforma DeFi)

1. Integra la API como proveedor de scoring.
2. Solicita el scoring de un usuario específico.
3. Recibe el scoring verificado.
4. Verifica la autenticidad en Soroban.
5. Decide otorgar el crédito.

## Casos de uso de la API (intermediario)

1. Recibe la identidad del usuario (wallet).
2. Procesa la información del formulario.
3. Genera el scoring.
4. Envía el score al prestamista autorizado.
5. Publica/verifica el score con Soroban.
