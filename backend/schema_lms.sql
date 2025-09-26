-- LMS schema additions
ALTER TABLE students ADD COLUMN user_id INT NULL AFTER id;

CREATE TABLE IF NOT EXISTS subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  code VARCHAR(40) NULL,
  workload INT NULL,
  description TEXT NULL,
  status VARCHAR(20) DEFAULT 'ativo',
  created_at DATETIME, updated_at DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS classes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  year INT NULL,
  grade VARCHAR(40) NULL,
  shift VARCHAR(20) NULL,
  status VARCHAR(20) DEFAULT 'ativo',
  created_at DATETIME, updated_at DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS class_subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_id INT NOT NULL,
  subject_id INT NOT NULL,
  teacher_id INT NOT NULL,
  created_at DATETIME, updated_at DATETIME,
  INDEX (class_id), INDEX(subject_id), INDEX(teacher_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS class_students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_id INT NOT NULL,
  student_id INT NOT NULL,
  status VARCHAR(20) DEFAULT 'ativo',
  created_at DATETIME, updated_at DATETIME,
  INDEX(class_id), INDEX(student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS evaluations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_id INT NOT NULL,
  subject_id INT NOT NULL,
  title VARCHAR(160) NOT NULL,
  description TEXT NULL,
  start_at DATETIME NULL,
  end_at DATETIME NULL,
  status VARCHAR(20) DEFAULT 'draft',
  total_points DECIMAL(8,2) DEFAULT 0,
  created_by INT NOT NULL,
  created_at DATETIME, updated_at DATETIME,
  INDEX(class_id), INDEX(subject_id), INDEX(created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS evaluation_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  evaluation_id INT NOT NULL,
  type VARCHAR(10) NOT NULL, -- mcq|text
  prompt TEXT NOT NULL,
  points DECIMAL(8,2) NOT NULL DEFAULT 1,
  ord INT NOT NULL DEFAULT 0,
  created_at DATETIME, updated_at DATETIME,
  INDEX(evaluation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS evaluation_choices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT NOT NULL,
  content VARCHAR(255) NOT NULL,
  is_correct TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME, updated_at DATETIME,
  INDEX(question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS evaluation_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  evaluation_id INT NOT NULL,
  student_id INT NOT NULL,
  submitted_at DATETIME NULL,
  graded_at DATETIME NULL,
  score DECIMAL(8,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'in_progress',
  created_at DATETIME, updated_at DATETIME,
  UNIQUE KEY uniq_eval_student (evaluation_id, student_id),
  INDEX(evaluation_id), INDEX(student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS submission_answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  submission_id INT NOT NULL,
  question_id INT NOT NULL,
  choice_id INT NULL,
  answer_text TEXT NULL,
  score_awarded DECIMAL(8,2) NULL,
  feedback TEXT NULL,
  created_at DATETIME, updated_at DATETIME,
  INDEX(submission_id), INDEX(question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
