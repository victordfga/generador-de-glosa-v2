/**
 * Catálogo de Áreas Usuarias (Unidades Orgánicas)
 * Municipalidad Distrital 26 de Octubre - Piura
 *
 * Fuente de verdad: base de datos de SISGEDO (tabla `remitentes`, tipo INTERNO).
 * Extraído y normalizado como semilla estática (Fase 1). En la Fase 2 este
 * catálogo se leerá en vivo desde Supabase para un único origen de datos.
 *
 * Nota: se excluyen entradas que no son unidades orgánicas solicitantes
 * (p. ej. "Código de Expediente", "Mesa de Partes / Trámite Documentario").
 */

export interface AreaUsuaria {
  nombre: string;
  siglas: string;
}

export const AREAS_USUARIAS: AreaUsuaria[] = [
  { nombre: 'Alcaldía', siglas: 'ALC' },
  { nombre: 'Asesoría Jurídica', siglas: 'AJ' },
  { nombre: 'Centro Integral de Atención al Adulto Mayor', siglas: 'CIAM' },
  { nombre: 'Control y Abastecimiento de Combustibles', siglas: 'CAC' },
  { nombre: 'DEMUNA', siglas: 'DEMUNA' },
  { nombre: 'Gerencia de Administración Tributaria', siglas: 'GAT' },
  { nombre: 'Gerencia de Desarrollo Económico', siglas: 'GDE' },
  { nombre: 'Gerencia de Desarrollo Social', siglas: 'GDS' },
  { nombre: 'Gerencia de Desarrollo Urbano', siglas: 'GDU' },
  { nombre: 'Gerencia de Gestión Ambiental y Residuos Sólidos', siglas: 'GGARS' },
  { nombre: 'Gerencia de Seguridad Ciudadana', siglas: 'GSC' },
  { nombre: 'Gerencia Municipal', siglas: 'GM' },
  { nombre: 'Oficina de Abastecimiento', siglas: 'OA' },
  { nombre: 'Oficina de Comunicaciones e Imagen Institucional', siglas: 'OCII' },
  { nombre: 'Oficina de Contabilidad', siglas: 'OC' },
  { nombre: 'Oficina de Planeamiento, Modernización e Inversiones', siglas: 'OPMI' },
  { nombre: 'Oficina de Presupuesto', siglas: 'OPP' },
  { nombre: 'Oficina de Recursos Humanos', siglas: 'ORH' },
  { nombre: 'Oficina de Tecnologías de la Información y Comunicaciones', siglas: 'OTIC' },
  { nombre: 'Oficina de Tesorería', siglas: 'OT' },
  { nombre: 'Oficina General de Administración', siglas: 'OGA' },
  { nombre: 'Oficina General de Atención al Ciudadano y Gestión Documentaria', siglas: 'OGACGD' },
  { nombre: 'Oficina General de Planeamiento y Presupuesto', siglas: 'OGPP' },
  { nombre: 'Órgano de Control Institucional', siglas: 'OCI' },
  { nombre: 'Procuraduría Pública Municipal', siglas: 'PPM' },
  { nombre: 'Programa Vaso de Leche', siglas: 'PVL' },
  { nombre: 'Registro Civil', siglas: 'RC' },
  { nombre: 'Sub Unidad de Control Patrimonial y Almacén', siglas: 'SUCPA' },
  { nombre: 'Sub Unidad de Maestranza', siglas: 'SUM' },
  { nombre: 'Sub Unidad de Participación Vecinal', siglas: 'SUPV' },
  { nombre: 'Sub Unidad Local de Empadronamiento', siglas: 'SULE' },
  { nombre: 'Sub Unidad OMAPED', siglas: 'OMAPED' },
  { nombre: 'Subgerencia de Catastro, Habilitaciones Urbanas y Saneamiento Físico Legal', siglas: 'SGCHU' },
  { nombre: 'Subgerencia de Comercialización y Licencias', siglas: 'SGCL' },
  { nombre: 'Subgerencia de Control Municipal', siglas: 'SGCM' },
  { nombre: 'Subgerencia de Control y Vigilancia Sanitaria', siglas: 'SGCVS' },
  { nombre: 'Subgerencia de Educación, Cultura, Deporte y Recreación', siglas: 'SGECDR' },
  { nombre: 'Subgerencia de Ejecución Coactiva', siglas: 'SGEC' },
  { nombre: 'Subgerencia de Fiscalización Tributaria', siglas: 'SGFT' },
  { nombre: 'Subgerencia de Formulación de Proyectos', siglas: 'SGFP' },
  { nombre: 'Subgerencia de Gestión Ambiental', siglas: 'SGGA' },
  { nombre: 'Subgerencia de Gestión de Riesgo de Desastres', siglas: 'SGGRD' },
  { nombre: 'Subgerencia de Infraestructura', siglas: 'SGI' },
  { nombre: 'Subgerencia de Juventudes', siglas: 'SGJ' },
  { nombre: 'Subgerencia de Programas y Servicios Sociales', siglas: 'SGPSS' },
  { nombre: 'Subgerencia de Rentas', siglas: 'SGR' },
  { nombre: 'Subgerencia de Residuos Sólidos', siglas: 'SGRS' },
  { nombre: 'Subgerencia de Seguridad Ciudadana', siglas: 'SGSC' },
  { nombre: 'Subgerencia de Transportes', siglas: 'SGT' },
];

/** Lista de nombres para poblar los <select> del formulario. */
export const AREAS_USUARIAS_NOMBRES: string[] = AREAS_USUARIAS.map((a) => a.nombre);
