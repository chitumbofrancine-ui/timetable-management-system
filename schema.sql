CREATE DATABASE IF NOT EXISTS campus_crud;
USE campus_crud;

CREATE TABLE IF NOT EXISTS timetable (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_code VARCHAR(20) NOT NULL,
    course_name VARCHAR(150) NOT NULL,
    lecturer_name VARCHAR(100) NOT NULL,
    venue VARCHAR(50) NOT NULL,
    day_of_week VARCHAR(20) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert the sample records only when the table is empty.
INSERT INTO timetable
    (course_code, course_name, lecturer_name, venue, day_of_week, start_time, end_time)
SELECT * FROM (
    SELECT 'ICT251', 'Web Technologies', 'Mr. Banda', 'Lab 1', 'Monday', '08:00:00', '10:00:00'
    UNION ALL SELECT 'ICT261', 'Java Programming', 'Mrs. Phiri', 'Lab 2', 'Monday', '10:30:00', '12:30:00'
    UNION ALL SELECT 'ICT211', 'Database Systems', 'Dr. Mwanza', 'Room 3', 'Tuesday', '09:00:00', '11:00:00'
    UNION ALL SELECT 'ICT231', 'Systems Analysis', 'Mr. Tembo', 'Room 1', 'Tuesday', '14:00:00', '16:00:00'
    UNION ALL SELECT 'MTH101', 'Discrete Mathematics', 'Mrs. Zulu', 'Room 2', 'Wednesday', '08:00:00', '10:00:00'
    UNION ALL SELECT 'ICT241', 'Computer Networks', 'Mr. Kunda', 'Lab 1', 'Wednesday', '11:00:00', '13:00:00'
    UNION ALL SELECT 'ICT221', 'Operating Systems', 'Dr. Chanda', 'Lab 3', 'Thursday', '09:30:00', '11:30:00'
    UNION ALL SELECT 'CS101', 'Programming in C', 'Mr. Sampa', 'Lab 2', 'Thursday', '14:00:00', '16:00:00'
    UNION ALL SELECT 'ICT252', 'Mobile App Dev', 'Mrs. Nsofwa', 'Lab 1', 'Friday', '08:00:00', '10:30:00'
    UNION ALL SELECT 'ENG101', 'Communication Skills', 'Mrs. Mwape', 'Room 4', 'Friday', '11:00:00', '13:00:00'
) AS sample_data
WHERE NOT EXISTS (SELECT 1 FROM timetable LIMIT 1);
