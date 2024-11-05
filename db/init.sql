DROP TABLE IF EXISTS residences;
DROP TABLE IF EXISTS accommodations;

CREATE TABLE residences (
    name TEXT PRIMARY KEY,
    location TEXT,
    link TEXT
);

INSERT INTO residences 
(name, location, link) VALUES 
('Auguste-Rodin', '42 quarter rue de Sèvres - 75007 Paris', 'https://w2.fac-habitat.com/Auguste-Rodin/p/4/20/33/version=iframe_reservation'),
('MIS-pour-jeunes-actifs', '2-16, rue Theroigne de Mericourt - 75013 Paris', 'https://w2.fac-habitat.com/MIS-pour-jeunes-actifs/p/4/20/9115/version=iframe_reservation');

CREATE TABLE accommodations (
    id INTEGER PRIMARY KEY,
    residence_name TEXT,
    rent TEXT,
    type TEXT,
    availability TEXT,
    surface TEXT,
    UNIQUE(residence_name, type)
);