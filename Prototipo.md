# SIMPA — Sistema Inteligente de Mantenimiento de Palma Africana

Prototipo funcional (frontend) para la gestión, monitoreo y diagnóstico por IA de cultivos de palma africana. Incluye login multiusuario por roles, dashboard, análisis de imagen simulado, registro de labores, mapa GPS, reportes, alertas y gestión de personal y cuentas.

Estado del proyecto: prototipo funcional de interfaz. La lógica de negocio corre en el navegador y los datos se guardan en localStorage (no hay backend/base de datos real todavía). Ver la sección "Persistencia de datos" y "Limitaciones y próximos pasos".

---

## Tabla de contenido

- Requisitos
- Instalación y ejecución local
- Cuentas de acceso
- Roles y permisos
- Funcionalidades por pantalla
- Persistencia de datos (estado actual)
- Estructura del proyecto
- Compilar para producción
- Desplegar el prototipo (sin servidor propio)
- Limitaciones actuales y próximos pasos
- Stack tecnológico

---

## Requisitos

- Node.js versión 18 o superior (incluye npm). Descarga: nodejs.org
- Un navegador moderno (Chrome, Edge, Firefox).
- Editor de código recomendado: Visual Studio Code.

Para comprobar que Node.js está instalado, abre una terminal y ejecuta:

```bash
node -v
npm -v
```

Si no reconoce el comando, instala Node.js desde nodejs.org (botón "LTS") y vuelve a intentarlo.

---

## Instalación y ejecución local

1. Clona o descarga este repositorio.
2. Abre una terminal dentro de la carpeta del proyecto.
3. Instala las dependencias (solo la primera vez, o cuando cambien):

   ```bash
   npm install
   ```

4. Inicia el servidor de desarrollo:

   ```bash
   npm run dev
   ```

5. Copia la URL que aparece en la terminal (normalmente http://localhost:5173/) y ábrela en el navegador.

6. Para detener el servidor: Ctrl + C en la terminal.

---

## Cuentas de acceso

El sistema trae 3 cuentas de prueba precargadas. Cada una define automáticamente el rol al iniciar sesión (no se elige manualmente):

| Usuario | Contraseña | Rol | Acceso a "Personal" y "Cuentas" |
|---|---|---|---|
| admin | admin123 | Administrador | Sí |
| supervisor | super123 | Supervisor | No |
| operario | oper123 | Operario | No |

Estas credenciales también se muestran directamente en la pantalla de inicio de sesión.

El Administrador puede cambiar estas contraseñas o crear cuentas nuevas desde el módulo Personal → Cuentas del sistema. Esos cambios quedan guardados en el navegador y afectan el login de inmediato.

---

## Roles y permisos

| Módulo | Administrador | Supervisor | Operario |
|---|:---:|:---:|:---:|
| Dashboard | Sí (completo) | Sí (completo) | Sí (simplificado) |
| Análisis IA | Sí | Sí | Sí |
| Registro de labor | Sí | Sí | Sí |
| Detalle de lote | Sí | Sí | No |
| Mapa GPS | Sí | Sí | Sí |
| Reportes | Sí | Sí | No |
| Alertas | Sí | Sí | Sí |
| Personal (añadir/editar/eliminar) | Sí | No | No |
| Cuentas del sistema (contraseñas, altas) | Sí | No | No |

El módulo Personal ni siquiera aparece en el menú para las cuentas Supervisor u Operario. Si se intenta entrar sin permiso, la app muestra "No tienes permiso" y regresa al Dashboard.

---

## Funcionalidades por pantalla

### 1. Iniciar sesión
- Usuario y contraseña reales (validados contra las cuentas registradas).
- Mostrar/ocultar contraseña.
- Mensajes de error claros ante campos vacíos o credenciales incorrectas.

### 2. Dashboard
- 4 tarjetas KPI: Lotes activos, Labores del día (se actualiza con las labores reales que registres hoy), Alertas abiertas (en vivo), Producción estimada.
- Alertas recientes clicables.
- Accesos rápidos que cambian según el rol.
- Franja de condiciones climáticas.

### 3. Análisis de imagen con IA
- Selector de lote y tipo de análisis.
- Simulación de cámara con indicador de calidad de imagen.
- Botón "Analizar" (deshabilitado hasta tener buena calidad de imagen).
- Tarjeta de resultado con diagnóstico, nivel de confianza y recomendación.

### 4. Registro de labor
- Selector de lote, tipo de labor, fecha (automática) y responsable.
- Estados de antesis para labores de polinización.
- Verificación visual (switch).
- Conteo automático simulado por GPS (en vivo).
- El botón "Guardar Registro de Labor" ya persiste el registro real: aparece en el Detalle de Lote y en el KPI del Dashboard.

### 5. Detalle de lote
- Ficha del lote y métricas rápidas.
- Pestañas: Labores (incluye las labores reales guardadas más el historial de ejemplo), Monitoreo, Diagnósticos, Análisis (suelo/foliar/clima), Línea de tiempo.

### 6. Mapa GPS
- Visualización de recorridos por trabajador.
- Filtro para mostrar/ocultar el recorrido de cada trabajador.
- Panel de totales de polinización.

### 7. Reportes
- Selector de tipo de reporte (Producción, Labores, Personal, Alertas) y de periodo.
- Gráficos y tabla consolidada de ejemplo.

### 8. Alertas
- Lista filtrable por estado/severidad.
- Panel de detalle con acción recomendada.
- Botón "Marcar como atendida" (persiste el cambio).

### 9. Personal (solo Administrador)
- Formulario para añadir trabajadores (nombre, cargo, lote asignado, teléfono).
- Edición y eliminación de cada registro.
- Botón para descargar un respaldo .txt con todo el personal registrado.

### 10. Cuentas del sistema (dentro de Personal, solo Administrador)
- Cambiar la contraseña de cualquier cuenta existente.
- Crear nuevas cuentas de acceso (usuario, contraseña, nombre, rol).
- Eliminar cuentas (siempre debe quedar al menos una).

---

## Persistencia de datos (estado actual)

Este prototipo no tiene backend ni base de datos real todavía. Mientras tanto, los datos se guardan así:

| Dato | Dónde se guarda | ¿Sobrevive a recargar la página? |
|---|---|---|
| Personal registrado | localStorage del navegador | Sí |
| Cuentas de acceso y contraseñas | localStorage del navegador | Sí |
| Alertas (estado atendida/abierta) | localStorage del navegador | Sí |
| Labores registradas | localStorage del navegador | Sí |
| Resultado de Análisis IA | Solo en memoria (no persiste) | No |
| Datos de Reportes y GPS de ejemplo | Datos de muestra fijos en el código | — |

localStorage guarda los datos en ese navegador y ese dispositivo específico. Si abres la app en otro computador o navegador, no verá los mismos datos. Al conectar un backend real (por ejemplo Supabase, Firebase o una API propia), todo esto pasaría a guardarse en una base de datos compartida.

---

## Estructura del proyecto

```
├── src/
│   ├── app/
│   │   ├── App.tsx              # Componente principal: login, navegación y las 8 pantallas
│   │   └── components/ui/       # Componentes de interfaz reutilizables (shadcn/ui)
│   ├── styles/
│   │   ├── theme.css            # Paleta de colores y variables de diseño
│   │   ├── globals.css
│   │   └── fonts.css
│   └── main.tsx                 # Punto de entrada de la app
├── index.html
├── vite.config.ts               # Configuración de Vite (build tool)
├── package.json                 # Dependencias y scripts (npm install / npm run dev)
└── README.md
```

---

## Compilar para producción

Genera una versión optimizada y estática de la app (carpeta dist/):

```bash
npm run build
```

Puedes previsualizar esa build localmente con:

```bash
npm run preview
```

---

## Desplegar el prototipo (sin servidor propio)

La forma más rápida de compartir una versión pública sin configurar hosting:

1. Ejecuta npm run build.
2. Entra a Netlify Drop (app.netlify.com/drop).
3. Arrastra la carpeta dist/ generada.
4. Netlify entrega una URL pública al instante (no requiere cuenta).

---

## Limitaciones actuales y próximos pasos

- Conectar un backend real (base de datos) en lugar de localStorage.
- El Análisis IA usa un diagnóstico simulado; falta conectar un modelo real de visión por computador.
- El conteo GPS por polinización es simulado; falta integrar geolocalización real del dispositivo.
- Los Reportes y el Mapa GPS aún muestran datos de ejemplo fijos, no datos filtrados dinámicamente.
- El botón "Guardar en historial" del Análisis IA aún no persiste el diagnóstico en el lote.
- La exportación de Reportes (PDF/Excel) todavía no genera el archivo real.
- Las contraseñas se guardan en texto plano en localStorage; en producción deben cifrarse/hashearse en un backend seguro.

---

## Stack tecnológico

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS v4
- shadcn/ui (componentes de interfaz)
- Recharts (gráficos)
- Lucide Icons

---

## Licencia

Uso interno / prototipo de proyecto académico o empresarial — ajustar esta sección según corresponda antes de publicar el repositorio.
