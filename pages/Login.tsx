import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Church } from 'lucide-react';
import { NeoButton } from '../components/ui/NeoButton';
import { Card } from '../components/ui/Card';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-primary-bg dark:bg-slate-900 transition-colors duration-300">
            <div className="w-full max-w-md">
                <div className="text-center mb-8 flex flex-col items-center">
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-soft mb-4">
                        <Church className="text-primary" size={32} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-2xl font-black text-text-main dark:text-gray-100 uppercase tracking-tight">Contagem de Culto</h1>
                    <p className="text-text-muted dark:text-slate-400 mt-2 font-medium">Entre para acessar o sistema</p>
                </div>

                <Card className="p-8">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-6 font-medium flex items-center justify-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-1.5">
                            <label htmlFor="email" className="block text-xs font-bold text-text-muted dark:text-slate-400 uppercase tracking-wider">
                                Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400 dark:text-slate-500" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    placeholder="seu@email.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="password" className="block text-xs font-bold text-text-muted dark:text-slate-400 uppercase tracking-wider">
                                Senha
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400 dark:text-slate-500" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <NeoButton
                            type="submit"
                            disabled={loading}
                            className="w-full shadow-lg hover:shadow-xl mt-2"
                            size="lg"
                        >
                            {loading ? 'Entrando...' : 'ENTRAR'}
                        </NeoButton>
                    </form>
                </Card>
            </div>
        </div>
    );
}
