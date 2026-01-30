import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { Report, VolunteerBreakdown } from '../types';
import { NeoButton } from '../components/ui/NeoButton';
import { Card } from '../components/ui/Card';
import { CounterInput } from '../components/ui/CounterInput';
import { VolunteerModal } from '../components/VolunteerModal';
import { ArrowLeft, Save, Plus, Trash } from 'lucide-react';

export const ReportForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { campuses, preachers, volunteerAreas, addReport, updateReport, deleteReport, reports, addPreacher } = useStore();
    const { role, assignedCampusId } = useAuth();

    const isEditing = !!id;
    const initialCampusId = searchParams.get('campusId') || campuses[0]?.id;

    // State
    const [campusId, setCampusId] = useState(initialCampusId || '');
    const [date, setDate] = useState(() => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    });
    const [time, setTime] = useState('18:30');
    const [preacherId, setPreacherId] = useState('');
    const [notes, setNotes] = useState('');

    // Attendance
    const [adults, setAdults] = useState(0);
    const [kids, setKids] = useState(0);
    const [visitors, setVisitors] = useState(0);
    const [teens, setTeens] = useState(0);

    // Volunteers
    const [volunteerBreakdown, setVolunteerBreakdown] = useState<VolunteerBreakdown>({});
    const [showVolunteerModal, setShowVolunteerModal] = useState(false);

    // Dynamic Preacher Add
    const [showAddPreacher, setShowAddPreacher] = useState(false);
    const [newPreacherName, setNewPreacherName] = useState('');

    useEffect(() => {
        if (role === 'global_viewer') {
            alert('Você não tem permissão para criar ou editar relatórios.');
            navigate('/');
            return;
        }

        if (isEditing && id) {
            const report = reports.find(r => r.id === id);
            if (!report) {
                alert('Relatório não encontrado ou sem permissão de acesso.');
                navigate('/');
                return;
            }
            if (report) {
                if (role === 'campus_leader' && report.campusId !== assignedCampusId && assignedCampusId) {
                    alert('Você só pode editar relatórios do seu próprio campus.');
                    navigate('/');
                    return;
                }
                setCampusId(report.campusId);
                setDate(report.date);
                setTime(report.time);
                setPreacherId(report.preacherId);
                setNotes(report.notes);
                setAdults(report.attendance.adults);
                setKids(report.attendance.kids);
                setVisitors(report.attendance.visitors);
                setTeens(report.attendance.teens);
                setVolunteerBreakdown(report.volunteerBreakdown || {});
            }
        }
    }, [isEditing, id, reports, role, assignedCampusId, navigate]);

    useEffect(() => {
        if (!campusId && campuses.length > 0) {
            setCampusId(campuses[0].id);
        }
        if (role === 'campus_leader' && assignedCampusId) {
            setCampusId(assignedCampusId);
        }
    }, [campuses, campusId, role, assignedCampusId]);

    const totalVolunteers = useMemo(() => {
        return Object.values(volunteerBreakdown).reduce((a: number, b: number) => a + b, 0);
    }, [volunteerBreakdown]);

    const grandTotal = useMemo(() => {
        return adults + kids + visitors + teens + totalVolunteers;
    }, [adults, kids, visitors, teens, totalVolunteers]);

    const handleSave = async () => {
        if (!campusId || !preacherId) {
            alert('Por favor, selecione o campus e o preletor.');
            return;
        }

        const reportData: Report = {
            id: id || Date.now().toString(),
            campusId,
            date,
            time,
            preacherId,
            attendance: { adults, kids, visitors, teens, volunteers: totalVolunteers },
            volunteerBreakdown,
            notes,
            createdAt: isEditing ? 0 : Date.now()
        };

        try {
            if (isEditing) await updateReport(reportData);
            else await addReport(reportData);
            navigate(-1);
        } catch (error) {
            console.error("Error saving:", error);
            alert("Erro ao salvar relatório.");
        }
    };

    const handleDelete = async () => {
        if (!id) return;
        if (window.confirm('Tem certeza que deseja excluir este relatório?')) {
            await deleteReport(id);
            navigate(-1);
        }
    };

    const handleQuickAddPreacher = async () => {
        if (newPreacherName.trim()) {
            await addPreacher(newPreacherName);
            setNewPreacherName('');
            setShowAddPreacher(false);
        }
    };

    const inputClasses = "w-full p-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all";
    const labelClasses = "block text-xs font-bold text-text-muted dark:text-slate-400 uppercase tracking-wider mb-1.5";

    return (
        <div className="min-h-screen p-6 pb-24">
            <div className="max-w-xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <NeoButton variant="ghost" size="sm" onClick={() => navigate(-1)} className="px-0 hover:bg-transparent">
                        <ArrowLeft size={16} /> VOLTAR
                    </NeoButton>
                    {isEditing && role === 'admin' && (
                        <button onClick={handleDelete} className="text-red-500 font-bold hover:text-red-600 transition-colors text-sm flex items-center gap-1">
                            <Trash size={14} /> EXCLUIR
                        </button>
                    )}
                </div>

                <h1 className="text-2xl font-bold text-text-main dark:text-white">
                    {isEditing ? 'Editar Relatório' : 'Novo Relatório'}
                </h1>

                {/* General Info Card */}
                <Card>
                    <h3 className="text-sm font-bold text-primary mb-4 pb-2 border-b border-gray-100 dark:border-slate-700">INFORMAÇÕES</h3>

                    <div className="space-y-4">
                        <div>
                            <label className={labelClasses}>Campus</label>
                            <select
                                value={campusId}
                                onChange={e => setCampusId(e.target.value)}
                                disabled={isEditing || !!searchParams.get('campusId') || campuses.length === 0 || role === 'campus_leader'}
                                className={`${inputClasses} ${(isEditing || !!searchParams.get('campusId') || campuses.length === 0 || role === 'campus_leader') ? 'bg-gray-50 dark:bg-slate-800 text-gray-500' : ''}`}
                            >
                                <option value="" disabled>Selecione...</option>
                                {campuses.length > 0 ? campuses.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                )) : <option value="" disabled>Nenhum</option>}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-4 items-start">
                            <div>
                                <label className={labelClasses}>Data</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    className={inputClasses}
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>Culto</label>
                                <select
                                    value={time}
                                    onChange={e => setTime(e.target.value)}
                                    className={inputClasses}
                                >
                                    <option value="09:30">MANHÃ</option>
                                    <option value="18:30">NOITE</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className={labelClasses}>Preletor</label>
                            <div className="flex gap-2">
                                <select
                                    value={preacherId}
                                    onChange={e => setPreacherId(e.target.value)}
                                    className={inputClasses}
                                >
                                    <option value="" disabled>Selecione...</option>
                                    {preachers.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => setShowAddPreacher(!showAddPreacher)}
                                    className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-3 rounded-lg transition-colors"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                            {showAddPreacher && (
                                <div className="mt-2 flex gap-2 animate-in fade-in slide-in-from-top-2">
                                    <input
                                        type="text"
                                        placeholder="Nome"
                                        value={newPreacherName}
                                        onChange={e => setNewPreacherName(e.target.value)}
                                        className={inputClasses}
                                    />
                                    <button onClick={handleQuickAddPreacher} className="bg-primary text-white px-4 rounded-lg font-bold text-sm">OK</button>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <CounterInput label="Adultos" value={adults} onChange={setAdults} />
                    <CounterInput label="Crianças" value={kids} onChange={setKids} />
                    <CounterInput label="Visitas" value={visitors} onChange={setVisitors} />
                    <CounterInput label="Pré-Adolesc." value={teens} onChange={setTeens} />
                </div>

                {/* Volunteers */}
                <Card className="bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-widest">Voluntários</label>
                        <button onClick={() => setShowVolunteerModal(true)} className="text-xs font-bold text-primary underline">EDITAR ÁREAS</button>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Total na equipe</span>
                        <span className="text-3xl font-bold text-green-700 dark:text-green-400">{totalVolunteers}</span>
                    </div>
                </Card>

                {/* Total Display */}
                <Card className="bg-gray-900 dark:bg-black text-white border-0 text-center py-8">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Público Total</h2>
                    <div className="text-5xl font-black tracking-tight">{grandTotal}</div>
                </Card>

                {/* Notes */}
                <div className="space-y-1.5">
                    <label className={labelClasses}>Observações</label>
                    <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        className={`${inputClasses} min-h-[100px] resize-none`}
                        placeholder="Algo especial aconteceu?"
                    />
                </div>

                {/* Save Button */}
                <NeoButton
                    onClick={handleSave}
                    size="lg"
                    className="w-full shadow-lg hover:shadow-xl"
                    icon={<Save size={20} />}
                >
                    SALVAR RELATÓRIO
                </NeoButton>
            </div>

            <VolunteerModal
                isOpen={showVolunteerModal}
                onClose={() => setShowVolunteerModal(false)}
                breakdown={volunteerBreakdown}
                onChange={setVolunteerBreakdown}
            />
        </div>
    );
};