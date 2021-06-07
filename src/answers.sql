-- INSERT
 

-- Insert following students to student table 

-- Lea   Hagovska , any country ,any age
-- Luna   Selene,any country ,any age
-- Magdalena   Sochon,any country ,any age
-- Max   Lawrie, any country ,any age
-- Mohammed   Shah,any country ,any age

    INSERT INTO students(name, last_name, country, age) VALUES('Lea', 'Hagovska', 'Canada', 25);
    INSERT INTO students(name, last_name, country, age) VALUES('Luna', 'Selene', 'Brazil', 31);
    INSERT INTO students(name, last_name, country, age) VALUES('Magdalena', 'Sochon', 'Algeria', 23);
    INSERT INTO students(name, last_name, country, age) VALUES('Max', 'Lawrie', 'Mexico', 56);
    INSERT INTO students(name, last_name, country, age) VALUES('Mohammed', 'Shah', 'Malta', 40);

-- UPDATE
-- Find yourself in student table and update your country and age.

UPDATE students 
SET country='UK', age=23 
WHERE name='Kaiwan';

 

-- SELECT
 

-- Select students who has country  field as Germany
SELECT * FROM students WHERE country='Germany';

-- Select students who has country  field as Thailand or Brazil
SELECT * FROM students WHERE country='Brazil' OR country='Thailand';

-- Select students who has name starts with "Tom"
SELECT * FROM students WHERE name LIKE'Tom%';

-- Select only name of students who are more than 23
SELECT name FROM students WHERE age>23;

-- Select students who are in 22-30 age range.
SELECT * FROM students WHERE age>=22 AND age<=30;

-- Select students and order by age
SELECT * FROM students ORDER BY age ASC;

-- Count students who are more than 25
SELECT COUNT(*) FROM students WHERE age>25;
 

 

 

-- DELETE
-- Delete all the records of  underaged  students 🔞 🤣 Sorry 👋🏻 

 DELETE FROM students WHERE age<18;

 