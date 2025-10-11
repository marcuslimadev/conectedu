-- Tabela de Escolas
CREATE TABLE IF NOT EXISTS schools (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(255),
  created_by_teacher_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name),
  INDEX idx_city (city),
  FOREIGN KEY (created_by_teacher_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Alterar tabela de alunos para incluir referência à escola
ALTER TABLE students ADD COLUMN school_id INT DEFAULT NULL;
ALTER TABLE students ADD FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL;