-- Write schema here (create table ...)

/*
 * "SERIAL" is a PostgreSQL pseudo-type that generates sequence of integer.
 */

DROP TABLE IF EXISTS Transaction, Service, ServiceType, Availability, Pet,
  MedicalCondition, Breed, PetOwner, CareTaker, Account, Region CASCADE;

CREATE TABLE Region(
  region SERIAL,
  name VARCHAR(30) NOT NULL,
  PRIMARY KEY(region)
);

CREATE TABLE Account(
  aid SERIAL,
  name VARCHAR(100) NOT NULL,
  username VARCHAR(50) NOT NULL,
  phone VARCHAR(16) NOT NULL,
  email VARCHAR(30) NOT NULL UNIQUE,
  address1 VARCHAR(100) NOT NULL,
  address2 VARCHAR(100), -- Optional
  region INTEGER NOT NULL,
  postalCode CHAR(6) NOT NULL,
  hash CHAR(60) NOT NULL,
  PRIMARY KEY(aid),
  FOREIGN KEY(region) REFERENCES Region
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

CREATE TABLE Breed(
  breed SERIAL,
  name varchar(20) NOT NULL,
  PRIMARY KEY(breed)
);

CREATE TABLE MedicalCondition(
  medicalCondition SERIAL,
  name varchar(20) NOT NULL,
  PRIMARY KEY(medicalCondition)
);

CREATE TABLE Pet(
  aid INTEGER NOT NULL, -- PetOwner
  name varchar(50) NOT NULL,
  weight INTEGER NOT NULL,
  birthDay DATE NOT NULL,
  breed INTEGER NOT NULL,
  medicalCondition INTEGER NOT NULL,
  remark TEXT, -- Optional
  PRIMARY KEY(aid, name),
  FOREIGN KEY(aid) REFERENCES Account,
  FOREIGN KEY(breed) REFERENCES Breed,
  FOREIGN KEY(medicalCondition) REFERENCES MedicalCondition
);

/**
 * CareTaker is available between [dateStart, dateEnd] inclusive.
 */
CREATE TABLE Availability(
  aid INTEGER NOT NULL, -- CareTaker
  dateStart DATE NOT NULL, -- yyyy-mm-dd format
  dateEnd DATE NOT NULL,
  FOREIGN KEY(aid) REFERENCES Account
);

CREATE TABLE ServiceType(
  serviceType SERIAL,
  name varchar(50) NOT NULL,
  PRIMARY KEY(serviceType)
);

CREATE TABLE Service(
  sid SERIAL,
  aid INTEGER NOT NULL, -- CareTaker
  serviceType INTEGER NOT NULL,
  price INTEGER NOT NULL,
  PRIMARY KEY(sid),
  FOREIGN KEY(aid) REFERENCES Account,
  FOREIGN KEY(serviceType) REFERENCES ServiceType
);

CREATE TABLE Transaction(
  tid SERIAL,
  sid INTEGER NOT NULL,
  aid INTEGER NOT NULL, -- PetOwner
  transactionTime TIMESTAMP NOT NULL,
  PRIMARY KEY(tid),
  FOREIGN KEY(sid) REFERENCES Service,
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

/**
 * Constraint 2: Check if aid is CareTaker.
 */
CREATE OR REPLACE FUNCTION is_caretaker()
RETURNS TRIGGER AS
$$
DECLARE count NUMERIC;
BEGIN
  SELECT COUNT (*) INTO count
  FROM PetOwner
  WHERE NEW.aid = CareTaker.aid;
  IF count > 0 THEN
    RETURN NEW;
  ELSE
    RETURN NULL;
  END IF;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER is_caretaker1
BEFORE INSERT OR UPDATE
ON Availability
FOR EACH ROW
EXECUTE PROCEDURE is_caretaker();

CREATE TRIGGER is_caretaker2
BEFORE INSERT OR UPDATE
ON Service
FOR EACH ROW
EXECUTE PROCEDURE is_caretaker();

/**
 * Constraint 3: Check if aid is PetOwner.
 */
CREATE OR REPLACE FUNCTION is_petowner()
RETURNS TRIGGER AS
$$
DECLARE count NUMERIC;
BEGIN
  SELECT COUNT (*) INTO count
  FROM PetOwner
  WHERE NEW.aid = PetOwner.aid;
  IF count > 0 THEN
    RETURN NEW;
  ELSE
    RETURN NULL;
  END IF;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER is_petowner1
BEFORE INSERT OR UPDATE
ON Transaction
FOR EACH ROW
EXECUTE PROCEDURE is_petowner();

/**
 * Constraint 4: No overlapping [dateStart, dateEnd].
 */


/**
 * Pre-populated values.
 */

INSERT INTO Region (name) VALUES ('Kent Ridge');
INSERT INTO Breed (name) VALUES ('blah');
INSERT INTO MedicalCondition (name) VALUES ('blah');
INSERT INTO ServiceType (name) VALUES ('blah');
