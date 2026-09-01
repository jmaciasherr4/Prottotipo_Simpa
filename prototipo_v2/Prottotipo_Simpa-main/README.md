# SIMPA — Prototipo funcional

Sistema Inteligente de Mantenimiento de Palma Africana.

## 🆕 Prototipo V2

### Demo en vivo
https://simpav2-prototipo.netlify.app/

**Cuentas de prueba:**

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `admin123` | Administrador |
| `supervisor` | `super123` | Supervisor |
| `operario` | `oper123` | Operario |

## Prototipo anterior

https://prototipo-simpa.netlify.app/

## Requisitos incorporados en esta versión

Se añadió el módulo **Gestión agrícola** para cubrir los requisitos que aparecían pendientes en la auditoría del MVP:

- **RF-08:** diagnóstico nutricional por imagen.
- **RF-10:** gestión de variedades y umbrales.
- **RF-13:** registro de polinización con estado de antesis.
- **RF-18:** estimación de producción.
- **RF-21:** clasificación de madurez del racimo.
- **RF-22:** alerta preventiva de fruta verde.
- **RF-26:** planificación semanal con presupuesto.
- **RF-28:** registro de avance por unidad de labor.
- **RF-35:** registro delegado del avance.
- **RF-36:** catálogo de tarifas por labor.
- **RF-37:** cálculo y aprobación de remuneración semanal.

También se reforzaron los flujos existentes de autenticación por rol, labores, alertas, reportes, personal y mapa GPS.

> Nota: el prototipo sigue siendo una aplicación frontend. Los modelos IA y algunos datos de campo se simulan para demostración; una implementación productiva requiere backend, base de datos, autenticación segura y servicios de IA/GPS.

## Ejecución local

Requisitos: Node.js 18+.

```bash
cd Prototipo
npm install
npm run dev
```

## Tecnologías

React · Vite · TypeScript · Tailwind CSS · Radix UI · Recharts · Lucide

## Persistencia

Los módulos nuevos guardan temporalmente la información en `localStorage` para que pueda demostrarse el flujo de creación, edición, aprobación y exportación sin backend.
