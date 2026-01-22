import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { NeoButton } from '../components/ui/NeoButton';
import { NeoCard } from '../components/ui/NeoCard';
import { ArrowLeft, Trash2, Plus, Download, FileSpreadsheet } from 'lucide-react';
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
    // 1. Prepare data
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
        `"${r.notes.replace(/"/g, '""')}"` // Escape quotes for CSV
      ];
    });

    // 2. Convert to CSV string
    const csvContent = [
      header.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // 3. Download
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
      // Reset input
      e.target.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        let jsonData: any[] = [];

        // Check if it's CSV or Excel based on extension or content
        if (file.name.endsWith('.csv')) {
          // Simple CSV parser
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
          // Assume Excel/Binary
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          jsonData = XLSX.utils.sheet_to_json(worksheet);
        }

        // Map JSON to Reports
        const newReports: Report[] = [];
        const newPreachers: Preacher[] = [];

        // Helper to find/create preacher
        jsonData.forEach(row => {
          // Map columns loosely (case insensitive keys if possible, but let's stick to our Export format)

          const date = row['Data'] || row['data'];
          const time = row['Horário'] || row['Horario'] || row['time'] || '19:30';
          const campusName = row['Campus'] || row['campus'];
          const preacherName = row['Preletor'] || row['preletor'];

          if (!date || !campusName) return; // Skip invalid rows

          // Resolve Campus
          const campus = campuses.find(c => c.name.toLowerCase() === String(campusName).toLowerCase()) || campuses[0];

          // Resolve Preacher
          let preacherId = preachers.find(p => p.name.toLowerCase() === String(preacherName).toLowerCase())?.id;

          if (!preacherId && preacherName) {
            // Check if we already staged this new preacher
            const staged = newPreachers.find(p => p.name.toLowerCase() === String(preacherName).toLowerCase());
            if (staged) {
              preacherId = staged.id;
            } else {
              // Create new ID
              const newId = Date.now().toString() + Math.random().toString().substr(2, 5);
              preacherId = newId;
              newPreachers.push({ id: newId, name: preacherName });
            }
          }

          if (!preacherId) preacherId = preachers[0].id; // Fallback

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

    // Reset
    e.target.value = '';
  };

  return (
    <div className="min-h-screen p-6 pb-20 space-y-8 bg-neo-bg">
      <header>
        <NeoButton variant="secondary" size="sm" onClick={() => navigate('/')} className="mb-4">
          <ArrowLeft size={16} /> VOLTAR
        </NeoButton>
        <h1 className="text-3xl font-bold uppercase text-red-600">Configurações V2</h1>
      </header>

      {/* Account Section */}
      <section>
        <h2 className="text-xl font-bold bg-black text-white inline-block px-2 py-1 mb-4 shadow-neo">CONTA</h2>
        <NeoCard className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold">Usuário Logado</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={() => signOut()}
              className="bg-red-500 text-white font-bold border-4 border-black px-4 py-2 hover:bg-red-600 active:translate-y-1 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
            >
              SAIR
            </button>
          </div>
        </NeoCard>
      </section>

      {/* Data Management Section */}
      <section>
        <h2 className="text-xl font-bold bg-black text-white inline-block px-2 py-1 mb-4 shadow-neo">DADOS</h2>
        <NeoCard className="space-y-4">
          <p className="text-sm font-bold text-gray-500">Exporte seus dados para backup ou importe relatórios antigos.</p>

          <div className="grid grid-cols-1 gap-4">
            <NeoButton onClick={handleExportCSV} icon={<Download size={20} />} className="w-full">
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
                icon={<FileSpreadsheet size={20} />}
                className="w-full"
              >
                IMPORTAR (EXCEL / PDF)
              </NeoButton>
            </div>
          </div>
          <div className="text-xs font-bold text-gray-400 mt-2">
            * Para importar PDF, recomendamos converter para Excel primeiro.
          </div>
        </NeoCard>
      </section>

      {/* Preachers Section */}
      <section>
        <h2 className="text-xl font-bold bg-black text-white inline-block px-2 py-1 mb-4 shadow-neo">PRELETORES</h2>
        <NeoCard>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newPreacher}
              onChange={(e) => setNewPreacher(e.target.value)}
              placeholder="Novo Preletor"
              className="flex-1 border-4 border-black p-2 font-bold focus:outline-none focus:ring-4 focus:ring-neo-yellow"
            />
            <button onClick={handleAddPreacher} className="bg-neo-yellow border-4 border-black px-4 hover:brightness-95 active:translate-y-1 transition-all">
              <Plus />
            </button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {preachers.map(p => (
              <div key={p.id} className="flex justify-between items-center bg-gray-50 p-2 border-4 border-black">
                <span className="font-bold">{p.name}</span>
                <button onClick={() => deletePreacher(p.id)} className="text-red-500 p-1">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </NeoCard>
      </section>

      {/* Areas Section */}
      <section>
        <h2 className="text-xl font-bold bg-black text-white inline-block px-2 py-1 mb-4 shadow-neo">ÁREAS DE VOLUNTÁRIOS</h2>
        <NeoCard>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newArea}
              onChange={(e) => setNewArea(e.target.value)}
              placeholder="Nova Área"
              className="flex-1 border-4 border-black p-2 font-bold focus:outline-none focus:ring-4 focus:ring-neo-pink"
            />
            <button onClick={handleAddArea} className="bg-neo-pink border-4 border-black px-4 hover:brightness-95 active:translate-y-1 transition-all">
              <Plus />
            </button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {volunteerAreas.map(a => (
              <div key={a.id} className="flex justify-between items-center bg-gray-50 p-2 border-4 border-black">
                <span className="font-bold">{a.name}</span>
                <button onClick={() => deleteVolunteerArea(a.id)} className="text-red-500 p-1">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </NeoCard>
      </section>

      <div className="text-center text-xs font-bold text-gray-400 mt-10">
        INA GESTÃO v1.1
      </div>
    </div>
  );
};