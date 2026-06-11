import { useState, useEffect } from 'react';
import { usePage, Link, router } from '@inertiajs/react';
import {
    LayoutDashboard, Calendar, UserPlus, ClipboardCheck, BookOpen,
    Clock, Layers, Users, Shield, UserCircle, ChevronDown, ChevronRight,
    Menu, X, Bell, LogOut, GraduationCap, Sun, Moon,
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

function SidebarItem({ icon: Icon, label, href, subItems, currentPath }) {
    const isActive    = href ? currentPath.startsWith(href) : false;
    const hasSubItems = subItems && subItems.length > 0;
    const isSubActive = hasSubItems && subItems.some(s => currentPath.startsWith(s.href));
    const [open, setOpen] = useState(isSubActive);

    useEffect(() => { if (isSubActive) setOpen(true); }, [isSubActive]);

    if (hasSubItems) {
        return (
            <div>
                <button onClick={() => setOpen(!open)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150
                        ${isSubActive
                            ? 'bg-primary-700/60 text-white border-l-2 border-white'
                            : 'text-primary-200 hover:bg-primary-800/60 hover:text-white border-l-2 border-transparent'
                        }`}>
                    <Icon size={18} className="flex-shrink-0" />
                    <span className="text-sm font-medium flex-1 text-left">{label}</span>
                    {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                {open && (
                    <div className="ml-4 mt-1 space-y-0.5 border-l border-primary-700/50 pl-3">
                        {subItems.map(sub => (
                            <Link key={sub.href} href={sub.href}
                                className={`flex items-center px-2 py-2 rounded-lg text-xs transition-colors
                                    ${currentPath.startsWith(sub.href)
                                        ? 'text-white bg-primary-600/40'
                                        : 'text-primary-300 hover:text-white hover:bg-primary-700/40'
                                    }`}>
                                {sub.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <Link href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150
                ${isActive
                    ? 'bg-primary-700/60 text-white border-l-2 border-white'
                    : 'text-primary-200 hover:bg-primary-800/60 hover:text-white border-l-2 border-transparent'
                }`}>
            <Icon size={18} className="flex-shrink-0" />
            <span className="text-sm font-medium">{label}</span>
        </Link>
    );
}

function SidebarSection({ label }) {
    return (
        <p className="px-3 pt-5 pb-1 text-[10px] font-bold tracking-widest uppercase text-primary-400/70">
            {label}
        </p>
    );
}

export default function AdminLayout({ children, title = 'Dashboard' }) {
    const { auth } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const { toggle, isDark } = useTheme();
    const currentPath = window.location.pathname;

    const handleLogout = () => router.post(route('logout'));

    useEffect(() => { setSidebarOpen(false); }, [currentPath]);

    const menuItems = {
        principal: [
            { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
        ],
        academica: [
            { icon: Calendar,       label: 'Cronograma',                    href: '/admin/cronograma' },
            { icon: UserPlus,       label: 'Matriculación de Estudiantes',  href: '/admin/matriculacion' },
            { icon: ClipboardCheck, label: 'Control de Asistencia',         href: '/admin/asistencia' },
            { icon: BookOpen, label: 'Bitácoras', href: '/admin/bitacoras' },
        ],
        administracion: [
            { icon: Clock,   label: 'Períodos Lectivos',   href: '/admin/periodos' },
            { icon: Layers,  label: 'Fases PPE',           href: '/admin/fases-ppe' },
            { icon: Users,   label: 'Directorio Personal', href: '/admin/directorio' },
            { icon: Shield,  label: 'Permisos y Accesos',  href: '/admin/permisos' },
        ],
        cuenta: [
            { icon: UserCircle, label: 'Mi Perfil', href: route('perfil.show') },
        ],
    };

    return (
        <div className="flex h-screen overflow-hidden bg-canvas dark:bg-gray-900">

            {/* Overlay móvil */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)} />
            )}

            {/* ── SIDEBAR ── */}
            <aside className={`fixed left-0 top-0 z-50 w-64 h-screen flex flex-col bg-primary-900
                transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>

                {/* Logo */}
                <div className="flex items-center gap-3 px-4 py-5 border-b border-primary-800 shrink-0">
                    <div className="bg-primary-700 rounded-xl p-2">
                        <GraduationCap className="text-white" size={20} />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-white font-bold text-sm leading-tight">Sistema PPE</h1>
                        <p className="text-primary-300 text-[10px]">Participación Estudiantil</p>
                    </div>
                    <button onClick={() => setSidebarOpen(false)}
                        className="ml-auto text-primary-400 hover:text-white lg:hidden shrink-0">
                        <X size={18} />
                    </button>
                </div>

                {/* Avatar */}
                <div className="px-4 py-4 border-b border-primary-800 shrink-0">
                    <div className="flex items-center gap-3">
                        <img src={auth.user?.foto_url} alt={auth.user?.name}
                            className="w-9 h-9 rounded-full object-cover ring-2 ring-primary-600 shrink-0" />
                        <div className="min-w-0">
                            <p className="text-white text-xs font-semibold truncate">{auth.user?.name}</p>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-primary-600/50 text-primary-200">
                                Coordinador
                            </span>
                        </div>
                    </div>
                </div>

                {/* Navegación */}
                <nav className="flex-1 overflow-y-auto px-2 py-2 scrollbar-thin scrollbar-thumb-primary-700">
                    <SidebarSection label="Principal" />
                    {menuItems.principal.map(item => <SidebarItem key={item.label} {...item} currentPath={currentPath} />)}
                    <SidebarSection label="Gestión Académica" />
                    {menuItems.academica.map(item => <SidebarItem key={item.label} {...item} currentPath={currentPath} />)}
                    <SidebarSection label="Administración" />
                    {menuItems.administracion.map(item => <SidebarItem key={item.label} {...item} currentPath={currentPath} />)}
                    <SidebarSection label="Cuenta" />
                    {menuItems.cuenta.map(item => <SidebarItem key={item.label} {...item} currentPath={currentPath} />)}
                </nav>

                {/* Logout */}
                <div className="p-3 border-t border-primary-800 shrink-0">
                    <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-primary-300 hover:bg-red-500/20 hover:text-red-300 transition-colors text-sm">
                        <LogOut size={16} />
                        <span className="font-medium">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* ── ÁREA DERECHA ── */}
            <div className="flex flex-col flex-1 h-screen overflow-hidden lg:ml-64">

                {/* Header */}
                <header className="h-16 min-h-[64px] shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 gap-4 z-10">
                    <button onClick={() => setSidebarOpen(true)}
                        className="lg:hidden text-secondary-500 dark:text-gray-400 hover:text-secondary-700 dark:hover:text-gray-200 transition-colors">
                        <Menu size={22} />
                    </button>
                    <h2 className="text-base font-semibold text-secondary-800 dark:text-gray-100 flex-1 truncate">{title}</h2>

                    <div className="flex items-center gap-1">
                        {/* Notificaciones */}
                        <button className="relative p-2 text-secondary-500 dark:text-gray-400 hover:text-secondary-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                            <Bell size={18} />
                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
                        </button>

                        {/* Toggle tema */}
                        <button onClick={toggle} title={isDark ? 'Modo claro' : 'Modo oscuro'}
                            aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                            className="p-2 text-secondary-500 dark:text-gray-400 hover:text-secondary-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                            {isDark ? <Sun size={18} /> : <Moon size={18} />}
                        </button>

                        {/* Avatar + menú */}
                        <div className="relative">
                            <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <img src={auth.user?.foto_url} alt={auth.user?.name} className="w-7 h-7 rounded-full object-cover" />
                                <span className="hidden sm:block text-sm font-medium text-secondary-700 dark:text-gray-200">
                                    {auth.user?.name?.split(' ')[0]}
                                </span>
                                <ChevronDown size={14} className="text-secondary-400 dark:text-gray-400" />
                            </button>
                            {userMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                                    <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-20">
                                        <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                                            <p className="text-xs font-semibold text-secondary-800 dark:text-gray-100">{auth.user?.name}</p>
                                            <p className="text-xs text-secondary-400 dark:text-gray-400">{auth.user?.email}</p>
                                        </div>
                                        <Link href={route('perfil.show')}
                                            className="flex items-center gap-2 px-3 py-2 text-sm text-secondary-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                            <UserCircle size={15} /> Mi Perfil
                                        </Link>
                                        <button onClick={handleLogout}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                            <LogOut size={15} /> Cerrar Sesión
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-canvas dark:bg-gray-900">
                    {children}
                </main>
            </div>
        </div>
    );
}
