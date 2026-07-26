# Plan de Acción y Desarrollo — Generador de Glosas SIGA

**Entidad:** Municipalidad Distrital 26 de Octubre — Oficina de Abastecimiento
**Documento:** Evaluación técnica, plan de mejora y roadmap por fases
**Fecha:** 2026-07-26

---

## 1. Contexto

El aplicativo **Generador de Glosas SIGA** es una SPA (React + Vite + TypeScript + Tailwind)
que estandariza el texto de las glosas para el registro en el SIGA. Fue construido
originalmente con datos del **Gobierno Regional de Piura** y se necesita adaptarlo a la
realidad de la **Municipalidad Distrital 26 de Octubre**, integrándolo al ecosistema que
ya usa la oficina (SISGEDO, sobre Supabase).

---

## 2. Diagnóstico del estado inicial

### 2.1 Interfaz (UI/UX)
- Diseño genérico, sin identidad institucional municipal.
- Accesibilidad limitada: etiquetas sin `htmlFor`, emojis como texto de botón, faltan `aria-label`.
- La grilla de ítems (12 columnas) no era responsive en móvil.

### 2.2 Funcionalidad
- El diálogo de confirmación se disparaba **siempre** al cambiar el tipo de glosa, incluso con el formulario vacío.
- `mostrarConfirmacion(accion, mensaje)` ignoraba el `mensaje`: el diálogo mostraba un texto fijo.
- `actualizarItem` **mutaba el estado en sitio** (anti-patrón React).
- Solo permitía "Copiar"; sin impresión ni exportación a PDF.
- Historial sin búsqueda; se pierde al limpiar caché o cambiar de equipo.

### 2.3 Datos
- Las 45 unidades orgánicas correspondían al **Gobierno Regional de Piura**.
- Placeholders con nomenclatura GRP (`GRP/490000`, `GRP-410000`).
- Encabezado "Gobierno Regional de Piura".

### 2.4 Arquitectura y calidad
- Componente monolítico (~790 líneas): datos, lógica de negocio y UI mezclados.
- Archivo muerto/duplicado en la raíz (`generador-glosas-siga-v24.tsx`).
- CI (GitHub Pages) sin lint ni pruebas.

### 2.5 Persistencia
- Todo en `localStorage`: **no se comparte** entre las PCs de la oficina.

---

## 3. Decisiones de arquitectura

| Tema | Decisión | Justificación |
|------|----------|---------------|
| Áreas usuarias | Extraer de **SISGEDO** (tabla `remitentes`, tipo INTERNO) | Única fuente de verdad; datos reales y vigentes |
| Backend | **Supabase compartido** (proyecto `siscodo-mdvo`) | Reutiliza la infraestructura que ya opera Abastecimiento |
| Despliegue | **Migrar a Vercel** | Manejo limpio de variables de entorno, previews por PR, consistencia con SISGEDO (`sisgedo-mdvo.vercel.app`) y elimina la subruta de GitHub Pages |
| Seguridad | No debilitar el RLS de producción | `remitentes` es legible solo por usuarios `authenticated`; la lectura en vivo se hará con sesión autenticada en la Fase 2 |

> **Recomendación de despliegue:** Vercel. GitHub Pages sigue siendo un *fallback* válido
> (la `base` de Vite se dejó en `./` para que ambos funcionen).

---

## 4. Plan por fases

### Fase 1 — Rebranding, datos, calidad y nuevas funciones *(este PR)*
**Objetivo:** aplicativo correcto, profesional y desplegable, sin tocar la base de producción.

- [x] Catálogo real de áreas de la MD 26 de Octubre (`src/data/areasUsuarias.ts`, semilla desde SISGEDO).
- [x] Configuración de tipos de glosa extraída a datos (`src/data/tiposGlosa.ts`) con placeholders MDVO.
- [x] Lógica de generación y validación como funciones puras (`src/lib/glosa.ts`).
- [x] Rebranding: encabezado, textos, `README`, `package.json`, `index.html`.
- [x] Corrección de bugs: diálogo de confirmación con mensaje real, confirmación solo si hay datos, estado inmutable.
- [x] Nuevas funciones: **imprimir / exportar a PDF** con membrete, **búsqueda** en el historial.
- [x] Mejora UI/UX: identidad institucional, responsive, accesibilidad (`htmlFor`, `aria-label`, roles).
- [x] Limpieza: eliminación del archivo muerto de la raíz.
- [x] Despliegue: `vercel.json`, `.env.example`, `base: './'`.

### Fase 2 — Backend compartido (Supabase + autenticación)
**Objetivo:** historial y plantillas compartidos entre las PCs de la oficina y catálogo de áreas en vivo.

- [ ] Autenticación (reutilizar el login de SISGEDO o Supabase Auth) para respetar el RLS existente.
- [ ] Cliente Supabase (`src/lib/supabase.ts`) leído por variables de entorno.
- [ ] Lectura del catálogo de áreas en vivo desde `remitentes` (usuario autenticado).
- [ ] Tablas `glosa_historial` y `glosa_plantillas` (ver esquema en §5), con RLS.
- [ ] Sincronización localStorage ⇄ Supabase (modo offline como respaldo).

**Esquema propuesto (migración a revisar antes de aplicar a producción):**

```sql
-- Tablas propias del generador de glosas (aisladas de SISGEDO por prefijo glosa_)
create table if not exists public.glosa_historial (
  id           bigint generated always as identity primary key,
  tipo         text not null,
  texto        text not null,
  form_data    jsonb not null default '{}'::jsonb,
  items        jsonb not null default '[]'::jsonb,
  creado_por   uuid references auth.users(id),
  creado_en    timestamptz not null default now()
);

create table if not exists public.glosa_plantillas (
  id           bigint generated always as identity primary key,
  slot         smallint not null check (slot between 1 and 3),
  nombre       text not null,
  tipo         text not null,
  form_data    jsonb not null default '{}'::jsonb,
  items        jsonb not null default '[]'::jsonb,
  creado_por   uuid references auth.users(id),
  creado_en    timestamptz not null default now(),
  unique (creado_por, slot)
);

alter table public.glosa_historial  enable row level security;
alter table public.glosa_plantillas enable row level security;

-- Políticas: solo usuarios autenticados; historial visible para toda la oficina.
create policy glosa_hist_select on public.glosa_historial for select to authenticated using (true);
create policy glosa_hist_insert on public.glosa_historial for insert to authenticated with check (true);
create policy glosa_plan_all    on public.glosa_plantillas for all to authenticated using (true) with check (true);
```

### Fase 3 — Reportes y valor agregado *(backlog)*
- [ ] Exportación a Word/plantilla oficial.
- [ ] Numeración correlativa de glosas y trazabilidad por área.
- [ ] Tablero: glosas por área/mes, tiempos, reutilización de plantillas.
- [ ] Pruebas automatizadas (Vitest) sobre `src/lib/glosa.ts` y lint en CI.

---

## 5. Modelo de datos (referencia)

**Origen del catálogo de áreas:** proyecto Supabase `siscodo-mdvo`
(`https://dsrtxkyywnfsfwldvwdn.supabase.co`), tabla `public.remitentes`,
filtro `tipo = 'INTERNO' AND activo = true`. Ver esquema de tablas propias en §4 (Fase 2).

---

## 6. Checklist de calidad

- [ ] `npm run build` sin errores.
- [ ] `npm run lint` sin errores.
- [ ] Verificación en preview: generación de las 4 glosas, impresión/PDF, búsqueda de historial, responsive.
- [ ] Revisión de accesibilidad básica.
- [ ] Despliegue en Vercel con variables de entorno (Fase 2).

---

## 7. Riesgos y mitigación

| Riesgo | Mitigación |
|--------|------------|
| Tocar la base de producción de SISGEDO | En Fase 1 no se modifica; las tablas de Fase 2 van con prefijo `glosa_` y RLS propio |
| Nombres de áreas desactualizados | Semilla marcada como provisional; Fase 2 lee en vivo desde `remitentes` |
| Exposición de datos | Backend solo para usuarios autenticados; no se debilita el RLS actual |
| Migración de despliegue | `base: './'` mantiene compatibilidad con GitHub Pages como respaldo |
