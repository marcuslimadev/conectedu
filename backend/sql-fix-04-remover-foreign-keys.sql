-- ================================================================
-- SCRIPT 7: REMOVER TODAS AS FOREIGN KEYS (SE NECESSÁRIO)
-- Use se estiver tendo problemas com foreign keys
-- ================================================================

USE conectedu;

SET FOREIGN_KEY_CHECKS=0;

-- Sessions
ALTER TABLE sessions DROP FOREIGN KEY IF EXISTS fk_sessions_user_id;
ALTER TABLE sessions DROP FOREIGN KEY IF EXISTS fk_sessions_user;

-- Students
ALTER TABLE students DROP FOREIGN KEY IF EXISTS fk_students_user_id;
ALTER TABLE students DROP FOREIGN KEY IF EXISTS fk_students_school_id;
ALTER TABLE students DROP FOREIGN KEY IF EXISTS fk_students_support_teacher_id;
ALTER TABLE students DROP FOREIGN KEY IF EXISTS fk_students_srm_room_id;
ALTER TABLE students DROP FOREIGN KEY IF EXISTS fk_students_created_by_teacher_id;

-- Entrevistas
ALTER TABLE entrevistas_responsavel DROP FOREIGN KEY IF EXISTS fk_entrevistas_responsavel_student_id;
ALTER TABLE entrevistas_responsavel DROP FOREIGN KEY IF EXISTS fk_entrevistas_student;

-- Atendimentos
ALTER TABLE atendimentos DROP FOREIGN KEY IF EXISTS fk_atendimentos_student_id;
ALTER TABLE atendimentos DROP FOREIGN KEY IF EXISTS fk_atendimentos_teacher_id;

-- Student Notes
ALTER TABLE student_notes DROP FOREIGN KEY IF EXISTS fk_student_notes_student_id;
ALTER TABLE student_notes DROP FOREIGN KEY IF EXISTS fk_student_notes_teacher_id;

-- PDIs
ALTER TABLE pdis DROP FOREIGN KEY IF EXISTS fk_pdis_student_id;

-- PAIs
ALTER TABLE pais DROP FOREIGN KEY IF EXISTS fk_pais_student_id;

-- Anamneses
ALTER TABLE anamneses DROP FOREIGN KEY IF EXISTS fk_anamneses_student_id;

-- Attendance
ALTER TABLE attendance DROP FOREIGN KEY IF EXISTS fk_attendance_student_id;

-- Course Enrollments
ALTER TABLE course_enrollments DROP FOREIGN KEY IF EXISTS fk_course_enrollments_student_id;
ALTER TABLE course_enrollments DROP FOREIGN KEY IF EXISTS fk_course_enrollments_course_id;

-- Weekly Plans
ALTER TABLE weekly_plans DROP FOREIGN KEY IF EXISTS fk_weekly_plans_student_id;
ALTER TABLE weekly_plan_items DROP FOREIGN KEY IF EXISTS fk_weekly_plan_items_weekly_plan_id;

-- Events
ALTER TABLE events DROP FOREIGN KEY IF EXISTS fk_events_student_id;
ALTER TABLE events DROP FOREIGN KEY IF EXISTS fk_events_user_id;

-- Agenda Events
ALTER TABLE agenda_events DROP FOREIGN KEY IF EXISTS fk_agenda_events_user_id;

SET FOREIGN_KEY_CHECKS=1;

SELECT 'Foreign keys removidas com sucesso!' AS resultado;
