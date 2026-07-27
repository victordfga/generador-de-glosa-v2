/**
 * Lógica pura de generación de glosas (sin dependencias de React).
 * Mantener aquí las reglas de negocio facilita las pruebas y el mantenimiento.
 */
import type { TipoGlosa, CampoConfig } from '../data/tiposGlosa';
import { CAMPOS_POR_TIPO } from '../data/tiposGlosa';

export interface Item {
  descripcion: string;
  cantidad: string;
  unidad: string;
}

export interface FormData {
  [key: string]: string;
}

export interface GlosaHistorial {
  id: number;
  tipo: TipoGlosa;
  texto: string;
  fecha: string;
  formData: FormData;
  items: Item[];
}

export interface Plantilla {
  tipo: TipoGlosa;
  formData: FormData;
  items: Item[];
  nombre: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

const up = (v?: string) => (v ?? '').toUpperCase().trim();

/** Valida el formulario según el tipo de glosa. Devuelve la lista de errores. */
export function validarFormulario(
  tipo: TipoGlosa | '',
  formData: FormData,
  items: Item[],
): ValidationError[] {
  const errores: ValidationError[] = [];

  if (!tipo) {
    errores.push({ field: 'tipoGlosa', message: 'Debe seleccionar un tipo de glosa' });
    return errores;
  }

  const campos: CampoConfig[] = CAMPOS_POR_TIPO[tipo] ?? [];
  campos.forEach((campo) => {
    if (campo.required && !formData[campo.id]?.trim()) {
      errores.push({ field: campo.id, message: `${campo.label} es requerido` });
    }
  });

  if (tipo === 'orden-compra') {
    const itemsValidos = items.filter((item) => item.descripcion.trim());
    if (itemsValidos.length === 0) {
      errores.push({ field: 'items', message: 'Debe agregar al menos un ítem' });
    }
  }

  return errores;
}

/** Construye el texto de la glosa a partir de los datos del formulario. */
export function generarTextoGlosa(
  tipo: TipoGlosa,
  formData: FormData,
  items: Item[],
): string {
  switch (tipo) {
    case 'orden-servicio-recurrente':
      return `POR LA CONTRATACIÓN DE ${up(formData.descripcionGeneral)}
- ${up(formData.descripcionItem)}
PEDIDO DE SERVICIO SOLICITADO POR ${up(formData.unidadOrganica)}.

DETALLE DEL SERVICIO: ${up(formData.detalleServicio)}

PERIODO: ${up(formData.periodo)}

REF.: ${up(formData.docReferencia)}

SEGÚN DOCUMENTACIÓN: ${up(formData.docAtendido)}

PEDIDO DE SERVICIO N° ${formData.pedidoInterno ?? ''}

CERTIFICADO N° ${formData.certificado ?? ''} / OS N° ${formData.ordenServicio ?? ''}`;

    case 'orden-servicio-consultoria': {
      let glosa = `POR LA CONTRATACIÓN DE ${up(formData.descripcionGeneral)}
- ${up(formData.descripcionItem)}
PEDIDO DE SERVICIO SOLICITADO POR ${up(formData.unidadOrganica)}.

DETALLE DEL SERVICIO: ${up(formData.detalleServicio)}

PLAZO DE EJECUCIÓN: ${formData.plazo ?? ''} DÍAS CALENDARIOS.

REF.: ${up(formData.docReferencia)}

SEGÚN DOCUMENTACIÓN: ${up(formData.docAtendido)}

PEDIDO DE SERVICIO N° ${formData.pedidoInterno ?? ''}

CERTIFICADO N° ${formData.certificado ?? ''} / OS N° ${formData.ordenServicio ?? ''}`;
      if (formData.garantia?.trim()) {
        glosa += `\n\nGARANTÍA: ${up(formData.garantia)}`;
      }
      return glosa;
    }

    case 'orden-compra': {
      let glosa = `POR LA CONTRATACIÓN DE PROVEEDOR PARA LA ADQUISICIÓN DE ${up(formData.descripcionGeneral)}`;
      items.forEach((item) => {
        if (item.descripcion.trim()) {
          glosa += `\n- ${up(item.descripcion)}   ${item.cantidad ?? ''} ${up(item.unidad)}`;
        }
      });
      glosa += `\n\nPEDIDO DE COMPRA SOLICITADO POR ${up(formData.unidadOrganica)}.

PLAZO DE ENTREGA: ${formData.plazo ?? ''} DÍAS CALENDARIOS.

GARANTÍA: ${up(formData.garantia)}

REF.: ${up(formData.docReferencia)}

SEGÚN DOCUMENTACIÓN: ${up(formData.docAtendido)}

PEDIDO DE COMPRA N° ${formData.pedidoInterno ?? ''}

CERTIFICADO N° ${formData.certificado ?? ''} / OC N° ${formData.ordenCompra ?? ''}`;
      return glosa;
    }

    case 'pago-contrato':
      return `POR EL PAGO DE VALORIZACIÓN DE ${up(formData.descripcionContrato)}

PERIODO O VALORIZACIÓN: ${up(formData.periodoValorizacion)}

DOCUMENTO DE CONFORMIDAD: ${up(formData.docConformidad)}

SEGÚN DOCUMENTACIÓN: ${up(formData.docAtendido)}

CONTRATO N° ${up(formData.contratoNumero)}`;

    default:
      return '';
  }
}
