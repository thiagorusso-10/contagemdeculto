import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, User, Shield, MapPin, Save, Loader2, Database, Users } from 'lucide-react';
import { NeoButton } from '../components/ui/NeoButton';
import { Card } from '../components/ui/Card';

interface UserData {
    id: string;
    email: string;
    role: 'admin' | 'campus_leader' | 'global_viewer' | null;
    campus_id: string | null;
    last_sign_in_at: string | null;
}

export function TeamManagement() {
    const navigate = useNavigate();
    const { campuses } = useStore();
    const { role: currentUserRole } = useAuth();

    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (!loading && currentUserRole !== 'admin') {
            // ux only
        }
    }, [currentUserRole, loading]);

    async function fetchUsers() {
        try {
            setLoading(true);
            const { data, error } = await supabase.rpc('get_users_management');

            if (error) throw error;

            setUsers(data || []);
        } catch (error: any) {
            console.error('Erro ao buscar usuários:', error);

            if (error.message?.includes('Acesso negado') || error.code === 'PGRST202' || error.code === '42501' || error.message?.includes('function public.get_users_management() does not exist')) {
                alert('Atenção: Você precisa rodar o script "fix_team_management_rpc.sql" no banco de dados Online (Supabase) para habilitar essa função.');
            } else {
                alert('Erro ao carregar usuários: ' + (error.message || 'Erro desconhecido'));
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleUpdateUser(userId: string, newRole: string | null, newCampusId: string | null) {
        try {
            setUpdatingId(userId);

            const finalCampusId = (newRole === 'campus_leader') ? newCampusId : null;

            if (!newRole) {
                const { error } = await supabase
                    .from('user_roles')
                    .delete()
                    .eq('id', userId);

                if (error) throw error;

            } else {
                const payload = {
                    id: userId,
                    role: newRole,
                    campus_id: finalCampusId
                };

                const { error } = await supabase
                    .from('user_roles')
                    .upsert(payload);

                if (error) throw error;
            }

            setUsers(prev => prev.map(u => {
                if (u.id === userId) {
                    return { ...u, role: newRole as any, campus_id: finalCampusId };
                }
                return u;
            }));

        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            alert('Erro ao salvar alterações.');
            await fetchUsers();
        } finally {
            setUpdatingId(null);
        }
    }

    return (
        <div className="min-h-screen bg-primary-bg dark:bg-slate-900 pb-24 transition-colors duration-300">
            {/* Header */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 p-4 sticky top-0 z-10 transition-colors">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <NeoButton variant="ghost" size="sm" onClick={() => navigate('/')} className="pl-0 hover:bg-transparent">
                        <ArrowLeft size={16} />
                    </NeoButton>
                    <h1 className="text-xl font-black uppercase tracking-wider text-text-main dark:text-white">
                        Gerenciar Equipe
                    </h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4 space-y-6">

                {/* Info Box */}
                <div className="bg-pop-yellow/10 border border-pop-yellow/30 p-4 rounded-xl flex gap-3 text-sm">
                    <div className="text-pop-yellow shrink-0 mt-0.5">
                        <User size={20} />
                    </div>
                    <div>
                        <p className="font-bold text-gray-800 dark:text-gray-200">Como adicionar novos membros:</p>
                        <p className="text-gray-600 dark:text-gray-400">
                            Crie a conta (Email/Senha) no painel do Supabase ou peça para se cadastrarem.
                            Eles aparecerão nesta lista para você atribuir o cargo.
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {users.map(user => (
                            <UserCard
                                key={user.id}
                                user={user}
                                campuses={campuses}
                                isUpdating={updatingId === user.id}
                                onUpdate={handleUpdateUser}
                            />
                        ))}

                        {users.length === 0 && (
                            <div className="text-center p-12 text-text-muted dark:text-slate-500 font-bold border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl">
                                Nenhum usuário encontrado.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// Sub-componente para cada Card de Usuário
interface UserCardProps {
    user: UserData;
    campuses: any[];
    isUpdating: boolean;
    onUpdate: (uid: string, role: string, cid: string) => void;
}

const UserCard: React.FC<UserCardProps> = ({
    user,
    campuses,
    isUpdating,
    onUpdate
}) => {
    const [localRole, setLocalRole] = useState(user.role || '');
    const [localCampus, setLocalCampus] = useState(user.campus_id || '');
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        setLocalRole(user.role || '');
        setLocalCampus(user.campus_id || '');
        setHasChanges(false);
    }, [user]);

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLocalRole(e.target.value);
        setHasChanges(true);
    };

    const handleCampusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLocalCampus(e.target.value);
        setHasChanges(true);
    };

    const handleSave = () => {
        onUpdate(user.id, localRole || null, localCampus || null);
    };

    const inputClasses = "w-full text-sm border border-gray-200 dark:border-slate-700 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-900 dark:text-white transition-colors";

    return (
        <Card className="flex flex-col gap-4 border-l-4 border-l-gray-300 dark:border-l-slate-600 hover:border-l-primary transition-all">
            {/* Header do Card */}
            <div className="flex items-start justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
                <div>
                    <div className="font-bold flex items-center gap-2 text-text-main dark:text-white">
                        <Users size={16} className="text-primary" />
                        {user.email}
                    </div>
                    <div className="text-xs text-text-muted dark:text-slate-400 mt-1">
                        Último login: {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Nunca'}
                    </div>
                </div>

                <div className={`px-2.5 py-1 text-xs font-bold rounded-lg uppercase tracking-wider
          ${user.role === 'admin' ? 'bg-pop-purple/10 text-pop-purple' :
                        user.role === 'campus_leader' ? 'bg-primary/10 text-primary' :
                            user.role === 'global_viewer' ? 'bg-cta/10 text-cta' : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-500'}
        `}>
                    {user.role === 'admin' ? 'Admin' :
                        user.role === 'campus_leader' ? 'Líder' :
                            user.role === 'global_viewer' ? 'Visu.' : 'Sem Acesso'}
                </div>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold uppercase mb-1.5 flex items-center gap-1 text-text-muted dark:text-slate-400">
                        <Shield className="w-3 h-3" /> Cargo
                    </label>
                    <select
                        value={localRole}
                        onChange={handleRoleChange}
                        className={inputClasses}
                    >
                        <option value="">Sem Acesso (Remover)</option>
                        <option value="campus_leader">Líder de Campus</option>
                        <option value="global_viewer">Visualizador Global</option>
                        <option value="admin">Administrador</option>
                    </select>
                </div>

                {/* Mostra Campus apenas se for Lider */}
                {localRole === 'campus_leader' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="text-xs font-bold uppercase mb-1.5 flex items-center gap-1 text-text-muted dark:text-slate-400">
                            <MapPin className="w-3 h-3" /> Campus
                        </label>
                        <select
                            value={localCampus}
                            onChange={handleCampusChange}
                            className={inputClasses}
                        >
                            <option value="">Selecione...</option>
                            {campuses.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Actions */}
            {hasChanges && (
                <div className="flex justify-end pt-2">
                    <NeoButton
                        onClick={handleSave}
                        disabled={isUpdating}
                        size="sm"
                        icon={isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    >
                        Salvar Alterações
                    </NeoButton>
                </div>
            )}

        </Card>
    );
}
