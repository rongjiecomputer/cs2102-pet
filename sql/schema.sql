-- Write schema here (create table ...)

/*
 * "SERIAL" is a PostgreSQL pseudo-type that generates sequence of integer.
 */

DROP TABLE IF EXISTS ServiceRequest, Service, ServiceType, Pet,
  MedicalCondition, Breed, PetOwner, CareTaker, Account, Region ,PetMedicalCondition,
   CareTakerRecords,PetOwnerRecords CASCADE;

CREATE TABLE Region(
  region SERIAL,
  name VARCHAR(30) NOT NULL,
  PRIMARY KEY(region)
);

CREATE TABLE Account(
  aid SERIAL,
  name VARCHAR(100) NOT NULL,
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
  remark TEXT, -- Optional
  PRIMARY KEY(aid, name),
  FOREIGN KEY(aid) REFERENCES Account,
  FOREIGN KEY(breed) REFERENCES Breed
);

CREATE TABLE PetMedicalCondition(
  aid INTEGER NOT NULL, -- PetOwner
  name varchar(50) NOT NULL, --name of pet
  medicalCondition INTEGER NOT NULL,
  PRIMARY KEY(aid,name,medicalCondition),
  FOREIGN KEY(aid,name) REFERENCES Pet,
  FOREIGN KEY(medicalCondition) REFERENCES MedicalCondition
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
  dateStart DATE NOT NULL, -- yyyy-mm-dd format
  dateEnd DATE NOT NULL,

  acceptedBy INTEGER, --PetOwner id if accepted

  PRIMARY KEY(sid),
  FOREIGN KEY(aid) REFERENCES Account,
  FOREIGN KEY(serviceType) REFERENCES ServiceType,
  CHECK(dateStart <= dateEnd)
);

CREATE TABLE ServiceRequest(
  srid SERIAL,
  aid INTEGER NOT NULL, -- PetOwner
  petName VARCHAR(50) NOT NULL,

  serviceType INTEGER NOT NULL,
  maxPrice INTEGER NOT NULL, -- maximum price that the pet owner is willing to pay
  dateStart DATE NOT NULL,
  dateEnd DATE NOT NULL,

  acceptedBy INTEGER, -- CareTaker id if accepted

  PRIMARY KEY(srid),
  FOREIGN KEY(aid) REFERENCES Account,
  FOREIGN KEY(acceptedBy) REFERENCES Account,
  FOREIGN KEY(aid, petName) REFERENCES Pet,
  FOREIGN KEY(serviceType) REFERENCES ServiceType,
  CHECK(dateStart <= dateEnd)
);

CREATE TABLE CareTakerRecords(
  careTakerID INTEGER NOT NULL, -- CareTaker aid
  petOwnerID INTEGER NOT NULL, -- PetOwner aid
  srid INTEGER NOT NULL, -- Service Request ID
  dateAccepted DATE DEFAULT CURRENT_DATE,
  FOREIGN KEY(careTakerID) REFERENCES Account,
  FOREIGN KEY(petOwnerID) REFERENCES Account,
  FOREIGN KEY(srid) REFERENCES ServiceRequest
);

CREATE TABLE PetOwnerRecords(
  petOwnerID INTEGER NOT NULL, -- PetOwner aid
  careTakerID INTEGER NOT NULL, -- CareTaker aid
  sid INTEGER NOT NULL, -- Service Request ID
  dateAccepted DATE DEFAULT CURRENT_DATE,
  FOREIGN KEY(careTakerID) REFERENCES Account,
  FOREIGN KEY(petOwnerID) REFERENCES Account,
  FOREIGN KEY(sid) REFERENCES Service
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
  FROM CareTaker
  WHERE NEW.aid = CareTaker.aid;
  IF count > 0 THEN
    RETURN NEW;
  ELSE
    RETURN NULL;
  END IF;
END;
$$
LANGUAGE plpgsql;

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
ON ServiceRequest
FOR EACH ROW
EXECUTE PROCEDURE is_petowner();

/**
 * Constraint 4: No overlapping availability [dateStart, dateEnd].
 * Pre-cond: there are no overlaps before this insert/update operation.
 */
/*CREATE OR REPLACE FUNCTION no_overlapping()
RETURNS TRIGGER AS
$$
DECLARE count NUMERIC;
BEGIN
  SELECT COUNT (*) INTO count
  FROM Availability A
  WHERE (A.dateStart <= NEW.dateStart AND NEW.dateStart <= A.dateEnd) 
     OR (A.dateStart <= NEW.dateEnd AND NEW.dateEnd <= A.dateEnd);
  IF count > 0 THEN
    RETURN NULL;
  ELSE
    RETURN NEW;
  END IF;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER detect_overlapping
BEFORE INSERT OR UPDATE
ON Availability
FOR EACH ROW
EXECUTE PROCEDURE no_overlapping();*/

/**
 * Pre-populated values.
 */
INSERT INTO Region (name) VALUES ('Central Region');
INSERT INTO Region (name) VALUES ('East Region');
INSERT INTO Region (name) VALUES ('North Region');
INSERT INTO Region (name) VALUES ('North-East Region');
INSERT INTO Region (name) VALUES ('West Region');

INSERT INTO Breed (name) VALUES ('Bulldog');
INSERT INTO Breed (name) VALUES ('Poodle');
INSERT INTO Breed (name) VALUES ('Labrador Retriever');
INSERT INTO Breed (name) VALUES ('Mastiff');
INSERT INTO Breed (name) VALUES ('Beagle');
INSERT INTO Breed (name) VALUES ('Greyhound');
INSERT INTO Breed (name) VALUES ('Pug');
INSERT INTO Breed (name) VALUES ('Siberian Husky');
INSERT INTO Breed (name) VALUES ('Dachshund');
INSERT INTO Breed (name) VALUES ('ChuHuaHua');
INSERT INTO Breed (name) VALUES ('Dog thats a cat');
INSERT INTO Breed (name) VALUES ('Cat thats a dog');
INSERT INTO Breed (name) VALUES ('Russian Blue');
INSERT INTO Breed (name) VALUES ('Persian Cat');
INSERT INTO Breed (name) VALUES ('Scottish Fold');
INSERT INTO Breed (name) VALUES ('British Shorthair');
INSERT INTO Breed (name) VALUES ('Siamese Cat');
INSERT INTO Breed (name) VALUES ('Maine Coon');
INSERT INTO Breed (name) VALUES ('Munchkin Cat');
INSERT INTO Breed (name) VALUES ('Ragdoll');
INSERT INTO Breed (name) VALUES ('Sphyx Cat');
INSERT INTO Breed (name) VALUES ('Abyssinian Cat');
INSERT INTO Breed (name) VALUES ('Turkish Angora');
INSERT INTO Breed (name) VALUES ('Norwegian Forest Cat');
INSERT INTO Breed (name) VALUES ('Bengal Cat');
INSERT INTO Breed (name) VALUES ('Birman');
INSERT INTO Breed (name) VALUES ('a Bird');

INSERT INTO MedicalCondition (name) VALUES ('Arthritis');
INSERT INTO MedicalCondition (name) VALUES ('Cancer');
INSERT INTO MedicalCondition (name) VALUES ('Dental Disease');
INSERT INTO MedicalCondition (name) VALUES ('Distemper');
INSERT INTO MedicalCondition (name) VALUES ('Epilepsy');
INSERT INTO MedicalCondition (name) VALUES ('Gastric Bloat');
INSERT INTO MedicalCondition (name) VALUES ('Heartworm');
INSERT INTO MedicalCondition (name) VALUES ('Too Fat');
INSERT INTO MedicalCondition (name) VALUES ('Too Thin');
INSERT INTO MedicalCondition (name) VALUES ('None');

INSERT INTO ServiceType (name) VALUES ('Pet Walking');
INSERT INTO ServiceType (name) VALUES ('Pet Grooming');
INSERT INTO ServiceType (name) VALUES ('Pet health checkup');
INSERT INTO ServiceType (name) VALUES ('Pet Petting');
INSERT INTO ServiceType (name) VALUES ('Pet Sitting');
INSERT INTO ServiceType (name) VALUES ('Pet Dance lessons');
INSERT INTO ServiceType (name) VALUES ('Pet Training');
