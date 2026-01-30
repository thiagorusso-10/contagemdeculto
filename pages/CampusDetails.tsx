import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { NeoButton } from '../components/ui/NeoButton';
import { ArrowLeft, Plus, Clock, User, Sun, Moon } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { formatServiceTime, getCampusColorBg } from '../lib/utils';

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

  const accentClass = getCampusColorBg(campus.name);

  return (
    <div className="min-h-screen p-6 pb-24 transition-colors duration-300 bg-primary-bg dark:bg-slate-900">
      {/* Header */}
      <div className="max-w-xl mx-auto mb-6">
        <NeoButton variant="ghost" size="sm" onClick={() => navigate('/')} className="mb-4 pl-0 hover:bg-transparent">
          <ArrowLeft size={16} /> VOLTAR
        </NeoButton>
        <div className="flex items-center gap-3">
          <div className={`w-2 h-12 rounded-full ${accentClass}`}></div>
          <h1 className="text-3xl font-bold uppercase text-text-main dark:text-white tracking-tight">
            {campus.name}
          </h1>
        </div>
      </div>

      <div className="max-w-xl mx-auto space-y-4">
        {campusReports.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
            <p className="font-bold text-xl text-text-muted dark:text-slate-400 mb-2">Nenhum relatório ainda.</p>
            <p className="text-sm text-text-muted dark:text-slate-500">Clique em "+" para adicionar o primeiro.</p>
          </div>
        ) : (
          campusReports.map(report => {
            const timeLabel = formatServiceTime(report.time);
            const isMorning = timeLabel.includes('MANHÃ');

            return (
              <Card
                key={report.id}
                accentColor={accentClass}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 group relative"
                noPadding={false}
              >
                <div onClick={() => navigate(`/report/edit/${report.id}`)}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-gray-100 dark:bg-slate-700 text-text-main dark:text-gray-200 px-2 py-1 rounded-md text-xs font-bold font-mono">
                          {(() => {
                            const [year, month, day] = report.date.split('-');
                            return `${day}/${month}`;
                          })()}
                        </span>

                        {/* Highlighted Time Badge */}
                        <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border ${isMorning
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900/40'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-900/40'}`}>
                          {isMorning ? <Sun size={10} /> : <Moon size={10} />}
                          {timeLabel}
                        </span>

                      </div>
                      <div className="text-sm font-medium text-text-muted dark:text-slate-300 flex items-center gap-1 pt-0">
                        <User size={14} className="text-primary" />
                        {getPreacherName(report.preacherId)}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-3xl font-black text-text-main dark:text-white leading-none tracking-tight">{getTotal(report)}</div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted dark:text-slate-400 mt-1">Total</div>
                    </div>
                  </div>

                  {/* Mini Breakdown */}
                  <div className="pt-3 border-t border-gray-100 dark:border-slate-700 grid grid-cols-5 gap-2">
                    {[
                      { label: 'Adultos', val: report.attendance.adults, color: 'text-cyan-600 dark:text-cyan-400' },
                      { label: 'Crianças', val: report.attendance.kids, color: 'text-pink-500 dark:text-pink-400' },
                      { label: 'Visitas', val: report.attendance.visitors, color: 'text-yellow-500 dark:text-yellow-400' },
                      { label: 'Pré', val: report.attendance.teens, color: 'text-purple-500 dark:text-purple-400' },
                      { label: 'Volunt.', val: report.attendance.volunteers, color: 'text-green-600 dark:text-green-400' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center bg-gray-50/50 dark:bg-slate-900/50 p-1.5 rounded-lg border border-transparent dark:border-slate-700/30">
                        <span className="text-[9px] uppercase font-bold text-gray-400 dark:text-slate-500 mb-0.5">{item.label}</span>
                        <span className={`font-bold text-lg leading-none ${item.color}`}>{item.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {(role === 'admin' || (role === 'campus_leader' && assignedCampusId === id)) && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => navigate(`/report/new?campusId=${id}`)}
            className="w-14 h-14 bg-cta hover:bg-cta-hover text-white rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center group"
          >
            <Plus size={28} className="transition-transform group-hover:rotate-90" />
          </button>
        </div>
      )}
    </div>
  );
};