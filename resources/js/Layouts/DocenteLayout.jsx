import { useState, useEffect } from 'react';
import { usePage, Link, router } from '@inertiajs/react';
import {
    LayoutDashboard, Users, ClipboardCheck, Star, UserCircle,
    Menu, X, Bell, LogOut, ChevronDown, GraduationCap, Sun, Moon,
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

function SidebarItem({ icon: Icon, label, href, currentPath }) {
    const isActive = currentPath.startsWith(href);
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

export default function DocenteLayout({ children, title = 'Dashboard' }) {
    const { auth } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const { toggle, isDark } = useTheme();
    const currentPath = window.location.pathname;

    const handleLogout = () => router.post(route('logout'));

    useEffect(() => { setSidebarOpen(false); }, [currentPath]);

    const menu = {
        principal: [
            { icon: LayoutDashboard, label: 'Dashboard',            href: '/docente/dashboard' },
        ],
        clases: [
            { icon: Users,          label: 'Mis Estudiantes',       href: '/docente/mis-estudiantes' },
            { icon: ClipboardCheck, label: 'Control de Asistencia', href: '/docente/asistencia' },
            { icon: Star,           label: 'Calificaciones',        href: '/docente/calificaciones' },
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
                        <h1 className="text-white font-bold text-sm">Sistema PPE</h1>
                        <p className="text-primary-300 text-[10px]">Portal Docente</p>
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
                                Docente
                            </span>
                        </div>
                    </div>
                </div>

                {/* Nav con scroll interno */}
                <nav className="flex-1 overflow-y-auto px-2 py-2">
                    <SidebarSection label="Principal" />
                    {menu.principal.map(item => <SidebarItem key={item.label} {...item} currentPath={currentPath} />)}
                    <SidebarSection label="Mis Clases" />
                    {menu.clases.map(item => <SidebarItem key={item.label} {...item} currentPath={currentPath} />)}
                    <SidebarSection label="Cuenta" />
                    {menu.cuenta.map(item => <SidebarItem key={item.label} {...item} currentPath={currentPath} />)}
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
                        <button className="relative p-2 text-secondary-500 dark:text-gray-400 hover:text-secondary-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                            <Bell size={18} />
                        </button>

                        {/* Toggle tema */}
                        <button onClick={toggle} title={isDark ? 'Modo claro' : 'Modo oscuro'}
                            aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                            className="p-2 text-secondary-500 dark:text-gray-400 hover:text-secondary-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                            {isDark ? <Sun size={18} /> : <Moon size={18} />}
                        </button>

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
