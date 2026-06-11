import { useEffect } from 'react';
import { useForm, Head, Link } from '@inertiajs/react';
import { Eye, EyeOff, Mail, Lock, GraduationCap, Shield } from 'lucide-react';
import { useState } from 'react';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => reset('password');
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login.store'));
    };

    return (
        <>
            <Head title="Iniciar Sesión" />

            <div className="min-h-screen flex">
                {/* ── LADO IZQUIERDO: Branding institucional ── */}
                <div className="hidden lg:flex lg:w-1/2 bg-gradient-institutional flex-col items-center justify-center p-12 relative overflow-hidden">
                    {/* Círculos decorativos de fondo */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                    <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-primary-400/20 rounded-full -translate-x-1/2 -translate-y-1/2" />

                    {/* Contenido del branding */}
                    <div className="relative z-10 text-center text-white">
                        {/* Ícono de escudo/academia */}
                        <div className="flex items-center justify-center mb-8">
                            <div className="bg-white/15 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
                                <Shield className="w-16 h-16 text-white" strokeWidth={1.5} />
                            </div>
                        </div>

                        <h1 className="text-4xl font-bold mb-3 text-shadow-sm">Sistema PPE</h1>
                        <p className="text-primary-200 text-lg font-medium mb-6">
                            Participación Estudiantil
                        </p>

                        <div className="w-16 h-1 bg-primary-300 rounded-full mx-auto mb-8" />

                        <p className="text-primary-100 text-base leading-relaxed max-w-sm mx-auto">
                            Plataforma institucional para la gestión integral de actividades,
                            asistencia y bitácoras de participación estudiantil en bachillerato.
                        </p>

                        {/* Características del sistema */}
                        <div className="mt-10 grid grid-cols-1 gap-3 text-left">
                            {[
                                { icon: '📋', text: 'Gestión de cronograma y actividades' },
                                { icon: '📊', text: 'Control de asistencia en tiempo real' },
                                { icon: '📁', text: 'Bitácoras y calificaciones digitales' },
                            ].map((item) => (
                                <div key={item.text} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
                                    <span className="text-xl">{item.icon}</span>
                                    <span className="text-sm text-primary-100">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── LADO DERECHO: Formulario de login ── */}
                <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50">
                    <div className="w-full max-w-md">
                        {/* Logo en mobile */}
                        <div className="flex lg:hidden items-center justify-center mb-8">
                            <div className="bg-gradient-institutional rounded-2xl p-4">
                                <Shield className="w-8 h-8 text-white" />
                            </div>
                            <div className="ml-3">
                                <h2 className="text-xl font-bold text-primary-900">Sistema PPE</h2>
                                <p className="text-sm text-secondary-500">Participación Estudiantil</p>
                            </div>
                        </div>

                        {/* Tarjeta del formulario */}
                        <div className="bg-white rounded-2xl shadow-xl shadow-primary-900/10 border border-gray-100 p-8">
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-secondary-900">
                                    Bienvenido de vuelta
                                </h2>
                                <p className="mt-1 text-secondary-500 text-sm">
                                    Ingresa tus credenciales para continuar
                                </p>
                            </div>

                            <form onSubmit={submit} className="space-y-5">
                                {/* Campo Email */}
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-medium text-secondary-700 mb-1.5"
                                    >
                                        Correo Electrónico
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <Mail className="h-4.5 w-4.5 text-secondary-400" size={18} />
                                        </div>
                                        <input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className={`block w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm
                                                text-secondary-900 placeholder-secondary-400
                                                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                                                transition-colors duration-200
                                                ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'}
                                            `}
                                            placeholder="tu@correo.edu"
                                            autoFocus
                                            autoComplete="email"
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                                            <span>⚠</span> {errors.email}
                                        </p>
                                    )}
                                </div>

                                {/* Campo Contraseña */}
                                <div>
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-medium text-secondary-700 mb-1.5"
                                    >
                                        Contraseña
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <Lock className="text-secondary-400" size={18} />
                                        </div>
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className={`block w-full pl-10 pr-11 py-2.5 border rounded-xl text-sm
                                                text-secondary-900 placeholder-secondary-400
                                                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                                                transition-colors duration-200
                                                ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'}
                                            `}
                                            placeholder="••••••••"
                                            autoComplete="current-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-secondary-400 hover:text-secondary-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                                            <span>⚠</span> {errors.password}
                                        </p>
                                    )}
                                </div>

                                {/* Recordarme y ¿Olvidó contraseña? */}
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.remember}
                                            onChange={(e) => setData('remember', e.target.checked)}
                                            className="w-4 h-4 rounded border-gray-300 text-primary-600
                                                focus:ring-primary-500 cursor-pointer"
                                        />
                                        <span className="text-sm text-secondary-600">Recordarme</span>
                                    </label>

                                    <a
                                        href="#"
                                        className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                                    >
                                        ¿Olvidó su contraseña?
                                    </a>
                                </div>

                                {/* Botón de login */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4
                                        bg-gradient-institutional text-white font-semibold rounded-xl
                                        hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                                        transition-all duration-200 shadow-md shadow-primary-900/20
                                        disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {processing ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Iniciando sesión...
                                        </>
                                    ) : (
                                        'Iniciar Sesión'
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Footer */}
                        <p className="text-center mt-6 text-xs text-secondary-400">
                            © 2025 Sistema PPE — Participación Estudiantil
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
