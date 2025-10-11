# ConectEDU - Sistema de AEE

## 📋 Sobre o Sistema

O ConectEDU é um sistema completo para gestão de Atendimento Educacional Especializado (AEE), desenvolvido para facilitar o trabalho de professores, coordenadores e profissionais da educação inclusiva.

### ✨ Funcionalidades Principais

- 🎯 **Gestão de Alunos**: Cadastro completo com informações de acessibilidade
- 📋 **Formulários AEE**: Anamnese, PDI, PAI e Entrevista com Responsável
- 📊 **Relatórios Inteligentes**: Geração automática de documentos em PDF
- 🔄 **Controle de Frequência**: Acompanhamento detalhado de presenças
- 📈 **Planos Semanais**: Organização de atividades e objetivos
- 🤖 **IA Integrada**: Análise automática e sugestões pedagógicas
- 📚 **Base de Legislações**: Acesso organizado às normativas de AEE

## 🚀 Configuração do Ambiente

### Pré-requisitos

- **XAMPP** (Apache + MySQL + PHP 7.4+)
- **Node.js** (versão 16+)
- **npm** (incluído com Node.js)

### Instalação

1. **Clone/Baixe o sistema** para `c:\xampp\htdocs\conectedu`

2. **Configure o banco de dados**:
   ```bash
   # No MySQL, execute:
   mysql -u root -e "CREATE DATABASE conectedu;"
   mysql -u root conectedu < backend/schema.sql
   ```

3. **Instale as dependências do frontend**:
   ```bash
   npm install
   ```

4. **Configure o CSS (primeira vez)**:
   ```bash
   npm run build-css-prod
   ```

## 🛠️ Desenvolvimento

### Modo Desenvolvimento (Recomendado)

Execute o script automático:
```bash
# No Windows
dev-start.bat
```

Ou manualmente:
```bash
# Inicia o build automático do CSS
npm run dev
```

### Build de Produção

```bash
# Gera CSS otimizado e minificado
npm run build
```

### Scripts Disponíveis

- `npm run dev` - Modo desenvolvimento com watch do CSS
- `npm run build` - Build de produção minificado
- `npm run build-css` - Build com watch (desenvolvimento)
- `npm run build-css-prod` - Build otimizado (produção)

## 🏗️ Estrutura do Projeto

```
conectedu/
├── frontend/
│   ├── spa-tailwind.js     # Aplicação Vue.js principal
│   ├── tailwind-src.css    # CSS fonte do Tailwind
│   ├── tailwind-local.css  # CSS compilado (gerado automaticamente)
│   └── index.html          # Página principal
├── backend/
│   ├── api.php            # API REST principal
│   ├── functions.php      # Funções auxiliares
│   └── vendor/            # Dependências PHP (Composer)
├── package.json           # Dependências Node.js
├── tailwind.config.js     # Configuração do Tailwind
├── postcss.config.js      # Configuração do PostCSS
└── dev-start.bat          # Script de desenvolvimento
```

## 🎨 Sistema de CSS

O projeto usa **Tailwind CSS 3.4** com configurações customizadas:

### Componentes Pré-definidos

```css
/* Botões */
.btn-primary    /* Botão principal azul */
.btn-secondary  /* Botão secundário branco */
.btn-success    /* Botão verde de sucesso */
.btn-danger     /* Botão vermelho de perigo */

/* Cards */
.card          /* Card básico */
.card-header   /* Cabeçalho do card */
.card-body     /* Corpo do card */
.card-footer   /* Rodapé do card */

/* Formulários */
.form-group    /* Grupo de campo */
.form-label    /* Label do campo */
.form-input    /* Input de texto */
.form-textarea /* Textarea */
.form-select   /* Select dropdown */

/* Status */
.badge         /* Badge básico */
.badge-success /* Badge verde */
.badge-warning /* Badge amarelo */
.badge-danger  /* Badge vermelho */
.badge-info    /* Badge azul */
```

### Cores Personalizadas

- **Primary**: Tons de azul (blue-50 a blue-900)
- **Secondary**: Tons de verde (green-50 a green-900)
- **Fonte**: Comic Neue (acessibilidade)

### Responsividade

O sistema é totalmente responsivo com breakpoints:
- `sm:` - 640px+
- `md:` - 768px+
- `lg:` - 1024px+
- `xl:` - 1280px+

## 🔧 Personalização

### Modificando Estilos

1. Edite `frontend/tailwind-src.css` para adicionar componentes customizados
2. Modifique `tailwind.config.js` para ajustar cores, fontes e configurações
3. Execute `npm run build-css-prod` para gerar o CSS final

### Adicionando Componentes

```css
/* Em tailwind-src.css, na seção @layer components */
.meu-componente {
  @apply bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600;
}
```

## 📱 Recursos de Acessibilidade

- ✅ Fonte Comic Neue para melhor legibilidade
- ✅ Contraste adequado em todos os componentes
- ✅ Navegação por teclado
- ✅ Labels semânticos em formulários
- ✅ Estados de foco visíveis
- ✅ Tamanhos de toque adequados (44px+)

## � Integração de Voz (STT/TTS)

O backend expõe duas ações novas para conversão de áudio e síntese de fala utilizando os serviços de voz da OpenAI, reutilizando a chave configurada em `backend/.env`.

### Endpoints Disponíveis

| Endpoint | Método | Auth | Descrição |
|----------|--------|------|-----------|
| `/backend/api.php?action=voice.transcribe` ou `POST /voice/transcribe` | `POST multipart/form-data` | ✅ | Recebe um arquivo de áudio (campo `audio`) e retorna `{ text }` com a transcrição usando Whisper (`OPENAI_STT_MODEL`, padrão `whisper-1`). |
| `/backend/api.php?action=voice.tts` ou `POST /voice/tts` | `POST application/json` | ✅ | Recebe `{ text, voice?, format? }` e retorna binário de áudio sintetizado (`OPENAI_TTS_MODEL`, padrão `tts-1`). |

### Configuração da Chave OpenAI

1. **Obtenha uma chave**: Acesse [OpenAI API Keys](https://platform.openai.com/account/api-keys) e gere uma nova chave
2. **Configure no `.env`**: Adicione `OPENAI_API_KEY=sua_chave_aqui` no arquivo `backend/.env`
3. **Modelos customizáveis**: `OPENAI_STT_MODEL`, `OPENAI_TTS_MODEL`
4. **Chaves de projeto**: Se usar chave `sk-proj-*`, adicione também `OPENAI_PROJECT_ID` (opcional, auto-detectado)

> **⚠️ Importante**: Sem uma chave válida da OpenAI, os endpoints de voz retornarão erro `OPENAI_KEY_MISSING`. A chave atual no `.env` está inválida ou expirada.

### Uso no Frontend (SPA Vue)

- **Transcrição (STT):** Na tela de relatórios, o botão “Gravar Áudio” envia o blob capturado para `/voice/transcribe`. A resposta preenche automaticamente a descrição do atendimento.
- **Síntese (TTS):** O botão “Ouvir descrição” chama `/voice/tts` e reproduz o áudio retornado (MP3 por padrão).

### Teste Manual Rápido (PowerShell)

```powershell
# Transcrição
$file = Get-Item .\amostra.wav
Invoke-WebRequest -Method Post \
   -Headers @{ Authorization = "Bearer <TOKEN_AQUI>" } \
   -InFile $file.FullName \
   -ContentType 'multipart/form-data' \
   -Uri 'http://localhost/conectedu/backend/api.php?action=voice.transcribe'

# TTS (recebe MP3)
Invoke-WebRequest -Method Post \
   -Headers @{ Authorization = "Bearer <TOKEN_AQUI>" } \
   -Body (@{ text = 'Olá, ConectEDU!'; voice='alloy'; format='mp3' } | ConvertTo-Json) \
   -ContentType 'application/json' \
   -OutFile 'fala.mp3' \
   -Uri 'http://localhost/conectedu/backend/api.php?action=voice.tts'
```

> **Dica:** Os requests exigem token JWT válido. Faça login na SPA, copie o token salvo em `localStorage` e envie no header `Authorization: Bearer ...`.

## �🚀 Deploy

### Preparação para Produção

1. Execute o build de produção:
   ```bash
   npm run build
   ```

2. O arquivo `frontend/tailwind-local.css` será otimizado e minificado

3. Certifique-se de que o Apache está configurado corretamente

4. Configure o banco de dados de produção

### Otimizações Aplicadas

- ✅ CSS minificado e otimizado
- ✅ Remoção de classes não utilizadas
- ✅ Autoprefixer para compatibilidade
- ✅ Compressão Gzip (configure no Apache)

## 🐛 Debug e Troubleshooting

### CSS não está atualizando

```bash
# Pare o processo atual (Ctrl+C) e execute:
npm run build-css-prod
```

### Erro de dependências

```bash
# Reinstale as dependências:
rm -rf node_modules package-lock.json
npm install
```

### Problemas de permissão (Windows)

Execute o terminal como Administrador

## 📚 Documentação Adicional

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vue.js 3 Guide](https://vuejs.org/guide/)
- [PHP Manual](https://www.php.net/manual/)

## 👥 Suporte

Para dúvidas sobre o sistema, consulte a documentação interna ou entre em contato com a equipe de desenvolvimento.

---

**ConectEDU** - Sistema de AEE desenvolvido com ❤️ para a educação inclusiva.