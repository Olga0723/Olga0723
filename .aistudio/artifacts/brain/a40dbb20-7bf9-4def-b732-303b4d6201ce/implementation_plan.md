# Sincronización Automática Continua con Google Sheets - Inducción SENA (Acuerdo 002 de 2026)

Plan de arquitectura y flujo para conectar el prototipo de inducción normativa con la hoja de cálculo de la instructora Olga de forma 100% automatizada, eliminando la necesidad de iniciar sesión en popups, lidiar con errores 403 de Google Cloud o configurar el prototipo en cada uso.

## Decisiones Críticas y Confirmación del Usuario

> [!IMPORTANT]
> A partir de tu respuesta (**Opción 2**), hemos estructurado el sistema para que la sincronización se ejecute de manera autónoma en segundo plano cuando el aprendiz culmina exitosamente su evaluación final y genera su certificado, sin interrumpir la experiencia de aprendizaje ni obligar a la instructora a reconfigurar accesos continuamente.

- **Método de Enlace Autónomo (Cero Fricción)**: Desacoplamiento de las ventanas emergentes (popups) de OAuth 2.0 que causaban bloqueos por pantalla de consentimiento (`auth/popup-closed-by-user` y `Error 403`). Se implementa un **Webhook de Google Apps Script / Endpoint Autónomo** de una sola vía (o descarga estructurada en segundo plano), donde los datos viajan directamente sin solicitar credenciales interactivas en el navegador.
- **Momento de Disparo**: Automático e inmediato al momento en que el aprendiz aprueba el examen final con $\ge 80\%$ y se emite su código único de certificación bajo el Acuerdo 002 de 2026.
- **Tolerancia a Fallos y Modo Offline**: Cola persistente en `localStorage`/`IndexedDB` que almacena los registros de inducción; si el usuario no tiene conexión en ese instante, el sistema reintenta la sincronización automáticamente en segundo plano cuando se restablece la red.
- **Visibilidad y Notificaciones**: Notificación toast discreta y elegante que confirma la sincronización exitosa del aprendiz en la hoja de seguimiento de la Ficha 2824190 sin bloquear la pantalla.

---

## 1. Visión General y Concepto Central

- **Qué hace**: Automatiza el flujo completo de telemetría de inducción. Tan pronto como un aprendiz completa su formación reglamentaria y obtiene su certificación, el sistema recopila sus metadatos (nombre, documento, puntaje del examen, módulos aprobados, código de certificado y fecha/hora) y los transmite de forma silenciosa a la hoja de Google Sheets designada, actualizando la pestaña "Registro de Aprendices" y "Seguimiento Ficha 2824190".
- **Audiencia Objetivo**: Instructora SENA Olga (`olgainstructora0723@gmail.com`) y aprendices del Centro de Tecnologías para la Construcción y la Madera (Regional Distrito Capital).
- **Valor Clave**: La instructora no tiene que tocar ni configurar el prototipo cada día; la información se consolida en su hoja en tiempo real, garantizando trazabilidad total del Acuerdo 002 de 2026 sin fricciones técnicas.

---

## 2. Experiencia de Usuario y Diseño Visual

### Flujos Principales de Usuario
1. **Flujo del Aprendiz (Transparente y Satisfactorio)**:
   - El aprendiz desarrolla los 6 módulos normativos (Derechos, Deberes, Prohibiciones, Trámites, Faltas y Procedimiento Sancionatorio).
   - Ingresa a la Evaluación Final (10 preguntas de casos reales).
   - Al obtener $\ge 80\%$, pulsa "Generar Certificado Oficial".
   - En ese mismo instante, el prototipo:
     - Emite el certificado con código único verificable.
     - Dispara la sincronización automática en segundo plano hacia la hoja de cálculo.
     - Despliega un toast sutil: *"✓ Registro sincronizado automáticamente en la hoja de inducción Ficha 2824190"*.
2. **Flujo de la Instructora (Cero Mantenimiento)**:
   - Abre su hoja de cálculo de Google Drive o el panel de instructora en el prototipo.
   - Observa las nuevas filas añadidas o actualizadas con colores institucionales SENA (#39A900), con porcentaje de progreso y fecha exacta.
   - Cuenta con una pestaña de configuración única de 1 solo clic donde puede verificar el estado de la conexión en vivo ("🟢 Enlace activo").

### Identidad Visual y Tema
- **Estética**: Institucional SENA, moderna, sobria y de alta legibilidad (anti-slop, sin píldoras decorativas vacías).
- **Paleta de Colores**:
  - Verde Institucional SENA: `#39A900` (`emerald-600` / `sena-green`)
  - Acentos de Éxito / Estado: `#0D6EFD` (Sincronizando) y `#198754` (Sincronizado)
  - Fondo Claro: `#F8FAFC` (`slate-50`) con tarjetas en blanco puro y bordes de 1px (`border-slate-200`)
  - Modo Oscuro: `#0F172A` (`slate-900`) con bordes `#334155` y texto de alto contraste WCAG AA.
- **Tipografía**:
  - Encabezados: Sans-serif limpia con peso `font-semibold` / `font-bold`.
  - Cifras y Metadatos: `tabular-nums font-mono` para puntajes, fechas y números de documento para evitar saltos visuales.
- **Micro-interacciones y Feedback**:
  - Indicador de estado discreto en la barra superior: un punto pulsante verde (`animate-pulse`) cuando transmite, convirtiéndose en visto verde fijo al confirmar recepción.
  - Almacén de auditoría local para revisar los últimos envíos sin salir del aplicativo.

---

## 3. Decisiones de Producto y Compensaciones (Trade-Offs)

### Decisión 1: Webhook Autónomo vs. OAuth 2.0 con Ventana Emergente
- **Enfoque Elegido**: Webhook de Apps Script / Endpoint sin popup en ejecución de clientes.
- **Por qué**: Los popups de Google OAuth en iframes cerrados generan `auth/popup-closed-by-user` y requieren que la app esté en modo Producción verificada por Google para evitar el error 403. Un Webhook o sincronizador por URL autorizada permite que el navegador envíe un `POST` JSON directo sin requerir que cada aprendiz inicie sesión con una cuenta de Google corporativa en ese momento.
- **Alternativa Descartada**: Forzar inicio de sesión Google en cada aprendiz; generaba bloqueos de navegador, ventanas emergentes cerradas y frustración del usuario.

### Decisión 2: Disparo por Evento de Certificación (Opción 2)
- **Enfoque Elegido**: La sincronización principal se activa al certificar el aprendiz (alcanzando el 100% y aprobando la evaluación), con sincronización secundaria silenciosa al cerrar el panel.
- **Por qué**: Evita saturar la cuota de peticiones de Google Sheets durante el estudio interactivo y garantiza que la fila registrada contenga el puntaje final consolidado y el código de certificado definitivo.
- **Alternativa Descartada**: Disparar una petición HTTP en cada clic de módulo; provocaba ráfagas innecesarias y registros incompletos.

### Decisión 3: Cola Local Resiliente (Offline-First)
- **Enfoque Elegido**: Guardar cada evento en la cola `sena_sync_queue` de `localStorage`.
- **Por qué**: Si la instructora o el aprendiz pierden conexión momentáneamente o Google responde con demora, el registro queda a salvo y se sincroniza automáticamente en el siguiente reintento sin intervención manual.

---

## 4. Arquitectura Técnica y Estrategia de Datos

### Diagrama del Sistema y Flujo de Sincronización

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PROTOTIPO DE INDUCCIÓN SENA                   │
│                                                                        │
│   ┌───────────────────────┐             ┌──────────────────────────┐   │
│   │   Aprendiz Completa   │             │   Instructor Dashboard   │   │
│   │   Módulos Normativos  │             │   (Monitoreo en tiempo   │   │
│   └──────────┬────────────┘             │    real Ficha 2824190)   │   │
│              │                          └─────────────▲────────────┘   │
│              ▼                                        │                │
│   ┌───────────────────────┐                           │                │
│   │   Evaluación Final    │                           │                │
│   │   (Aprobado >= 80%)   │                           │                │
│   └──────────┬────────────┘                           │                │
│              │                                        │                │
│              ▼                                        │                │
│   ┌───────────────────────┐                           │                │
│   │ Emisión Certificado   │                           │                │
│   │ (Acuerdo 002 de 2026) │                           │                │
│   └──────────┬────────────┘                           │                │
│              │                                        │                │
│              ▼ [Disparo Automático]                   │                │
│   ┌───────────────────────────────────────────────────┴────────────┐   │
│   │        Background Sync Engine (Auto-Sincronizador)             │   │
│   │  - Valida payload de aprendiz                                  │   │
│   │  - Encola en LocalStorage (Resiliencia Offline)                │   │
│   │  - Despacha solicitud POST sin ventanas emergentes             │   │
│   └──────────────────────────┬─────────────────────────────────────┘   │
└──────────────────────────────┼─────────────────────────────────────────┘
                               │
                Petición HTTPS │ POST (JSON Payload)
                               ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   DESTINO DE DATOS AUTOMATIZADO                        │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │  Google Apps Script Web App (Webhook de la Instructora)         │   │
│   │  doPost(e): Inserta o actualiza fila según Cédula              │   │
│   └──────────────────────────────┬─────────────────────────────────┘   │
│                                  │                                     │
│                                  ▼                                     │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │  Google Sheets: "SENA - Registro y Seguimiento de Inducción"   │   │
│   │  - Pestaña: 'Registro de Aprendices' (Datos, XP, Certificado)  │   │
│   │  - Pestaña: 'Seguimiento Ficha 2824190' (Resumen Cohorte)      │   │
│   └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

### Estructura del Payload Automático
Cada transmisión contiene la información oficial requerida por el Acuerdo 002 de 2026:
```json
{
  "action": "syncApprentice",
  "sheetId": "1-v78_v32q...",
  "timestamp": "2026-10-21T15:45:00.000Z",
  "apprentice": {
    "document": "1023456789",
    "documentType": "CC",
    "fullName": "Carlos Andrés Mendoza",
    "email": "carlos.mendoza@misena.edu.co",
    "program": "Tecnología en Desarrollo de Software",
    "ficha": "2824190",
    "regional": "Distrito Capital",
    "center": "Centro de Tecnologías para la Construcción y la Madera",
    "progressPercent": 100,
    "completedModulesCount": 6,
    "finalExamScore": 92,
    "certificateCode": "SENA-2026-REG-F2824190-84920",
    "status": "Certificado",
    "xp": 1250,
    "level": 5
  }
}
```

### Código de Apps Script Proporcionado en 1 Clic
Para que la instructora Olga no tenga que configurar nada complejo, el sistema incluirá el script oficial de 12 líneas listo para copiar o ejecutar, que recibe los datos y escribe en su hoja automáticamente:
```javascript
function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Registro de Aprendices") || ss.getActiveSheet();
  var app = data.apprentice;
  sheet.appendRow([
    app.document, app.fullName, app.email, app.program, 
    app.ficha, app.progressPercent + "%", app.finalExamScore + "%", 
    app.certificateCode, app.status, new Date()
  ]);
  return ContentService.createTextOutput(JSON.stringify({result: "success"})).setMimeType(ContentService.MimeType.JSON);
}
```

---

## 5. Fases de Ejecución Tras tu Aprobación

1. **Fase 1: Servicio de Sincronización Automática en Segundo Plano**
   - Creación de `src/services/autoSyncService.ts` con despacho asíncrono, almacenamiento en búfer local y reintentos automáticos.
2. **Fase 2: Conexión de Triggers en el Flujo de Certificación**
   - Modificación de `App.tsx` y `CertificateModal.tsx` para que al emitirse el certificado se active la sincronización sin que el usuario deba pulsar ningún botón de Google.
3. **Fase 3: Panel Simplificado de Instructora**
   - Actualización del modal y dashboard de instructora para mostrar el enlace directo a su hoja, el estado de auto-sincronización y la opción de exportar el informe de auditoría Ficha 2824190 en cualquier momento.
4. **Fase 4: Verificación Integral**
   - Comprobación de compilación limpia con TypeScript, pruebas de despacho sin errores de red y validación de toasts informativos.
