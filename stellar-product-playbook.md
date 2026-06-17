# Stellar Product Playbook — Guía para Construir (o Redirigir) un Producto en Stellar

> **Propósito de este documento.** Este archivo consolida la investigación de mercado, los criterios de validación, las lecciones técnicas y la guía de financiamiento del ecosistema Stellar (estado: junio 2026). Está escrito para que un agente de IA (Claude u otro) lo lea junto con la documentación de un proyecto existente y ayude a **evaluar y redirigir ese proyecto** hacia un hueco real, defendible y financiable.
>
> **Cómo usarlo (instrucciones para el agente que lo lea):**
> 1. Lee primero la base del proyecto existente del usuario.
> 2. Aplica el "Filtro de 6 preguntas" (Sección 3) al proyecto actual.
> 3. Identifica en qué "cubo de oportunidad" (Sección 4) cae o podría caer.
> 4. Corre el "Test ¿Ya existe?" (Sección 5) con búsqueda web real, NO de memoria.
> 5. Propón 1-3 redirecciones concretas usando los huecos de la Sección 6.
> 6. Sé honesto sobre riesgos. Una idea sin riesgos nombrados es una idea no analizada.

---

## 1. Contexto del ecosistema Stellar (Q1-Q2 2026)

Datos clave para entender hacia dónde se mueve la red y qué está validado por el mercado:

- **Los RWA (activos del mundo real) son la ola de mayor crecimiento.** El market cap de RWAs (sin stablecoins) creció ~91% en un trimestre, de ~$796M a ~$1.52B, superando $2B en abril 2026. Impulsado por tesoros tokenizados: USDY de Ondo, fondos de Spiko (EUTBL/USTBL). Société Générale lanzó su euro stablecoin (EURCV) en la red. Templar habilitó préstamos contra RWAs (composabilidad DeFi).
- **Pagos agénticos (AI agents que pagan) es la frontera caliente pero inmadura.** x402 lanzó en marzo 2026; Machine Payments Protocol (MPP) en abril. Hay una explosión de infraestructura (gateways, facilitators, SDKs) pero casi ningún producto de consumo encima. El espacio de *herramientas* se está saturando; el de *aplicaciones de usuario final* está vacío.
- **El Stellar Community Fund (SCF)** procesó ~1,163 abstracts y premió ~154 proyectos con ~$14.4M en 2025 (~$93K promedio/proyecto, ~25% tasa de aprobación). Hay financiamiento real disponible si llenas un hueco genuino.
- **Diagnóstico de la industria que valida la tesis "web3 invisible":** la adopción de consumo sigue estancada porque la mayoría de las apps las construyen insiders de crypto para insiders de crypto, sin resolver problemas financieros reales de forma amigable.

---

## 2. Principios de producto innegociables ("web3 invisible")

El patrón que comparten TODOS los casos de éxito de consumo en Stellar (Félix Pago, Meru, Decaf, MiniPay, Airtm):

1. **Interfaz familiar.** WhatsApp, app simple, o flujo web sin descarga. El usuario nunca ve la palabra "blockchain", "seed phrase", "gas" ni "wallet address".
2. **Stablecoin como motor invisible.** USDC (o stablecoin local) hace el trabajo; el usuario piensa en "dólares" o en su moneda local.
3. **Rampa a los rails que la gente YA usa.** SINPE (Costa Rica), PIX (Brasil), Mercado Pago (Argentina), MoneyGram, anchors locales. El onboarding ideal ES recibir/mover dinero, no "entrar a crypto".
4. **Onboarding sin fricción técnica.** Passkeys (Face ID / huella) en vez de seed phrases; fees patrocinados (el usuario no paga ni entiende el gas); claimable balances para enviar dinero a quien aún no tiene cuenta.

**Stack técnico recurrente que habilita esto:** passkey-kit + smart wallets + Launchtube (fees patrocinados) + USDC + contratos Soroban + red de anchors. El usuario nunca lidia con fees, sequence numbers ni llaves.

---

## 3. El Filtro de 6 preguntas (aplicar a CUALQUIER idea)

Toda idea de producto debe pasar este filtro antes de escribir una línea de código. Si falla varias, redirige o mata la idea.

1. **¿El dolor es real y cuantificable?** ¿El usuario pierde dinero/tiempo medible hoy? ¿O es un "nice to have" que nadie pidió?
2. **¿La blockchain es estructuralmente necesaria, o es decorativa?** Pregunta clave: *"¿Este producto puede existir sin blockchain?"* Si la respuesta es "sí pero peor", es débil. Si es "no, porque sería ilegal/imposible/antieconómico sin ella", es fuerte. (Ej: lo no-custodial evita licencias de transmisor de dinero; fees de fracción de centavo hacen viable un pago de $0.50 que es *imposible* en rails bancarios).
3. **¿Por qué Stellar y no otra cadena?** Finalidad ~5s, fees de fracción de centavo, USDC nativo maduro, passkeys/smart wallets, y sobre todo la **red de anchors + MoneyGram** para la última milla a moneda local/efectivo. Esto último es el diferenciador real frente a Ethereum/Solana/Base.
4. **¿Quién paga y desde el día uno?** ¿Hay modelo de ingresos claro? B2B con ventas directas suele ser más sólido que consumo viral sin monetización.
5. **¿Hay que educar/inculcar un hábito nuevo, o se monta sobre uno existente?** Desplazar un hábito que ya funciona ("suficientemente bueno") es el asesino silencioso. Habilitar transacciones que HOY no ocurren (por miedo/imposibilidad) es mucho más fuerte.
6. **¿Cuál es la ventaja defendible (moat)?** En un ecosistema con hackathons mensuales, **las ideas son commodity**. El moat viene de: un corredor geográfico específico, distribución, estructura regulatoria difícil de replicar, o ejecución superior con clientes reales — NO de "tener la idea".

---

## 4. Los tres cubos de oportunidad reales

En 2026, **no existe la idea buena y desocupada esperando ser encontrada.** Toda idea buena tiene 3-8 equipos circulándola. La elección real no es "qué idea sin competencia", sino "en cuál de estos cubos quiero competir y con qué precio de entrada":

### Cubo A — RFPs oficiales del SCF (demanda garantizada y pagada por escrito)
- **Qué es:** Stellar publica RFPs trimestrales = lista literal de "cosas que la red necesita y nadie ha construido". Hay hasta ~$150K esperando.
- **Precio de entrada:** es trabajo de infraestructura/tooling, no tu startup soñada.
- **Ejemplos vistos:** Trustline Onboarder (UX de onboarding sin fricción), Passkey UI SDK, Account Demolisher, Contract Source Verification (un "Sourcify para Soroban"), OZ Accounts Policy Builder (políticas de gasto para agentes IA).

### Cubo B — Huecos confirmados por la comunidad sin responder
- **Qué es:** necesidades verbalizadas en Discord/foros que nadie ha llenado.
- **Precio de entrada:** suelen ser proyectos chicos; pagan en reputación rápida, no en gran negocio.
- **Ejemplo visto:** un dashboard (tipo Dune) que rastree eventos x402/MPP en Stellar — preguntado en Discord, sin respuesta.

### Cubo C — Espacios con "carpas embrionarias" donde se gana por ejecución
- **Qué es:** áreas validadas (otros las están oliendo) pero sin nadie con tracción real. Aquí se construye una empresa.
- **Precio de entrada:** aceptar competencia y que tu ventaja venga de **hablar con 15 clientes reales antes que los demás**.
- **Ejemplos vistos:** trade escrow para PyMEs (asegurar adelantos a proveedores), tesorería B2B con yield (RWAs invisibles).

---

## 5. El test "¿Ya existe?" (CRÍTICO — usar búsqueda web real)

La pregunta "¿ya existe?" mata el 90% de las malas decisiones, pero hay que aplicarla con el criterio correcto.

**La escalera de "existe" (un repo de GitHub NO es competencia real):**

```
Descripción → Repo → Testnet → Mainnet → Usuarios → Ingresos → Moat
   (1)         (2)      (3)        (4)        (5)        (6)      (7)
```

- **Escalones 1-3 (descripción/repo/testnet):** NO es un bloqueo. Casi todo lo que se encuentra en hackathons y listas de GitHub vive aquí. Validan que la tesis es correcta (otros la huelen) sin quitarte el camino.
- **Escalones 4-7 (mainnet con usuarios/ingresos/moat):** ESTO sí es competencia real. Si alguien tiene tracción y ventaja defendible en TU segmento exacto, redirige.

**Cómo correr el test correctamente:**
- SIEMPRE con búsqueda web fresca, nunca de memoria (los datos de mercado cambian).
- Verifica el ESCALÓN, no solo el nombre. "Existe Neko Protocol" resultó ser un repo de oráculo de precios (escalón 2), no un competidor.
- Distingue el PRODUCTO, no el ingrediente. Dos productos pueden usar tesoros tokenizados (mismo ingrediente) y ser cosas totalmente distintas (brokerage retail vs. cuenta de tesorería B2B = distinto comprador, venta, regulación).
- El criterio de descarte NO es "alguien lo describió" — es "alguien tiene tracción + moat en mi segmento exacto".

**Casos reales de este test (referencia):**
- *Thalos* (escrow freelance) → escalón 1-2: GitBook de una página + prototipo en v0.app. No competidor operativo.
- *Neko Protocol* (RWA marketplace) → escalón 2: repo de oráculo de precios. La frase "marketplace" es aspiracional.
- *Airtm* (payouts a microtrabajadores/data-labeling vía Stellar) → escalón 6-7: 3M+ trabajadores, API empresarial, ~mitad de sus payouts ya en Stellar, clientes como Sapien (datos de IA). **Espacio TOMADO.** Visa, Mural Pay, Reap también entrando.

---

## 6. Mapa de saturación del ecosistema (dónde NO entrar y dónde sí)

### 🔴 ZONA ROJA — hipersaturado (no entrar sin diferenciador brutal)
- **Wallets de remesas/pagos para mercados emergentes** (30+ variantes: Bexo, Hurupay, PeerPesa, Kasi Money, DomiPago, etc.)
- **Payroll/nómina cripto** (8+ equipos: OrbitPay, StelloPay, Quipay, Fluxora, Flux-DeFi, AfriWage, Protocol-Guild...)
- **"El Stripe de Stellar" / gateways de pago** (OrbitStream, Link2Pay, FacilPay, Ding...)
- **Learn-to-earn con NFTs/certificados** (7+: ChainLearn, LearnVault, learnault, SkillCert...)
- **Crowdfunding/donaciones** (KindFi, Boundless, Juntta, GiveHub, GrantFox...)
- **SDKs y dev tooling genérico** (decenas)
- **Infraestructura de pagos agénticos** (x402 gateways/facilitators/skills — saturándose en tiempo real en 2026)

### 🟡 ZONA AMARILLA — 1-2 ocupantes (competible con ángulo distinto)
- **Ahorro grupal / tandas / ROSCAs:** Vaquita (gamificado), Clixpesa (chamas). Hueco libre: score crediticio portable construido sobre historial de tandas.
- **Escrow:** Trustless Work es el estándar de infraestructura (API/SDK maduros, mainnet, SCF). Encima construyen OfferHub, ArcusX, Boundless, MERCATO, Thalos, SafeTrust. **Construir SOBRE Trustless Work (no competirle) = califica para Integration Track del SCF.**
- **Cashback/lealtad:** Loop, Tipper, QuillTip.

### 🟢 ZONA VERDE — casi vacío (huecos reales, junio 2026)
- **Pagos offline / conectividad intermitente:** ~1 proyecto (Payala, StellarConduit). Enorme para zonas rurales.
- **Seguros / protección paramétrica:** casi nada. Microseguros climáticos (pago automático si llueve menos de X vía oráculo), seguro de cancelación para turismo.
- **Mercados de predicción:** la categoría consumer que más creció en crypto, con CERO representantes maduros en el catálogo SCF. ⚠️ Ojo: riesgo regulatorio de apuestas — formatos privados/de habilidad son zona más segura, requiere análisis legal por jurisdicción.
- **Trade finance / mini cartas de crédito para PyMEs:** escrow de comercio internacional (asegurar adelantos a proveedores). Brecha global de trade finance = ~$2.5 billones; 41% de solicitudes de PyMEs rechazadas por bancos. Validado por Alibaba Trade Assurance (pero solo dentro de Alibaba). SendXpress lo huele (escalón 1).
- **Tesorería B2B con yield invisible:** cuenta empresarial en dólares que barre saldo ocioso a tesoros tokenizados (4-5%) + pagos internacionales. "El Mercury de mercados emergentes". $2B+ en RWAs institucionales sin NI UN producto de consumo encima. ⚠️ Barrera = estructura regulatoria (valores) — que es también el moat.
- **Trazabilidad agrícola:** ~1 proyecto (AgTrail). Ángulo local fuerte para países agroexportadores (café/piña/banano bajo EUDR europeo).
- **Ticketing/eventos:** ~1-2 (Fewticket, BuidlZone).

### Huecos geográficos
- Los anchors/ramps financiados cubren México, Colombia, Brasil, Argentina, Nigeria, Kenia, Ghana. **Centroamérica (Costa Rica/SINPE) está desatendida.** Cualquier vertical de consumo construido sobre un corredor centroamericano tiene un moat que los 30 wallets genéricos no tienen.

---

## 7. Lecciones de diseño de producto (de los casos analizados)

### Sobre escrows y "confianza entre desconocidos"
- **El valor central que una blockchain hace genuinamente mejor que web2 es: confianza entre desconocidos.** Despojado de ruido, ese es el caso de uso defendible.
- **Regla de oro del escrow físico:** el bien y el dinero nunca deben estar separados en manos opuestas. Secuencia correcta: confirmar → liberar (5s) → entregar. El producto debe hacer casi imposible entregar antes de liberar (UI clara + handshake por QR simultáneo).
- **El problema del oráculo es real y hay que nombrarlo:** un smart contract NO ve el mundo físico. El escrow no elimina el fraude por magia; **comprime la ventana de vulnerabilidad** y elimina las dos estafas más comunes (comprobante falso, depósito-por-adelantado a algo inexistente). Para lo demás: evidencia + arbitraje + consecuencias reputacionales.
- **El encuentro presencial simultáneo NO necesita escrow** (el vendedor ve el SINPE acreditado y entrega — "suficientemente bueno"). Donde el escrow SÍ gana es donde dinero y bien están **separados en tiempo o espacio:** apartados, encargos, adelantos a contratistas, compra a distancia, depósitos de garantía, comercio transfronterizo. **El producto no es "compraventa segura en persona" — es "pagá por adelantado sin miedo".**
- El depósito en escrow es además el **mejor filtro anti-flake** que existe: quien bloquea fondos aparece; los curiosos nunca llegan a ese paso.
- La **renegociación in situ** (enmienda mutua de precio con 2 toques) es indispensable: sin ella, los tratos se caen en el parqueo y cierran en efectivo.

### Sobre reputación
- **La reputación verificable es feature de RETENCIÓN, no gancho de ADQUISICIÓN.** Nadie descarga una app para "construir historial". No la pongas en el centro del marketing de adquisición.
- En B2B sí importa más (el historial del contraparte es lo primero que se pregunta antes de girar un adelanto).
- Su valor real-técnico: es portable e inmutable (imposible en web2, donde cualquier DB centralizada puede editarla/venderla/borrarla — por eso ninguna plataforma la ofrece: su modelo de negocio ES el secuestro de la reputación).

### Sobre el modelo de negocio
- Comisión por transacción (1-1.5%) es el piso. Pisos adicionales: servicios premium por trato (verificación, inspección, contratos), yield del float (con cuidado legal sobre de quién es el rendimiento), y API white-label a marketplaces/plataformas (el verdadero juego de escala).
- **B2B con ticket alto + ingreso recurrente sobre saldos > comisión por transacción que hay que ganarse cada vez.** Ej: tesorería = ~300-500 clientes fieles; payouts por transacción = decenas de miles de tratos.
- Comparable de salida (exit) en estos espacios: Caramel (compraventa de autos P2P con verificación + pagos) levantó $33M y fue adquirida por eBay (ene 2025).

---

## 8. Lecciones técnicas (de los canales de desarrollo)

### Sobre Soroban / criptografía
- Soroban tiene host functions para BLS12-381 (útil para pruebas/commitments tipo Pedersen, votación anónima). NO tiene curve25519 más allá de verificación de firmas.
- Para commitments: se puede usar BLS12-381 en G1 (más barato, suficiente) sin pairings. La privacidad de consumo (confidential transfers, privacy pools) está naciendo pero inmadura.

### Sobre pagos agénticos (x402 / MPP) — leer con escepticismo
- **Crítica documentada y válida:** x402 en su forma actual no maneja batching, streams ni sesiones. "No querés golpear la red de pagos en cada llamada diminuta de API." Para suscripciones/sesiones, el modelo de payment channels (MPP) o batching (Circle "nanopayments") es superior.
- **Problemas operativos reales reportados:** el OZ facilitator con latencias de 20+ segundos y errores 401; equipos cayendo a verificación manual vía Horizon RPC. Hay hueco para un facilitator robusto y neutral.
- **El gap filosófico de consumo:** toda la infraestructura existe, pero NADIE construyó la experiencia donde una persona normal delega gasto a un agente con límites comprensibles ("máx $X/mes, solo estas categorías, avisame antes de pasar de $Y"). Escepticismo sano del propio ecosistema: "¿dejarías que un LLM gaste tu dinero?" — la mayoría dice no. Ese escepticismo ES la oportunidad de producto (la capa de confianza/control), pero también la razón de que el mercado de usuarios finales siga siendo especulativo en 2026.

### Sobre compliance (no opcional)
- On/off-ramps los hace un proveedor licenciado que ya hace KYC en su flujo — no lo construyes tú.
- El diseño **no-custodial** (fondos en el contrato, nunca en tu cuenta) es lo que te aleja de ser "transmisor de dinero" regulado. Es razón de negocio, no detalle técnico.
- Para montos altos / B2B transfronterizo: KYB (conocer ambas empresas) y screening de sanciones son parte del producto desde el día uno.
- **Distribuir instrumentos que rinden (tesoros tokenizados = valores) tiene perímetro legal serio por país.** Es barrera de entrada Y moat. Requiere estructura legal real desde el inicio.
- ⚠️ Disclaimer permanente: esto NO es asesoría legal. El perímetro regulatorio (custodia, AML, valores, apuestas) varía muchísimo por jurisdicción y requiere abogado antes de lanzar.

---

## 9. Guía del Stellar Community Fund (SCF)

- **Tracks relevantes:**
  - *Open Track:* ideas nuevas de producto.
  - *Integration Track:* construir SOBRE infraestructura ya financiada (Trustless Work, Blend, DeFindex, anchors). **Menos competencia, menor riesgo técnico (building blocks auditados). Ruta recomendada para equipos nuevos con idea de producto.**
  - *RFP Track:* responder a las necesidades publicadas por Stellar (ver Cubo A).
  - *Public Goods Award:* bienes públicos / OSS.
- **Punto de entrada para equipos nuevos / poca experiencia en Stellar:** Instawards (fondos pequeños acelerados vía capítulos de embajadores locales).
- **Lo que diferencia una submission ganadora en 2026:** el formato del research/PRD/draft ya es commodity (cualquiera lo genera con IA — ej. el paquete `stellar-build`). Lo único que separa submissions es lo que ningún skill puede generar: **evidencia de campo** — "hablé con N clientes reales, esto dijeron", usuarios en testnet, cartas de intención, un corredor/distribución concreta.

### Herramienta útil del ecosistema
- `kaankacar/stellar-build`: instalador de 42 skills + datos curados (728 proyectos LumenLoop, 9,027 repos Electric Capital, skills SCF, skill oficial de dev de Stellar). Experimental. Útil para: chequeo competitivo contra los 728 proyectos, `scf-round-watcher` (qué ronda está abierta), `scf-submission-drafter`. ⚠️ Higiene: es `curl|bash` de repo personal — leer el `install.sh` y usar instalación sandboxed (`--prefix`) antes de la global.

---

## 10. Plan de validación pre-código (el paso que casi nadie da)

Antes de escribir una línea, validar con campo real. Esto vale más que cualquier research generado por IA:

1. **Identificar 10-15 usuarios reales** del segmento exacto (ej: PyMEs importadoras, dealers, vendedores de alto valor en Marketplace).
2. **Validar 3 cosas:** (a) ¿cuánto mueven/adelantan/pierden hoy? (b) ¿qué han perdido por el problema? (c) ¿pagarían 1-1.5% por eliminar el riesgo?
3. **Criterio go/no-go:** si <50% confirma dolor + disposición a pagar, redirige o mata.
4. **MVP mínimo (8 semanas):** lo suficiente para demostrarle a UN primer cliente el momento mágico (ej: "tus fondos están bloqueados y verificables" / "tu trabajador cobró en 5 segundos").
5. **El momento mágico vende el producto, no la liberación final.** Identifícalo y ponlo en el centro (ej: en escrow P2P el momento mágico es *verificar que la plata de un desconocido existe y está reservada*, no el pago final).

---

## 11. Checklist final para redirigir el proyecto existente

Cuando leas la base del proyecto del usuario, responde explícitamente:

- [ ] ¿En qué escalón de la "escalera de existe" está el proyecto actual? (¿tiene usuarios/ingresos o es idea/repo?)
- [ ] ¿Pasa el Filtro de 6 preguntas? ¿Cuáles falla?
- [ ] ¿En qué zona de saturación cae? (roja/amarilla/verde)
- [ ] ¿La blockchain es necesaria o decorativa en este proyecto?
- [ ] ¿Por qué Stellar específicamente para este caso?
- [ ] ¿Quién paga y desde cuándo?
- [ ] ¿Hay un ángulo geográfico/corredor que dé moat? (ej: Centroamérica desatendida)
- [ ] ¿Se puede reposicionar de "desplazar hábito existente" a "habilitar transacción que hoy no ocurre"?
- [ ] ¿Se puede mover de Open Track a Integration Track construyendo sobre infra existente?
- [ ] ¿Cuál sería el competidor real (escalón 4+) que hay que verificar con búsqueda web?
- [ ] 1-3 redirecciones concretas, cada una con su riesgo principal nombrado.

---

## Apéndice: proyectos de referencia mencionados (por escalón aproximado)

**Tracción real (escalón 4-7):** Trustless Work (escrow infra), Blend (~$80M+ TVL lending), Aquarius/Soroswap (DEX), Token Tails (juego play-to-save, 2º protocolo más activo de la red, ~111K tx/mes), Airtm (payouts a 3M+ trabajadores), Félix Pago (remesas WhatsApp), Meru (ahorro+yield freelancers), Decaf (wallet remesas no-custodial), Ondo/Spiko (tesoros tokenizados), CashAbroad (treasury).

**Embrionarios / aspiracionales (escalón 1-3):** Thalos, Neko Protocol, SendXpress, y la mayoría de la lista de ~90 orgs de GitHub del circuito de contribución (payroll ×8, learn-to-earn ×7, escrow varios, "Stripe de Stellar" ×4).

**Piezas del ecosistema que se pueden REUSAR (no competir):** Trustless Work (escrow), Slice (resolución de disputas con jurados), bridgelet (cuentas efímeras para onboarding), ACTA (credenciales verificables), QuickLendX/TradeFlow (factoring de facturas, complemento río abajo de un trade escrow), SDP (plataforma de desembolsos de SDF).

---

*Documento generado a partir de investigación del ecosistema Stellar (RFPs del SCF, reporte Messari Q1 2026, catálogo LumenLoop de 728 proyectos, canales de desarrollo, y análisis competitivo de productos web2/web3). Estado: junio 2026. No constituye asesoría legal ni financiera.*
