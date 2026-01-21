import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Report, VolunteerBreakdown } from '../types';
import { NeoButton } from '../components/ui/NeoButton';
import { NeoCard } from '../components/ui/NeoCard';
import { CounterInput } from '../components/ui/CounterInput';
import { VolunteerModal } from '../components/VolunteerModal';
import { ArrowLeft, Save, Plus, Trash } from 'lucide-react';

export const ReportForm: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // If editing
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { campuses, preachers, volunteerAreas, addReport, updateReport, deleteReport, reports, addPreacher } = useStore();

    const isEditing = !!id;
    const initialCampusId = searchParams.get('campusId') || campuses[0]?.id;

    // Form State
    const [campusId, setCampusId] = useState(initialCampusId);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState('19:30');
    const [preacherId, setPreacherId] = useState('');
    const [notes, setNotes] = useState('');

    // Metrics
    const [adults, setAdults] = useState(0);
    const [kids, setKids] = useState(0);
    const [visitors, setVisitors] = useState(0);
    const [teens, setTeens] = useState(0);
    const [volunteerBreakdown, setVolunteerBreakdown] = useState<VolunteerBreakdown>({});

    // UI State
    const [showVolunteerModal, setShowVolunteerModal] = useState(false);
    const [newPreacherName, setNewPreacherName] = useState('');
    const [showAddPreacher, setShowAddPreacher] = useState(false);

    // Load data if editing
    useEffect(() => {
        if (isEditing && id) {
            const report = reports.find(r => r.id === id);
            if (report) {
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
        } else {
            // Default Preacher
            if (preachers.length > 0) setPreacherId(preachers[0].id);
        }
    }, [id, isEditing, reports, preachers]);

    // Calculate Total Volunteers
    const totalVolunteers = useMemo(() => {
        return (Object.values(volunteerBreakdown) as number[]).reduce((sum, count) => sum + count, 0);
    }, [volunteerBreakdown]);

    // Calculate Grand Total
    const grandTotal = adults + kids + visitors + teens + totalVolunteers;

    const handleSave = () => {
        if (!campusId || !date || !time || !preacherId) {
            alert('Preencha os campos obrigatórios');
            return;
        }

        const reportData: Report = {
            id: isEditing ? id! : Date.now().toString(),
            campusId,
            date,
            time,
            preacherId,
            notes,
            attendance: {
                adults,
                kids,
                visitors,
                teens,
                volunteers: totalVolunteers
            },
            volunteerBreakdown,
            createdAt: Date.now()
        };

        if (isEditing) {
            updateReport(reportData);
        } else {
            addReport(reportData);
        }
        navigate(-1);
    };

    const handleDelete = () => {
        if (confirm('Tem certeza que deseja excluir este relatório?')) {
            if (id) deleteReport(id);
            navigate(-1);
        }
    };

    const handleQuickAddPreacher = () => {
        if (newPreacherName.trim()) {
            addPreacher(newPreacherName.trim());
            setNewPreacherName('');
            setShowAddPreacher(false);
            // Optimistically select the new one? Requires finding the ID, 
            // but for now context doesn't return ID. User can select from list.
            alert('Preletor adicionado! Selecione na lista.');
        }
    };

    return (
        <div className="min-h-screen p-6 pb-24 bg-neo-bg">
            <div className="max-w-xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <NeoButton variant="ghost" size="sm" onClick={() => navigate(-1)} className="px-0">
                        <ArrowLeft size={16} /> VOLTAR
                    </NeoButton>
                    {isEditing && (
                        <button onClick={handleDelete} className="text-red-500 font-bold underline decoration-4 decoration-red-500">
                            EXCLUIR
                        </button>
                    )}
                </div>

                <h1 className="text-3xl font-bold uppercase">
                    {isEditing ? 'Editar Relatório' : 'Novo Relatório'}
                </h1>

                {/* General Info Card */}
                <NeoCard>
                    <h3 className="font-bold border-b-4 border-black mb-4 pb-1">INFORMAÇÕES GERAIS</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">CAMPUS</label>
                            <select
                                value={campusId}
                                onChange={e => setCampusId(e.target.value)}
                                disabled={isEditing || !!searchParams.get('campusId')}
                                className={`w-full border-4 border-black p-3 font-bold bg-white shadow-neo-sm focus:outline-none focus:shadow-neo transition-all ${(isEditing || !!searchParams.get('campusId')) ? 'opacity-50 bg-gray-100 pointer-events-none' : ''
                                    }`}
                            >
                                {campuses.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-[1.6fr_1fr] gap-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">DATA</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    className="w-full border-4 border-black px-2 py-3 text-sm font-bold shadow-neo-sm focus:outline-none focus:shadow-neo transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">HORÁRIO</label>
                                <input
                                    type="time"
                                    value={time}
                                    onChange={e => setTime(e.target.value)}
                                    className="w-full border-4 border-black px-2 py-3 text-sm font-bold shadow-neo-sm focus:outline-none focus:shadow-neo transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-1">PRELETOR</label>
                            <div className="flex gap-2">
                                <select
                                    value={preacherId}
                                    onChange={e => setPreacherId(e.target.value)}
                                    className="flex-1 border-4 border-black p-3 font-bold bg-white shadow-neo-sm focus:outline-none focus:shadow-neo transition-all"
                                >
                                    <option value="" disabled>Selecione...</option>
                                    {preachers.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => setShowAddPreacher(!showAddPreacher)}
                                    className="bg-neo-yellow border-4 border-black p-3 shadow-neo-sm active:translate-y-1 active:shadow-none transition-all"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                            {/* Inline Add Preacher */}
                            {showAddPreacher && (
                                <div className="mt-2 flex gap-2 animate-in fade-in slide-in-from-top-2">
                                    <input
                                        type="text"
                                        placeholder="Nome do Preletor"
                                        value={newPreacherName}
                                        onChange={e => setNewPreacherName(e.target.value)}
                                        className="flex-1 border-4 border-black p-2 text-sm font-bold"
                                    />
                                    <button onClick={handleQuickAddPreacher} className="bg-black text-white px-3 text-sm font-bold border-4 border-black">OK</button>
                                </div>
                            )}
                        </div>
                    </div>
                </NeoCard>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <CounterInput label="Adultos" value={adults} onChange={setAdults} color="bg-neo-cyan" />
                    <CounterInput label="Crianças" value={kids} onChange={setKids} color="bg-neo-pink" />
                    <CounterInput label="Visitas" value={visitors} onChange={setVisitors} color="bg-neo-yellow" />
                    <CounterInput label="Pré-Adolesc." value={teens} onChange={setTeens} color="bg-neo-purple" />
                </div>

                {/* Volunteers Special Field - Updated Color */}
                <CounterInput
                    label="Voluntários"
                    value={totalVolunteers}
                    onChange={() => { }}
                    readOnly
                    color="bg-neo-green"
                    onLabelClick={() => setShowVolunteerModal(true)}
                />
                <p className="text-xs text-center font-bold text-gray-500 -mt-4 mb-4">Toque em "EDITAR" acima para gerenciar áreas</p>


                {/* Total Display */}
                <div className="bg-black text-white p-6 border-4 border-white shadow-[6px_6px_0px_0px_#000] text-center">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Público Total</h2>
                    <div className="text-6xl font-bold">{grandTotal}</div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                    <label className="font-bold">Observações</label>
                    <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        className="w-full border-4 border-black p-3 font-bold shadow-neo-sm focus:outline-none focus:shadow-neo min-h-[100px] transition-all"
                        placeholder="Algo especial aconteceu?"
                    />
                </div>

                {/* Save Button */}
                <NeoButton
                    onClick={handleSave}
                    size="lg"
                    className="w-full"
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