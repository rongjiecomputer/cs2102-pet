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

/**
 * Triggers
 */


/**
 * Constraint 1: Enforce an Account cannot be both PetOwner and CareTaker.
 */
CREATE OR REPLACE FUNCTION not_caretaker()
RETURNS TRIGGER AS
$$
DECLARE count NUMERIC;
BEGIN
  SELECT COUNT (*) INTO count
  FROM CareTaker
  WHERE NEW.aid = CareTaker.aid;
  IF count > 0 THEN
    RETURN NULL;
  ELSE
    RETURN NEW;
  END IF;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER non_caretaker
BEFORE INSERT OR UPDATE
ON PetOwner
FOR EACH ROW
EXECUTE PROCEDURE not_caretaker();

CREATE OR REPLACE FUNCTION not_petowner()
RETURNS TRIGGER AS
$$
DECLARE count NUMERIC;
BEGIN
  SELECT COUNT (*) INTO count
  FROM PetOwner
  WHERE NEW.aid = PetOwner.aid;
  IF count > 0 THEN
    RETURN NULL;
  ELSE
    RETURN NEW;
  END IF;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER non_petowner
BEFORE INSERT OR UPDATE
ON CareTaker
FOR EACH ROW
EXECUTE PROCEDURE not_petowner();
