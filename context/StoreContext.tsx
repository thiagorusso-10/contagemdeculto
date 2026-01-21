import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, Campus, Preacher, Report, VolunteerArea } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface StoreContextType extends AppState {
  addReport: (report: Report) => Promise<void>;
  updateReport: (report: Report) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
  addPreacher: (name: string) => Promise<void>;
  deletePreacher: (id: string) => Promise<void>;
  addVolunteerArea: (name: string) => void;
  deleteVolunteerArea: (id: string) => void;
  importData: (reports: Report[], preachers: Preacher[]) => void;
  refreshData: () => Promise<void>;
  loading: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const INITIAL_AREAS: VolunteerArea[] = [
  { id: '1', name: 'Recepção' },
  { id: '2', name: 'Kids' },
  { id: '3', name: 'Louvor' },
  { id: '4', name: 'Mídia' },
  { id: '5', name: 'Estacionamento' },
];

// Initial data for seeding if DB is empty
const SEED_CAMPUSES: Campus[] = [
  { id: '1', name: 'INA Centro', color: 'bg-neo-yellow' },
  { id: '2', name: 'INA Campus Zona Sul', color: 'bg-neo-purple' },
  { id: '3', name: 'INA Campus Cambé', color: 'bg-neo-cyan' },
  { id: '4', name: 'INA Campus Ibiporã', color: 'bg-neo-pink' },
];

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<AppState>({
    campuses: [],
    preachers: [],
    volunteerAreas: INITIAL_AREAS,
    reports: [],
  });

  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Campuses
      const { data: campusesData } = await supabase.from('campuses').select('*').order('name');
      let finalCampuses = campusesData || [];

      // Seed campuses if empty (automagically)
      if (finalCampuses.length === 0) {
        // Using upsert to insert initial campuses, assuming we want to keep them
        // Note: ID generation is handled by DB defaults usually, but here we might want to let DB handle it 
        // or use text IDs. The migration uses uuid.
        // Let's insert without IDs to let DB generate UUIDs, 
        // BUT mapped to our known names/colors.
        const seedData = SEED_CAMPUSES.map(({ name, color }) => ({ name, color }));
        const { data: newCampuses } = await supabase.from('campuses').insert(seedData).select();
        if (newCampuses) finalCampuses = newCampuses;
      }

      finalCampuses.sort((a, b) => {
        if (a.name === 'INA Centro') return -1;
        if (b.name === 'INA Centro') return 1;
        return a.name.localeCompare(b.name);
      });

      // 2. Preachers
      const { data: preachersData } = await supabase.from('preachers').select('*').order('name');

      // 3. Reports
      const { data: reportsData } = await supabase.from('reports').select('*').order('date', { ascending: false });

      // Transform DB Reports to Frontend Reports
      const formattedReports: Report[] = (reportsData || []).map((r: any) => ({
        id: r.id,
        campusId: r.campus_id,
        date: r.date,
        time: r.time,
        preacherId: r.preacher_id,
        notes: r.notes || '',
        createdAt: new Date(r.created_at).getTime(),
        attendance: {
          adults: r.attendance_adults,
          kids: r.attendance_kids,
          visitors: r.attendance_visitors,
          teens: r.attendance_teens,
          volunteers: r.attendance_volunteers,
        },
        volunteerBreakdown: r.volunteer_data || {},
      }));

      // 4. Volunteer Areas
      const { data: areasData } = await supabase.from('volunteer_areas').select('*').order('name');

      setState(prev => ({
        ...prev,
        campuses: finalCampuses as Campus[],
        preachers: (preachersData || []) as Preacher[],
        reports: formattedReports,
        volunteerAreas: (areasData || []) as VolunteerArea[], // Load from DB
      }));

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const addReport = async (report: Report) => {
    if (!user) return;

    // Optimistic update
    setState(prev => ({ ...prev, reports: [report, ...prev.reports] }));

    const dbPayload = {
      campus_id: report.campusId,
      date: report.date,
      time: report.time,
      preacher_id: report.preacherId,
      attendance_adults: report.attendance.adults,
      attendance_kids: report.attendance.kids,
      attendance_visitors: report.attendance.visitors,
      attendance_teens: report.attendance.teens,
      attendance_volunteers: report.attendance.volunteers,
      volunteer_data: report.volunteerBreakdown,
      notes: report.notes,
      user_id: user.id
    };

    const { data, error } = await supabase.from('reports').insert(dbPayload).select();

    if (error) {
      console.error("Error adding report", error);
      fetchData();
    } else if (data) {
      const realId = data[0].id;
      const realCreatedAt = new Date(data[0].created_at).getTime();
      setState(prev => ({
        ...prev,
        reports: prev.reports.map(r => r.id === report.id ? { ...r, id: realId, createdAt: realCreatedAt } : r)
      }));
    }
  };

  const updateReport = async (updatedReport: Report) => {
    // Optimistic
    setState(prev => ({
      ...prev,
      reports: prev.reports.map(r => r.id === updatedReport.id ? updatedReport : r)
    }));

    const dbPayload = {
      campus_id: updatedReport.campusId,
      date: updatedReport.date,
      time: updatedReport.time,
      preacher_id: updatedReport.preacherId,
      attendance_adults: updatedReport.attendance.adults,
      attendance_kids: updatedReport.attendance.kids,
      attendance_visitors: updatedReport.attendance.visitors,
      attendance_teens: updatedReport.attendance.teens,
      attendance_volunteers: updatedReport.attendance.volunteers,
      volunteer_data: updatedReport.volunteerBreakdown,
      notes: updatedReport.notes,
    };

    const { error } = await supabase.from('reports').update(dbPayload).eq('id', updatedReport.id);
    if (error) {
      console.error("Error updating report", error);
      fetchData();
    }
  };

  const deleteReport = async (id: string) => {
    // Optimistic
    const previousReports = state.reports;
    setState(prev => ({
      ...prev,
      reports: prev.reports.filter(r => r.id !== id)
    }));

    const { error } = await supabase.from('reports').delete().eq('id', id);

    if (error) {
      console.error("Error deleting report:", error);
      alert("Erro ao excluir relatório no banco de dados. Verifique suas permissões.");
      setState(prev => ({ ...prev, reports: previousReports }));
    }
  };

  const addPreacher = async (name: string) => {
    // Optimistic
    const tempId = Date.now().toString();
    setState(prev => ({ ...prev, preachers: [...prev.preachers, { id: tempId, name }] }));

    const { data, error } = await supabase.from('preachers').insert({ name }).select();
    if (error) {
      console.error("Error adding preacher", error);
      fetchData();
    } else if (data) {
      // Update temp ID
      setState(prev => ({
        ...prev,
        preachers: prev.preachers.map(p => p.id === tempId ? { ...p, id: data[0].id } : p)
      }));
    }
  };

  const deletePreacher = async (id: string) => {
    // Optimistic
    setState(prev => ({ ...prev, preachers: prev.preachers.filter(p => p.id !== id) }));

    const { error } = await supabase.from('preachers').delete().eq('id', id);
    if (error) {
      console.error("Error deleting preacher", error);
      fetchData();
    }
  };

  const addVolunteerArea = async (name: string) => {
    // Optimistic
    const tempId = Date.now().toString();
    const newArea = { id: tempId, name };
    setState(prev => ({ ...prev, volunteerAreas: [...prev.volunteerAreas, newArea] }));

    const { data, error } = await supabase.from('volunteer_areas').insert({ name }).select();

    if (error) {
      console.error("Error adding area:", error);
      alert("Erro ao adicionar área. Verifique permissões.");
      fetchData(); // Rollback
    } else if (data) {
      setState(prev => ({
        ...prev,
        volunteerAreas: prev.volunteerAreas.map(a => a.id === tempId ? { ...a, id: data[0].id } : a)
      }));
    }
  };

  const deleteVolunteerArea = async (id: string) => {
    // Optimistic
    const previousAreas = state.volunteerAreas;
    setState(prev => ({ ...prev, volunteerAreas: prev.volunteerAreas.filter(a => a.id !== id) }));

    const { error } = await supabase.from('volunteer_areas').delete().eq('id', id);
    if (error) {
      console.error("Error deleting area:", error);
      alert("Erro ao excluir área. Verifique permissões.");
      setState(prev => ({ ...prev, volunteerAreas: previousAreas }));
    }
  };

  const importData = (newReports: Report[], newPreachers: Preacher[]) => {
    // Import not fully implemented for DB yet. Would need batched inserts.
    console.warn("Import not fully implemented for Supabase yet");
  };

  return (
    <StoreContext.Provider value={{
      ...state,
      addReport,
      updateReport,
      deleteReport,
      addPreacher,
      deletePreacher,
      addVolunteerArea,
      deleteVolunteerArea,
      importData,
      refreshData: fetchData,
      loading
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};