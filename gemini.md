# Mapa do Projeto B.L.A.S.T. (Adaptado)

Este documento serve como a "Fonte da Verdade" (Protocolo 0) para o projeto **Contagem de Culto INA VLNT**.

## 🟢 Protocolo 0: Status do Projeto
- **Estado Atual**: Inicialização / Descoberta
- **Stack Tecnológica**: React 19, TypeScript, Vite, React Router, XLSX.
- **Link**: [Adicionar URL de deploy se houver]

---

## 🏗️ Fase 1: B - Blueprint (Visão & Lógica)

### Descoberta (Confirmada)
1.  **North Star (Objetivo Principal)**: Gerar relatórios semanais de frequência de cultos de todos os campus com 100% de precisão, acessíveis via dashboard para o pastor presidente.
2.  **Integrações**: Supabase (Banco de Dados e Auth) e Vercel (Hospedagem).
3.  **Fonte da Verdade (Dados)**: Supabase (PostgreSQL).
4.  **Payload de Entrega**: Dashboard Web (App) com visualização consolidada de totais por fim de semana e histórico de cultos.
5.  **Regras Comportamentais (Sugestões Adotadas)**:
    -   **Segurança**: Apenas usuários autenticados podem enviar relatórios.
    -   **Integridade**: Relatórios não podem ser excluídos por usuários comuns após finalizados.
    -   **Visibilidade**: O Pastor Presidente vê tudo; Líderes locais veem apenas seu campus (Role-based access).

### Schema de Dados (Supabase - PostgreSQL)

#### Tabelas Planejadas:
1.  **`campuses`**:
    -   `id` (uuid, pk)
    -   `name` (text)
    -   `color` (text)
    -   `created_at` (timestamp)

2.  **`reports`**:
    -   `id` (uuid, pk)
    -   `campus_id` (uuid, fk -> campuses)
    -   `date` (date)
    -   `time` (time)
    -   `preacher_id` (uuid, fk -> preachers os text?) -> *Simplificar para text inicialmente ou tabela separada? Vamos manter tabela `preachers` para consistência.*
    -   `attendance_adults` (int)
    -   `attendance_kids` (int)
    -   `attendance_visitors` (int)
    -   `attendance_teens` (int)
    -   `attendance_volunteers` (int)
    -   `notes` (text)
    -   `user_id` (uuid, fk -> auth.users) - *Quem criou o relatório*
    -   `created_at` (timestamp)

3.  **`preachers`** (Opcional por enquanto, mas bom para padronizar):
    -   `id` (uuid, pk)
    -   `name` (text)

4.  **`volunteer_breakdown`** (Detalhes dos voluntários):
    -   `report_id` (uuid, fk -> reports)
    -   `area_name` (text)
    -   `count` (int)
    -   *Ou armazenar como JSONB na tabela reports para simplificar? JSONB é ótimo para estruturas flexíveis como essa no Supabase.* -> **Decisão: JSONB na coluna `volunteer_data` dentro de `reports`.**


---

## ⚡ Fase 2: L - Link (Conectividade)
- Verificação de API Keys (Gemini?): [Pendente]
- Verificação de ambiente (.env): [Pendente]

---

## ⚙️ Fase 3: A - Architect (Arquitetura Adaptada)

O protocolo original sugere "Architecture/Navigation/Tools" (Python). Para este projeto React, adaptamos para:

### Camada 1: Estrutura (SOPs)
- Documentação em `architecture/` (a ser criada se necessário).
- **Regra de Ouro**: Se a lógica de negócio mudar, atualize a documentação antes do código.

### Camada 2: Navegação & Estado (Reasoning)
- Gerenciamento de rotas (`react-router-dom`).
- Gerenciamento de estado global (`Context API` ou apenas local).
- Hooks personalizados para lógica de negócio.

### Camada 3: Componentes & Utils (Tools)
- **Componentes**: Interface do usuário (UI) em `components/`.
- **Utils/Services**: Funções puras em `utils/` ou `services/` (equivalente aos scripts `tools/` do BLAST).
    - Devem ser determinísticas e testáveis.

---

## ✨ Fase 4: S - Stylize (Refinamento & UI)
- Design System: [Definir se usa Tailwind, CSS puro, etc - pelo package.json parece ser CSS Modules ou global?]
- UX: Foco em responsividade e usabilidade.

---

## 🛰️ Fase 5: T - Trigger (Deploy)
- Build: `npm run build`
- Deploy: [Vercel? Netlify? GitHub Pages?]

