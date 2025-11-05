-- Create a test user for Playwright tests
-- This script should be run before executing the tests to ensure the user exists.

-- Delete the user if it already exists to ensure a clean state
DELETE FROM `users` WHERE `email` = 'professor.teste@conectedu.com';

-- Insert the new test user
INSERT INTO `users` (`name`, `email`, `password`, `role`, `status`)
VALUES
(
    'Professor Teste',
    'professor.teste@conectedu.com',
    '$2b$10$Mr7dP0nZxraDySz3fcFcjuL3Nmy4OKNomg3BL4LFFgvZraqJK/ESu', -- a senha é 'password123'
    'teacher',
    'active'
);
