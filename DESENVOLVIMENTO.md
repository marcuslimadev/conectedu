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

## 🚀 Deploy

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