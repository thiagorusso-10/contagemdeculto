import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, User, Shield, MapPin, Save, Loader2, Database } from 'lucide-react';

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

    // Proteger a rota manualmente caso o usuário force a URL (embora já vamos esconder o link)
    useEffect(() => {
        if (!loading && currentUserRole !== 'admin') {
            // Redireciona ou mostra erro se não for admin
            // Mas o RLS/RPC já bloqueia, aqui é só UX
        }
    }, [currentUserRole, loading]);

    async function fetchUsers() {
        try {
            setLoading(true);
            const { data, error } = await supabase.rpc('get_users_management');

            if (error) throw error;

            setUsers(data || []);
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            alert('Erro ao carregar usuários. Verifique se você é administrador.');
        } finally {
            setLoading(false);
        }
    }

    async function handleUpdateUser(userId: string, newRole: string | null, newCampusId: string | null) {
        try {
            setUpdatingId(userId);

            // Regra de negócio: Se o cargo não for lider de campus, limpa o campus_id
            const finalCampusId = (newRole === 'campus_leader') ? newCampusId : null;

            // Se newRole for "null" (string) ou vazio, interpretamos como remover acesso?
            // Vamos assumir que se o usuário selecionar "Sem Acesso", removemos da tabela roles OU setamos null.
            // SQL upsert aceita.

            if (!newRole) {
                // Se quiser remover o acesso totalmente, deletamos a row ou deixamos role sem nada?
                // O app espera que exista row? O RPC faz Left Join.
                // Vamos deletar a row se for "sem acesso" para limpar? 
                // Ou apenas fazer update. Vamos fazer upsert normal.
                // Se newRole for falsy, podemos deletar.

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

            // Atualiza estado local
            setUsers(prev => prev.map(u => {
                if (u.id === userId) {
                    return { ...u, role: newRole as any, campus_id: finalCampusId };
                }
                return u;
            }));

            // Feedback visual rápido
            // alert('Usuário atualizado!'); // Opcional, pode ser chato.

        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            alert('Erro ao salvar alterações.');
            await fetchUsers(); // Revert
        } finally {
            setUpdatingId(null);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b-4 border-black p-4 sticky top-0 z-10 shadow-sm">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors border-2 border-transparent hover:border-black"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-black uppercase tracking-wider">
                        Gerenciar Equipe
                    </h1>
                    <div className="w-10"></div> {/* Spacer */}
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4 space-y-6">

                {/* Info Box */}
                <div className="bg-yellow-100 border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg">
                    <p className="text-sm font-bold flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Como adicionar novos membros:
                    </p>
                    <p className="text-sm mt-1">
                        Crie a conta (Email/Senha) no painel do Supabase ou peça para se cadastrarem.
                        Eles aparecerão nesta lista para você atribuir o cargo.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="w-8 h-8 animate-spin" />
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
                            <div className="text-center p-8 text-gray-500 font-bold border-2 border-dashed border-gray-300 rounded-lg">
                                Nenhum usuário encontrado.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// Sub-componente para cada Card de Usuário para organizar melhor
function UserCard({
    user,
    campuses,
    isUpdating,
    onUpdate
}: {
    user: UserData,
    campuses: any[], // Tipar corretamente se possível, mas any funciona pros props
    isUpdating: boolean,
    onUpdate: (uid: string, role: string | null, cid: string | null) => void
}) {
    const [localRole, setLocalRole] = useState(user.role || '');
    const [localCampus, setLocalCampus] = useState(user.campus_id || '');
    const [hasChanges, setHasChanges] = useState(false);

    // Se o usuário mudar na lista (ex: refresh), atualiza local
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

    return (
        <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg flex flex-col gap-3">

            {/* Header do Card */}
            <div className="flex items-start justify-between border-b-2 border-gray-100 pb-2">
                <div>
                    <div className="font-bold flex items-center gap-2">
                        {user.email}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        Último login: {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Nunca'}
                    </div>
                </div>

                {/* Badge do Status Atual (Visualização apenas) */}
                <div className={`px-2 py-1 text-xs font-bold border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase
          ${user.role === 'admin' ? 'bg-purple-200' :
                        user.role === 'campus_leader' ? 'bg-blue-200' :
                            user.role === 'global_viewer' ? 'bg-green-200' : 'bg-gray-200'}
        `}>
                    {user.role === 'admin' ? 'Admin' :
                        user.role === 'campus_leader' ? 'Líder' :
                            user.role === 'global_viewer' ? 'Visu.' : 'Sem Acesso'}
                </div>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                <div>
                    <label className="text-xs font-bold uppercase mb-1 flex items-center gap-1">
                        <Shield className="w-3 h-3" /> Cargo
                    </label>
                    <select
                        value={localRole}
                        onChange={handleRoleChange}
                        className="w-full text-sm border-2 border-black p-2 rounded focus:outline-none focus:bg-gray-50"
                    >
                        <option value="">Sem Acesso</option>
                        <option value="campus_leader">Líder de Campus</option>
                        <option value="global_viewer">Visualizador Global</option>
                        <option value="admin">Administrador</option>
                    </select>
                </div>

                {/* Mostra Campus apenas se for Lider */}
                {localRole === 'campus_leader' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="text-xs font-bold uppercase mb-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> Campus
                        </label>
                        <select
                            value={localCampus}
                            onChange={handleCampusChange}
                            className="w-full text-sm border-2 border-black p-2 rounded focus:outline-none focus:bg-gray-50"
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
                <div className="mt-2 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isUpdating}
                        className="bg-black text-white px-4 py-2 text-sm font-bold uppercase rounded hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50"
                    >
                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Salvar Alterações
                    </button>
                </div>
            )}

        </div>
    );
}
