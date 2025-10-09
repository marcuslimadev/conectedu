# ConectAEE v5.0 - Sistema de Gestão Educacional AEE

Sistema completo de gestão educacional especializado em **Atendimento Educacional Especializado (AEE)** com interface moderna, centrado no professor e otimizado para o fluxo educacional inclusivo.

## 🎯 Visão Geral do Sistema

O ConectAEE é um sistema **centrado no professor AEE**, onde cada professor gerencia apenas seus próprios alunos, garantindo privacidade e organização. O sistema inclui funcionalidades avançadas como **relatórios de atendimento com gravação de áudio e conversão IA**, além de um **diretório completo de legislações** para consulta.

## 🚀 Funcionalidades Principais

### 📊 **Sistema Centrado no Professor**
- **Acesso Restrito**: Professores veem apenas alunos que cadastraram
- **Auto-registro**: Apenas professores podem se cadastrar
- **Bloqueio de Alunos**: Login de estudantes desabilitado
- **Relatórios Filtrados**: Dados isolados por professor

### 🎤 **Relatórios de Atendimento com IA**
- **Gravação de Áudio**: Interface de microfone integrada
- **Conversão IA**: Áudio para texto automatizada
- **Campos Completos**: Data, descrição, objetivos, recursos, observações
- **CRUD Completo**: Criar, editar, listar e excluir relatórios

### 📚 **Diretório de Legislações**
- **Upload de PDFs**: Sistema seguro de upload de documentos
- **Controle Admin**: Apenas administradores podem cadastrar/deletar
- **Busca Avançada**: Filtros por título e descrição
- **Visualização**: Interface para consulta de documentos legislativos

### 📋 **Formulários AEE Integrados**
- **Entrevista com Responsável**: Coleta inicial de dados
- **PDI ConectAEE**: Plano de desenvolvimento individual
- **Plano de Atendimento**: Planejamento detalhado
- **Dropdowns Inteligentes**: Seleção automática de alunos por professor

## 📋 Formulários Implementados

### 1. Entrevista com Responsável
Formulário completo para entrevista inicial com responsáveis, incluindo:
- Dados de identificação do aluno
- Informações familiares
- Histórico médico
- Desenvolvimento e comportamento
- Expectativas do atendimento

### 2. PDI - Plano de Desenvolvimento Individual (ConectAEE)
Plano detalhado de desenvolvimento baseado no template ConectAEE:
- Identificação do aluno
- Diagnóstico e caracterização
- Objetivos específicos
- Estratégias pedagógicas
- Recursos e tecnologia assistiva

### 3. Plano de Atendimento Individual
Planejamento detalhado do atendimento educacional:
- Identificação completa
- Necessidades educacionais especiais
- Objetivos do atendimento
- Metodologia e recursos
- Critérios de avaliação

## � Controle de Acesso

| Funcionalidade | Professor AEE | Administrador | Aluno |
|---|---|---|---|
| **Login** | ✅ | ✅ | ❌ |
| **Cadastro de Alunos** | ✅ (próprios) | ✅ (todos) | ❌ |
| **Visualizar Alunos** | ✅ (próprios) | ✅ (todos) | ❌ |
| **Formulários AEE** | ✅ (próprios alunos) | ✅ (todos) | ❌ |
| **Relatórios de Atendimento** | ✅ (próprios) | ✅ (todos) | ❌ |
| **Gravação de Áudio** | ✅ | ✅ | ❌ |
| **Legislações - Visualizar** | ✅ | ✅ | ❌ |
| **Legislações - CRUD** | ❌ | ✅ | ❌ |
| **Dashboard** | ✅ (dados próprios) | ✅ (dados globais) | ❌ |

## �🛠️ Tecnologias Utilizadas

### **Frontend Moderno**
- **Vue.js 3.4.38**: Framework JavaScript progressivo com Composition API
- **Vue Router 4.4.5**: Sistema de roteamento SPA avançado
- **Tailwind CSS 3.4.0**: Framework CSS utility-first responsivo
- **Axios 1.7.4**: Cliente HTTP para comunicação com API
- **PWA**: Progressive Web App com service workers

### **Backend Robusto**
- **PHP 8.0+**: API RESTful com arquitetura limpa
- **MySQL 8.0+**: Banco de dados relacional otimizado
- **mPDF**: Geração de relatórios PDF profissionais
- **File Upload Security**: Sistema seguro para PDFs de legislação

### **Acessibilidade**
- **VLibras**: Tradução automática para LIBRAS
- **ARIA Labels**: Navegação acessível
- **Design Inclusivo**: Interface otimizada para deficientes visuais

## 📦 Instalação e Configuração

### 🔧 Requisitos do Sistema
- **XAMPP** ou servidor web com **PHP 8.0+**
- **MySQL 8.0+** ou MariaDB compatível
- **Navegador moderno** com suporte a ES6+ e PWA
- **Microfone** (para funcionalidade de gravação de áudio)

### ⚡ Instalação Rápida

1. **📁 Preparar Diretório**
   ```powershell
   # Extrair arquivos na pasta htdocs do XAMPP
   # Caminho recomendado: C:\xampp\htdocs\conectedu
   ```

2. **🗄️ Configurar Banco de Dados**
   ```sql
   -- Criar banco de dados
   CREATE DATABASE conect_edu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

   -- Importar schema principal (com novas tabelas)
   mysql -u root -p conect_edu < backend/schema.sql

   -- Importar schema dos formulários AEE
   mysql -u root -p conect_edu < backend/schema-aee.sql

   -- Aplicar atualizações de tabelas (nova funcionalidade)
   mysql -u root -p conect_edu < create_atendimentos_table.sql
   ```

3. **🔐 Criar Usuário Administrador**
   ```sql
   -- Primeiro login deve ser feito com usuário admin
   INSERT INTO users (nome, email, password, tipo) 
   VALUES ('Administrador', 'admin@conectedu.com', 'admin123', 'admin');
   ```

4. **🌐 Configurar Servidor**
   ```php
   // Verificar configurações em backend/functions.php
   // Configurações padrão do XAMPP:
   // Host: localhost
   // Database: conect_edu  
   // User: root
   // Password: (vazio no XAMPP)
   ```

5. **🚀 Iniciar Sistema**
   ```powershell
   # Iniciar Apache e MySQL no XAMPP Control Panel
   # Acessar: http://localhost/conectedu/frontend/
   ```

### 🔧 Desenvolvimento Local (Opcional)

Para desenvolvedores que preferem servidor PHP embutido:

```powershell
# 1. Navegar para pasta backend
cd C:\xampp\htdocs\conectedu\backend
php -S 127.0.0.1:8000 api.php

# 2. Em novo terminal, servir frontend  
cd C:\xampp\htdocs\conectedu\frontend
php -S 127.0.0.1:8001

# 3. Acessar sistema
# http://127.0.0.1:8001/index.html#/login
```

## � Acesso ao Sistema

### 🔑 Credenciais Iniciais
- **Email**: `admin@conectedu.com`
- **Senha**: `admin123`
- **Tipo**: Administrador

### ➕ Cadastro de Professores
1. **Pelo Admin**: Acesso total ao sistema
2. **Auto-cadastro**: Interface pública em `/register`
3. **Via SQL**: Para casos especiais

```sql
-- Exemplo de inserção manual
INSERT INTO users (nome, email, password, tipo, created_at) 
VALUES ('Professor AEE', 'professor@escola.com', 'senha123', 'professor', NOW());
```

## 🎯 Funcionalidades Detalhadas

### 🏠 **Dashboard Inteligente**
- **Estatísticas Personalizadas**: Dados isolados por professor
- **Gráficos Interativos**: Visualização de progresso dos alunos
- **Resumo Executivo**: Alunos cadastrados e atendimentos realizados
- **Timeline de Atividades**: Histórico de ações recentes

### 👥 **Gestão de Alunos (Professor-Específica)**
- **Cadastro Exclusivo**: Cada professor vê apenas seus alunos
- **Busca Inteligente**: Filtros por nome, necessidade, data
- **Perfil Completo**: Informações detalhadas e histórico
- **Segurança de Dados**: Isolamento total entre professores

### 📋 **Formulários AEE Oficiais**
- **🎤 Entrevista com Responsável**: Coleta inicial com dropdowns automáticos
- **📊 PDI ConectAEE**: Plano de desenvolvimento individual estruturado  
- **🎯 Plano de Atendimento**: Objetivos, metodologia e avaliação

### 📝 **Relatórios de Atendimento com IA**
- **🎤 Gravação de Áudio**: Interface nativa do navegador
- **🤖 Conversão IA**: Áudio para texto automatizada (preparado)
- **📅 Controle de Datas**: Agendamento e histórico de atendimentos
- **📊 Análise Completa**: Objetivos, recursos, observações detalhadas

### 📚 **Diretório de Legislações (Admin)**
- **📄 Upload Seguro**: Sistema protegido para PDFs
- **🔍 Busca Avançada**: Por título, descrição e conteúdo
- **👁️ Visualização**: Interface integrada de documentos
- **🗑️ Controle Total**: Apenas administradores podem gerenciar

## �️ Estrutura do Banco de Dados

### 📊 **Tabelas Principais**
```sql
-- Usuários (professores e admins)
users: id, nome, email, password, tipo, created_at

-- Alunos (vinculados ao professor que cadastrou)
students: id, nome, data_nascimento, escola, created_by_teacher_id, created_at

-- Relatórios de atendimento
atendimentos: id, aluno_id, professor_id, data_atendimento, descricao, objetivos, recursos, observacoes, audio_path, created_at

-- Legislações (apenas admin)
legislacoes: id, titulo, descricao, arquivo_path, created_by_admin_id, created_at

-- Formulários AEE (PDI, Entrevistas, Planos)
pdi_forms, entrevista_forms, plano_atendimento_forms
```

## 🔧 Configurações e Manutenção

### 🎨 **Personalização Visual**
```javascript
// Arquivo: frontend/spa-tailwind.js
// Modificar cores do tema
const theme = {
  primary: 'blue',    // Cor principal
  secondary: 'green', // Cor secundária  
  accent: 'purple'    // Cor de destaque
}
```

### 💾 **Backup e Restauração**
```powershell
# Backup completo
mysqldump -u root -p conect_edu > backup_conectedu_$(Get-Date -Format "yyyy-MM-dd").sql

# Restauração
mysql -u root -p conect_edu < backup_conectedu_2024-01-15.sql
```

### 🛡️ **Segurança do Sistema**
- **Upload Protegido**: Diretório `/uploads/legislacoes/` com `.htaccess`
- **Autenticação**: Sistema de sessões PHP seguro
- **Validação**: Filtros de entrada em todos os endpoints
- **Isolamento**: Dados de professores completamente separados

## 🚀 Performance e Otimização

### ⚡ **Características de Performance**
- **SPA Vue.js**: Navegação instantânea sem recarregamento
- **Lazy Loading**: Componentes carregados sob demanda  
- **API Otimizada**: Consultas SQL indexadas e eficientes
- **PWA**: Cache offline e instalação no dispositivo

### 🔍 **Debugging e Logs**
```powershell
# Verificar logs PHP (Windows XAMPP)
Get-Content C:\xampp\apache\logs\error.log -Wait -Tail 50

# Console JavaScript (F12 no navegador)
# Network tab para debugging de API
```

## 📱 Compatibilidade e Responsividade

- **💻 Desktop**: Interface completa (1024px+)
- **📱 Tablet**: Layout adaptado (768px - 1023px)  
- **📱 Mobile**: Interface otimizada (320px - 767px)
- **🦽 Acessibilidade**: VLibras, ARIA labels, alto contraste

### 🌍 **Navegadores Testados**
- ✅ Chrome 90+ (recomendado)
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## �️ Segurança Implementada

### 🔐 **Camadas de Proteção**
- **Autenticação Robusta**: Sistema de sessões PHP com timeout
- **Isolamento de Dados**: Professores acessam apenas próprios dados
- **Upload Seguro**: Validação de tipos de arquivo e diretório protegido
- **SQL Injection**: Prepared statements em todas as consultas
- **XSS Protection**: Sanitização de entradas e outputs
- **CSRF Prevention**: Validação de tokens em formulários

## 🆘 Suporte e Troubleshooting

### ⚠️ **Problemas Frequentes**

1. **❌ Erro de Conexão Database**
   ```powershell
   # Verificar se MySQL está ativo no XAMPP
   # Conferir credenciais em backend/functions.php
   # Testar: mysql -u root -p conect_edu
   ```

2. **⭕ Página em Branco / 500 Error**
   ```powershell
   # Verificar logs de erro
   Get-Content C:\xampp\apache\logs\error.log
   # Conferir permissões de arquivos
   ```

3. **🚫 Upload de Legislações Falhando**
   ```powershell
   # Criar diretório se não existir
   mkdir C:\xampp\htdocs\conectedu\backend\uploads\legislacoes\
   # Verificar permissões de escrita
   ```

4. **🎤 Gravação de Áudio Não Funciona**
   - Verificar se navegador tem permissão de microfone
   - Testar em HTTPS (localhost funciona em HTTP)
   - Chrome requer HTTPS para getUserMedia()

### 📞 **Suporte Técnico**
Para dúvidas, sugestões ou problemas:
- 📧 **Email**: suporte@conectedu.com  
- 💬 **Issues**: Reporte bugs no repositório
- 📚 **Documentação**: Consulte este README atualizado

---

## 🏗️ Arquitetura do Sistema

### 📂 **Estrutura de Arquivos**
```
conectedu/
├── 📁 frontend/              # SPA Vue.js
│   ├── index.html           # Página principal
│   ├── spa-tailwind.js      # Aplicação Vue + componentes
│   ├── config.js            # Configurações da API
│   └── icons/               # Logos e ícones
├── 📁 backend/              # API PHP
│   ├── api.php              # Endpoints REST
│   ├── functions.php        # Funções auxiliares
│   ├── schema.sql           # Schema principal
│   ├── schema-aee.sql       # Formulários AEE
│   └── uploads/             # Arquivos enviados
│       └── legislacoes/     # PDFs de legislação
└── create_atendimentos_table.sql # Update de tabelas
```

### 🔄 **Fluxo de Dados**
```
[Frontend Vue.js] ↔ [API PHP] ↔ [MySQL Database]
      ↓
[Componentes Reativos] → [Axios HTTP] → [Endpoints REST] → [Prepared Statements]
```

## 📈 Roadmap e Melhorias Futuras

### 🚀 **Próximas Versões**
- 🤖 **IA de Análise**: Processamento automático de relatórios de atendimento
- 📊 **Dashboard Avançado**: Gráficos de progresso individual dos alunos
- 📱 **App Mobile**: Aplicativo nativo para Android/iOS
- 🔔 **Notificações Push**: Lembretes de atendimentos agendados
- 📧 **Sistema de Email**: Comunicação com responsáveis
- 🎯 **Metas e Objetivos**: Tracking de evolução dos alunos

---

**ConectAEE v5.0** - Sistema de gestão educacional inclusiva desenvolvido com ❤️ para profissionais de Atendimento Educacional Especializado.
Para suporte técnico, consulte a documentação ou entre em contato com a equipe de desenvolvimento.

## 📄 Licença

Sistema desenvolvido para uso educacional. Todos os direitos reservados.

---

**ConectEdu v5.0** - Sistema de Gestão Educacional Especializada
Desenvolvido com ❤️ para a educação inclusiva.

