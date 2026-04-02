# 🛡️ Spartan

## 🏥 Inteligência e Gestão em Ergonomia e Saúde Ocupacional

**Spartan** é uma plataforma avançada de gestão ocupacional criada para centralizar, automatizar e elevar o nível das análises ergonômicas e de saúde física e mental dos colaboradores, utilizando **visão computacional** e **gestão de dados inteligente** para transformar conformidade em prevenção real.

O projeto foi desenvolvido para ergonomistas e gestores de SST que buscam precisão, agilidade e uma gestão baseada em evidências, superando processos manuais e planilhas isoladas.

---

## ✨ Funcionalidades

### 📊 Dashboard Estratégico
- Visão geral de empresas atendidas e setores cadastrados.
- Métricas de riscos detectados e planos de ação em andamento.
- Acompanhamento do progresso de análises e questionários.
- Acesso rápido às principais ferramentas de captura e gestão.

---

### 📷 Análise Biomecânica via IA
- **Captura de Posturas**: Registro fotográfico e em vídeo de atividades laborais.
- **Visão Computacional**: Detecção automática de articulações e ângulos corporais.
- **Avaliação em Tempo Real**: Feedback imediato sobre desvios posturais e riscos biomecânicos.
- Integração de câmeras para análises precisas sem necessidade de sensores caros.

---

### 📋 Gestão de Riscos e Ações
- Cadastro hierárquico: Empresas → Setores → Postos de Trabalho.
- Identificação e classificação de riscos ocupacionais por posto.
- Criação e monitoramento de **Planos de Ação** para mitigação de riscos.
- Controle de status e prazos para intervenções ergonômicas.

---

### 🧠 Avaliação Psicossocial
- Aplicação de questionários psicossociais digitais.
- Gestão centralizada de respostas e avaliações de clima/saúde mental.
- Relatórios automáticos sobre o perfil psicossocial do colaborador e do ambiente.
- Ferramentas de apoio para conformidade com normas regulamentadoras.

---

### 📄 Relatórios e Documentação
- Geração instantânea de relatórios técnicos profissionais em PDF/DOCX.
- Gestão de **Responsáveis Técnicos** e assinaturas.
- Histórico completo de análises por colaborador e por posto de trabalho.
- Formulários online para coleta remota de dados com trabalhadores.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Inteligência Artificial**: [TensorFlow Pose Detection](https://github.com/tensorflow/tfjs-models/tree/master/pose-detection)
- **Componentes**: [Shadcn UI](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend/Banco de Dados**: [Supabase](https://supabase.com/)
- **Gestão de Estado**: [TanStack Query](https://tanstack.com/query/latest)
- **Mobile Friendly**: Integrado com [Capacitor](https://capacitorjs.com/) para uso em dispositivos móveis.

---

## 🏗️ Estrutura do Projeto

```bash
spartan/
├── public/          # Ativos estáticos e ícones
├── src/
│   ├── components/  # Componentes de UI e Layout (AppLayout, Dashboard)
│   ├── hooks/       # Hooks customizados (useNativeApp)
│   ├── integrations/# Integração com serviços (Supabase, OpenAI)
│   ├── lib/         # Configurações e Contextos (company-context)
│   ├── pages/       # Páginas de gestão e análise (AnalisesPage, RiscosPage)
│   ├── styles/      # Arquivos de estilização CSS
│   └── App.tsx      # Roteamento e estrutura principal
├── index.html
├── package.json
├── tailwind.config.ts
├── vite.config.ts
└── README.md
```

---

## 🚀 Como Rodar o Projeto

1.  **Clone o repositório**:
    ```bash
    git clone <url-do-repositorio>
    cd spartan
    ```

2.  **Instale as dependências**:
    ```bash
    npm install
    ```

3.  **Configurar variáveis de ambiente**:
    - Edite o arquivo `.env` baseado no `.env.example`.
    - Adicione o `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.

4.  **Inicie o servidor local**:
    ```bash
    npm run dev
    ```

5.  **Acesse no navegador**:
    - `http://localhost:5173`
