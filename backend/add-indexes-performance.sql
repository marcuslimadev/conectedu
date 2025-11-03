-- ========================================
-- SCRIPT DE OTIMIZAÇÃO: ÍNDICES E PERFORMANCE
-- Data: 31/10/2025
-- Descrição: Adiciona índices críticos para otimizar queries
-- ========================================

-- Índices para tabela students (otimizar filtros teacher-centric)
CREATE INDEX IF NOT EXISTS idx_students_teacher ON students(created_by_teacher_id);
CREATE INDEX IF NOT EXISTS idx_students_school ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_modalidade ON students(modalidade);
CREATE INDEX IF NOT EXISTS idx_students_created_at ON students(created_at);

-- Índices para tabela schools
CREATE INDEX IF NOT EXISTS idx_schools_teacher ON schools(created_by_teacher_id);
CREATE INDEX IF NOT EXISTS idx_schools_city ON schools(city);

-- Índices para tabela sessions (crítico para validação de tokens)
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- Índices para tabela users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Índices para formulários AEE (comentados - criar quando tabelas forem implementadas)
-- CREATE INDEX IF NOT EXISTS idx_entrevista_student ON entrevista_forms(student_id);
-- CREATE INDEX IF NOT EXISTS idx_entrevista_teacher ON entrevista_forms(created_by_teacher_id);
-- CREATE INDEX IF NOT EXISTS idx_entrevista_created ON entrevista_forms(created_at);

-- CREATE INDEX IF NOT EXISTS idx_pdi_student ON pdi_forms(student_id);
-- CREATE INDEX IF NOT EXISTS idx_pdi_teacher ON pdi_forms(created_by_teacher_id);
-- CREATE INDEX IF NOT EXISTS idx_pdi_created ON pdi_forms(created_at);

-- CREATE INDEX IF NOT EXISTS idx_pai_student ON plano_atendimento_forms(student_id);
-- CREATE INDEX IF NOT EXISTS idx_pai_teacher ON plano_atendimento_forms(created_by_teacher_id);
-- CREATE INDEX IF NOT EXISTS idx_pai_created ON plano_atendimento_forms(created_at);

-- Índices para tabela courses
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(code);

-- Índices para tabela course_teachers
CREATE INDEX IF NOT EXISTS idx_course_teachers_course ON course_teachers(course_id);
CREATE INDEX IF NOT EXISTS idx_course_teachers_teacher ON course_teachers(teacher_id);

-- Estatísticas (apenas tabelas existentes)
SELECT 
  'students' as tabela,
  COUNT(*) as total_registros,
  COUNT(DISTINCT created_by_teacher_id) as professores_unicos
FROM students
UNION ALL
SELECT 
  'schools',
  COUNT(*),
  COUNT(DISTINCT created_by_teacher_id)
FROM schools
UNION ALL
SELECT 
  'sessions',
  COUNT(*),
  COUNT(DISTINCT user_id)
FROM sessions;

-- Verificar índices criados
SELECT 
  TABLE_NAME,
  INDEX_NAME,
  COLUMN_NAME,
  SEQ_IN_INDEX
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'conectedu'
  AND TABLE_NAME IN ('students', 'schools', 'sessions', 'users', 'courses', 'course_teachers')
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;
