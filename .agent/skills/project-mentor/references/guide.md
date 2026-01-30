# Mapa do Projeto

Este é um guia em português claro sobre onde tudo mora na sua casa (projeto).

---

## 🏠 A Planta Baixa (Diretórios Principais)

### `src/` ou raiz (Source/Fonte)
**A Sala de Estar**. É aqui que toda a construção real acontece. 99% do seu tempo será gasto aqui.

### `pages/` (Páginas)
**Os Quartos**. Cada arquivo aqui corresponde a um "Lugar" que o usuário pode visitar, como a "Página Inicial" ou "Página de Login".

### `components/` (Componentes)
**A Loja de Móveis**. Aqui é onde guardamos as peças individuais como Botões, Barras de Navegação e Formulários.

### `public/` (Público)
**A Garagem**. Coisas estáticas que não mudam muito, como imagens, ícones e logotipos.

---

## 🤖 Sistema de Agentes (`.agent/`)

### `.agent/skills/` (Skills)
**Seu Exército de Especialistas**. Cada pasta aqui é um "consultor" diferente que pode te ajudar. Veja o [Catálogo de Skills](skills-catalog.md) para a lista completa.

### `.agent/workflows/` (Workflows)
**Receitas de Bolo**. Passos pré-definidos para tarefas comuns. Se você sempre faz algo da mesma forma, pode virar um workflow.

---

## 📄 Arquivos Chave

| Arquivo | Analogia | Função |
|---------|----------|--------|
| `vite.config.ts` | As Plantas | Instruções de como construir o app |
| `package.json` | Lista de Compras | Bibliotecas instaladas |
| `tsconfig.json` | Regras da Casa | Configuração do TypeScript |
| `.env` | Cofre Secreto | Senhas e chaves de API |

---

## 🚀 Como Pedir Ajuda

### Para Skills
Mencione a skill pelo nome ou peça algo relacionado:
- "Use a skill `clerk-auth`"
- "Quero adicionar login"
- "Me ajude com o design"

### Para Análise Completa
Diga algo como:
- "Analise o projeto"
- "Me dê uma visão geral"
- "O que temos aqui?"

---

## 🎯 Fluxo Recomendado para Iniciantes

1. **Entender**: Peça para eu explicar a estrutura
2. **Planejar**: Use `brainstorming` para clarificar o que quer fazer
3. **Construir**: Implemente com minha ajuda
4. **Revisar**: Peça sugestões de melhorias
5. **Testar**: Use `ai-test-engineer` para validar
