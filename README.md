# ConectEdu v5.0 - Sistema de Gestão Educacional

Sistema completo de gestão educacional especializado em Atendimento Educacional Especializado (AEE) com interface moderna usando Tailwind CSS.

## 🚀 Características Principais

- **Interface Moderna**: Design responsivo com Tailwind CSS
- **Formulários AEE Completos**: Baseados em templates oficiais
- **Sistema de Autenticação**: Login seguro com sessões
- **Dashboard Interativo**: Gráficos e estatísticas em tempo real
- **Gestão de Alunos**: Cadastro e acompanhamento completo
- **Relatórios**: Sistema de relatórios integrado

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

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Vue.js 2.6.14 + Tailwind CSS 3.4.0
- **Backend**: PHP 8.1 + MySQL
- **Gráficos**: Chart.js
- **Icons**: Heroicons
- **Arquitetura**: SPA (Single Page Application)

## 📦 Instalação

### Requisitos
- XAMPP ou servidor web com PHP 8.1+
- MySQL 5.7+
- Navegador web moderno

### Passos de Instalação

1. **Extrair arquivos**
   ```bash
   # Extrair o arquivo ZIP na pasta htdocs do XAMPP
   # Exemplo: C:\xampp\htdocs\conect-edu-melhorado
   ```

2. **Configurar banco de dados**
   ```sql
   -- Criar banco de dados
   CREATE DATABASE conect_edu;
   
   -- Importar schema principal
   mysql -u root -p conect_edu < backend/schema.sql
   
   -- Importar schema dos formulários AEE
   mysql -u root -p conect_edu < backend/schema-aee.sql
   ```

3. **Configurar conexão**
   ```php
   // Editar backend/functions.php se necessário
   // Configurações padrão:
   // Host: localhost
   // Database: conect_edu
   // User: root
   // Password: (vazio)
   ```

4. **Iniciar servidor**
   ```bash
   # Iniciar Apache e MySQL no XAMPP
   # Acessar: http://localhost/conect-edu-melhorado/frontend/
   ```

## 👤 Acesso ao Sistema

### Usuário Padrão
- **Email**: admin@conectedu.com
- **Senha**: 123456

### Criando Novos Usuários
```sql
INSERT INTO users (name, email, password_hash, role, status, created_at, updated_at) 
VALUES ('Nome do Usuário', 'email@exemplo.com', '$2y$10$hash_da_senha', 'professor', 'ativo', NOW(), NOW());
```

## 🎯 Funcionalidades

### Dashboard
- Estatísticas em tempo real
- Gráfico de atividades por dia
- Resumo de alunos, cursos e eventos
- Lista de atividades recentes

### Gestão de Alunos
- Cadastro completo de alunos
- Busca e filtros avançados
- Histórico de atendimentos
- Vinculação com formulários AEE

### Formulários AEE
- **Entrevista com Responsável**: Coleta inicial de informações
- **PDI ConectAEE**: Plano de desenvolvimento individual
- **Plano de Atendimento**: Planejamento detalhado do atendimento

### Sistema de Relatórios
- Relatórios de frequência
- Acompanhamento de desenvolvimento
- Estatísticas de atendimento
- Exportação de dados

## 🔧 Configuração Avançada

### Personalização do Tema
O sistema usa Tailwind CSS via CDN. Para personalizar:

1. Editar `frontend/index.html`
2. Modificar classes Tailwind nos componentes Vue
3. Ajustar cores no arquivo `frontend/spa-tailwind.js`

### Backup do Banco de Dados
```bash
mysqldump -u root -p conect_edu > backup_conect_edu.sql
```

### Logs e Debugging
- Logs do PHP: verificar error_log do servidor
- Console do navegador: para erros JavaScript
- Network tab: para problemas de API

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🔒 Segurança

- Autenticação baseada em tokens
- Validação de entrada no backend
- Proteção contra SQL injection
- Sessões seguras com expiração

## 🆘 Suporte e Troubleshooting

### Problemas Comuns

1. **Erro de conexão com banco**
   - Verificar se MySQL está rodando
   - Conferir credenciais em `backend/functions.php`

2. **Página em branco**
   - Verificar logs de erro do PHP
   - Conferir se todos os arquivos foram extraídos

3. **Formulários não salvam**
   - Verificar se as tabelas foram criadas
   - Conferir permissões do banco de dados

### Contato
Para suporte técnico, consulte a documentação ou entre em contato com a equipe de desenvolvimento.

## 📄 Licença

Sistema desenvolvido para uso educacional. Todos os direitos reservados.

---

**ConectEdu v5.0** - Sistema de Gestão Educacional Especializada
Desenvolvido com ❤️ para a educação inclusiva.

