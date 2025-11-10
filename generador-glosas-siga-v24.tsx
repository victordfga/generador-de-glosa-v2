import React, { useState, useEffect } from 'react';
import { Copy, Plus, Save, Trash2, FileText, Clock } from 'lucide-react';

const GeneradorGlosasSIGA = () => {
  const [tipoGlosa, setTipoGlosa] = useState('');
  const [formData, setFormData] = useState({});
  const [glosaGenerada, setGlosaGenerada] = useState('');
  const [historial, setHistorial] = useState([]);
  const [plantillas, setPlantillas] = useState([null, null, null]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [items, setItems] = useState([{ descripcion: '', cantidad: '', unidad: '' }]);

  const unidadesOrganicas = [
    'Aldea Infantil Huarmaca',
    'Aldea Infantil San Miguel de Piura',
    'Archivo Regional Piura',
    'Agua Bayovar',
    'Centro de Servicio de Equipo Mecanizado',
    'Centro Regional de Planeamiento Estratégico',
    'Dirección de Estudios y Proyectos',
    'Dirección de Obras',
    'Dirección Regional de Comercio Exterior y Turismo',
    'Dirección Regional de Energía y Minas',
    'Dirección Regional de la Producción Piura',
    'Dirección Regional de Trabajo y Promoción del Empleo',
    'Gerencia de Desarrollo Económico',
    'Gerencia de Recursos Naturales y Gestión del Medio Ambiente',
    'Gerencia General Regional',
    'Gerencia Regional de Desarrollo Social',
    'Gerencia Regional de Infraestructura',
    'Gerencia Regional de Recursos Naturales y Gestión del Medio Ambiente',
    'Gerencia Regional de Saneamiento Físico Legal de la Propiedad Rural',
    'Laboratorio de Suelos',
    'Oficina de Abastecimiento y Servicios Auxiliares',
    'Oficina de Comunicación e Imagen Institucional',
    'Oficina de Contabilidad',
    'Oficina de Control Patrimonial',
    'Oficina de Programación y Seguimiento de Contratos de Inversión',
    'Oficina de Programación Multianual de Inversiones',
    'Oficina de Recursos Humanos',
    'Oficina de Tecnologías de la Información',
    'Oficina de Tesorería',
    'Oficina Regional de Administración',
    'Oficina Regional de Comunicaciones e Imagen Institucional',
    'Oficina Regional de Seguridad y Defensa Nacional',
    'Procuraduría Pública Regional',
    'Programa de Apoyo Social',
    'Programa de Desarrollo Social',
    'Programa PIMA',
    'Secretaría de Consejo Regional',
    'Secretaría General de la Gobernación Regional',
    'Secretaría Técnica de la Sede Central del Gobierno Regional de Piura',
    'Sub Gerencia Regional de Desarrollo Institucional',
    'Sub Gerencia Regional de Gestión de Recursos Naturales',
    'Sub Gerencia Regional de Normas, Monitoreo y Evaluación GRI',
    'Sub Gerencia Regional de Planeamiento, Programación e Inversión',
    'Sub Gerencia Regional de Promoción de Inversiones',
    'Unidad Formuladora'
  ];

  const codigosItem = [
    'SERVICIO DE ASISTENCIA TÉCNICA EN INGENIERÍA',
    'SERVICIO DE ASISTENCIA TÉCNICA ADMINISTRATIVA',
    'SERVICIO ESPECIALIZADO EN TEMAS DE DERECHO',
    'SERVICIO DE CONSULTORÍA'
  ];

  const tiposDocumento = ['MEMORÁNDUM', 'MEMORANDO', 'INFORME', 'CARTA'];

  const camposPorTipo = {
    'orden-servicio-consultoria': [
      { id: 'descripcionGeneral', label: 'Descripción General del Servicio', tipo: 'textarea' },
      { id: 'descripcionItem', label: 'Descripción del Item en el Sistema', tipo: 'text' },
      { id: 'unidadOrganica', label: 'Unidad Orgánica Solicitante', tipo: 'selectCustom', opciones: unidadesOrganicas },
      { id: 'detalleServicio', label: 'Detalle Específico del Servicio', tipo: 'textarea' },
      { id: 'plazo', label: 'Plazo de Ejecución (en días)', tipo: 'text' },
      { id: 'garantia', label: 'Descripción de la Garantía', tipo: 'text', placeholder: 'Ej: DURANTE EL SERVICIO' },
      { id: 'docReferencia', label: 'Documento de Referencia', tipo: 'text', placeholder: 'Ej: MEMORÁNDUM N°282-2025-GRP/490000' },
      { id: 'docAtendido', label: 'Documento Atendido', tipo: 'text', placeholder: 'Ej: MEMORÁNDUM N° 331-2025-GRP/490000' },
      { id: 'pedidoInterno', label: 'Nro. de Pedido Interno', tipo: 'text' },
      { id: 'certificado', label: 'Nro. de Certificado Presupuestal', tipo: 'text' },
      { id: 'ordenServicio', label: 'Nro. de Orden de Servicio (O/S)', tipo: 'text' }
    ],
    'orden-servicio-recurrente': [
      { id: 'descripcionGeneral', label: 'Descripción General del Servicio', tipo: 'textarea' },
      { id: 'descripcionItem', label: 'Descripción del Item en el Sistema', tipo: 'text' },
      { id: 'unidadOrganica', label: 'Unidad Orgánica Solicitante', tipo: 'selectCustom', opciones: unidadesOrganicas },
      { id: 'detalleServicio', label: 'Detalle Específico del Servicio', tipo: 'textarea' },
      { id: 'periodo', label: 'Periodo del Servicio', tipo: 'text', placeholder: 'Ej: SEPTIEMBRE, OCTUBRE, NOVIEMBRE Y DICIEMBRE DEL 2025' },
      { id: 'docReferencia', label: 'Documento de Referencia', tipo: 'text', placeholder: 'Ej: MEMORÁNDUM N°282-2025-GRP/490000' },
      { id: 'docAtendido', label: 'Documento Atendido', tipo: 'text', placeholder: 'Ej: MEMORÁNDUM N° 331-2025-GRP/490000' },
      { id: 'pedidoInterno', label: 'Nro. de Pedido Interno', tipo: 'text' },
      { id: 'certificado', label: 'Nro. de Certificado Presupuestal', tipo: 'text' },
      { id: 'ordenServicio', label: 'Nro. de Orden de Servicio (O/S)', tipo: 'text' }
    ],
    'orden-compra': [
      { id: 'descripcionGeneral', label: 'Descripción General del Bien', tipo: 'textarea' },
      { id: 'unidadOrganica', label: 'Unidad Orgánica Solicitante', tipo: 'selectCustom', opciones: unidadesOrganicas },
      { id: 'detalleBien', label: 'Detalle Específico del Bien', tipo: 'textarea' },
      { id: 'plazo', label: 'Plazo de Entrega (en días)', tipo: 'text' },
      { id: 'garantia', label: 'Descripción de la Garantía', tipo: 'text' },
      { id: 'docReferencia', label: 'Documento de Referencia', tipo: 'text', placeholder: 'Ej: MEMORÁNDUM N°2843-2025/GRP-410000' },
      { id: 'docAtendido', label: 'Documento Atendido', tipo: 'text', placeholder: 'Ej: MEMORANDO N°922-2025/GRP-100020' },
      { id: 'pedidoInterno', label: 'Nro. de Pedido Interno', tipo: 'text' },
      { id: 'certificado', label: 'Nro. de Certificado Presupuestal', tipo: 'text' },
      { id: 'ordenCompra', label: 'Nro. de Orden de Compra (O/C)', tipo: 'text' }
    ],
    'pago-contrato': [
      { id: 'descripcionContrato', label: 'Descripción del Servicio del Contrato', tipo: 'textarea' },
      { id: 'periodoValorizacion', label: 'Periodo o Valorización a Pagar', tipo: 'text' },
      { id: 'docConformidad', label: 'Documento de Conformidad', tipo: 'text' },
      { id: 'docAtendido', label: 'Documento Atendido', tipo: 'text', placeholder: 'Ej: INFORME N° 3148-2025/GRP-480400-AASS' },
      { id: 'contratoNumero', label: 'Nro. de Contrato Original', tipo: 'text' }
    ]
  };

  const agregarItem = () => {
    setItems([...items, { descripcion: '', cantidad: '', unidad: '' }]);
  };

  const eliminarItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const actualizarItem = (index, campo, valor) => {
    const nuevosItems = [...items];
    nuevosItems[index][campo] = valor;
    setItems(nuevosItems);
  };

  const handleInputChange = (campo, valor) => {
    setFormData({ ...formData, [campo]: valor });
  };

  const generarGlosa = () => {
    let glosa = '';

    if (tipoGlosa === 'orden-servicio-recurrente') {
      glosa = `POR LA ${formData.descripcionGeneral?.toUpperCase() || ''}
- ${formData.descripcionItem?.toUpperCase() || ''}
PEDIDO DE SERVICIO SOLICITADO POR ${formData.unidadOrganica?.toUpperCase() || ''}.

DETALLE DEL SERVICIO: ${formData.detalleServicio?.toUpperCase() || ''}

PERIODO: ${formData.periodo?.toUpperCase() || ''}

REF.: ${formData.docReferencia?.toUpperCase() || ''}

SEGÚN DOCUMENTACIÓN: ${formData.docAtendido?.toUpperCase() || ''}

PEDIDO DE SERVICIO N° ${formData.pedidoInterno || ''}

CERTIFICADO N° ${formData.certificado || ''} / OS N° ${formData.ordenServicio || ''}`;
    } 
    else if (tipoGlosa === 'orden-servicio-consultoria') {
      glosa = `POR LA ${formData.descripcionGeneral?.toUpperCase() || ''}
- ${formData.descripcionItem?.toUpperCase() || ''}
PEDIDO DE SERVICIO SOLICITADO POR ${formData.unidadOrganica?.toUpperCase() || ''}.

DETALLE DEL SERVICIO: ${formData.detalleServicio?.toUpperCase() || ''}

PLAZO DE EJECUCIÓN: ${formData.plazo || ''} DÍAS CALENDARIOS.

REF.: ${formData.docReferencia?.toUpperCase() || ''}

SEGÚN DOCUMENTACIÓN: ${formData.docAtendido?.toUpperCase() || ''}

PEDIDO DE SERVICIO N° ${formData.pedidoInterno || ''}

CERTIFICADO N° ${formData.certificado || ''} / OS N° ${formData.ordenServicio || ''}`;
      
      if (formData.garantia) {
        glosa += `\n\nGARANTÍA: ${formData.garantia?.toUpperCase()}`;
      }
    } 
    else if (tipoGlosa === 'orden-compra') {
      glosa = `POR LA ${formData.descripcionGeneral?.toUpperCase() || ''}`;
      
      items.forEach(item => {
        if (item.descripcion) {
          glosa += `\n- ${item.descripcion?.toUpperCase()}   ${item.cantidad || ''} ${item.unidad?.toUpperCase() || ''}`;
        }
      });
      
      glosa += `\n\nPEDIDO DE COMPRA SOLICITADO POR ${formData.unidadOrganica?.toUpperCase() || ''}.

PLAZO DE ENTREGA: ${formData.plazo || ''} DÍAS CALENDARIOS.

GARANTÍA: ${formData.garantia?.toUpperCase() || ''}

REF.: ${formData.docReferencia?.toUpperCase() || ''}

SEGÚN DOCUMENTACIÓN: ${formData.docAtendido?.toUpperCase() || ''}

PEDIDO DE COMPRA N° ${formData.pedidoInterno || ''}

CERTIFICADO N° ${formData.certificado || ''} / OC N° ${formData.ordenCompra || ''}`;
    } 
    else if (tipoGlosa === 'pago-contrato') {
      glosa = `${formData.descripcionContrato?.toUpperCase() || ''}

PERIODO O VALORIZACIÓN: ${formData.periodoValorizacion?.toUpperCase() || ''}

DOCUMENTO DE CONFORMIDAD: ${formData.docConformidad?.toUpperCase() || ''}

SEGÚN DOCUMENTACIÓN: ${formData.docAtendido?.toUpperCase() || ''}

CONTRATO N° ${formData.contratoNumero?.toUpperCase() || ''}`;
    }

    setGlosaGenerada(glosa);
    
    const nuevaGlosa = {
      id: Date.now(),
      tipo: tipoGlosa,
      texto: glosa,
      fecha: new Date().toLocaleString('es-PE'),
      formData: { ...formData },
      items: tipoGlosa === 'orden-compra' ? [...items] : []
    };
    
    setHistorial([nuevaGlosa, ...historial.slice(0, 19)]);
  };

  const copiarGlosa = () => {
    navigator.clipboard.writeText(glosaGenerada);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const duplicarGlosa = (glosa) => {
    setTipoGlosa(glosa.tipo);
    setFormData(glosa.formData);
    if (glosa.items && glosa.items.length > 0) {
      setItems(glosa.items);
    }
    setGlosaGenerada('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const guardarPlantilla = (index) => {
    const nuevasPlantillas = [...plantillas];
    nuevasPlantillas[index] = {
      tipo: tipoGlosa,
      formData: { ...formData },
      items: tipoGlosa === 'orden-compra' ? [...items] : [],
      nombre: formData.descripcionGeneral?.substring(0, 40) || 'Plantilla sin nombre'
    };
    setPlantillas(nuevasPlantillas);
  };

  const cargarPlantilla = (plantilla) => {
    if (plantilla) {
      setTipoGlosa(plantilla.tipo);
      setFormData(plantilla.formData);
      if (plantilla.items && plantilla.items.length > 0) {
        setItems(plantilla.items);
      }
      setGlosaGenerada('');
    }
  };

  const limpiarFormulario = () => {
    setFormData({});
    setGlosaGenerada('');
    setItems([{ descripcion: '', cantidad: '', unidad: '' }]);
  };

  const modificarGlosa = () => {
    setGlosaGenerada('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FileText size={36} />
              Generador de Glosas SIGA
            </h1>
            <p className="mt-2 text-blue-100">Sistema automatizado para registro de glosas - Gobierno Regional de Piura</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Panel Principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Selección de Tipo */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border-2 border-indigo-200">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  TIPO DE GLOSA A GENERAR
                </label>
                <select
                  value={tipoGlosa}
                  onChange={(e) => {
                    setTipoGlosa(e.target.value);
                    limpiarFormulario();
                  }}
                  className="w-full p-3 border-2 border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white font-medium"
                >
                  <option value="">-- Seleccione el tipo de glosa --</option>
                  <option value="orden-servicio-consultoria">Orden de Servicio (General / Consultoría)</option>
                  <option value="orden-servicio-recurrente">Orden de Servicio (Locador / Recurrente)</option>
                  <option value="orden-compra">Orden de Compra</option>
                  <option value="pago-contrato">Pago de Contrato / Valorización</option>
                </select>
              </div>

              {/* Plantillas Rápidas */}
              {plantillas.some(p => p !== null) && (
                <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-300">
                  <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <Save size={20} className="text-yellow-600" />
                    Plantillas Rápidas
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {plantillas.map((plantilla, index) => (
                      plantilla && (
                        <button
                          key={index}
                          onClick={() => cargarPlantilla(plantilla)}
                          className="p-2 bg-white border-2 border-yellow-400 rounded hover:bg-yellow-100 text-xs text-left truncate font-medium"
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
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Datos de la Glosa</h2>
                    <button
                      onClick={limpiarFormulario}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium"
                    >
                      Limpiar
                    </button>
                  </div>

                  {camposPorTipo[tipoGlosa]?.map(campo => (
                    <div key={campo.id}>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        {campo.label} <span className="text-red-500">*</span>
                      </label>
                      {campo.tipo === 'textarea' ? (
                        <textarea
                          value={formData[campo.id] || ''}
                          onChange={(e) => handleInputChange(campo.id, e.target.value)}
                          placeholder={campo.placeholder}
                          disabled={glosaGenerada !== ''}
                          className={`w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${glosaGenerada !== '' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                          rows="3"
                        />
                      ) : campo.tipo === 'selectCustom' ? (
                        <div className="space-y-2">
                          <select
                            value={formData[campo.id] || ''}
                            onChange={(e) => {
                              if (e.target.value === '__CUSTOM__') {
                                handleInputChange(campo.id, '');
                              } else {
                                handleInputChange(campo.id, e.target.value);
                              }
                            }}
                            disabled={glosaGenerada !== ''}
                            className={`w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${glosaGenerada !== '' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                          >
                            <option value="">-- Seleccione --</option>
                            {campo.opciones.map(opcion => (
                              <option key={opcion} value={opcion}>{opcion}</option>
                            ))}
                            <option value="__CUSTOM__">✏️ Escribir otro...</option>
                          </select>
                          {(formData[campo.id] === '' || !campo.opciones.includes(formData[campo.id])) && formData[campo.id] !== undefined && glosaGenerada === '' && (
                            <input
                              type="text"
                              value={formData[campo.id] || ''}
                              onChange={(e) => handleInputChange(campo.id, e.target.value)}
                              placeholder={`Escriba ${campo.label.toLowerCase()}`}
                              className="w-full p-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-blue-50"
                            />
                          )}
                        </div>
                      ) : campo.tipo === 'select' ? (
                        <select
                          value={formData[campo.id] || ''}
                          onChange={(e) => handleInputChange(campo.id, e.target.value)}
                          disabled={glosaGenerada !== ''}
                          className={`w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${glosaGenerada !== '' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        >
                          <option value="">-- Seleccione --</option>
                          {campo.opciones.map(opcion => (
                            <option key={opcion} value={opcion}>{opcion}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={formData[campo.id] || ''}
                          onChange={(e) => handleInputChange(campo.id, e.target.value)}
                          placeholder={campo.placeholder}
                          disabled={glosaGenerada !== ''}
                          className={`w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${glosaGenerada !== '' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        />
                      )}
                    </div>
                  ))}

                  {/* Items para Orden de Compra */}
                  {tipoGlosa === 'orden-compra' && (
                    <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-300">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-gray-700">Ítems del Pedido</h3>
                        {glosaGenerada === '' && (
                          <button
                            onClick={agregarItem}
                            className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm font-medium"
                          >
                            <Plus size={16} /> Agregar Ítem
                          </button>
                        )}
                      </div>
                      {items.map((item, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                          <input
                            type="text"
                            value={item.descripcion}
                            onChange={(e) => actualizarItem(index, 'descripcion', e.target.value)}
                            placeholder="Descripción del ítem"
                            disabled={glosaGenerada !== ''}
                            className={`col-span-6 p-2 border rounded ${glosaGenerada !== '' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                          />
                          <input
                            type="text"
                            value={item.cantidad}
                            onChange={(e) => actualizarItem(index, 'cantidad', e.target.value)}
                            placeholder="Cant."
                            disabled={glosaGenerada !== ''}
                            className={`col-span-2 p-2 border rounded ${glosaGenerada !== '' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                          />
                          <input
                            type="text"
                            value={item.unidad}
                            onChange={(e) => actualizarItem(index, 'unidad', e.target.value)}
                            placeholder="UND"
                            disabled={glosaGenerada !== ''}
                            className={`col-span-3 p-2 border rounded ${glosaGenerada !== '' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                          />
                          {items.length > 1 && glosaGenerada === '' && (
                            <button
                              onClick={() => eliminarItem(index)}
                              className="col-span-1 p-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                              <Trash2 size={16} />
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
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 font-bold text-lg shadow-lg"
                      >
                        ⚡ GENERAR GLOSA
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={modificarGlosa}
                        className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-lg hover:from-orange-600 hover:to-red-600 font-bold text-lg shadow-lg"
                      >
                        ✏️ MODIFICAR GLOSA
                      </button>
                      <button
                        onClick={limpiarFormulario}
                        className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 text-white p-4 rounded-lg hover:from-green-700 hover:to-teal-700 font-bold text-lg shadow-lg"
                      >
                        ➕ NUEVA GLOSA
                      </button>
                    </div>
                  )}

                  {/* Guardar como Plantilla */}
                  {glosaGenerada && (
                    <div className="flex gap-2">
                      <span className="text-sm text-gray-600 py-2">Guardar como plantilla:</span>
                      {[0, 1, 2].map(index => (
                        <button
                          key={index}
                          onClick={() => guardarPlantilla(index)}
                          className="px-3 py-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-sm font-medium"
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
                <div className="bg-green-50 p-4 rounded-lg border-2 border-green-300">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-gray-800 text-lg">✅ Glosa Generada</h3>
                    <button
                      onClick={copiarGlosa}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold shadow-lg"
                    >
                      <Copy size={20} /> COPIAR
                    </button>
                  </div>
                  <pre className="bg-white p-4 rounded border border-green-300 whitespace-pre-wrap text-sm font-mono">
                    {glosaGenerada}
                  </pre>
                </div>
              )}
            </div>

            {/* Panel Lateral - Historial */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg border-2 border-gray-300 p-4 sticky top-4">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Clock size={20} className="text-blue-600" />
                  Historial de Sesión
                </h3>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {historial.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-8">
                      No hay glosas generadas aún
                    </p>
                  ) : (
                    historial.map(glosa => (
                      <div
                        key={glosa.id}
                        className="bg-white p-3 rounded border border-gray-300 hover:border-blue-500 cursor-pointer transition-all"
                        onClick={() => duplicarGlosa(glosa)}
                      >
                        <div className="text-xs text-gray-500 mb-1">{glosa.fecha}</div>
                        <div className="text-sm font-medium text-gray-800 truncate">
                          {glosa.texto.substring(0, 60)}...
                        </div>
                        <div className="text-xs text-blue-600 mt-2 font-medium">
                          Click para duplicar
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notificación de Éxito */}
      {showSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-2xl animate-bounce">
          ✅ ¡Glosa copiada al portapapeles!
        </div>
      )}
    </div>
  );
};

export default GeneradorGlosasSIGA;