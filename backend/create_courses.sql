-- Script para crear cursos básicos en la base de datos
-- Ejecutar este script directamente en PostgreSQL

-- Limpiar cursos existentes (opcional)
-- DELETE FROM courses;

-- Insertar cursos de primaria
INSERT INTO courses (id, name, level, grade, section, academic_year, capacity, is_active, created_at, updated_at) VALUES
-- Pre-K y Kinder
('550e8400-e29b-41d4-a716-446655440001', 'Pre-K A', 'primaria', 0, 'A', 2025, 25, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Pre-K B', 'primaria', 0, 'B', 2025, 25, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'Kinder A', 'primaria', 0, 'A', 2025, 25, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'Kinder B', 'primaria', 0, 'B', 2025, 25, true, NOW(), NOW()),

-- 1° Primaria
('550e8400-e29b-41d4-a716-446655440005', '1° Primaria A', 'primaria', 1, 'A', 2025, 30, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440006', '1° Primaria B', 'primaria', 1, 'B', 2025, 30, true, NOW(), NOW()),

-- 2° Primaria
('550e8400-e29b-41d4-a716-446655440007', '2° Primaria A', 'primaria', 2, 'A', 2025, 30, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440008', '2° Primaria B', 'primaria', 2, 'B', 2025, 30, true, NOW(), NOW()),

-- 3° Primaria
('550e8400-e29b-41d4-a716-446655440009', '3° Primaria A', 'primaria', 3, 'A', 2025, 30, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440010', '3° Primaria B', 'primaria', 3, 'B', 2025, 30, true, NOW(), NOW()),

-- 4° Primaria
('550e8400-e29b-41d4-a716-446655440011', '4° Primaria A', 'primaria', 4, 'A', 2025, 30, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440012', '4° Primaria B', 'primaria', 4, 'B', 2025, 30, true, NOW(), NOW()),

-- 5° Primaria
('550e8400-e29b-41d4-a716-446655440013', '5° Primaria A', 'primaria', 5, 'A', 2025, 30, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440014', '5° Primaria B', 'primaria', 5, 'B', 2025, 30, true, NOW(), NOW()),

-- 6° Primaria
('550e8400-e29b-41d4-a716-446655440015', '6° Primaria A', 'primaria', 6, 'A', 2025, 30, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440016', '6° Primaria B', 'primaria', 6, 'B', 2025, 30, true, NOW(), NOW());

-- Insertar cursos de secundaria
INSERT INTO courses (id, name, level, grade, section, academic_year, capacity, is_active, created_at, updated_at) VALUES
-- 1° Secundaria
('550e8400-e29b-41d4-a716-446655440017', '1° Secundaria A', 'secundaria', 1, 'A', 2025, 35, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440018', '1° Secundaria B', 'secundaria', 1, 'B', 2025, 35, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440019', '1° Secundaria C', 'secundaria', 1, 'C', 2025, 35, true, NOW(), NOW()),

-- 2° Secundaria
('550e8400-e29b-41d4-a716-446655440020', '2° Secundaria A', 'secundaria', 2, 'A', 2025, 35, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440021', '2° Secundaria B', 'secundaria', 2, 'B', 2025, 35, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440022', '2° Secundaria C', 'secundaria', 2, 'C', 2025, 35, true, NOW(), NOW()),

-- 3° Secundaria
('550e8400-e29b-41d4-a716-446655440023', '3° Secundaria A', 'secundaria', 3, 'A', 2025, 35, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440024', '3° Secundaria B', 'secundaria', 3, 'B', 2025, 35, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440025', '3° Secundaria C', 'secundaria', 3, 'C', 2025, 35, true, NOW(), NOW()),

-- 4° Secundaria
('550e8400-e29b-41d4-a716-446655440026', '4° Secundaria A', 'secundaria', 4, 'A', 2025, 35, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440027', '4° Secundaria B', 'secundaria', 4, 'B', 2025, 35, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440028', '4° Secundaria C', 'secundaria', 4, 'C', 2025, 35, true, NOW(), NOW()),

-- 5° Secundaria
('550e8400-e29b-41d4-a716-446655440029', '5° Secundaria A', 'secundaria', 5, 'A', 2025, 35, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440030', '5° Secundaria B', 'secundaria', 5, 'B', 2025, 35, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440031', '5° Secundaria C', 'secundaria', 5, 'C', 2025, 35, true, NOW(), NOW());

-- Verificar que se insertaron correctamente
SELECT 
    level,
    COUNT(*) as total_cursos,
    STRING_AGG(DISTINCT CAST(grade AS TEXT), ', ' ORDER BY CAST(grade AS TEXT)) as grados
FROM courses 
WHERE is_active = true 
GROUP BY level 
ORDER BY level;