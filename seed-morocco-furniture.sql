-- seed-morocco-furniture.sql
BEGIN;

-- Optional, for consistent timestamps
SET TIME ZONE 'Africa/Casablanca';

-- 1) Employés (password hash = bcrypt for 'admin123' used as placeholder)
INSERT INTO utilisateurs (email, nom, prenom, role, password_hash) VALUES
('employe1@store.com', 'Benali', 'Youssef', 'employe', '$2b$10$ArnuuEeOcm4uZq7XrRcUSuBL6Dgnq242BvrPUp75HnqdWGluRLLXG'),
('employe2@store.com', 'El Fassi', 'Amina',   'employe', '$2b$10$ArnuuEeOcm4uZq7XrRcUSuBL6Dgnq242BvrPUp75HnqdWGluRLLXG'),
('employe3@store.com', 'El Idrissi','Hamza',  'employe', '$2b$10$ArnuuEeOcm4uZq7XrRcUSuBL6Dgnq242BvrPUp75HnqdWGluRLLXG')
ON CONFLICT (email) DO NOTHING;

-- 2) Catégories de meubles (couleurs = tags UI)
INSERT INTO categories (nom, description, couleur) VALUES
('Lits',              'Lits en bois massif (160/180/200)',               '#8B5CF6'),
('Armoires',          'Armoires en bois (2/3/4 portes)',                 '#F59E0B'),
('Miroirs',           'Miroirs muraux et sur pied (bois sculpté)',       '#06B6D4'),
('Tables',            'Tables basses, tables à manger en bois',          '#10B981'),
('Chaises',           'Chaises, tabourets en bois',                      '#EF4444'),
('Bibliothèques',     'Bibliothèques, étagères en bois',                 '#3B82F6'),
('Décoration bois',   'Objets déco: cadres, consoles, panneaux',         '#A855F7')
ON CONFLICT (nom) DO NOTHING;

-- 3) Essences de bois (ajouts spécifiques Maroc)
INSERT INTO wood_types (nom, description, couleur) VALUES
('Cèdre de l''Atlas', 'Bois noble du Moyen Atlas, odeur caractéristique', '#7F5539'),
('Noyer',             'Bois foncé à veinage prononcé',                    '#6B4423'),
('Arganier',          'Bois rare et dense, originaire du Souss',         '#8A5A44')
ON CONFLICT (nom) DO NOTHING;

-- Shortcut CTEs we will reuse
WITH u AS (
  SELECT email, id FROM utilisateurs WHERE email IN ('employe1@store.com','employe2@store.com','employe3@store.com')
),
cats AS (
  SELECT nom, id FROM categories WHERE nom IN ('Lits','Armoires','Miroirs','Tables','Chaises','Bibliothèques','Décoration bois')
),
woods AS (
  SELECT nom, id FROM wood_types
)
SELECT 1; -- no-op

-- 4) ACHATS (stock entrants)
-- Achat 1 (2024-11-12) – Fournisseur: Bois du Maroc (employe1)
WITH u AS (SELECT id FROM utilisateurs WHERE email = 'employe1@store.com'),
     l(produit_nom, category_nom, wood_type_nom, quantite, prix_unitaire) AS (
       VALUES
       ('Lit 160x200 bois Cèdre Atlas', 'Lits', 'Cèdre de l''Atlas', 5, 3200.00),
       ('Miroir mural sculpté 80x180',  'Miroirs', 'Noyer',          8,  950.00),
       ('Table basse en noyer 120x60',  'Tables', 'Noyer',           6, 1800.00)
     ),
     totals AS (SELECT SUM(quantite*prix_unitaire) AS total FROM l),
     ins AS (
       INSERT INTO achats (utilisateur_id, nom_fournisseur, date_achat, total)
       SELECT u.id, 'Bois du Maroc', '2024-11-12 10:30:00+01', totals.total
       FROM u, totals
       RETURNING id
     )
INSERT INTO lignes_achat (achat_id, produit_nom, category_id, wood_type_id, quantite, prix_unitaire)
SELECT ins.id, l.produit_nom, c.id, w.id, l.quantite, l.prix_unitaire
FROM l
JOIN cats c  ON c.nom = l.category_nom
LEFT JOIN woods w ON w.nom = l.wood_type_nom
CROSS JOIN ins;

-- Achat 2 (2024-12-05) – Cèdre Atlas SARL (employe2)
WITH u AS (SELECT id FROM utilisateurs WHERE email = 'employe2@store.com'),
     l(produit_nom, category_nom, wood_type_nom, quantite, prix_unitaire) AS (
       VALUES
       ('Armoire 3 portes en cèdre',    'Armoires', 'Cèdre de l''Atlas', 4, 4200.00),
       ('Chaise traditionnelle bois',   'Chaises',  'Hêtre',             20, 350.00),
       ('Cadre miroir artisanal',       'Décoration bois', 'Arganier',   15, 220.00)
     ),
     totals AS (SELECT SUM(quantite*prix_unitaire) AS total FROM l),
     ins AS (
       INSERT INTO achats (utilisateur_id, nom_fournisseur, date_achat, total)
       SELECT u.id, 'Cèdre Atlas SARL', '2024-12-05 09:15:00+01', totals.total
       FROM u, totals
       RETURNING id
     )
INSERT INTO lignes_achat (achat_id, produit_nom, category_id, wood_type_id, quantite, prix_unitaire)
SELECT ins.id, l.produit_nom, c.id, w.id, l.quantite, l.prix_unitaire
FROM l
JOIN cats c  ON c.nom = l.category_nom
LEFT JOIN woods w ON w.nom = l.wood_type_nom
CROSS JOIN ins;

-- Achat 3 (2025-01-18) – Atelier Fès (employe1)
WITH u AS (SELECT id FROM utilisateurs WHERE email = 'employe1@store.com'),
     l(produit_nom, category_nom, wood_type_nom, quantite, prix_unitaire) AS (
       VALUES
       ('Bibliothèque 5 niveaux',       'Bibliothèques', 'Chêne', 7, 2600.00),
       ('Table à manger 6 places',      'Tables',        'Hêtre', 3, 5200.00),
       ('Miroir sur pied 60x170',       'Miroirs',       'Pin',   10, 700.00)
     ),
     totals AS (SELECT SUM(quantite*prix_unitaire) AS total FROM l),
     ins AS (
       INSERT INTO achats (utilisateur_id, nom_fournisseur, date_achat, total)
       SELECT u.id, 'Atelier Fès', '2025-01-18 14:40:00+01', totals.total
       FROM u, totals
       RETURNING id
     )
INSERT INTO lignes_achat (achat_id, produit_nom, category_id, wood_type_id, quantite, prix_unitaire)
SELECT ins.id, l.produit_nom, c.id, w.id, l.quantite, l.prix_unitaire
FROM l
JOIN cats c  ON c.nom = l.category_nom
LEFT JOIN woods w ON w.nom = l.wood_type_nom
CROSS JOIN ins;

-- Achat 4 (2025-02-07) – Menuiserie Hassan (employe3)
WITH u AS (SELECT id FROM utilisateurs WHERE email = 'employe3@store.com'),
     l(produit_nom, category_nom, wood_type_nom, quantite, prix_unitaire) AS (
       VALUES
       ('Lit 180x200 tête sculptée',   'Lits',        'Noyer', 4, 4100.00),
       ('Armoire 2 portes coulissantes','Armoires',   'Hêtre', 5, 3800.00),
       ('Console d''entrée',          'Décoration bois','Arganier', 8, 950.00)
     ),
     totals AS (SELECT SUM(quantite*prix_unitaire) AS total FROM l),
     ins AS (
       INSERT INTO achats (utilisateur_id, nom_fournisseur, date_achat, total)
       SELECT u.id, 'Menuiserie Hassan', '2025-02-07 11:05:00+01', totals.total
       FROM u, totals
       RETURNING id
     )
INSERT INTO lignes_achat (achat_id, produit_nom, category_id, wood_type_id, quantite, prix_unitaire)
SELECT ins.id, l.produit_nom, c.id, w.id, l.quantite, l.prix_unitaire
FROM l
JOIN cats c  ON c.nom = l.category_nom
LEFT JOIN woods w ON w.nom = l.wood_type_nom
CROSS JOIN ins;

-- Achat 5 (2025-03-03) – Artisanat Marrakech (employe2)
WITH u AS (SELECT id FROM utilisateurs WHERE email = 'employe2@store.com'),
     l(produit_nom, category_nom, wood_type_nom, quantite, prix_unitaire) AS (
       VALUES
       ('Chaise dossier haut',       'Chaises',        'Chêne', 24, 420.00),
       ('Table basse ronde',         'Tables',         'Cèdre de l''Atlas', 6, 1650.00),
       ('Miroir mural 50x70',        'Miroirs',        'Hêtre', 12, 480.00),
       ('Étagère murale 90cm',       'Bibliothèques',  'Pin', 10, 350.00)
     ),
     totals AS (SELECT SUM(quantite*prix_unitaire) AS total FROM l),
     ins AS (
       INSERT INTO achats (utilisateur_id, nom_fournisseur, date_achat, total)
       SELECT u.id, 'Artisanat Marrakech', '2025-03-03 16:20:00+01', totals.total
       FROM u, totals
       RETURNING id
     )
INSERT INTO lignes_achat (achat_id, produit_nom, category_id, wood_type_id, quantite, prix_unitaire)
SELECT ins.id, l.produit_nom, c.id, w.id, l.quantite, l.prix_unitaire
FROM l
JOIN cats c  ON c.nom = l.category_nom
LEFT JOIN woods w ON w.nom = l.wood_type_nom
CROSS JOIN ins;

-- Achat 6 (2025-04-11) – Noyer & Co (employe1)
WITH u AS (SELECT id FROM utilisateurs WHERE email = 'employe1@store.com'),
     l(produit_nom, category_nom, wood_type_nom, quantite, prix_unitaire) AS (
       VALUES
       ('Commode 6 tiroirs',        'Armoires', 'Noyer', 6, 2950.00),
       ('Cadre miroir carré',       'Décoration bois', 'Chêne', 20, 260.00),
       ('Table à manger 8 places',  'Tables', 'Noyer', 2, 6800.00)
     ),
     totals AS (SELECT SUM(quantite*prix_unitaire) AS total FROM l),
     ins AS (
       INSERT INTO achats (utilisateur_id, nom_fournisseur, date_achat, total)
       SELECT u.id, 'Noyer & Co', '2025-04-11 12:10:00+01', totals.total
       FROM u, totals
       RETURNING id
     )
INSERT INTO lignes_achat (achat_id, produit_nom, category_id, wood_type_id, quantite, prix_unitaire)
SELECT ins.id, l.produit_nom, c.id, w.id, l.quantite, l.prix_unitaire
FROM l
JOIN cats c  ON c.nom = l.category_nom
LEFT JOIN woods w ON w.nom = l.wood_type_nom
CROSS JOIN ins;

-- Achat 7 (2025-05-26) – Atlas Bois (employe3)
WITH u AS (SELECT id FROM utilisateurs WHERE email = 'employe3@store.com'),
     l(produit_nom, category_nom, wood_type_nom, quantite, prix_unitaire) AS (
       VALUES
       ('Miroir plein pied 70x180', 'Miroirs', 'Cèdre de l''Atlas', 10, 820.00),
       ('Lit 160x200 tête lisse',   'Lits',    'Hêtre', 5, 2900.00),
       ('Chaise simple',            'Chaises', 'Pin',   30, 220.00)
     ),
     totals AS (SELECT SUM(quantite*prix_unitaire) AS total FROM l),
     ins AS (
       INSERT INTO achats (utilisateur_id, nom_fournisseur, date_achat, total)
       SELECT u.id, 'Atlas Bois', '2025-05-26 09:45:00+01', totals.total
       FROM u, totals
       RETURNING id
     )
INSERT INTO lignes_achat (achat_id, produit_nom, category_id, wood_type_id, quantite, prix_unitaire)
SELECT ins.id, l.produit_nom, c.id, w.id, l.quantite, l.prix_unitaire
FROM l
JOIN cats c  ON c.nom = l.category_nom
LEFT JOIN woods w ON w.nom = l.wood_type_nom
CROSS JOIN ins;

-- Achat 8 (2025-06-15) – Cooperative Agadir (employe2)
WITH u AS (SELECT id FROM utilisateurs WHERE email = 'employe2@store.com'),
     l(produit_nom, category_nom, wood_type_nom, quantite, prix_unitaire) AS (
       VALUES
       ('Console d''entrée Argan',  'Décoration bois', 'Arganier', 10, 1150.00),
       ('Bibliothèque 4 niveaux',   'Bibliothèques', 'Cèdre de l''Atlas', 6, 2350.00),
       ('Table basse rectangle',    'Tables', 'Chêne', 5, 1750.00)
     ),
     totals AS (SELECT SUM(quantite*prix_unitaire) AS total FROM l),
     ins AS (
       INSERT INTO achats (utilisateur_id, nom_fournisseur, date_achat, total)
       SELECT u.id, 'Coopérative Agadir', '2025-06-15 15:05:00+01', totals.total
       FROM u, totals
       RETURNING id
     )
INSERT INTO lignes_achat (achat_id, produit_nom, category_id, wood_type_id, quantite, prix_unitaire)
SELECT ins.id, l.produit_nom, c.id, w.id, l.quantite, l.prix_unitaire
FROM l
JOIN cats c  ON c.nom = l.category_nom
LEFT JOIN woods w ON w.nom = l.wood_type_nom
CROSS JOIN ins;

-- 5) VENTES (sortants)
-- Vente 1 (2024-12-20) – Client: Mme. Amina El Fassi – Vendeur: employe1
WITH u AS (SELECT id FROM utilisateurs WHERE email = 'employe1@store.com'),
     l(produit_nom, category_nom, quantite, prix_unitaire) AS (
       VALUES
       ('Miroir mural sculpté 80x180', 'Miroirs', 2, 1300.00),
       ('Chaise traditionnelle bois',  'Chaises', 6, 550.00)
     ),
     totals AS (SELECT SUM(quantite*prix_unitaire) AS total FROM l),
     ins AS (
       INSERT INTO ventes (utilisateur_id, nom_client, date_vente, total)
       SELECT u.id, 'Mme. Amina El Fassi', '2024-12-20 17:45:00+01', totals.total
       FROM u, totals
       RETURNING id
     )
INSERT INTO lignes_vente (vente_id, produit_nom, category_id, quantite, prix_unitaire)
SELECT ins.id, l.produit_nom, c.id, l.quantite, l.prix_unitaire
FROM l
JOIN cats c ON c.nom = l.category_nom
CROSS JOIN ins;

-- Vente 2 (2025-01-22) – Client: M. Youssef Benali – Vendeur: employe2
WITH u AS (SELECT id FROM utilisateurs WHERE email = 'employe2@store.com'),
     l(produit_nom, category_nom, quantite, prix_unitaire) AS (
       VALUES
       ('Table basse en noyer 120x60', 'Tables', 1, 2700.00),
       ('Miroir sur pied 60x170',      'Miroirs', 2, 950.00)
     ),
     totals AS (SELECT SUM(quantite*prix_unitaire) AS total FROM l),
     ins AS (
       INSERT INTO ventes (utilisateur_id, nom_client, date_vente, total)
       SELECT u.id, 'M. Youssef Benali', '2025-01-22 12:10:00+01', totals.total
       FROM u, totals
       RETURNING id
     )
INSERT INTO lignes_vente (vente_id, produit_nom, category_id, quantite, prix_unitaire)
SELECT ins.id, l.produit_nom, c.id, l.quantite, l.prix_unitaire
FROM l
JOIN cats c ON c.nom = l.category_nom
CROSS JOIN ins;

-- Vente 3 (2025-02-14) – Client: Mme. Salma Zahra – Vendeur: employe3
WITH u AS (SELECT id FROM utilisateurs WHERE email = 'employe3@store.com'),
     l(produit_nom, category_nom, quantite, prix_unitaire) AS (
       VALUES
       ('Lit 160x200 tête lisse',      'Lits', 1, 4300.00),
       ('Cadre miroir artisanal',      'Décoration bois', 3, 380.00)
     ),
     totals AS (SELECT SUM(quantite*prix_unitaire) AS total FROM l),
     ins AS (
       INSERT INTO ventes (utilisateur_id, nom_client, date_vente, total)
       SELECT u.id, 'Mme. Salma Zahra', '2025-02-14 18:30:00+01', totals.total
       FROM u, totals
       RETURNING id
     )
INSERT INTO lignes_vente (vente_id, produit_nom, category_id, quantite, prix_unitaire)
SELECT ins.id, l.produit_nom, c.id, l.quantite, l.prix_unitaire
FROM l
JOIN cats c ON c.nom = l.category_nom
CROSS JOIN ins;

-- Vente 4 (2025-03-21) – Client: Hôtel Atlas Rabat – Vendeur: employe1
WITH u AS (SELECT id FROM utilisateurs WHERE email = 'employe1@store.com'),
     l(produit_nom, category_nom, quantite, prix_unitaire) AS (
       VALUES
       ('Chaise dossier haut', 'Chaises', 12, 690.00),
       ('Table à manger 6 places', 'Tables', 1, 6900.00)
     ),
     totals AS (SELECT SUM(quantite*prix_unitaire) AS total FROM l),
     ins AS (
       INSERT INTO ventes (utilisateur_id, nom_client, date_vente, total)
       SELECT u.id, 'Hôtel Atlas Rabat', '2025-03-21 11:20:00+01', totals.total
       FROM u, totals
       RETURNING id
     )
INSERT INTO lignes_vente (vente_id, produit_nom, category_id, quantite, prix_unitaire)
SELECT ins.id, l.produit_nom, c.id, l.quantite, l.prix_unitaire
FROM l
JOIN cats c ON c.nom = l.category_nom
CROSS JOIN ins;

-- Vente 5 (2025-05-09) – Client: Riad Médina Marrakech – Vendeur: employe2
WITH u AS (SELECT id FROM utilisateurs WHERE email = 'employe2@store.com'),
     l(produit_nom, category_nom, quantite, prix_unitaire) AS (
       VALUES
       ('Console d''entrée', 'Décoration bois', 2, 1650.00),
       ('Miroir plein pied 70x180', 'Miroirs', 3, 1190.00)
     ),
     totals AS (SELECT SUM(quantite*prix_unitaire) AS total FROM l),
     ins AS (
       INSERT INTO ventes (utilisateur_id, nom_client, date_vente, total)
       SELECT u.id, 'Riad Médina Marrakech', '2025-05-09 16:50:00+01', totals.total
       FROM u, totals
       RETURNING id
     )
INSERT INTO lignes_vente (vente_id, produit_nom, category_id, quantite, prix_unitaire)
SELECT ins.id, l.produit_nom, c.id, l.quantite, l.prix_unitaire
FROM l
JOIN cats c ON c.nom = l.category_nom
CROSS JOIN ins;

-- Vente 6 (2025-06-28) – Client: M. Karim El Alaoui – Vendeur: employe3
WITH u AS (SELECT id FROM utilisateurs WHERE email = 'employe3@store.com'),
     l(produit_nom, category_nom, quantite, prix_unitaire) AS (
       VALUES
       ('Bibliothèque 5 niveaux', 'Bibliothèques', 1, 3450.00),
       ('Table basse rectangle', 'Tables', 1, 2450.00),
       ('Cadre miroir carré', 'Décoration bois', 2, 420.00)
     ),
     totals AS (SELECT SUM(quantite*prix_unitaire) AS total FROM l),
     ins AS (
       INSERT INTO ventes (utilisateur_id, nom_client, date_vente, total)
       SELECT u.id, 'M. Karim El Alaoui', '2025-06-28 13:35:00+01', totals.total
       FROM u, totals
       RETURNING id
     )
INSERT INTO lignes_vente (vente_id, produit_nom, category_id, quantite, prix_unitaire)
SELECT ins.id, l.produit_nom, c.id, l.quantite, l.prix_unitaire
FROM l
JOIN cats c ON c.nom = l.category_nom
CROSS JOIN ins;

-- Vente 7 (2025-07-12) – Client: Maison d''Hôtes Essaouira – Vendeur: employe1
WITH u AS (SELECT id FROM utilisateurs WHERE email = 'employe1@store.com'),
     l(produit_nom, category_nom, quantite, prix_unitaire) AS (
       VALUES
       ('Lit 180x200 tête sculptée', 'Lits', 1, 5200.00),
       ('Chaise simple', 'Chaises', 10, 340.00),
       ('Étagère murale 90cm', 'Bibliothèques', 2, 520.00)
     ),
     totals AS (SELECT SUM(quantite*prix_unitaire) AS total FROM l),
     ins AS (
       INSERT INTO ventes (utilisateur_id, nom_client, date_vente, total)
       SELECT u.id, 'Maison d''Hôtes Essaouira', '2025-07-12 10:05:00+01', totals.total
       FROM u, totals
       RETURNING id
     )
INSERT INTO lignes_vente (vente_id, produit_nom, category_id, quantite, prix_unitaire)
SELECT ins.id, l.produit_nom, c.id, l.quantite, l.prix_unitaire
FROM l
JOIN cats c ON c.nom = l.category_nom
CROSS JOIN ins;

COMMIT;

