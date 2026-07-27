import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Copy, Plus, Save, Trash2, FileText, Clock, AlertCircle, CheckCircle,
  Printer, Search, Zap, Pencil, FilePlus, Download, Upload,
} from 'lucide-react';
import { TIPOS_GLOSA, CAMPOS_POR_TIPO } from '../data/tiposGlosa';
import type { TipoGlosa } from '../data/tiposGlosa';
import {
  validarFormulario, generarTextoGlosa,
} from '../lib/glosa';
import type {
  Item, FormData, GlosaHistorial, Plantilla, ValidationError,
} from '../lib/glosa';

// Constantes
const MAX_HISTORIAL_ITEMS = 200;
const PLANTILLA_NAME_LENGTH = 40;
const ITEM_VACIO: Item = { descripcion: '', cantidad: '', unidad: '' };

const GeneradorGlosasSIGA = () => {
  // Estados principales
  const [tipoGlosa, setTipoGlosa] = useState<TipoGlosa | ''>('');
  const [formData, setFormData] = useState<FormData>({});
  const [glosaGenerada, setGlosaGenerada] = useState('');
  const [historial, setHistorial] = useState<GlosaHistorial[]>([]);
  const [plantillas, setPlantillas] = useState<(Plantilla | null)[]>([null, null, null]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [items, setItems] = useState<Item[]>([{ ...ITEM_VACIO }]);
  const [busquedaHistorial, setBusquedaHistorial] = useState('');

  // Estados de flujo
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmMensaje, setConfirmMensaje] = useState('');
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar datos del localStorage al inicializar
  useEffect(() => {
    const savedHistorial = localStorage.getItem('glosas-historial');
    const savedPlantillas = localStorage.getItem('glosas-plantillas');

    if (savedHistorial) {
      try {
        setHistorial(JSON.parse(savedHistorial));
      } catch (error) {
        console.error('Error al cargar historial:', error);
      }
    }

    if (savedPlantillas) {
      try {
        setPlantillas(JSON.parse(savedPlantillas));
      } catch (error) {
        console.error('Error al cargar plantillas:', error);
      }
    }
  }, []);

  // Persistir historial y plantillas
  useEffect(() => {
    localStorage.setItem('glosas-historial', JSON.stringify(historial));
  }, [historial]);

  useEffect(() => {
    localStorage.setItem('glosas-plantillas', JSON.stringify(plantillas));
  }, [plantillas]);

  // Historial filtrado por búsqueda
  const historialFiltrado = useMemo(() => {
    const q = busquedaHistorial.trim().toLowerCase();
    if (!q) return historial;
    return historial.filter(
      (g) => g.texto.toLowerCase().includes(q) || g.tipo.toLowerCase().includes(q),
    );
  }, [historial, busquedaHistorial]);

  // Gestión de ítems (inmutable)
  const agregarItem = () => setItems((prev) => [...prev, { ...ITEM_VACIO }]);

  const eliminarItem = (index: number) => {
    setItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  };

  const actualizarItem = (index: number, campo: keyof Item, valor: string) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [campo]: valor } : item)));
  };

  const handleInputChange = (campo: string, valor: string) => {
    setFormData((prev) => ({ ...prev, [campo]: valor }));
    setValidationErrors((prev) => prev.filter((error) => error.field !== campo));
  };

  // Confirmación reutilizable
  const mostrarConfirmacion = (accion: () => void, mensaje: string) => {
    setConfirmAction(() => accion);
    setConfirmMensaje(mensaje);
    setShowConfirmDialog(true);
  };

  const ejecutarAccionConfirmada = () => {
    confirmAction?.();
    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  const resetFormulario = () => {
    setFormData({});
    setGlosaGenerada('');
    setItems([{ ...ITEM_VACIO }]);
    setValidationErrors([]);
  };

  const hayDatosEnFormulario = () =>
    Object.values(formData).some((v) => v?.trim()) ||
    items.some((it) => it.descripcion.trim() || it.cantidad.trim() || it.unidad.trim());

  // Al cambiar el tipo: solo confirmar si hay datos que se perderían
  const cambiarTipoGlosa = (nuevoTipo: TipoGlosa | '') => {
    const aplicar = () => {
      setTipoGlosa(nuevoTipo);
      resetFormulario();
    };
    if (hayDatosEnFormulario()) {
      mostrarConfirmacion(aplicar, 'Cambiar el tipo de glosa borrará los datos actuales. ¿Desea continuar?');
    } else {
      aplicar();
    }
  };

  const generarGlosa = async () => {
    setIsLoading(true);
    setValidationErrors([]);

    try {
      const errores = validarFormulario(tipoGlosa, formData, items);
      if (errores.length > 0) {
        setValidationErrors(errores);
        return;
      }

      const glosa = generarTextoGlosa(tipoGlosa as TipoGlosa, formData, items);
      setGlosaGenerada(glosa);

      const nuevaGlosa: GlosaHistorial = {
        id: Date.now(),
        tipo: tipoGlosa as TipoGlosa,
        texto: glosa,
        fecha: new Date().toLocaleString('es-PE'),
        formData: { ...formData },
        items: tipoGlosa === 'orden-compra' ? items.map((it) => ({ ...it })) : [],
      };
      setHistorial((prev) => [nuevaGlosa, ...prev.slice(0, MAX_HISTORIAL_ITEMS - 1)]);
    } catch (error) {
      console.error('Error al generar glosa:', error);
      setValidationErrors([{ field: 'general', message: 'Error al generar la glosa. Intente nuevamente.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const copiarGlosa = async () => {
    try {
      await navigator.clipboard.writeText(glosaGenerada);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Error al copiar:', error);
      setValidationErrors([{ field: 'general', message: 'No se pudo copiar al portapapeles. Intente manualmente.' }]);
    }
  };

  const imprimirGlosa = () => window.print();

  const eliminarDelHistorial = (id: number) => {
    setHistorial((prev) => prev.filter((g) => g.id !== id));
  };

  // Exportar el historial a un archivo JSON (respaldo personal)
  const exportarHistorial = () => {
    const blob = new Blob([JSON.stringify(historial, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `glosas-historial-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Importar un historial desde archivo, fusionando por id (sin duplicar)
  const importarHistorial = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (!Array.isArray(data)) throw new Error('Formato inválido');
        setHistorial((prev) => {
          const porId = new Map<number, GlosaHistorial>();
          [...prev, ...data].forEach((g: GlosaHistorial) => {
            if (g && typeof g.id === 'number' && typeof g.texto === 'string') {
              porId.set(g.id, g);
            }
          });
          return Array.from(porId.values())
            .sort((a, b) => b.id - a.id)
            .slice(0, MAX_HISTORIAL_ITEMS);
        });
      } catch {
        setValidationErrors([{ field: 'general', message: 'No se pudo importar: el archivo no es un historial válido.' }]);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const duplicarGlosa = (glosa: GlosaHistorial) => {
    setTipoGlosa(glosa.tipo);
    setFormData(glosa.formData);
    setItems(glosa.items && glosa.items.length > 0 ? glosa.items.map((it) => ({ ...it })) : [{ ...ITEM_VACIO }]);
    setGlosaGenerada('');
    setValidationErrors([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const guardarPlantilla = (index: number) => {
    if (!tipoGlosa) return;
    const base = formData.descripcionGeneral || formData.descripcionContrato || 'Plantilla sin nombre';
    const nombre = base.substring(0, PLANTILLA_NAME_LENGTH) + (base.length > PLANTILLA_NAME_LENGTH ? '...' : '');
    setPlantillas((prev) => {
      const next = [...prev];
      next[index] = {
        tipo: tipoGlosa,
        formData: { ...formData },
        items: tipoGlosa === 'orden-compra' ? items.map((it) => ({ ...it })) : [],
        nombre,
      };
      return next;
    });
  };

  const cargarPlantilla = (plantilla: Plantilla) => {
    setTipoGlosa(plantilla.tipo);
    setFormData(plantilla.formData);
    setItems(plantilla.items && plantilla.items.length > 0 ? plantilla.items.map((it) => ({ ...it })) : [{ ...ITEM_VACIO }]);
    setGlosaGenerada('');
    setValidationErrors([]);
  };

  const limpiarFormulario = () => {
    mostrarConfirmacion(resetFormulario, '¿Está seguro de que desea limpiar todos los datos del formulario?');
  };

  const modificarGlosa = () => {
    setGlosaGenerada('');
    setValidationErrors([]);
  };

  const camposActuales = tipoGlosa ? CAMPOS_POR_TIPO[tipoGlosa] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-100 p-4 print:bg-white print:p-0">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden print:shadow-none">
          {/* Encabezado institucional */}
          <header className="bg-gradient-to-r from-blue-700 to-sky-700 p-6 text-white print:hidden">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <FileText size={36} aria-hidden="true" />
              Generador de Glosas SIGA
            </h1>
            <p className="mt-2 text-blue-100">
              Municipalidad Distrital 26 de Octubre · Oficina de Abastecimiento
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 print:block print:p-0">
            {/* Panel Principal */}
            <div className="lg:col-span-2 space-y-6 print:space-y-0">
              {/* Selección de Tipo */}
              <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-4 rounded-lg border-2 border-sky-200 print:hidden">
                <label htmlFor="tipoGlosa" className="block text-sm font-bold text-gray-700 mb-2">
                  TIPO DE GLOSA A GENERAR
                </label>
                <select
                  id="tipoGlosa"
                  value={tipoGlosa}
                  onChange={(e) => cambiarTipoGlosa(e.target.value as TipoGlosa | '')}
                  className="input-field font-medium"
                >
                  <option value="">-- Seleccione el tipo de glosa --</option>
                  {TIPOS_GLOSA.map((t) => (
                    <option key={t.valor} value={t.valor}>{t.etiqueta}</option>
                  ))}
                </select>
              </div>

              {/* Errores de validación */}
              {validationErrors.length > 0 && (
                <div className="bg-red-50 border-2 border-red-300 p-4 rounded-lg print:hidden" role="alert">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle size={20} className="text-red-600" aria-hidden="true" />
                    <h3 className="font-bold text-red-800">Errores de validación</h3>
                  </div>
                  <ul className="space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index} className="text-red-700 text-sm flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full" aria-hidden="true"></span>
                        {error.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Plantillas Rápidas */}
              {plantillas.some((p) => p !== null) && (
                <div className="bg-amber-50 p-4 rounded-lg border-2 border-amber-300 print:hidden">
                  <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <Save size={20} className="text-amber-600" aria-hidden="true" />
                    Plantillas Rápidas
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {plantillas.map((plantilla, index) => (
                      plantilla && (
                        <button
                          key={index}
                          onClick={() => cargarPlantilla(plantilla)}
                          className="p-2 bg-white border-2 border-amber-400 rounded hover:bg-amber-100 text-xs text-left truncate font-medium transition-colors"
                          title={plantilla.nombre}
                        >
                          {plantilla.nombre}
                        </button>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Formulario Dinámico */}
              {tipoGlosa && (
                <div className="space-y-4 print:hidden">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Datos de la Glosa</h2>
                    <button
                      onClick={limpiarFormulario}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium transition-colors"
                    >
                      Limpiar
                    </button>
                  </div>

                  {camposActuales.map((campo) => {
                    const disabled = glosaGenerada !== '';
                    const disabledCls = disabled ? 'bg-gray-100 cursor-not-allowed' : '';
                    return (
                      <div key={campo.id}>
                        <label htmlFor={campo.id} className="block text-sm font-bold text-gray-700 mb-1">
                          {campo.label} {campo.required && <span className="text-red-500">*</span>}
                        </label>
                        {campo.tipo === 'textarea' ? (
                          <textarea
                            id={campo.id}
                            value={formData[campo.id] || ''}
                            onChange={(e) => handleInputChange(campo.id, e.target.value)}
                            placeholder={campo.placeholder}
                            disabled={disabled}
                            className={`input-field ${disabledCls}`}
                            rows={3}
                          />
                        ) : campo.tipo === 'selectCustom' ? (
                          <div className="space-y-2">
                            <select
                              id={campo.id}
                              value={
                                formData[campo.id] === undefined
                                  ? ''
                                  : campo.opciones?.includes(formData[campo.id])
                                    ? formData[campo.id]
                                    : '__CUSTOM__'
                              }
                              onChange={(e) => handleInputChange(campo.id, e.target.value === '__CUSTOM__' ? '' : e.target.value)}
                              disabled={disabled}
                              className={`input-field ${disabledCls}`}
                            >
                              <option value="">-- Seleccione --</option>
                              {campo.opciones?.map((opcion) => (
                                <option key={opcion} value={opcion}>{opcion}</option>
                              ))}
                              <option value="__CUSTOM__">✏️ Escribir otro...</option>
                            </select>
                            {formData[campo.id] !== undefined && !campo.opciones?.includes(formData[campo.id]) && !disabled && (
                              <input
                                type="text"
                                value={formData[campo.id] || ''}
                                onChange={(e) => handleInputChange(campo.id, e.target.value)}
                                placeholder={`Escriba ${campo.label.toLowerCase()}`}
                                className="input-field bg-blue-50 border-blue-300"
                                aria-label={campo.label}
                              />
                            )}
                          </div>
                        ) : (
                          <input
                            id={campo.id}
                            type="text"
                            value={formData[campo.id] || ''}
                            onChange={(e) => handleInputChange(campo.id, e.target.value)}
                            placeholder={campo.placeholder}
                            disabled={disabled}
                            className={`input-field ${disabledCls}`}
                          />
                        )}
                      </div>
                    );
                  })}

                  {/* Items para Orden de Compra */}
                  {tipoGlosa === 'orden-compra' && (
                    <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-300">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-gray-700">Ítems del Pedido</h3>
                        {glosaGenerada === '' && (
                          <button
                            onClick={agregarItem}
                            className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium transition-colors"
                          >
                            <Plus size={16} aria-hidden="true" /> Agregar Ítem
                          </button>
                        )}
                      </div>
                      {items.map((item, index) => (
                        <div key={index} className="grid grid-cols-2 sm:grid-cols-12 gap-2 mb-2">
                          <input
                            type="text"
                            value={item.descripcion}
                            onChange={(e) => actualizarItem(index, 'descripcion', e.target.value)}
                            placeholder="Descripción del ítem"
                            disabled={glosaGenerada !== ''}
                            aria-label={`Descripción del ítem ${index + 1}`}
                            className={`col-span-2 sm:col-span-6 p-2 border rounded ${glosaGenerada !== '' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                          />
                          <input
                            type="text"
                            value={item.cantidad}
                            onChange={(e) => actualizarItem(index, 'cantidad', e.target.value)}
                            placeholder="Cant."
                            disabled={glosaGenerada !== ''}
                            aria-label={`Cantidad del ítem ${index + 1}`}
                            className={`col-span-1 sm:col-span-2 p-2 border rounded ${glosaGenerada !== '' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                          />
                          <input
                            type="text"
                            value={item.unidad}
                            onChange={(e) => actualizarItem(index, 'unidad', e.target.value)}
                            placeholder="UND"
                            disabled={glosaGenerada !== ''}
                            aria-label={`Unidad del ítem ${index + 1}`}
                            className={`col-span-1 sm:col-span-3 p-2 border rounded ${glosaGenerada !== '' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                          />
                          {items.length > 1 && glosaGenerada === '' && (
                            <button
                              onClick={() => eliminarItem(index)}
                              className="col-span-2 sm:col-span-1 p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center justify-center"
                              aria-label={`Eliminar ítem ${index + 1}`}
                            >
                              <Trash2 size={16} aria-hidden="true" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Botones de Acción */}
                  {!glosaGenerada ? (
                    <div className="flex gap-3">
                      <button
                        onClick={generarGlosa}
                        disabled={isLoading}
                        className={`btn-primary flex-1 flex items-center justify-center gap-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Zap size={20} aria-hidden="true" />
                        {isLoading ? 'GENERANDO...' : 'GENERAR GLOSA'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <button onClick={modificarGlosa} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                        <Pencil size={20} aria-hidden="true" /> MODIFICAR GLOSA
                      </button>
                      <button onClick={limpiarFormulario} className="btn-success flex-1 flex items-center justify-center gap-2">
                        <FilePlus size={20} aria-hidden="true" /> NUEVA GLOSA
                      </button>
                    </div>
                  )}

                  {/* Guardar como Plantilla */}
                  {glosaGenerada && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-gray-600 py-2">Guardar como plantilla:</span>
                      {[0, 1, 2].map((index) => (
                        <button
                          key={index}
                          onClick={() => guardarPlantilla(index)}
                          className="px-3 py-2 bg-amber-100 text-amber-700 rounded hover:bg-amber-200 text-sm font-medium transition-colors"
                        >
                          Slot {index + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Glosa Generada */}
              {glosaGenerada && (
                <div className="bg-green-50 p-4 rounded-lg border-2 border-green-300 print:border-0 print:bg-white print:p-0">
                  <div className="flex justify-between items-center mb-3 print:hidden">
                    <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                      <CheckCircle size={20} className="text-green-600" aria-hidden="true" />
                      Glosa Generada
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={imprimirGlosa}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 font-bold shadow transition-colors"
                      >
                        <Printer size={20} aria-hidden="true" /> IMPRIMIR / PDF
                      </button>
                      <button
                        onClick={copiarGlosa}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold shadow-lg transition-colors"
                      >
                        <Copy size={20} aria-hidden="true" /> COPIAR
                      </button>
                    </div>
                  </div>
                  <div className="hidden print:block mb-4 text-center">
                    <p className="font-bold uppercase">Municipalidad Distrital 26 de Octubre</p>
                    <p className="text-sm">Oficina de Abastecimiento · Glosa SIGA</p>
                    <hr className="my-2" />
                  </div>
                  <pre className="glosa-print-area bg-white p-4 rounded border border-green-300 whitespace-pre-wrap text-sm font-mono print:border-0 print:text-base">
                    {glosaGenerada}
                  </pre>
                </div>
              )}
            </div>

            {/* Panel Lateral - Historial */}
            <aside className="lg:col-span-1 print:hidden">
              <div className="bg-gray-50 rounded-lg border-2 border-gray-300 p-4 sticky top-4">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Clock size={20} className="text-blue-600" aria-hidden="true" />
                  Historial ({historial.length}/{MAX_HISTORIAL_ITEMS})
                </h3>
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={exportarHistorial}
                    disabled={historial.length === 0}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Descargar el historial como archivo de respaldo"
                  >
                    <Download size={14} aria-hidden="true" /> Exportar
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-white border-2 border-blue-600 text-blue-700 rounded text-xs font-medium hover:bg-blue-50 transition-colors"
                    title="Cargar un historial desde un archivo de respaldo"
                  >
                    <Upload size={14} aria-hidden="true" /> Importar
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/json,.json"
                    onChange={importarHistorial}
                    className="hidden"
                    aria-hidden="true"
                  />
                </div>
                <div className="relative mb-3">
                  <Search size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                  <input
                    type="search"
                    value={busquedaHistorial}
                    onChange={(e) => setBusquedaHistorial(e.target.value)}
                    placeholder="Buscar en el historial..."
                    aria-label="Buscar en el historial"
                    className="w-full pl-8 pr-2 py-2 border-2 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {historialFiltrado.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-8">
                      {historial.length === 0 ? 'No hay glosas generadas aún' : 'Sin resultados para la búsqueda'}
                    </p>
                  ) : (
                    historialFiltrado.map((glosa) => (
                      <div
                        key={glosa.id}
                        className="relative bg-white rounded border border-gray-300 hover:border-blue-500 transition-all"
                      >
                        <button
                          className="w-full text-left p-3 pr-8 cursor-pointer"
                          onClick={() => duplicarGlosa(glosa)}
                        >
                          <div className="text-xs text-gray-500 mb-1">{glosa.fecha}</div>
                          <div className="text-sm font-medium text-gray-800 line-clamp-2">
                            {glosa.texto.substring(0, 70)}...
                          </div>
                          <div className="text-xs text-blue-600 mt-2 font-medium">Click para duplicar</div>
                        </button>
                        <button
                          onClick={() => eliminarDelHistorial(glosa.id)}
                          className="absolute top-1 right-1 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          aria-label="Eliminar del historial"
                          title="Eliminar del historial"
                        >
                          <Trash2 size={14} aria-hidden="true" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Notificación de Éxito */}
      {showSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-2xl print:hidden" role="status">
          ✅ ¡Glosa copiada al portapapeles!
        </div>
      )}

      {/* Diálogo de Confirmación */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 print:hidden" role="dialog" aria-modal="true">
          <div className="bg-white p-6 rounded-lg shadow-2xl max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle size={24} className="text-amber-600" aria-hidden="true" />
              <h3 className="text-lg font-bold text-gray-800">Confirmar acción</h3>
            </div>
            <p className="text-gray-600 mb-6">{confirmMensaje}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={ejecutarAccionConfirmada}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { GeneradorGlosasSIGA };
export default GeneradorGlosasSIGA;
