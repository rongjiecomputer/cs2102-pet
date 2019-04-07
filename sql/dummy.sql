-- Add dummy data here

INSERT INTO Account(name, username, email, hash, phone, address1, address2, region, postalCode) VALUES
('Alex', 'alex', 'alex@example.com', '$2b$08$HXbjEJIKqkLk5acjcutuE.lbQ3EFlrMhkX0OAkwq/ytCsC9fyAWYi',
'12345678', '', '', 1, '112480'); -- password: test1

INSERT INTO Account(name, username, email, hash, phone, address1, address2, region, postalCode) VALUES
('Bob', 'bob', 'bob@example.com', '$2b$08$JMs.TS.6UslkU2kCuKzOo.2rU./9kv7q49W4zrH5M94nQ12tS/68G',
'12345678', '', '', 1, '112480'); -- password: test2

INSERT INTO CareTaker(aid) SELECT aid FROM Account WHERE name = 'Alex'; -- Alex is Care Taker
INSERT INTO PetOwner(aid) SELECT aid FROM Account WHERE name = 'Bob'; -- Bob is Pet Owner

INSERT INTO Service (aid, serviceType, price, dateStart, dateEnd)
SELECT aid, 1, 10, '2019-05-01', '2019-05-02' FROM Account WHERE name = 'Alex';
INSERT INTO Service (aid, serviceType, price, dateStart, dateEnd)
SELECT aid, 2, 5, '2019-05-03', '2019-05-03' FROM Account WHERE name = 'Alex';
INSERT INTO Service (aid, serviceType, price, dateStart, dateEnd)
SELECT aid, 2, 6, '2019-05-04', '2019-05-07' FROM Account WHERE name = 'Alex';
