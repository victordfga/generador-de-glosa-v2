/**
 * Configuración de los tipos de glosa y sus campos.
 * Municipalidad Distrital 26 de Octubre - Oficina de Abastecimiento.
 *
 * Los placeholders usan la nomenclatura documental de la municipalidad
 * (formato: N° XXX-AAAA-MDVO/[SIGLAS DEL ÁREA]).
 */
import { AREAS_USUARIAS_NOMBRES } from './areasUsuarias';

export type TipoGlosa =
  | 'orden-servicio-consultoria'
  | 'orden-servicio-recurrente'
  | 'orden-compra'
  | 'pago-contrato';

export type TipoCampo = 'text' | 'textarea' | 'select' | 'selectCustom';

export interface CampoConfig {
  id: string;
  label: string;
  tipo: TipoCampo;
  required?: boolean;
  placeholder?: string;
  opciones?: string[];
}

export interface TipoGlosaMeta {
  valor: TipoGlosa;
  etiqueta: string;
}

/** Opciones del selector principal de tipo de glosa. */
export const TIPOS_GLOSA: TipoGlosaMeta[] = [
  { valor: 'orden-servicio-consultoria', etiqueta: 'Orden de Servicio (General / Consultoría)' },
  { valor: 'orden-servicio-recurrente', etiqueta: 'Orden de Servicio (Locador / Recurrente)' },
  { valor: 'orden-compra', etiqueta: 'Orden de Compra' },
  { valor: 'pago-contrato', etiqueta: 'Pago de Contrato / Valorización' },
];

export const CAMPOS_POR_TIPO: Record<TipoGlosa, CampoConfig[]> = {
  'orden-servicio-consultoria': [
    { id: 'descripcionGeneral', label: 'Descripción General del Servicio', tipo: 'textarea', required: true },
    { id: 'descripcionItem', label: 'Descripción del Item en el Sistema', tipo: 'text', required: true },
    { id: 'unidadOrganica', label: 'Área Usuaria Solicitante', tipo: 'selectCustom', opciones: AREAS_USUARIAS_NOMBRES, required: true },
    { id: 'detalleServicio', label: 'Detalle Específico del Servicio', tipo: 'textarea', required: true },
    { id: 'plazo', label: 'Plazo de Ejecución (en días)', tipo: 'text', required: true },
    { id: 'garantia', label: 'Descripción de la Garantía', tipo: 'text', placeholder: 'Ej: DURANTE EL SERVICIO' },
    { id: 'docReferencia', label: 'Documento de Referencia', tipo: 'text', placeholder: 'Ej: MEMORÁNDUM N° 282-2025-MDVO/OA', required: true },
    { id: 'docAtendido', label: 'Documento Atendido', tipo: 'text', placeholder: 'Ej: MEMORÁNDUM N° 331-2025-MDVO/GM', required: true },
    { id: 'pedidoInterno', label: 'Nro. de Pedido de Servicio', tipo: 'text', required: true },
    { id: 'certificado', label: 'Nro. de Certificado Presupuestal', tipo: 'text', required: true },
    { id: 'ordenServicio', label: 'Nro. de Orden de Servicio (O/S)', tipo: 'text', required: true },
  ],
  'orden-servicio-recurrente': [
    { id: 'descripcionGeneral', label: 'Descripción General del Servicio', tipo: 'textarea', required: true },
    { id: 'descripcionItem', label: 'Descripción del Item en el Sistema', tipo: 'text', required: true },
    { id: 'unidadOrganica', label: 'Área Usuaria Solicitante', tipo: 'selectCustom', opciones: AREAS_USUARIAS_NOMBRES, required: true },
    { id: 'detalleServicio', label: 'Detalle Específico del Servicio', tipo: 'textarea', required: true },
    { id: 'periodo', label: 'Periodo del Servicio', tipo: 'text', placeholder: 'Ej: SEPTIEMBRE, OCTUBRE, NOVIEMBRE Y DICIEMBRE DEL 2025', required: true },
    { id: 'docReferencia', label: 'Documento de Referencia', tipo: 'text', placeholder: 'Ej: MEMORÁNDUM N° 282-2025-MDVO/OA', required: true },
    { id: 'docAtendido', label: 'Documento Atendido', tipo: 'text', placeholder: 'Ej: MEMORÁNDUM N° 331-2025-MDVO/GM', required: true },
    { id: 'pedidoInterno', label: 'Nro. de Pedido de Servicio', tipo: 'text', required: true },
    { id: 'certificado', label: 'Nro. de Certificado Presupuestal', tipo: 'text', required: true },
    { id: 'ordenServicio', label: 'Nro. de Orden de Servicio (O/S)', tipo: 'text', required: true },
  ],
  'orden-compra': [
    { id: 'descripcionGeneral', label: 'Descripción General del Bien', tipo: 'textarea', required: true },
    { id: 'unidadOrganica', label: 'Área Usuaria Solicitante', tipo: 'selectCustom', opciones: AREAS_USUARIAS_NOMBRES, required: true },
    { id: 'detalleBien', label: 'Detalle Específico del Bien', tipo: 'textarea', required: true },
    { id: 'plazo', label: 'Plazo de Entrega (en días)', tipo: 'text', required: true },
    { id: 'garantia', label: 'Descripción de la Garantía', tipo: 'text', required: true },
    { id: 'docReferencia', label: 'Documento de Referencia', tipo: 'text', placeholder: 'Ej: MEMORÁNDUM N° 2843-2025-MDVO/OGA', required: true },
    { id: 'docAtendido', label: 'Documento Atendido', tipo: 'text', placeholder: 'Ej: MEMORANDO N° 922-2025-MDVO/GM', required: true },
    { id: 'pedidoInterno', label: 'Nro. de Pedido de Compra', tipo: 'text', required: true },
    { id: 'certificado', label: 'Nro. de Certificado Presupuestal', tipo: 'text', required: true },
    { id: 'ordenCompra', label: 'Nro. de Orden de Compra (O/C)', tipo: 'text', required: true },
  ],
  'pago-contrato': [
    { id: 'descripcionContrato', label: 'Descripción del Servicio del Contrato', tipo: 'textarea', required: true },
    { id: 'periodoValorizacion', label: 'Periodo o Valorización a Pagar', tipo: 'text', required: true },
    { id: 'docConformidad', label: 'Documento de Conformidad', tipo: 'text', required: true },
    { id: 'docAtendido', label: 'Documento Atendido', tipo: 'text', placeholder: 'Ej: INFORME N° 3148-2025-MDVO/OA', required: true },
    { id: 'contratoNumero', label: 'Nro. de Contrato Original', tipo: 'text', required: true },
  ],
};
