import { useState, useEffect, useMemo } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { createPortal } from 'react-dom';
import { Plus, Users, Search, Mail, Phone, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import AdminLayout   from '@/Layouts/AdminLayout';
import PersonalModal from './components/PersonalModal';

// ── Constantes de módulo ──────────────────────────────────────────────────────

const TIPO_CONFIG = {
    docente:        { label: 'Docente',        cls: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300' },
    administrativo: { label: 'Administrativo', cls: 'bg-blue-100   dark:bg-blue-900/40   text-blue-700   dark:text-blue-300'   },
    directivo:      { label: 'Directivo',      cls: 'bg-green-100  dark:bg-green-900/40  text-green-700  dark:text-green-300'  },
};

const FILTROS_TIPO = [
    { value: '',               label: 'Todos'          },
    { value: 'docente',        label: 'Docentes'       },
    { value: 'administrativo', label: 'Administrativos'},
    { value: 'directivo',      label: 'Directivos'     },
];

// ── Confirm delete ────────────────────────────────────────────────────────────

function ConfirmEliminar({ item, onConfirmar, onCancelar }) {
    if (!item) return null;
    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 10001 }}>
            <div className="absolute inset-0 bg-black/60" onClick={onCancelar} />
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6"
                style={{ zIndex: 10002 }} onClick={e => e.stopPropagation()}>
                <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100">¿Eliminar registro?</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Se eliminará a <strong>{item.nombre}</strong> del directorio. Esta acción no se puede deshacer.
                        </p>
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <button onClick={onCancelar}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        Cancelar
                    </button>
                    <button onClick={onConfirmar}
                        className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors">
                        Eliminar
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

// ── PersonalCard ──────────────────────────────────────────────────────────────

function PersonalCard({ item, onEditar, onEliminar }) {
    const tipoCfg = TIPO_CONFIG[item.tipo] ?? TIPO_CONFIG.docente;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex flex-col items-center text-center gap-3 hover:shadow-md dark:hover:shadow-gray-900/50 transition-shadow">
            {/* Avatar */}
            <img src={item.foto_url} alt={item.nombre}
                className="w-20 h-20 rounded-full object-cover border-4 border-purple-100 dark:border-purple-900/50" />

            {/* Nombre + cargo */}
            <div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-tight">{item.nombre}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.cargo}</p>
                {item.departamento && (
                    <p className="text-xs text-gray-400 dark:text-gray-500">{item.departamento}</p>
                )}
            </div>

            {/* Badge tipo */}
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${tipoCfg.cls}`}>
                {tipoCfg.label}
            </span>

            {/* Contacto */}
            <div className="w-full space-y-1 text-left">
                {item.email && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Mail size={11} className="flex-shrink-0" />
                        <span className="truncate">{item.email}</span>
                    </div>
                )}
                {item.telefono && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Phone size={11} className="flex-shrink-0" />
                        <span>{item.telefono}</span>
                    </div>
                )}
            </div>

            {/* Badge activo */}
            {!item.activo && (
                <span className="w-full text-center px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs rounded-full">
                    Inactivo
                </span>
            )}

            {/* Acciones */}
            <div className="flex gap-2 w-full mt-1">
                <button onClick={() => onEditar(item)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Pencil size={12} /> Editar
                </button>
                <button onClick={() => onEliminar(item)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <Trash2 size={12} /> Eliminar
                </button>
            </div>
        </div>
    );
}

// ── Flash toast ───────────────────────────────────────────────────────────────

function FlashToast({ flash }) {
    const [visible, setVisible] = useState(false);
    const [msg,     setMsg]     = useState('');
    const [tipo,    setTipo]    = useState('success');

    useEffect(() => {
        const text = flash?.success ?? flash?.error ?? null;
        if (text) {
            setMsg(text);
            setTipo(flash?.success ? 'success' : 'error');
            setVisible(true);
            const t = setTimeout(() => setVisible(false), 4500);
            return () => clearTimeout(t);
        }
    }, [flash?.success, flash?.error]);

    if (!visible) return null;
    const cls = tipo === 'success'
        ? 'bg-green-100 dark:bg-green-900/40 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200'
        : 'bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200';
    return (
        <div className={`fixed top-5 right-5 z-50 border rounded-xl px-4 py-3 text-sm font-medium shadow-lg max-w-sm ${cls}`}>
            {msg}
        </div>
    );
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function DirectorioIndex({ personal }) {
    const { props }     = usePage();
    const [modalOpen,   setModalOpen]   = useState(false);
    const [editItem,    setEditItem]    = useState(null);
    const [deleteItem,  setDeleteItem]  = useState(null);
    const [busqueda,    setBusqueda]    = useState('');
    const [filtroTipo,  setFiltroTipo]  = useState('');

    const abrirCrear   = () => { setEditItem(null); setModalOpen(true); };
    const abrirEditar  = (item) => { setEditItem(item); setModalOpen(true); };

    const confirmarEliminar = () => {
        router.delete(route('admin.directorio.destroy', deleteItem.id), { preserveScroll: true });
        setDeleteItem(null);
    };

    const lista = useMemo(() => {
        let items = personal ?? [];
        if (filtroTipo) items = items.filter(p => p.tipo === filtroTipo);
        if (busqueda)   items = items.filter(p =>
            p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            (p.cargo ?? '').toLowerCase().includes(busqueda.toLowerCase()) ||
            (p.departamento ?? '').toLowerCase().includes(busqueda.toLowerCase())
        );
        return items;
    }, [personal, busqueda, filtroTipo]);

    return (
        <AdminLayout>
            <Head title="Directorio del Personal" />
            <FlashToast flash={props.flash} />

            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

                {/* Header */}
                <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-purple-100 dark:bg-purple-900/40 rounded-xl">
                            <Users size={20} className="text-purple-700 dark:text-purple-300" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Directorio del Personal</h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{personal?.length ?? 0} miembros registrados</p>
                        </div>
                    </div>
                    <button onClick={abrirCrear}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
                        <Plus size={16} /> Agregar
                    </button>
                </div>

                {/* Filtros */}
                <div className="flex flex-wrap items-center gap-3 mb-5">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={busqueda}
                            onChange={e => setBusqueda(e.target.value)}
                            placeholder="Buscar por nombre, cargo..."
                            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                    </div>
                    <div className="flex gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-1">
                        {FILTROS_TIPO.map(f => (
                            <button key={f.value}
                                onClick={() => setFiltroTipo(f.value)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
                                    ${filtroTipo === f.value
                                        ? 'bg-purple-600 text-white'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                {lista.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-16 text-center">
                        <Users size={40} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                            {busqueda || filtroTipo ? 'Sin resultados para los filtros aplicados' : 'No hay personal registrado'}
                        </p>
                        {!busqueda && !filtroTipo && (
                            <button onClick={abrirCrear}
                                className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-xl transition-colors">
                                Agregar primer miembro
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {lista.map(item => (
                            <PersonalCard
                                key={item.id}
                                item={item}
                                onEditar={abrirEditar}
                                onEliminar={setDeleteItem}
                            />
                        ))}
                    </div>
                )}
            </div>

            <PersonalModal
                isOpen={modalOpen}
                personal={editItem}
                onClose={() => setModalOpen(false)}
            />

            <ConfirmEliminar
                item={deleteItem}
                onConfirmar={confirmarEliminar}
                onCancelar={() => setDeleteItem(null)}
            />
        </AdminLayout>
    );
}
