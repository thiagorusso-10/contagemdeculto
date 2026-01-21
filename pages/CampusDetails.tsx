import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { NeoButton } from '../components/ui/NeoButton';
import { ArrowLeft, Plus, Calendar, User, Clock } from 'lucide-react';
import { NeoCard } from '../components/ui/NeoCard';

export const CampusDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { campuses, reports, preachers } = useStore();
  const { role, assignedCampusId } = useAuth();

  const campus = campuses.find(c => c.id === id);
  const campusReports = reports
    .filter(r => r.campusId === id)
    .sort((a, b) => new Date(b.date + 'T' + b.time).getTime() - new Date(a.date + 'T' + a.time).getTime());

  if (!campus) return <div>Campus não encontrado</div>;

  const getPreacherName = (id: string) => preachers.find(p => p.id === id)?.name || 'Desconhecido';

  const getTotal = (r: any) => r.attendance.adults + r.attendance.kids + r.attendance.visitors + r.attendance.teens + r.attendance.volunteers;

  return (
    <div className="min-h-screen p-6 pb-24">
      <header className="mb-6">
        <NeoButton variant="secondary" size="sm" onClick={() => navigate('/')} className="mb-4">
          <ArrowLeft size={16} /> VOLTAR
        </NeoButton>
        <h1 className={`text-3xl font-bold uppercase p-2 border-4 border-black inline-block shadow-neo ${campus.color}`}>
          {campus.name}
        </h1>
      </header>

      <div className="space-y-4">
        {campusReports.length === 0 ? (
          <div className="text-center py-12 opacity-60">
            <p className="font-bold text-xl">Nenhum relatório ainda.</p>
            <p>Clique em "+" para adicionar.</p>
          </div>
        ) : (
          campusReports.map(report => (
            <NeoCard
              key={report.id}
              onClick={() => navigate(`/report/edit/${report.id}`)}
              className="group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-black text-white px-2 py-0.5 text-sm font-bold">
                      {new Date(report.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </span>
                    <span className="font-bold text-gray-600 flex items-center gap-1 text-sm">
                      <Clock size={14} /> {report.time}
                    </span>
                  </div>
                  <div className="font-bold text-sm flex items-center gap-1 mb-2">
                    <User size={14} /> {getPreacherName(report.preacherId)}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-bold leading-none">{getTotal(report)}</div>
                  <div className="text-xs font-bold uppercase tracking-wider">Total</div>
                </div>
              </div>

              {/* Mini Breakdown */}
              <div className="mt-4 pt-3 border-t-4 border-gray-100 flex flex-wrap gap-x-4 gap-y-2 text-xs font-bold text-gray-500 uppercase">
                <span>ADUL: {report.attendance.adults}</span>
                <span>CRIANÇAS: {report.attendance.kids}</span>
                <span>VISIT: {report.attendance.visitors}</span>
                <span>PRÉ: {report.attendance.teens}</span>
                <span>VOL: {report.attendance.volunteers}</span>
              </div>
            </NeoCard>
          ))
        )}
      </div>

      {(role === 'admin' || (role === 'campus_leader' && assignedCampusId === id)) && (
        <div className="fixed bottom-6 right-6 z-10">
          <button
            onClick={() => navigate(`/report/new?campusId=${id}`)}
            className="bg-neo-yellow text-black w-16 h-16 flex items-center justify-center border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"
          >
            <Plus size={32} />
          </button>
        </div>
      )}
    </div>
  );
};