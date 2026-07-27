# Plan de Acción y Desarrollo — Generador de Glosas SIGA

**Entidad:** Municipalidad Distrital 26 de Octubre — Oficina de Abastecimiento
**Documento:** Evaluación técnica, plan de mejora y roadmap por fases
**Fecha:** 2026-07-26

---

## 1. Contexto

El aplicativo **Generador de Glosas SIGA** es una SPA (React + Vite + TypeScript + Tailwind)
que estandariza el texto de las glosas para pegarlo en las órdenes que se registran en el
SIGA. Fue construido originalmente con datos del **Gobierno Regional de Piura** y se adapta
a la realidad de la **Municipalidad Distrital 26 de Octubre**.

**Finalidad y alcance:** es una **herramienta de uso personal** del responsable de
Abastecimiento. Su objetivo es (1) generar rápido el texto de la glosa y (2) mantener un
**historial personal** de glosas como referencia (por si se consulta una orden). **No** es
un sistema compartido de oficina ni está integrado con SISGEDO; el catálogo de áreas se tomó
de SISGEDO una sola vez como semilla de datos, pero el aplicativo no se conecta a esa base.

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
- Todo en `localStorage`: **frágil para un historial de referencia** (se pierde al limpiar
  caché, con otro navegador o al cambiar de PC) y limitado a 20 registros.

---

## 3. Decisiones de arquitectura

| Tema | Decisión | Justificación |
|------|----------|---------------|
| Áreas usuarias | **Semilla estática** tomada una vez de SISGEDO (`remitentes`, tipo INTERNO) | Datos reales sin acoplar el aplicativo a otra base; el generador no se conecta a SISGEDO |
| Durabilidad del historial | **Respaldo por archivo** (Exportar/Importar JSON) | Uso personal: portátil entre PCs y a prueba de limpieza de caché, sin infraestructura ni login |
| Despliegue | **GitHub Pages** (Vercel opcional) | Sin backend no hacen falta variables de entorno; ya está configurado. `base: './'` deja Vercel disponible si se quisiera |

> **Nota:** el aplicativo es de uso personal y no requiere backend, autenticación ni
> integración con SISGEDO. Un backend en la nube solo se justificaría si se necesitara
> sincronización automática entre varias PCs (ver Fase 2, opcional).

---

## 4. Plan por fases

### Fase 1 — Rebranding, datos, calidad y nuevas funciones *(este PR)*
**Objetivo:** aplicativo correcto, profesional y desplegable.

- [x] Catálogo real de áreas de la MD 26 de Octubre (`src/data/areasUsuarias.ts`, semilla desde SISGEDO).
- [x] Configuración de tipos de glosa extraída a datos (`src/data/tiposGlosa.ts`) con placeholders MDVO.
- [x] Lógica de generación y validación como funciones puras (`src/lib/glosa.ts`).
- [x] Rebranding: encabezado, textos, `README`, `package.json`, `index.html`.
- [x] Corrección de bugs: diálogo de confirmación con mensaje real, confirmación solo si hay datos, estado inmutable.
- [x] Nuevas funciones: **imprimir / exportar a PDF** con membrete, **búsqueda** en el historial.
- [x] Mejora UI/UX: identidad institucional, responsive, accesibilidad (`htmlFor`, `aria-label`, roles).
- [x] Limpieza: eliminación del archivo muerto de la raíz.
- [x] Despliegue: `base: './'` (compatible con GitHub Pages y Vercel).

### Fase 2 — Durabilidad del historial personal *(este PR)*
**Objetivo:** que el historial de referencia no se pierda y sea portátil, sin backend.

- [x] **Exportar** el historial a un archivo JSON de respaldo.
- [x] **Importar** un historial desde archivo, fusionando por `id` (sin duplicar).
- [x] Ampliar el tope del historial de 20 a **200** registros.
- [x] **Eliminar** entradas individuales del historial.

> Un backend en la nube (Supabase personal para sincronización automática entre PCs) queda
> como opción futura solo si el respaldo por archivo resultara insuficiente. No se contempla
> ninguna integración con la base de SISGEDO.

### Fase 3 — Valor agregado *(backlog)*
- [ ] Exportación a Word/plantilla oficial.
- [ ] Filtros del historial por tipo de glosa y por número de orden (O/C, O/S).
- [ ] Pruebas automatizadas (Vitest) sobre `src/lib/glosa.ts` y lint en CI.

---

## 5. Datos (referencia)

**Origen del catálogo de áreas:** se tomó una única vez del proyecto Supabase `siscodo-mdvo`
(`public.remitentes`, `tipo = 'INTERNO'`) y se guardó como semilla estática en
`src/data/areasUsuarias.ts`. El aplicativo **no** consulta esa base en tiempo de ejecución.
El historial y las plantillas se guardan en `localStorage` del navegador, con respaldo
manual por archivo (Exportar/Importar).

---

## 6. Checklist de calidad

- [x] `npm run build` sin errores.
- [x] `npx tsc --noEmit` sin errores.
- [x] Verificación en navegador: generación de glosas, impresión/PDF, búsqueda, exportar/importar/eliminar historial.
- [x] Revisión de accesibilidad básica.

---

## 7. Riesgos y mitigación

| Riesgo | Mitigación |
|--------|------------|
| Pérdida del historial (caché/PC) | Exportar a archivo de respaldo periódicamente; importar al cambiar de equipo |
| Nombres de áreas desactualizados | Semilla editable en `src/data/areasUsuarias.ts`; se actualiza con un cambio de código |
| Confusión con SISGEDO | Documentado: aplicativo personal, sin conexión a esa base |
