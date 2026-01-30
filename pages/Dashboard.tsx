import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/ui/Card';
import { getCampusColorBg } from '../lib/utils';
import { Settings, Plus, Users, Church, Calendar, LogOut, Sun, Moon, TrendingUp } from 'lucide-react';
import { AnalyticsModal } from '../components/charts/AnalyticsModal';
import { NeoButton } from '../components/ui/NeoButton';

export const Dashboard: React.FC = () => {
  const { campuses, reports } = useStore();
  const { assignedCampusId, role, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showAnalytics, setShowAnalytics] = useState(false);

  const visibleCampuses = useMemo(() => {
    if (role === 'admin' || role === 'global_viewer') {
      return campuses;
    }
    if (assignedCampusId) {
      return campuses.filter(c => c.id === assignedCampusId);
    }
    return [];
  }, [campuses, assignedCampusId, role]);

  const getLastReportSummary = (campusId: string) => {
    const campusReports = reports.filter(r => r.campusId === campusId);
    if (campusReports.length === 0) return null;

    campusReports.sort((a, b) => b.date.localeCompare(a.date));
    const latestDate = campusReports[0].date;
    const reportsOnLatestDate = campusReports.filter(r => r.date === latestDate);

    const total = reportsOnLatestDate.reduce((acc, r) => {
      return acc + r.attendance.adults + r.attendance.kids + r.attendance.visitors + r.attendance.teens + r.attendance.volunteers;
    }, 0);

    const [year, month, day] = latestDate.split('-');
    return { date: `${day}/${month}`, total };
  };

  const stats = useMemo(() => {
    if (reports.length === 0) return { totalPeople: 0, date: null };

    const sortedReports = [...reports].sort((a, b) => b.date.localeCompare(a.date));
    const latestDate = sortedReports[0].date;
    const reportsOnLatestDate = reports.filter(r => r.date === latestDate);

    const total = reportsOnLatestDate.reduce((acc, r) => {
      return acc + r.attendance.adults + r.attendance.kids + r.attendance.visitors + r.attendance.teens + r.attendance.volunteers;
    }, 0);

    const [year, month, day] = latestDate.split('-');
    return { totalPeople: total, date: `${day}/${month}` };
  }, [reports]);

  const canViewAnalytics = role === 'admin' || role === 'global_viewer' || role === 'campus_leader';
  const analyticsCampusId = (role === 'campus_leader' && assignedCampusId) ? assignedCampusId : undefined;

  return (
    <div className="min-h-screen pb-24 page-transition">
      {/* Analytics Modal */}
      <AnalyticsModal
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        campusId={analyticsCampusId}
      />

      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 sticky top-0 z-30 transition-colors duration-300">
        <div className="max-w-6xl mx-auto p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 w-10 h-10 rounded-xl flex items-center justify-center">
              <Church className="text-primary" size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-text-main dark:text-white">
                CONTAGEM<br />DE CULTO
              </h1>
            </div>
          </div>

          <div className="flex gap-2">
            {canViewAnalytics && (
              <button
                onClick={() => setShowAnalytics(true)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-100 dark:hover:bg-cyan-900/40 hover:shadow-md transition-all duration-200"
                title="Análise Geral"
              >
                <TrendingUp size={20} />
              </button>
            )}

            <button
              onClick={toggleTheme}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:shadow-md transition-all duration-200"
              title="Alternar Tema"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
              onClick={() => navigate('/history')}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:shadow-md transition-all duration-200"
              title="Histórico"
            >
              <Calendar size={20} />
            </button>

            {role === 'admin' ? (
              <button
                onClick={() => navigate('/settings')}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:shadow-md transition-all duration-200"
                title="Configurações"
              >
                <Settings size={20} />
              </button>
            ) : (
              <button
                onClick={signOut}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 hover:shadow-md transition-all duration-200"
                title="Sair"
              >
                <LogOut size={20} />
              </button>
            )}

            {role === 'admin' && (
              <button
                onClick={() => navigate('/team')}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-white dark:hover:bg-slate-700 hover:shadow-md transition-all duration-200"
                title="Equipe"
              >
                <Users size={20} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Stats */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-800 py-6 mb-6 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-sm font-semibold text-text-muted dark:text-slate-400 uppercase tracking-wider mb-1">
              Total Geral ({stats.date || '--/--'})
            </h2>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-primary tracking-tight">{stats.totalPeople}</span>
              <span className="text-text-muted dark:text-slate-500 font-medium">pessoas</span>
            </div>
          </div>

          {canViewAnalytics && (
            <div className="hidden md:block">
              <NeoButton
                variant="ghost"
                icon={<TrendingUp size={18} />}
                onClick={() => setShowAnalytics(true)}
                className="text-primary hover:bg-primary/5"
              >
                VER ANÁLISE DETALHADA
              </NeoButton>
            </div>
          )}
        </div>
      </div>

      {/* Campus List */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {visibleCampuses.map(campus => {
            const summary = getLastReportSummary(campus.id);
            const accentColor = getCampusColorBg(campus.name);

            const formatName = (name: string) => {
              if (name.toLowerCase().includes('campus')) {
                return { line1: 'INA CAMPUS', line2: name.replace(/ina campus/i, '').trim() };
              }
              return { line1: 'INA', line2: name.replace(/ina/i, '').trim() };
            };
            const { line1, line2 } = formatName(campus.name);

            return (
              <Card
                key={campus.id}
                accentColor={accentColor}
                className="group cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                noPadding={false}
              >
                <div onClick={() => navigate(`/campus/${campus.id}`)}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-xs font-bold text-text-muted dark:text-slate-400 mb-1">{line1}</div>
                      <div className="text-2xl font-bold text-text-main dark:text-gray-100 leading-none uppercase">{line2}</div>
                    </div>
                  </div>

                  {summary ? (
                    <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3 flex items-center justify-between">
                      <div className="text-xs font-medium text-text-muted dark:text-slate-400">
                        Último Culto <span className="font-bold text-slate-600 dark:text-slate-300">{summary.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-text-main dark:text-white">
                        <Users size={16} className={`${accentColor.replace('bg-', 'text-')}`} />
                        <span className="font-bold text-lg">{summary.total}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3 text-center text-xs text-text-muted italic">
                      Sem dados recentes
                    </div>
                  )}

                  <div className="absolute top-2 right-2 opacity-5 dark:opacity-10 scale-150 rotate-12 transition-transform group-hover:rotate-0 group-hover:scale-125 duration-500 text-black dark:text-white">
                    <Users size={64} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* FAB */}
      {(role === 'admin' || role === 'campus_leader') && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => navigate('/report/new')}
            className="w-14 h-14 bg-cta hover:bg-cta-hover text-white rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center group"
          >
            <Plus size={28} className="transition-transform group-hover:rotate-90" />
          </button>
        </div>
      )}
    </div>
  );
};