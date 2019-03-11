-- Write schema here (create table ...)

/*
 * "SERIAL" is a PostgreSQL pseudo-type that generates sequence of integer.
 */

DROP TABLE IF EXISTS Account CASCADE;

CREATE TABLE Account(
  aid SERIAL,
  name VARCHAR(100) DEFAULT 'John Doe',
  username VARCHAR(50) DEFAULT 'JohnDoe',
  phone VARCHAR(16) DEFAULT '12345678',
  email VARCHAR(30) NOT NULL UNIQUE,
  hash CHAR(60) NOT NULL,
  PRIMARY KEY(aid)
);
