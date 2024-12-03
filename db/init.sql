DROP TABLE IF EXISTS residences;
DROP TABLE IF EXISTS links;
DROP TABLE IF EXISTS accommodations;

CREATE TABLE links (
    url TEXT PRIMARY KEY,
    meta TEXT -- This column stores a JSON object describing the link
);

INSERT INTO links
(url, meta) VALUES
('https://w2.fac-habitat.com/Auguste-Rodin/p/4/20/33/version=iframe_reservation',
'{"residence_name": "Auguste-Rodin", "location": "42 quarter rue de Sèvres - 75007 Paris"}'
),
('https://w2.fac-habitat.com/MIS-pour-jeunes-actifs/p/4/20/9115/version=iframe_reservation',
'{"residence_name": "MIS-pour-jeunes-actifs", "location": "2-16, rue Theroigne de Mericourt - 75013 Paris"}'
),
('https://w2.fac-habitat.com/Marne/p/4/21/12672/version=iframe_reservation',
'{"residence_name": "Marne", "location": "44, quai de la Marne - 75019 Paris"}'
),
('https://w2.fac-habitat.com/Quai-de-la-Loire/p/4/21/9207/version=iframe_reservation',
'{"residence_name": "Quai-de-la-Loire", "location": "41 bis, quai de la Loire - 75019 Paris"}'
);

CREATE TABLE accommodations (
    id INTEGER PRIMARY KEY,
    residence_name TEXT,
    rent TEXT,
    type TEXT,
    availability TEXT,
    surface TEXT,
    url TEXT,
    UNIQUE(residence_name, type)
);