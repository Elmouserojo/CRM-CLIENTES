import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// ──────────────────────────────────────────────
// UTILIDADES
// ──────────────────────────────────────────────
const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const todayISO = () => new Date().toISOString().split('T')[0];

const STORAGE_KEY = 'clientes_app_data_v2';

const loadClients = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveClients = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const compressImage = (file, maxSize = 600, quality = 0.5) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let { width, height } = img;
        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

// ──────────────────────────────────────────────
// ICONOS SVG REUTILIZABLES
// ──────────────────────────────────────────────
const IconSearch = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconCamera = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
  </svg>
);

const IconBack = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const IconPlus = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconHelp = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const IconClose = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconTrash = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" />
  </svg>
);

const IconEdit = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

// ──────────────────────────────────────────────
// COMPONENTES REUTILIZABLES
// ──────────────────────────────────────────────

// Modal de ayuda
const HelpModal = ({ title, content, onClose }) => {
  if (!title) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-lg text-gray-700 leading-relaxed mb-5">{content}</p>
        <button
          onClick={onClose}
          className="w-full py-3.5 bg-blue-700 text-white rounded-xl text-lg font-bold hover:bg-blue-800 transition"
        >
          ENTENDIDO
        </button>
      </div>
    </div>
  );
};

// Modal de confirmación
const ConfirmModal = ({ title, message, onConfirm, onCancel, confirmText = 'SÍ', cancelText = 'CANCELAR' }) => {
  if (!title) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-lg text-gray-700 leading-relaxed mb-5">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3.5 bg-gray-200 text-gray-800 rounded-xl text-lg font-bold hover:bg-gray-300 transition">
            {cancelText}
          </button>
          <button onClick={onConfirm} className="flex-1 py-3.5 bg-red-600 text-white rounded-xl text-lg font-bold hover:bg-red-700 transition">
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal de repuesto (agregar / editar)
const PartModal = ({ part, isNew, onSave, onRemove, onClose }) => {
  const [name, setName] = useState(part?.name || '');
  const [quantity, setQuantity] = useState(part?.quantity || 1);
  const [price, setPrice] = useState(part?.price ? String(part.price) : '');

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ id: part?.id || generateId(), name: name.trim(), quantity: Math.max(1, Number(quantity)), price: price ? parseFloat(price) : null });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold text-gray-900">{isNew ? 'AGREGAR REPUESTO' : 'EDITAR REPUESTO'}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 min-w-[48px] min-h-[48px] flex items-center justify-center" aria-label="Cerrar">
            <IconClose />
          </button>
        </div>

        {/* Nombre */}
        <label className="block text-base font-semibold text-gray-700 mb-1">Nombre del repuesto</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Bomba de agua"
          className="w-full p-4 text-lg border-2 border-gray-300 rounded-xl mb-4 focus:border-blue-500 focus:outline-none"
        />

        {/* Cantidad */}
        <label className="block text-base font-semibold text-gray-700 mb-1">Cantidad</label>
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="min-w-[56px] min-h-[56px] flex items-center justify-center bg-gray-200 rounded-xl text-2xl font-bold hover:bg-gray-300 transition"
            aria-label="Reducir cantidad"
          >
            −
          </button>
          <span className="text-2xl font-bold text-gray-900 min-w-[40px] text-center">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="min-w-[56px] min-h-[56px] flex items-center justify-center bg-gray-200 rounded-xl text-2xl font-bold hover:bg-gray-300 transition"
            aria-label="Aumentar cantidad"
          >
            +
          </button>
        </div>

        {/* Precio */}
        <label className="block text-base font-semibold text-gray-700 mb-1">Precio unitario (opcional)</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Ej: 1500"
          className="w-full p-4 text-lg border-2 border-gray-300 rounded-xl mb-6 focus:border-blue-500 focus:outline-none"
        />

        {/* Botones */}
        <div className="flex flex-col gap-3">
          <button onClick={handleSave} disabled={!name.trim()} className="w-full py-4 bg-green-600 text-white rounded-xl text-lg font-bold hover:bg-green-700 transition disabled:opacity-40">
            {isNew ? 'AGREGAR' : 'ACTUALIZAR'}
          </button>
          {!isNew && (
            <button onClick={onRemove} className="w-full py-4 bg-red-600 text-white rounded-xl text-lg font-bold hover:bg-red-700 transition">
              ELIMINAR REPUESTO
            </button>
          )}
          <button onClick={onClose} className="w-full py-4 bg-gray-300 text-gray-800 rounded-xl text-lg font-bold hover:bg-gray-400 transition">
            CANCELAR
          </button>
        </div>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────
// PANTALLA: LISTA DE CLIENTES
// ──────────────────────────────────────────────
const ClientListScreen = ({ clients, onSelectClient, onAddClient }) => {
  const [search, setSearch] = useState('');
  const [sortMode, setSortMode] = useState('name'); // 'name' | 'work'
  const [help, setHelp] = useState(null);

  const filtered = useMemo(() => {
    let list = clients.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.address.toLowerCase().includes(search.toLowerCase())
    );
    if (sortMode === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name, 'es'));
    } else {
      list.sort((a, b) => {
        const dateA = a.updatedAt || a.lastWork?.date || '';
        const dateB = b.updatedAt || b.lastWork?.date || '';
        return dateB.localeCompare(dateA);
      });
    }
    return list;
  }, [clients, search, sortMode]);

  return (
    <div className="min-h-screen bg-gray-50 max-w-[600px] mx-auto">
      {/* Header */}
      <header className="bg-blue-800 text-white px-5 pt-6 pb-5">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Mis Clientes</h1>
          <button
            onClick={() => setHelp({ title: 'Lista de Clientes', content: 'Aquí ves todos tus clientes guardados. Puedes buscar por nombre o dirección, ordenar alfabéticamente o por trabajo más reciente, y agregar nuevos clientes con el botón verde.' })}
            className="p-2 rounded-full hover:bg-blue-700 min-w-[48px] min-h-[48px] flex items-center justify-center"
            aria-label="Ayuda"
          >
            <IconHelp />
          </button>
        </div>

        {/* Buscador */}
        <div className="relative mb-4">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <IconSearch />
          </div>
          <input
            type="text"
            placeholder="Buscar cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 text-lg rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Botones de orden */}
        <div className="flex gap-3">
          <button
            onClick={() => setSortMode('name')}
            className={`flex-1 py-3 rounded-xl text-base font-bold transition ${sortMode === 'name' ? 'bg-white text-blue-800' : 'bg-blue-700 text-blue-100 hover:bg-blue-600'}`}
          >
            🔤 Ordenar por nombre
          </button>
          <button
            onClick={() => setSortMode('work')}
            className={`flex-1 py-3 rounded-xl text-base font-bold transition ${sortMode === 'work' ? 'bg-white text-blue-800' : 'bg-blue-700 text-blue-100 hover:bg-blue-600'}`}
          >
            🛠️ Trabajo reciente
          </button>
        </div>
      </header>

      {/* Lista */}
      <main className="px-4 py-5 pb-28 space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500 font-medium">
              {clients.length === 0 ? 'No hay clientes aún.' : 'Sin resultados.'}
            </p>
            {clients.length === 0 && (
              <button onClick={onAddClient} className="mt-4 px-6 py-3 bg-green-600 text-white rounded-xl text-lg font-bold hover:bg-green-700 transition">
                + AGREGAR MI PRIMER CLIENTE
              </button>
            )}
          </div>
        ) : (
          filtered.map(client => (
            <article
              key={client.id}
              className="bg-white rounded-2xl p-5 shadow-md border border-gray-100"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-2">🧑 {client.name}</h2>
              <p className="text-base text-gray-600 mb-1 flex items-start gap-2">
                <span className="flex-shrink-0">📍</span>
                <span>{client.address || 'Sin dirección'}</span>
              </p>
              <p className="text-base text-gray-600 mb-4 flex items-start gap-2">
                <span className="flex-shrink-0">🔧</span>
                <span>Último: {client.lastWork?.description || 'Sin trabajos registrados'}</span>
              </p>
              <button
                onClick={() => onSelectClient(client.id)}
                className="w-full py-3.5 bg-blue-600 text-white rounded-xl text-lg font-bold hover:bg-blue-700 transition active:bg-blue-800"
              >
                VER MÁS
              </button>
            </article>
          ))
        )}
      </main>

      {/* Botón flotante */}
      <button
        onClick={onAddClient}
        className="fixed bottom-8 right-8 z-50 bg-green-600 text-white rounded-full shadow-xl hover:bg-green-700 transition active:bg-green-800 min-w-[64px] min-h-[64px] flex items-center justify-center text-4xl font-bold"
        aria-label="Agregar nuevo cliente"
      >
        +
      </button>

      {/* Modal de ayuda */}
      {help && <HelpModal title={help.title} content={help.content} onClose={() => setHelp(null)} />}
    </div>
  );
};

// ──────────────────────────────────────────────
// PANTALLA: DETALLE DEL CLIENTE
// ──────────────────────────────────────────────
const ClientDetailScreen = ({ client, onBack, onUpdate, onDelete }) => {
  const [name, setName] = useState(client.name);
  const [phone, setPhone] = useState(client.phone || '');
  const [address, setAddress] = useState(client.address || '');
  const [workDate, setWorkDate] = useState(client.lastWork?.date || todayISO());
  const [workDesc, setWorkDesc] = useState(client.lastWork?.description || '');
  const [parts, setParts] = useState(client.lastWork?.parts || []);
  const [photos, setPhotos] = useState(client.lastWork?.photos || []);
  const fileInputRef = useRef(null);
  const [partModal, setPartModal] = useState(null); // { isNew: boolean, part?: object }
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [pendingNav, setPendingNav] = useState(null);
  const [help, setHelp] = useState(null);
  const [saved, setSaved] = useState(false);

  const hasChanges = useCallback(() => {
    return (
      name !== client.name ||
      phone !== (client.phone || '') ||
      address !== (client.address || '') ||
      workDate !== (client.lastWork?.date || '') ||
      workDesc !== (client.lastWork?.description || '') ||
      JSON.stringify(parts) !== JSON.stringify(client.lastWork?.parts || []) ||
      JSON.stringify(photos) !== JSON.stringify(client.lastWork?.photos || [])
    );
  }, [name, phone, address, workDate, workDesc, parts, photos, client]);

  const handleSave = () => {
    const updated = {
      ...client,
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      updatedAt: new Date().toISOString(),
      lastWork: {
        date: workDate,
        description: workDesc.trim(),
        parts,
        photos,
      },
    };
    onUpdate(updated);
    onBack();
  };

  const handleNav = (action) => {
    if (hasChanges()) {
      setPendingNav(() => action);
      setConfirmLeave(true);
    } else {
      action();
    }
  };

  const handlePartSave = (partData) => {
    if (partModal?.isNew) {
      setParts(prev => [...prev, partData]);
    } else {
      setParts(prev => prev.map(p => p.id === partData.id ? partData : p));
    }
    setPartModal(null);
  };

  const handlePartRemove = (id) => {
    setParts(prev => prev.filter(p => p.id !== id));
    setPartModal(null);
  };

  const handleAddPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      setPhotos(prev => [...prev, compressed]);
    } catch (error) {
      console.error("Error al comprimir la imagen", error);
      alert("No se pudo procesar la imagen");
    }
    e.target.value = '';
  };

  const totalPartsPrice = parts.reduce((sum, p) => sum + (p.price || 0) * p.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 max-w-[600px] mx-auto">
      {/* Header */}
      <header className="bg-blue-800 text-white px-5 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => handleNav(onBack)}
            className="flex items-center gap-2 py-2 px-3 rounded-xl hover:bg-blue-700 transition min-h-[48px]"
          >
            <IconBack />
            <span className="text-lg font-semibold">VOLVER</span>
          </button>
          <button
            onClick={() => setHelp({ title: 'Detalle del Cliente', content: 'Aquí puedes ver y editar los datos del cliente, registrar el trabajo realizado, y gestionar los repuestos cambiados. Los cambios se guardan al tocar el botón verde "GUARDAR TRABAJO".' })}
            className="p-2 rounded-full hover:bg-blue-700 min-w-[48px] min-h-[48px] flex items-center justify-center"
            aria-label="Ayuda"
          >
            <IconHelp />
          </button>
        </div>
      </header>

      <main className="px-4 py-5 pb-8 space-y-6">
        {/* Datos del cliente */}
        <section className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
          <h2 className="text-lg font-bold text-gray-500 uppercase tracking-wide mb-3">Datos del cliente</h2>

          <label className="block text-base font-semibold text-gray-700 mb-1">Nombre</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-4 text-lg border-2 border-gray-300 rounded-xl mb-3 focus:border-blue-500 focus:outline-none"
          />

          <label className="block text-base font-semibold text-gray-700 mb-1">Teléfono</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Ej: 11-1234-5678"
            className="w-full p-4 text-lg border-2 border-gray-300 rounded-xl mb-3 focus:border-blue-500 focus:outline-none"
          />

          <label className="block text-base font-semibold text-gray-700 mb-1">Dirección</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Ej: Av. Siempreviva 123"
            className="w-full p-4 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
          />
        </section>

        {/* Trabajo realizado */}
        <section className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
          <h2 className="text-lg font-bold text-gray-500 uppercase tracking-wide mb-3">Trabajo realizado</h2>

          <label className="block text-base font-semibold text-gray-700 mb-1">Fecha</label>
          <input
            type="date"
            value={workDate}
            onChange={(e) => setWorkDate(e.target.value)}
            className="w-full p-4 text-lg border-2 border-gray-300 rounded-xl mb-3 focus:border-blue-500 focus:outline-none"
          />

          <label className="block text-base font-semibold text-gray-700 mb-1">Descripción del trabajo</label>
          <textarea
            value={workDesc}
            onChange={(e) => setWorkDesc(e.target.value)}
            placeholder="Describe el trabajo realizado..."
            rows={3}
            className="w-full p-4 text-lg border-2 border-gray-300 rounded-xl mb-4 focus:border-blue-500 focus:outline-none resize-none"
          />

          {/* Repuestos */}
          <h3 className="text-base font-bold text-gray-700 mb-2">REPUESTOS CAMBIADOS</h3>
          {parts.length === 0 ? (
            <p className="text-base text-gray-400 mb-3">No hay repuestos registrados.</p>
          ) : (
            <ul className="space-y-2 mb-3">
              {parts.map(p => (
                <li key={p.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div>
                    <span className="text-lg font-semibold text-gray-900">{p.name}</span>
                    <span className="text-base text-gray-500 ml-2">({p.quantity})</span>
                    {p.price != null && (
                      <span className="text-base text-gray-500 ml-2">— ${p.price.toLocaleString('es-AR')}</span>
                    )}
                  </div>
                  <button
                    onClick={() => setPartModal({ isNew: false, part: p })}
                    className="min-w-[48px] min-h-[48px] flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 rounded-xl text-base font-bold hover:bg-gray-300 transition"
                  >
                    <IconEdit /> EDITAR
                  </button>
                </li>
              ))}
            </ul>
          )}

          {parts.length > 0 && (
            <p className="text-base font-bold text-gray-700 mb-3">Total repuestos: ${totalPartsPrice.toLocaleString('es-AR')}</p>
          )}

          <button
            onClick={() => setPartModal({ isNew: true })}
            className="w-full py-3.5 bg-blue-100 text-blue-700 rounded-xl text-lg font-bold hover:bg-blue-200 transition border-2 border-blue-200 mb-4"
          >
            + AGREGAR REPUESTO
          </button>

          {/* Fotos */}
          <h3 className="text-base font-bold text-gray-700 mb-2 mt-4">FOTOS DEL TRABAJO</h3>
          {photos.length === 0 ? (
            <p className="text-base text-gray-400 mb-3">No hay fotos registradas.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 mb-3">
              {photos.map((p, i) => (
                <div key={i} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square">
                  <img src={p} alt={`Foto ${i+1}`} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full shadow-md opacity-80 hover:opacity-100 transition"
                  >
                    <IconTrash />
                  </button>
                </div>
              ))}
            </div>
          )}

          <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleAddPhoto} />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3.5 bg-purple-100 text-purple-700 rounded-xl text-lg font-bold hover:bg-purple-200 transition border-2 border-purple-200 flex items-center justify-center gap-2"
          >
            <IconCamera /> AGREGAR FOTO
          </button>
        </section>

        {/* Guardar */}
        <button
          onClick={handleSave}
          className="w-full py-4 bg-green-600 text-white rounded-xl text-xl font-bold hover:bg-green-700 transition active:bg-green-800 shadow-md"
        >
          {saved ? '✓ GUARDADO' : 'GUARDAR TRABAJO'}
        </button>

        {/* Eliminar */}
        <button
          onClick={() => setConfirmDelete(true)}
          className="w-full py-4 bg-red-100 text-red-700 rounded-xl text-lg font-bold hover:bg-red-200 transition border-2 border-red-200 flex items-center justify-center gap-2"
        >
          <IconTrash /> ELIMINAR CLIENTE
        </button>
      </main>

      {/* Modales */}
      {partModal && (
        <PartModal
          part={partModal.part}
          isNew={partModal.isNew}
          onSave={handlePartSave}
          onRemove={() => handlePartRemove(partModal.part.id)}
          onClose={() => setPartModal(null)}
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          title="¿Eliminar cliente?"
          message={`Se eliminará a "${client.name}" y todos sus trabajos. Esta acción no se puede deshacer.`}
          onConfirm={() => { onDelete(client.id); onBack(); }}
          onCancel={() => setConfirmDelete(false)}
          confirmText="SÍ, ELIMINAR"
        />
      )}

      {confirmLeave && (
        <ConfirmModal
          title="¿Salir sin guardar?"
          message="Tienes cambios sin guardar. Si sales ahora, se perderán."
          onConfirm={() => { pendingNav?.(); setConfirmLeave(false); setPendingNav(null); }}
          onCancel={() => { setConfirmLeave(false); setPendingNav(null); }}
          confirmText="SALIR SIN GUARDAR"
        />
      )}

      {help && <HelpModal title={help.title} content={help.content} onClose={() => setHelp(null)} />}
    </div>
  );
};

// ──────────────────────────────────────────────
// PANTALLA: NUEVO CLIENTE
// ──────────────────────────────────────────────
const NewClientScreen = ({ onBack, onSave }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [saved, setSaved] = useState(false);
  const [help, setHelp] = useState(null);

  const handleSave = () => {
    if (!name.trim()) return;
    const newClient = {
      id: generateId(),
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      updatedAt: new Date().toISOString(),
      lastWork: { date: todayISO(), description: '', parts: [] },
    };
    onSave(newClient);
    setSaved(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-[600px] mx-auto">
      <header className="bg-blue-800 text-white px-5 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 py-2 px-3 rounded-xl hover:bg-blue-700 transition min-h-[48px]"
          >
            <IconBack />
            <span className="text-lg font-semibold">VOLVER</span>
          </button>
          <button
            onClick={() => setHelp({ title: 'Nuevo Cliente', content: 'Completa el nombre del cliente (obligatorio), teléfono y dirección. Luego podrás agregar trabajos y repuestos desde la pantalla de detalle.' })}
            className="p-2 rounded-full hover:bg-blue-700 min-w-[48px] min-h-[48px] flex items-center justify-center"
            aria-label="Ayuda"
          >
            <IconHelp />
          </button>
        </div>
      </header>

      <main className="px-4 py-5 space-y-6">
        <section className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
          <h2 className="text-lg font-bold text-gray-500 uppercase tracking-wide mb-3">Nuevo cliente</h2>

          <label className="block text-base font-semibold text-gray-700 mb-1">Nombre *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre y apellido"
            className="w-full p-4 text-lg border-2 border-gray-300 rounded-xl mb-3 focus:border-blue-500 focus:outline-none"
          />

          <label className="block text-base font-semibold text-gray-700 mb-1">Teléfono</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Ej: 11-1234-5678"
            className="w-full p-4 text-lg border-2 border-gray-300 rounded-xl mb-3 focus:border-blue-500 focus:outline-none"
          />

          <label className="block text-base font-semibold text-gray-700 mb-1">Dirección</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Ej: Av. Siempreviva 123"
            className="w-full p-4 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
          />
        </section>

        <button
          onClick={handleSave}
          disabled={!name.trim()}
          className="w-full py-4 bg-green-600 text-white rounded-xl text-xl font-bold hover:bg-green-700 transition active:bg-green-800 shadow-md disabled:opacity-40"
        >
          {saved ? '✓ CREADO' : 'CREAR CLIENTE'}
        </button>
      </main>

      {help && <HelpModal title={help.title} content={help.content} onClose={() => setHelp(null)} />}
    </div>
  );
};

// ──────────────────────────────────────────────
// APP PRINCIPAL
// ──────────────────────────────────────────────
export default function App() {
  const [clients, setClients] = useState(loadClients);
  const [screen, setScreen] = useState('list'); // 'list' | 'detail' | 'new'
  const [selectedId, setSelectedId] = useState(null);

  // Persistir automáticamente
  useEffect(() => {
    saveClients(clients);
  }, [clients]);

  const selectedClient = clients.find(c => c.id === selectedId);

  const handleUpdateClient = (updated) => {
    setClients(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const handleDeleteClient = (id) => {
    setClients(prev => prev.filter(c => c.id !== id));
  };

  const handleAddClient = (newClient) => {
    setClients(prev => [...prev, newClient]);
    setScreen('detail');
    setSelectedId(newClient.id);
  };

  const handleSelectClient = (id) => {
    setSelectedId(id);
    setScreen('detail');
  };

  const handleGoList = () => {
    setSelectedId(null);
    setScreen('list');
  };

  const handleGoNew = () => {
    setScreen('new');
  };

  if (screen === 'new') {
    return <NewClientScreen onBack={handleGoList} onSave={handleAddClient} />;
  }

  if (screen === 'detail' && selectedClient) {
    return (
      <ClientDetailScreen
        client={selectedClient}
        onBack={handleGoList}
        onUpdate={handleUpdateClient}
        onDelete={handleDeleteClient}
      />
    );
  }

  return (
    <ClientListScreen
      clients={clients}
      onSelectClient={handleSelectClient}
      onAddClient={handleGoNew}
    />
  );
}
