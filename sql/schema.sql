-- Write schema here (create table ...)

/*
 * "SERIAL" is a PostgreSQL pseudo-type that generates sequence of integer.
 */

DROP TABLE IF EXISTS PetOwner, CareTaker, Account CASCADE;

CREATE TABLE Account(
  aid SERIAL,
  name VARCHAR(100) NOT NULL,
  username VARCHAR(50) NOT NULL,
  phone VARCHAR(16) NOT NULL,
  email VARCHAR(30) NOT NULL UNIQUE,
  hash CHAR(60) NOT NULL,
  PRIMARY KEY(aid)
);

CREATE TABLE PetOwner(
  aid INTEGER,
  PRIMARY KEY(aid),
  FOREIGN KEY(aid) REFERENCES Account
);

CREATE TABLE CareTaker(
  aid INTEGER,
  PRIMARY KEY(aid),
  FOREIGN KEY(aid) REFERENCES Account
);
