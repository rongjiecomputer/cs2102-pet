-- Add dummy data here

INSERT INTO Account(name, email, hash, phone, address1, address2, region, postalCode) VALUES
('Alex', 'alex@example.com', '$2b$08$HXbjEJIKqkLk5acjcutuE.lbQ3EFlrMhkX0OAkwq/ytCsC9fyAWYi',
'12345678', '', '', 1, '112480'); -- password: test1

INSERT INTO Account(name, email, hash, phone, address1, address2, region, postalCode) VALUES
('Bob', 'bob@example.com', '$2b$08$JMs.TS.6UslkU2kCuKzOo.2rU./9kv7q49W4zrH5M94nQ12tS/68G',
'12345678', '', '', 1, '112480'); -- password: test2

INSERT INTO Account(name, email, hash, phone, address1, address2, region, postalCode) VALUES
('Charlie', ' carlie@example.com', '$2b$08$JMs.TS.6UslkU2kCuKzOo.2rU./9kv7q49W4zrH5M94nQ12tS/68G',
'12345678', '', '', 1, '112480'); -- password: test2

INSERT INTO Account(name, email, hash, phone, address1, address2, region, postalCode) VALUES
('Dave', 'dave@example.com', '$2b$08$JMs.TS.6UslkU2kCuKzOo.2rU./9kv7q49W4zrH5M94nQ12tS/68G',
'12345678', '', '', 1, '112480'); -- password: test2

INSERT INTO Account(name, email, hash, phone, address1, address2, region, postalCode) VALUES
('Elsa', 'elsa@example.com', '$2b$08$JMs.TS.6UslkU2kCuKzOo.2rU./9kv7q49W4zrH5M94nQ12tS/68G',
'12345678', '', '', 1, '112480'); -- password: test2

INSERT INTO Account(name, email, hash, phone, address1, address2, region, postalCode) VALUES
('Frank', 'frank@example.com', '$2b$08$JMs.TS.6UslkU2kCuKzOo.2rU./9kv7q49W4zrH5M94nQ12tS/68G',
'12345678', '', '', 1, '112480'); -- password: test2

INSERT INTO Account(name, email, hash, phone, address1, address2, region, postalCode) VALUES
('Gerald', 'gerald@example.com', '$2b$08$JMs.TS.6UslkU2kCuKzOo.2rU./9kv7q49W4zrH5M94nQ12tS/68G',
'12345678', '', '', 1, '112480'); -- password: test2


INSERT INTO CareTaker(aid) SELECT aid FROM Account WHERE name = 'Alex'; -- ID:1
INSERT INTO CareTaker(aid) SELECT aid FROM Account WHERE name = 'Charlie'; -- ID:3
INSERT INTO CareTaker(aid) SELECT aid FROM Account WHERE name = 'Elsa';  -- ID:5
INSERT INTO CareTaker(aid) SELECT aid FROM Account WHERE name = 'Gerald'; -- ID:6
INSERT INTO PetOwner(aid) SELECT aid FROM Account WHERE name = 'Bob'; -- ID:2
INSERT INTO PetOwner(aid) SELECT aid FROM Account WHERE name = 'Dave'; -- ID:4
INSERT INTO PetOwner(aid) SELECT aid FROM Account WHERE name = 'Gerald'; -- ID:7

-- Services advertised by Alex

INSERT INTO Service (aid, serviceType, price, dateStart, dateEnd)
SELECT aid, 1, 10, '2019-05-01', '2019-05-02' FROM Account WHERE name = 'Alex';
INSERT INTO Service (aid, serviceType, price, dateStart, dateEnd)
SELECT aid, 2, 5, '2019-05-03', '2019-05-03' FROM Account WHERE name = 'Alex';
INSERT INTO Service (aid, serviceType, price, dateStart, dateEnd)
SELECT aid, 2, 6, '2019-05-04', '2019-05-07' FROM Account WHERE name = 'Alex';

-- Bob's Pets
INSERT INTO Pet(aid,name,weight,birthday,breed,remark) VALUES
(2, 'Max', 30, '2019-01-02', 1, 'Dog that loves fun');
INSERT INTO PetMedicalCondition (aid,name,medicalCondition) VALUES
(2, 'Max', 1);
INSERT INTO PetMedicalCondition (aid,name,medicalCondition) VALUES
(2, 'Max', 2);

INSERT INTO Pet (aid,name,weight,birthday,breed,remark) VALUES
(2, 'Mocha', 20, '2019-03-01', 3, NULL);
INSERT INTO PetMedicalCondition (aid,name,medicalCondition) VALUES
(2, 'Mocha', 10);

-- Dave's Pets
INSERT INTO Pet(aid,name,weight,birthday,breed,remark) VALUES
(4, 'Stevo', 100, '2013-01-02', 10, 'Does not move much');
INSERT INTO PetMedicalCondition (aid,name,medicalCondition) VALUES
(4, 'Stevo', 8);
INSERT INTO PetMedicalCondition (aid,name,medicalCondition) VALUES
(4, 'Stevo', 2);

INSERT INTO Pet (aid,name,weight,birthday,breed,remark) VALUES
(4, 'Spike', 20, '2014-12-01', 3, 'Does not like birds');
INSERT INTO PetMedicalCondition (aid,name,medicalCondition) VALUES
(4, 'Spike', 1);

-- Gerald's Pets
INSERT INTO Pet(aid,name,weight,birthday,breed,remark) VALUES
(7, 'Fluffball', 5, '2012-11-02', 13, 'Just a ball of fluff');
INSERT INTO PetMedicalCondition (aid,name,medicalCondition) VALUES
(7, 'Fluffball', 9);

INSERT INTO Pet (aid,name,weight,birthday,breed,remark) VALUES
(7, 'Cat', 20, '2018-03-21',12 , NULL);
INSERT INTO PetMedicalCondition (aid,name,medicalCondition) VALUES
(7, 'Cat', 10);

