-- ================================================================
-- SCRIPT 4: CONVERTER TABELAS EXISTENTES DE InnoDB PARA MyISAM
-- USE SOMENTE SE: Seu servidor não suporta InnoDB
-- ================================================================

USE conectedu;

-- Desabilitar checagem de foreign keys temporariamente
SET FOREIGN_KEY_CHECKS=0;

-- Converter cada tabela (cole linha por linha ou todas de uma vez)
ALTER TABLE users ENGINE=MyISAM;
ALTER TABLE sessions ENGINE=MyISAM;
ALTER TABLE students ENGINE=MyISAM;
ALTER TABLE support_teachers ENGINE=MyISAM;
ALTER TABLE srm_rooms ENGINE=MyISAM;
ALTER TABLE schools ENGINE=MyISAM;
ALTER TABLE entrevistas_responsavel ENGINE=MyISAM;
ALTER TABLE atendimentos ENGINE=MyISAM;
ALTER TABLE student_notes ENGINE=MyISAM;
ALTER TABLE pdis ENGINE=MyISAM;
ALTER TABLE pais ENGINE=MyISAM;
ALTER TABLE anamneses ENGINE=MyISAM;
ALTER TABLE attendance ENGINE=MyISAM;
ALTER TABLE courses ENGINE=MyISAM;
ALTER TABLE course_enrollments ENGINE=MyISAM;
ALTER TABLE weekly_plans ENGINE=MyISAM;
ALTER TABLE weekly_plan_items ENGINE=MyISAM;
ALTER TABLE agenda_events ENGINE=MyISAM;
ALTER TABLE events ENGINE=MyISAM;
ALTER TABLE legislacoes ENGINE=MyISAM;
ALTER TABLE activity_log ENGINE=MyISAM;
ALTER TABLE migrations ENGINE=MyISAM;

-- Reabilitar checagem de foreign keys
SET FOREIGN_KEY_CHECKS=1;

-- Verificar conversão
SELECT table_name, engine 
FROM information_schema.tables 
WHERE table_schema = 'conectedu' 
ORDER BY table_name;
