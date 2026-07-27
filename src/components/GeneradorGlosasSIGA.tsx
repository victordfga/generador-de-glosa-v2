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
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 print:p-0">
      <div className="max-w-6xl mx-auto">
        <div className="card overflow-hidden print:shadow-none print:ring-0">
          {/* Encabezado institucional */}
          <header className="flex items-center gap-4 px-6 py-5 border-b border-slate-200 print:hidden">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
              <FileText size={24} aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-slate-900">
                Generador de Glosas SIGA
              </h1>
              <p className="text-sm text-slate-500">
                Municipalidad Distrital 26 de Octubre · Oficina de Abastecimiento
              </p>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 print:block print:p-0">
            {/* Panel Principal */}
            <div className="lg:col-span-2 space-y-5 print:space-y-0">
              {/* Selección de Tipo */}
              <div className="print:hidden">
                <label htmlFor="tipoGlosa" className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                  Tipo de glosa a generar
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
                <div className="bg-red-50 ring-1 ring-inset ring-red-200 p-4 rounded-xl print:hidden" role="alert">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle size={18} className="text-red-500" aria-hidden="true" />
                    <h3 className="font-semibold text-red-800 text-sm">Revisa estos campos</h3>
                  </div>
                  <ul className="space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index} className="text-red-700 text-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full" aria-hidden="true"></span>
                        {error.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Plantillas Rápidas */}
              {plantillas.some((p) => p !== null) && (
                <div className="rounded-xl bg-slate-50 ring-1 ring-inset ring-slate-200 p-4 print:hidden">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3 flex items-center gap-2">
                    <Save size={16} className="text-slate-400" aria-hidden="true" />
                    Plantillas rápidas
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {plantillas.map((plantilla, index) => (
                      plantilla && (
                        <button
                          key={index}
                          onClick={() => cargarPlantilla(plantilla)}
                          className="px-3 py-2 bg-white ring-1 ring-inset ring-slate-200 rounded-lg hover:ring-blue-400 hover:bg-blue-50 text-xs text-left truncate font-medium text-slate-700 transition-colors"
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
                    <h2 className="text-base font-semibold text-slate-900">Datos de la glosa</h2>
                    <button
                      onClick={limpiarFormulario}
                      className="px-3 py-1.5 text-sm font-medium text-slate-500 rounded-lg hover:bg-slate-100 hover:text-slate-700 transition-colors"
                    >
                      Limpiar
                    </button>
                  </div>

                  {camposActuales.map((campo) => {
                    const disabled = glosaGenerada !== '';
                    const disabledCls = disabled ? 'bg-gray-100 cursor-not-allowed' : '';
                    return (
                      <div key={campo.id}>
                        <label htmlFor={campo.id} className="block text-sm font-medium text-slate-700 mb-1.5">
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
                        ) : campo.tipo === 'combo' ? (
                          <>
                            <input
                              id={campo.id}
                              type="text"
                              list={`${campo.id}-opciones`}
                              value={formData[campo.id] || ''}
                              onChange={(e) => handleInputChange(campo.id, e.target.value)}
                              placeholder={campo.placeholder ?? 'Escriba para buscar...'}
                              disabled={disabled}
                              autoComplete="off"
                              className={`input-field ${disabledCls}`}
                            />
                            <datalist id={`${campo.id}-opciones`}>
                              {campo.opciones?.map((opcion) => (
                                <option key={opcion} value={opcion} />
                              ))}
                            </datalist>
                          </>
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
                    <div className="rounded-xl bg-slate-50 ring-1 ring-inset ring-slate-200 p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ítems del pedido</h3>
                        {glosaGenerada === '' && (
                          <button
                            onClick={agregarItem}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-sm font-medium text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            <Plus size={16} aria-hidden="true" /> Agregar ítem
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
                            className="col-span-2 sm:col-span-6 input-field"
                          />
                          <input
                            type="text"
                            value={item.cantidad}
                            onChange={(e) => actualizarItem(index, 'cantidad', e.target.value)}
                            placeholder="Cant."
                            disabled={glosaGenerada !== ''}
                            aria-label={`Cantidad del ítem ${index + 1}`}
                            className="col-span-1 sm:col-span-2 input-field"
                          />
                          <input
                            type="text"
                            value={item.unidad}
                            onChange={(e) => actualizarItem(index, 'unidad', e.target.value)}
                            placeholder="UND"
                            disabled={glosaGenerada !== ''}
                            aria-label={`Unidad del ítem ${index + 1}`}
                            className="col-span-1 sm:col-span-3 input-field"
                          />
                          {items.length > 1 && glosaGenerada === '' && (
                            <button
                              onClick={() => eliminarItem(index)}
                              className="col-span-2 sm:col-span-1 rounded-lg text-slate-400 ring-1 ring-inset ring-slate-200 bg-white hover:text-red-600 hover:ring-red-300 hover:bg-red-50 transition-colors flex items-center justify-center py-2"
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
                    <div className="flex gap-3 pt-1">
                      <button
                        onClick={generarGlosa}
                        disabled={isLoading}
                        className="btn-primary flex-1 py-3 text-base"
                      >
                        <Zap size={18} aria-hidden="true" />
                        {isLoading ? 'Generando…' : 'Generar glosa'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-3 pt-1">
                      <button onClick={modificarGlosa} className="btn-secondary flex-1">
                        <Pencil size={18} aria-hidden="true" /> Modificar
                      </button>
                      <button onClick={limpiarFormulario} className="btn-success flex-1">
                        <FilePlus size={18} aria-hidden="true" /> Nueva glosa
                      </button>
                    </div>
                  )}

                  {/* Guardar como Plantilla */}
                  {glosaGenerada && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-slate-500 py-2">Guardar como plantilla:</span>
                      {[0, 1, 2].map((index) => (
                        <button
                          key={index}
                          onClick={() => guardarPlantilla(index)}
                          className="px-3 py-1.5 bg-white text-slate-600 ring-1 ring-inset ring-slate-300 rounded-lg hover:bg-slate-50 hover:ring-blue-400 hover:text-blue-600 text-sm font-medium transition-colors"
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
                <div className="rounded-xl ring-1 ring-inset ring-slate-200 bg-white p-4 print:ring-0 print:p-0">
                  <div className="flex justify-between items-center mb-3 print:hidden">
                    <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                      <CheckCircle size={18} className="text-emerald-500" aria-hidden="true" />
                      Glosa generada
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={imprimirGlosa}
                        className="btn-secondary px-3 py-2"
                      >
                        <Printer size={16} aria-hidden="true" /> Imprimir / PDF
                      </button>
                      <button
                        onClick={copiarGlosa}
                        className="btn-primary px-3 py-2"
                      >
                        <Copy size={16} aria-hidden="true" /> Copiar
                      </button>
                    </div>
                  </div>
                  <div className="hidden print:block mb-4 text-center">
                    <p className="font-bold uppercase">Municipalidad Distrital 26 de Octubre</p>
                    <p className="text-sm">Oficina de Abastecimiento · Glosa SIGA</p>
                    <hr className="my-2" />
                  </div>
                  <pre className="glosa-print-area rounded-lg bg-slate-50 ring-1 ring-inset ring-slate-200 p-4 whitespace-pre-wrap text-sm font-mono text-slate-800 leading-relaxed print:ring-0 print:bg-white print:text-base">
                    {glosaGenerada}
                  </pre>
                </div>
              )}
            </div>

            {/* Panel Lateral - Historial */}
            <aside className="lg:col-span-1 print:hidden">
              <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-4 sticky top-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Clock size={16} className="text-slate-400" aria-hidden="true" />
                  Historial
                  <span className="ml-auto text-xs font-medium text-slate-400">{historial.length}/{MAX_HISTORIAL_ITEMS}</span>
                </h3>
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={exportarHistorial}
                    disabled={historial.length === 0}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-1.5 bg-white text-slate-600 ring-1 ring-inset ring-slate-300 rounded-lg text-xs font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Descargar el historial como archivo de respaldo"
                  >
                    <Download size={14} aria-hidden="true" /> Exportar
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-1.5 bg-white text-slate-600 ring-1 ring-inset ring-slate-300 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors"
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
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                  <input
                    type="search"
                    value={busquedaHistorial}
                    onChange={(e) => setBusquedaHistorial(e.target.value)}
                    placeholder="Buscar…"
                    aria-label="Buscar en el historial"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2 max-h-[560px] overflow-y-auto">
                  {historialFiltrado.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-10">
                      {historial.length === 0 ? 'Aún no has generado glosas' : 'Sin resultados'}
                    </p>
                  ) : (
                    historialFiltrado.map((glosa) => (
                      <div
                        key={glosa.id}
                        className="group relative bg-white rounded-xl ring-1 ring-inset ring-slate-200 hover:ring-blue-400 transition-all"
                      >
                        <button
                          className="w-full text-left p-3 pr-8 cursor-pointer"
                          onClick={() => duplicarGlosa(glosa)}
                        >
                          <div className="text-xs text-slate-400 mb-1">{glosa.fecha}</div>
                          <div className="text-sm text-slate-700 line-clamp-2">
                            {glosa.texto.substring(0, 70)}…
                          </div>
                          <div className="text-xs text-blue-600 mt-2 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            Clic para duplicar
                          </div>
                        </button>
                        <button
                          onClick={() => eliminarDelHistorial(glosa.id)}
                          className="absolute top-1.5 right-1.5 p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
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
        <div className="fixed bottom-5 right-5 flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg print:hidden" role="status">
          <CheckCircle size={18} className="text-emerald-400" aria-hidden="true" />
          Glosa copiada al portapapeles
        </div>
      )}

      {/* Diálogo de Confirmación */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:hidden" role="dialog" aria-modal="true">
          <div className="bg-white p-6 rounded-2xl shadow-xl ring-1 ring-slate-200 max-w-md w-full">
            <div className="flex items-center gap-3 mb-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100">
                <AlertCircle size={20} className="text-amber-600" aria-hidden="true" />
              </span>
              <h3 className="text-base font-semibold text-slate-900">Confirmar acción</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6">{confirmMensaje}</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowConfirmDialog(false)} className="btn-secondary">
                Cancelar
              </button>
              <button
                onClick={ejecutarAccionConfirmada}
                className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500"
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
