# Generador de Glosas SIGA

Sistema automatizado para la generación de glosas del **SIGA** — **Municipalidad Distrital 26 de Octubre**, Oficina de Abastecimiento (Piura, Perú).

Genera de forma estandarizada el texto de la glosa para:

- Orden de Servicio (General / Consultoría)
- Orden de Servicio (Locador / Recurrente)
- Orden de Compra
- Pago de Contrato / Valorización

## Características

- Formularios dinámicos según el tipo de glosa.
- Catálogo de **áreas usuarias** de la municipalidad (fuente: SISGEDO).
- Historial de sesión con **búsqueda** y duplicado de glosas.
- Plantillas rápidas reutilizables.
- Copiar al portapapeles e **imprimir / exportar a PDF** con membrete institucional.

## Desarrollo

```bash
npm install
npm run dev      # servidor local en http://localhost:3000
npm run build    # build de producción en dist/
npm run preview  # previsualizar el build
```

## Documentación

- [Plan de Acción y Desarrollo](docs/PLAN_DE_ACCION.md) — evaluación, arquitectura por fases y roadmap.
- [Guía de Despliegue](GUIA_DESPLIEGUE.md)

## Stack

React 18 · Vite · TypeScript · Tailwind CSS · lucide-react.
Backend compartido (Supabase) planificado para la Fase 2.
