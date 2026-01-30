import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { NeoButton } from '../components/ui/NeoButton';
import { Card } from '../components/ui/Card';
import { ArrowLeft, Trash2, Plus, Download, FileSpreadsheet, User, Database, Users, MapPin } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Report, Preacher } from '../types';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const {
    preachers,
    addPreacher,
    deletePreacher,
    volunteerAreas,
    addVolunteerArea,
    deleteVolunteerArea,
    reports,
    campuses,
    importData
  } = useStore();

  const [newPreacher, setNewPreacher] = useState('');
  const [newArea, setNewArea] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddPreacher = () => {
    if (newPreacher.trim()) {
      addPreacher(newPreacher.trim());
      setNewPreacher('');
    }
  };

  const handleAddArea = () => {
    if (newArea.trim()) {
      addVolunteerArea(newArea.trim());
      setNewArea('');
    }
  };

  // --- Export Logic ---
  const handleExportCSV = () => {
    const header = ['Data', 'Horário', 'Campus', 'Preletor', 'Adultos', 'Crianças', 'Visitantes', 'Pré-Adolescentes', 'Voluntários', 'Total', 'Observações'];
    const rows = reports.map(r => {
      const campusName = campuses.find(c => c.id === r.campusId)?.name || 'Desconhecido';
      const preacherName = preachers.find(p => p.id === r.preacherId)?.name || 'Desconhecido';
      const total = r.attendance.adults + r.attendance.kids + r.attendance.visitors + r.attendance.teens + r.attendance.volunteers;

      return [
        r.date,
        r.time,
        campusName,
        preacherName,
        r.attendance.adults,
        r.attendance.kids,
        r.attendance.visitors,
        r.attendance.teens,
        r.attendance.volunteers,
        total,
        `"${r.notes.replace(/"/g, '""')}"`
      ];
    });

    const csvContent = [
      header.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_cultos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Import Logic ---
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const processImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      alert('A importação direta de PDF ainda é experimental. Para garantir a integridade dos dados, por favor converta seu arquivo para Excel (.xlsx) ou CSV antes de importar.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        let jsonData: any[] = [];

        if (file.name.endsWith('.csv')) {
          const text = data as string;
          const lines = text.split('\n');
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

          jsonData = lines.slice(1).filter(l => l.trim()).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            const obj: any = {};
            headers.forEach((h, i) => obj[h] = values[i]);
            return obj;
          });
        } else {
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          jsonData = XLSX.utils.sheet_to_json(worksheet);
        }

        const newReports: Report[] = [];
        const newPreachers: Preacher[] = [];

        jsonData.forEach(row => {
          const date = row['Data'] || row['data'];
          const time = row['Horário'] || row['Horario'] || row['time'] || '19:30';
          const campusName = row['Campus'] || row['campus'];
          const preacherName = row['Preletor'] || row['preletor'];

          if (!date || !campusName) return;

          const campus = campuses.find(c => c.name.toLowerCase() === String(campusName).toLowerCase()) || campuses[0];
          let preacherId = preachers.find(p => p.name.toLowerCase() === String(preacherName).toLowerCase())?.id;

          if (!preacherId && preacherName) {
            const staged = newPreachers.find(p => p.name.toLowerCase() === String(preacherName).toLowerCase());
            if (staged) {
              preacherId = staged.id;
            } else {
              const newId = Date.now().toString() + Math.random().toString().substr(2, 5);
              preacherId = newId;
              newPreachers.push({ id: newId, name: preacherName });
            }
          }

          if (!preacherId) preacherId = preachers[0].id;

          const report: Report = {
            id: Date.now().toString() + Math.random().toString().substr(2, 5),
            campusId: campus.id,
            date: date,
            time: time,
            preacherId: preacherId!,
            notes: row['Observações'] || row['Observacoes'] || '',
            attendance: {
              adults: Number(row['Adultos']) || 0,
              kids: Number(row['Crianças']) || Number(row['Criancas']) || 0,
              visitors: Number(row['Visitantes']) || 0,
              teens: Number(row['Pré-Adolescentes']) || Number(row['Pre-Adolescentes']) || 0,
              volunteers: Number(row['Voluntários']) || Number(row['Voluntarios']) || 0,
            },
            volunteerBreakdown: {},
            createdAt: Date.now()
          };
          newReports.push(report);
        });

        if (newReports.length > 0) {
          importData(newReports, newPreachers);
          alert(`${newReports.length} relatórios importados com sucesso!`);
        } else {
          alert('Nenhum dado válido encontrado para importar.');
        }

      } catch (error) {
        console.error(error);
        alert('Erro ao processar arquivo. Verifique o formato.');
      }
    };

    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
    e.target.value = '';
  };

  const inputClasses = "flex-1 p-2.5 rounded-l-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm font-medium";
  const addButtonClasses = "bg-primary text-white px-4 rounded-r-xl font-bold hover:bg-primary-hover transition-colors flex items-center justify-center";

  return (
    <div className="min-h-screen p-6 pb-24 space-y-8 bg-primary-bg dark:bg-slate-900 transition-colors duration-300">
      <header className="max-w-xl mx-auto">
        <NeoButton variant="ghost" size="sm" onClick={() => navigate('/')} className="mb-4 pl-0 hover:bg-transparent">
          <ArrowLeft size={16} /> VOLTAR
        </NeoButton>
        <h1 className="text-3xl font-black uppercase text-text-main dark:text-white tracking-tight">Configurações</h1>
      </header>

      {/* Account Section */}
      <section className="max-w-xl mx-auto">
        <Card accentColor="bg-primary">
          <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
            <User size={16} /> Conta
          </h2>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50 dark:bg-slate-900 rounded-xl p-4 transition-colors">
            <div className="text-center sm:text-left">
              <p className="font-bold text-text-main dark:text-white">Usuário Logado</p>
              <p className="text-sm text-text-muted dark:text-slate-400">{user?.email}</p>
            </div>
            <button
              onClick={async () => {
                try {
                  await signOut();
                  navigate('/login');
                } catch (e) {
                  localStorage.clear();
                  window.location.href = '/#/login';
                  window.location.reload();
                }
              }}
              className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold px-6 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors w-full sm:w-auto"
            >
              SAIR
            </button>
          </div>
        </Card>
      </section>

      {/* Data Management Section */}
      <section className="max-w-xl mx-auto">
        <Card accentColor="bg-pop-yellow">
          <h2 className="text-sm font-bold text-pop-yellow uppercase tracking-wider mb-4 flex items-center gap-2">
            <Database size={16} /> Dados
          </h2>
          <p className="text-sm text-text-muted dark:text-slate-400 mb-4">Exporte seus dados para backup ou importe relatórios antigos.</p>

          <div className="grid grid-cols-1 gap-3">
            <NeoButton onClick={handleExportCSV} icon={<Download size={18} />} className="w-full justify-start pl-6" variant="secondary">
              EXPORTAR CSV
            </NeoButton>

            <div className="relative">
              <input
                type="file"
                ref={fileInputRef}
                onChange={processImport}
                accept=".csv, .xlsx, .pdf"
                className="hidden"
              />
              <NeoButton
                onClick={handleImportClick}
                variant="secondary"
                icon={<FileSpreadsheet size={18} />}
                className="w-full justify-start pl-6"
              >
                IMPORTAR (EXCEL / PDF)
              </NeoButton>
            </div>
          </div>
        </Card>
      </section>

      {/* Preachers Section */}
      <section className="max-w-xl mx-auto">
        <Card accentColor="bg-pop-purple">
          <h2 className="text-sm font-bold text-pop-purple uppercase tracking-wider mb-4 flex items-center gap-2">
            <Users size={16} /> Preletores
          </h2>

          <div className="flex mb-4">
            <input
              type="text"
              value={newPreacher}
              onChange={(e) => setNewPreacher(e.target.value)}
              placeholder="Novo Preletor"
              className={inputClasses}
            />
            <button onClick={handleAddPreacher} className="bg-pop-purple text-white px-4 rounded-r-xl font-bold hover:brightness-110 transition-colors flex items-center justify-center">
              <Plus />
            </button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {preachers.map(p => (
              <div key={p.id} className="flex justify-between items-center bg-gray-50 dark:bg-slate-900 p-3 rounded-lg border border-gray-100 dark:border-slate-800 group hover:border-pop-purple/30 transition-all">
                <span className="font-medium text-text-main dark:text-gray-200">{p.name}</span>
                <button onClick={() => deletePreacher(p.id)} className="text-gray-400 hover:text-red-500 p-1 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Areas Section */}
      <section className="max-w-xl mx-auto">
        <Card accentColor="bg-pop-pink">
          <h2 className="text-sm font-bold text-pop-pink uppercase tracking-wider mb-4 flex items-center gap-2">
            <MapPin size={16} /> Áreas de Voluntários
          </h2>
          <div className="flex mb-4">
            <input
              type="text"
              value={newArea}
              onChange={(e) => setNewArea(e.target.value)}
              placeholder="Nova Área"
              className={inputClasses}
            />
            <button onClick={handleAddArea} className="bg-pop-pink text-white px-4 rounded-r-xl font-bold hover:brightness-110 transition-colors flex items-center justify-center">
              <Plus />
            </button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {volunteerAreas.map(a => (
              <div key={a.id} className="flex justify-between items-center bg-gray-50 dark:bg-slate-900 p-3 rounded-lg border border-gray-100 dark:border-slate-800 group hover:border-pop-pink/30 transition-all">
                <span className="font-medium text-text-main dark:text-gray-200">{a.name}</span>
                <button onClick={() => deleteVolunteerArea(a.id)} className="text-gray-400 hover:text-red-500 p-1 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <div className="text-center text-xs font-bold text-text-muted/50 dark:text-slate-700 mt-10">
        INA GESTÃO v2.0 Hybrid Dark
      </div>
    </div>
  );
};