import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { NeoCard } from '../components/ui/NeoCard';
import { Settings, Plus, Users, Church, Calendar } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { campuses, reports } = useStore();
  const navigate = useNavigate();

  // Helper to find last report stats (aggregated by date)
  const getLastReportSummary = (campusId: string) => {
    const campusReports = reports.filter(r => r.campusId === campusId);

    if (campusReports.length === 0) return null;

    // 1. Find the most recent date among reports
    // Sort descending by date string (YYYY-MM-DD works with string comparison)
    campusReports.sort((a, b) => b.date.localeCompare(a.date));

    const latestDate = campusReports[0].date;

    // 2. Filter all reports that match this date
    const reportsOnLatestDate = campusReports.filter(r => r.date === latestDate);

    // 3. Sum the attendance
    const total = reportsOnLatestDate.reduce((acc, r) => {
      return acc + r.attendance.adults + r.attendance.kids + r.attendance.visitors + r.attendance.teens + r.attendance.volunteers;
    }, 0);

    // Format date DD/MM
    const [year, month, day] = latestDate.split('-');

    return { date: `${day}/${month}`, total };
  };

  // Global Stats: Sum of ALL campuses on the LATEST AVAILABLE DATE
  const stats = useMemo(() => {
    if (reports.length === 0) return { totalPeople: 0, date: null };

    // 1. Find the absolute latest date across ALL reports
    const sortedReports = [...reports].sort((a, b) => b.date.localeCompare(a.date));
    const latestDate = sortedReports[0].date;

    // 2. Filter reports ONLY from that specific date
    const reportsOnLatestDate = reports.filter(r => r.date === latestDate);

    // 3. Sum total
    const total = reportsOnLatestDate.reduce((acc, r) => {
      return acc + r.attendance.adults + r.attendance.kids + r.attendance.visitors + r.attendance.teens + r.attendance.volunteers;
    }, 0);

    // Format date DD/MM
    const [year, month, day] = latestDate.split('-');
    const formattedDate = `${day}/${month}`;

    return { totalPeople: total, date: formattedDate };
  }, [reports]);

  return (
    <div className="min-h-screen pb-24 bg-neo-bg">
      {/* Yellow Brand Header */}
      <header className="bg-neo-yellow border-b-4 border-black p-4 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-4">
          {/* Icon Box */}
          <div className="bg-black w-12 h-12 flex items-center justify-center border-2 border-black">
            <Church className="text-neo-yellow" size={24} strokeWidth={2.5} />
          </div>

          {/* Text */}
          <div className="leading-none">
            <h1 className="text-2xl font-black uppercase tracking-tighter">CONTAGEM<br />DE CULTO</h1>
            <span className="text-xs font-bold opacity-70 tracking-widest">Gestão de Cultos</span>
          </div>
        </div>

        <div className="flex gap-3">
          {/* History Button */}
          <button
            onClick={() => navigate('/history')}
            className="bg-white w-12 h-12 flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all hover:bg-gray-50"
          >
            <Calendar size={24} />
          </button>

          {/* Settings Button */}
          <button
            onClick={() => navigate('/settings')}
            className="bg-white w-12 h-12 flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all hover:bg-gray-50"
          >
            <Settings size={24} />
          </button>
        </div>
      </header>


      {/* Black Stats Bar */}
      <div className="bg-black text-white p-2 border-b-4 border-black flex justify-end items-center gap-4 text-xs font-bold font-mono overflow-x-auto whitespace-nowrap">
        <div className="flex items-center gap-2 pr-2">
          <span className="text-gray-400">TOTAL EM {stats.date || '--/--'}:</span>
          <span className="text-neo-cyan text-lg">{stats.totalPeople}</span>
          <span className="text-gray-500 lowercase">pessoas</span>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 auto-rows-fr">
          {campuses.map(campus => {
            const summary = getLastReportSummary(campus.id);

            return (
              <NeoCard
                key={campus.id}
                color={campus.color}
                className="relative min-h-[200px] h-full flex flex-col justify-between hover:-translate-y-1 hover:-translate-x-1 hover:shadow-neo-hover transition-all duration-200"
                onClick={() => navigate(`/campus/${campus.id}`)}
              >
                <div className="relative z-10">
                  <h2 className="text-2xl md:text-3xl font-bold uppercase mb-2 leading-tight">{campus.name}</h2>
                  <div className="h-2 w-16 bg-black mb-6"></div>
                </div>

                {summary ? (
                  <div className="bg-white border-4 border-black p-3 self-start shadow-neo-sm relative z-10">
                    <div className="text-xs font-bold uppercase text-gray-500 mb-1">Último Culto ({summary.date})</div>
                    <div className="flex items-center gap-2">
                      <Users size={20} />
                      <span className="font-bold text-2xl">{summary.total} Pessoas</span>
                    </div>
                  </div>
                ) : (
                  <div className="opacity-50 font-bold text-sm italic border-4 border-dashed border-black p-3 inline-block relative z-10 bg-white/30 backdrop-blur-sm">
                    Sem dados recentes
                  </div>
                )}

                <div className="absolute top-4 right-4 opacity-10 pointer-events-none z-0">
                  <Users size={80} />
                </div>
              </NeoCard>
            );
          })}
        </div>
      </div>

      {/* FAB */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={() => navigate('/report/new')}
          className="bg-black text-white w-16 h-16 flex items-center justify-center border-4 border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,0.5)] active:translate-y-1 active:shadow-none transition-all hover:scale-105"
        >
          <Plus size={32} />
        </button>
      </div>
    </div>
  );
};