"""Lot 4 des motifs retrouvés (4 novembre 2026) : 50 pièces proposées + 20 de réserve.
Cleveland, Rijksmuseum, Cooper Hewitt et Chicago. Source unique pour la page de choix (les fiches complètes seront écrites après le choix)."""
CONSULTE = "2026-11-04"
CONSULTE_TEXTE = "4 novembre 2026"
CONSULTE_COURT = "4 nov. 2026"

CHICAGO = "Chicago ne fournit plus que 3 000 px depuis début novembre 2026 : agrandissement nécessaire."
VOLUME = "Photo d'un objet en volume : ombres et reflets à effacer, décor à redessiner à plat."
TABLEAU = "Tableau, pas un motif raccordable : à vendre en image entière ou par détails."
POCHOIR = "On vend le motif redessiné, pas la photo du pochoir."
VETEMENT = "Vêtement photographié entier : le tissu est à extraire et à remettre à plat."

# id, planche, famille, periode, type, piece, raccord, or, fr(titre, date, origine, technique, auteur), pourquoi, vigilance
P = []


def piece(id, planche, famille, periode, type, piece_, raccord, or_, titre, date, origine, technique, auteur, pourquoi, vigilance=""):
    if famille == "peintres" or piece_ in ("Estampe", "Peinture") or (piece_ == "Vêtement" and raccord == "a-composer"):
        raccord = "oeuvre" if raccord == "a-composer" else raccord
    P.append(dict(id=id, planche=planche, famille=famille, periode=periode, type=type, piece=piece_, raccord=raccord, or_=or_,
                  fr=dict(titre=titre, date=date, origine=origine, technique=technique, auteur=auteur), pourquoi=pourquoi, vigilance=vigilance))


# ---------------- 50 propositions ----------------
# Indiennes colorées (8)
piece("b01", "C002", "indiennes", "xviiie", "floral", "Étoffe peinte", "a-composer", False, "Cartouche fleuri sur fond rouge", "XVIIIe siècle", "Inde",
      "Coton peint et teint (indienne), bordé d'un galon", "", "Un médaillon découpé dans un palampore, sur un fond rouge et blanc : très décoratif.",
      "Pièce découpée et bordée d'un galon : galon à effacer, médaillon à remettre à plat.")
piece("b02", "C062", "indiennes", "xviiie", "floral", "Étoffe peinte", "facile", False, "Rayures rouges et fleurs à l'indienne", "XVIIIe siècle", "Inde",
      "Coton peint et teint (indienne)", "", "Des rayures rouges fleuries alternent avec des rayures blanches à fleurs et papillons : le raccord est déjà là.")
piece("b03", "C030", "indiennes", "xviiie", "animalier", "Étoffe peinte", "moyen", False, "L'Oiseau-paon et la fleur géante", "Vers 1800", "Inde",
      "Coton peint et teint (indienne)", "", "Un oiseau aux airs de paon et une fleur immense : spectaculaire en panneau ou en tissu d'ameublement.",
      "Morceau de bordure : la répétition est à reconstituer.")
piece("b04", "C119", "indiennes", "xviiie", "floral", "Étoffe peinte", "facile", False, "Treillage de rubans fleuris", "XVIIIe siècle", "Inde",
      "Coton peint et teint (indienne)", "", "Un treillage régulier de rubans et de fleurs : le motif raccordable par excellence.")
piece("b05", "R033", "indiennes", "xviie", "floral", "Étoffe peinte", "moyen", False, "Couvre-lit aux palmettes", "Vers 1675 – 1700", "Perse (peut-être)",
      "Coton peint (indienne), doublé et matelassé", "", "Une indienne du XVIIe siècle aux palmettes rouges, violettes et jaunes : rare et très graphique.",
      "Le Rijksmuseum sert 6 014 × 7 025 px (sa base annonce plus grand).")
piece("b06", "C324", "indiennes", "xviiie", "floral", "Étoffe imprimée", "facile", False, "Guirlandes et grandes fleurs à la française", "XVIIIe siècle", "France",
      "Coton imprimé à la planche, bleu posé au pinceau (indienne française)", "", "Une indienne française en demi-saut, avec guirlandes et grandes fleurs : prête à répéter.")
piece("b07", "C103", "indiennes", "xixe", "floral", "Étoffe imprimée", "facile", False, "Œillets et iris sur fond bleu", "1800 – 1850", "Angleterre",
      "Coton glacé imprimé à la planche", "", "Œillets, iris, asters et lis tigrés sur un fond bleu vif : un chintz anglais joyeux.",
      "Bande étroite (6 920 × 2 912 px) : vérifier la hauteur du raccord.")
piece("b08", "R240", "indiennes", "xviiie", "floral", "Étoffe peinte", "a-composer", False, "Arbre de vie sur fond rouge", "Vers 1725 – 1750", "Inde",
      "Coton peint et teint (indienne), doublé de lin", "", "Le palampore à l'arbre de vie, ici sur un fond rouge rare.",
      "Image de 2 939 × 4 000 px : agrandissement nécessaire. Composition d'un seul tenant.")

# Soieries et papiers peints (10)
piece("b09", "C416", "soieries", "xviiie", "floral", "Tissage", "moyen", False, "Palmettes et raisins brochés d'argent", "XVIIIe siècle", "France",
      "Soie brochée de soies de couleur et de fils d'argent", "", "Un grand dessin symétrique de palmettes, colonnes et grappes : le luxe des soieries françaises.",
      "Trois fragments : le dessin est à compléter là où ils se rejoignent.")
piece("b10", "C414", "soieries", "xviiie", "floral", "Tissage", "facile", False, "Guirlandes sur taffetas rose", "XVIIIe siècle", "France",
      "Taffetas de soie moiré, broché", "", "Des guirlandes fleuries sur un taffetas rose à rayures : doux et très facile à répéter.")
piece("b11", "C417", "soieries", "xviiie", "figuratif", "Tissage", "a-composer", False, "La Bouquetière sur soie jaune", "XVIIIe – XIXe siècle", "France",
      "Soie façonnée, médaillon en satin broché", "", "Une jeune femme au panier de fleurs dans un médaillon, sur une soie rouge et jaune.",
      "Le médaillon est plus ancien que le fond ; traces de colle (ancienne tenture murale).")
piece("b12", "C214", "soieries", "xviiie", "geometrique", "Papier peint", "facile", False, "Rosaces bleues en nid d'abeille", "1800", "France",
      "Papier peint imprimé à la planche sur feuilles assemblées", "", "Des rosaces bleues dans un réseau hexagonal jaune sur fond brun : un graphisme étonnamment moderne.")
piece("b13", "C228", "soieries", "xviiie", "floral", "Papier peint", "facile", False, "Tiges fleuries sur fond satiné", "Vers 1800", "France",
      "Papier peint imprimé à la planche, fond satiné", "", "Bleuets, campanules, roses et pois de senteur sur fond blanc : frais et lumineux.",
      "Image de 3 761 × 4 508 px : léger agrandissement nécessaire.")
piece("b14", "C286", "soieries", "xviiie", "figuratif", "Papier peint", "facile", False, "Liberté, Égalité : papier peint de la Révolution", "Vers 1792", "France",
      "Papier peint imprimé à la planche sur papier fait main", "", "Couronnes de chêne, faisceaux, bonnet phrygien et rubans tricolores : une pièce d'histoire très parlante.",
      "Symboles et devise politiques (« Soyons unis, nous serons invincibles ») : à présenter comme document d'époque.")
piece("b15", "C092", "soieries", "xixe", "floral", "Papier peint", "facile", False, "Frise fleurie à l'indienne", "1795 – 1830", "France",
      "Bordure de papier peint imprimée à la planche", "", "Une frise de fleurs dans le goût des indiennes : parfaite pour une bordure ou un ruban.")
piece("b16", "4R053", "soieries", "xviiie", "animalier", "Papier décoré", "facile", False, "Oiseaux et fleurs en quatre rangs", "1700 – 1850", "Non précisée (atelier anonyme)",
      "Papier décoré imprimé", "", "Des oiseaux et des rameaux fleuris en rangs réguliers : un semis tout prêt, plein de charme.")
piece("b17", "4R035", "soieries", "xixe", "animalier", "Papier décoré", "facile", True, "Volière dorée sur fond bleu", "1850 – 1920", "Allemagne, Aschaffenburg",
      "Papier décoré imprimé en or, à l'imitation des papiers indiennés du XVIIIe siècle", "Dessauersche Buntpapierfabrik, fabricant",
      "Oiseaux, fleurs et fruits dessinés en or sur un bleu profond : chic et immédiatement utilisable.",
      "L'or se photographie mal : à recolorer pendant la restauration.")
piece("b18", "C590", "soieries", "xviie", "floral", "Tissage", "moyen", True, "Corne d'abondance et couronne de velours", "XVIIe siècle", "Italie",
      "Velours de soie ciselé, fond de fils métalliques", "", "Un grand velours rouge sur fond d'or : corne d'abondance, bouquet et couronne.",
      "Fragment d'un très grand dessin : le raccord est à reconstituer.")

# Asie (10)
piece("b19", "4L136", "asie", "xixe", "paysage", "Estampe", "a-composer", False, "Le Fuji rouge, d'après Hokusai", "Début des années 1830", "Japon",
      "Estampe gravée sur bois en couleurs (série des Trente-six vues du mont Fuji)", "Katsushika Hokusai (1760 – 1849)",
      "L'une des images japonaises les plus célèbres, en très haute définition (12 310 px).",
      "Estampe proposée partout : la valeur viendra de la restauration et des déclinaisons. Titre et signature dans les cartouches.")
piece("b20", "4L177", "asie", "xixe", "animalier", "Estampe", "a-composer", False, "Deux carpes sous les herbes d'eau, d'après Hokusai", "1831", "Japon",
      "Estampe gravée sur bois en couleurs, pour éventail", "Katsushika Hokusai (1760 – 1849)",
      "Deux carpes dorées sur fond bleu : un sujet porte-bonheur, très graphique.",
      "Format d'éventail aux coins arrondis : à recadrer ou à compléter.")
piece("b21", "4L185", "asie", "xixe", "floral", "Estampe", "a-composer", False, "Corbeille de pivoines, d'après Hokusai", "1810 ou 1814", "Japon",
      "Estampe gravée sur bois en couleurs (surimono)", "Katsushika Hokusai (1760 – 1849)",
      "Pivoines roses et rouges dans une corbeille tressée : délicat et très décoratif.",
      "Poèmes calligraphiés en haut : à garder ou à effacer.")
piece("b22", "4L188", "asie", "xxe", "floral", "Peinture", "a-composer", False, "Pivoines de Corée, paravent à huit panneaux", "Début du XXe siècle", "Corée",
      "Encre et couleurs sur soie, paravent à huit panneaux", "",
      "Huit panneaux de pivoines aux couleurs vives, symbole de prospérité : chaque panneau peut devenir un motif.",
      "Paravent de 27 511 px de large : vendez-le panneau par panneau.")
piece("b23", "4L160", "asie", "xviie", "animalier", "Peinture", "a-composer", True, "Lions et tigres parmi pivoines et bambous", "1668", "Japon",
      "Paire de paravents à six panneaux, encre et couleurs sur papier doré", "Yamaguchi Sekkei (1644 – 1732)",
      "Lions et tigres joueurs sur fond d'or : la grande peinture décorative japonaise.",
      "Paire de paravents : à vendre en deux fichiers ou par détails.")
piece("b24", "4L164", "asie", "xviie", "floral", "Peinture", "a-composer", False, "Champ de fleurs et de graminées, paravents", "Milieu du XVIIe siècle", "Japon",
      "Paire de paravents à six panneaux, encre et couleurs sur papier", "Kitagawa Sōsetsu (actif vers 1639 – 1650)",
      "Un chef-d'œuvre de l'école Rinpa : fleurs et herbes en frise, idéal pour un papier peint.",
      "Paire de paravents : à vendre en deux fichiers ou par détails.")
piece("b25", "4L166", "asie", "xixe", "animalier", "Peinture", "a-composer", False, "La Famille tigre", "Fin du XIXe siècle", "Corée",
      "Rouleau vertical, encre et couleurs sur papier", "",
      "Une tigresse, ses petits et un léopard sous les pins : une peinture populaire coréenne pleine d'humour.",
      TABLEAU)
piece("b26", "C470", "asie", "xixe", "floral", "Tissage", "moyen", True, "Chrysanthèmes sur l'onde d'or", "XIXe siècle", "Japon",
      "Soie brochée de soies de couleur et de lames d'or", "",
      "Chrysanthèmes multicolores sur des ondes d'or : la soierie japonaise dans ce qu'elle a de plus festif.",
      "Image de 3 814 × 3 508 px : léger agrandissement nécessaire.")
piece("b27", "R176", "asie", "xviie", "geometrique", "Broderie", "a-composer", False, "Grande roue d'éventail sur soie noire", "1688 – 1703", "Japon",
      "Broderie et teinture à réserve (shibori) sur damas de soie noir", "",
      "Une grande roue d'éventail brodée sur soie noire : un graphisme japonais très moderne.",
      "Deux fragments montés sur carton : à composer en planche ou en semis.")
piece("b28", "R113", "asie", "xixe", "animalier", "Pochoir", "facile", False, "Poissons et triangles aux oiseaux, pochoir japonais", "1800 – 1909", "Japon",
      "Pochoir (katagami) en papier découpé", "", "Poissons dans les vagues et oiseaux dans des triangles : un motif vif, facile à redessiner.",
      POCHOIR)

# Peintres du domaine public (9)
piece("b29", "4L027", "peintres", "xxe", "figuratif", "Pastel", "a-composer", False, "Violette Heymann, d'après Odilon Redon", "1910", "France",
      "Pastel sur papier gris", "Odilon Redon (1840 – 1916)",
      "Le Redon des fleurs, très proche des images que vous m'avez montrées : un profil dans un foisonnement de couleurs.",
      TABLEAU)
piece("b30", "4L032", "peintres", "xxe", "floral", "Pastel", "a-composer", False, "Vase de fleurs sur fond jaune, d'après Odilon Redon", "1916", "France",
      "Pastel", "Odilon Redon (1840 – 1916)", "Un bouquet lumineux sur fond jaune et rose, l'une des dernières œuvres de Redon.", TABLEAU)
piece("b31", "4L003", "peintres", "xixe", "figuratif", "Peinture", "a-composer", False, "Dans les vagues, d'après Gauguin", "1889", "France",
      "Huile sur toile", "Paul Gauguin (1848 – 1903)", "Des vagues vert et blanc et une chevelure rousse : les aplats de couleur de Gauguin.",
      TABLEAU + " Nu de dos.")
piece("b32", "4L021", "peintres", "xixe", "paysage", "Peinture", "a-composer", False, "La Maison du jardinier à Antibes, d'après Monet", "1888", "France",
      "Huile sur toile", "Claude Monet (1840 – 1926)", "Monet en Méditerranée : arbres en fleurs, mer et montagnes, en très haute définition.", TABLEAU)
piece("b33", "4L028", "peintres", "xixe", "floral", "Peinture", "a-composer", False, "Roses dans un vase, d'après Renoir", "Vers 1890", "France",
      "Huile sur toile", "Pierre-Auguste Renoir (1841 – 1919)", "Sept roses aux tons chauds : un petit tableau tendre, très demandé en décoration.", TABLEAU)
piece("b34", "4A028", "peintres", "xixe", "figuratif", "Peinture", "a-composer", False, "La Chambre, d'après Van Gogh", "1889", "France, Saint-Rémy-de-Provence",
      "Huile sur toile", "Vincent van Gogh (1853 – 1890)", "La chambre jaune et bleue d'Arles : l'un des tableaux les plus connus au monde.",
      CHICAGO + " " + TABLEAU)
piece("b35", "4A011", "peintres", "xxe", "paysage", "Peinture", "a-composer", False, "Nymphéas, d'après Monet", "1906", "France",
      "Huile sur toile", "Claude Monet (1840 – 1926)", "Les nymphéas de Giverny, bleus et roses : une image apaisante, idéale en grand format.",
      CHICAGO + " " + TABLEAU)
piece("b36", "4L024", "peintres", "xxe", "figuratif", "Dessin", "a-composer", False, "L'Enfant aux chrysanthèmes, d'après Kamisaka Sekka", "1909", "Japon",
      "Encre et couleurs sur papier (dessin préparatoire pour « Momoyogusa »)", "Kamisaka Sekka (1866 – 1942)",
      "Des chrysanthèmes jaunes en nuage, très graphiques : le Japon moderne, entre peinture et motif.", TABLEAU)
piece("b37", "4L012", "peintres", "xviiie", "floral", "Dessin", "facile", False, "Fleurs pour la soierie de Lyon, d'après Pillement", "Vers 1790", "France",
      "Crayon noir et crayons de couleur sur papier vélin", "Jean-Baptiste Pillement (1728 – 1808)",
      "Un vrai dessin de motif pour les soieries de Lyon, déjà pensé pour la répétition.")

# Vêtements (7)
piece("b38", "4L047", "vetements", "xixe", "geometrique", "Vêtement", "a-composer", False, "Costume de cérémonie de la cour de Corée", "Fin du XIXe – début du XXe siècle", "Corée",
      "Soie ; accessoires en papier doré, fil de fer et soie noire", "",
      "Rouge vif, bleu et vert d'eau : les aplats de couleur d'un costume de cour, très modernes.",
      "Costume complet photographié à plat : à découper en motifs (couleurs, bordures).")
piece("b39", "4A031", "vetements", "xixe", "animalier", "Vêtement", "a-composer", True, "Robe de cour impériale aux dragons", "1790 – 1820", "Chine, dynastie Qing",
      "Tapisserie de soie et d'or (kesi), broderie de soie", "",
      "Dragons d'or sur fond jaune, vagues et nuages : la robe impériale chinoise.", CHICAGO + " " + VETEMENT)
piece("b40", "4L048", "vetements", "xixe", "animalier", "Vêtement", "a-composer", False, "La Veste à la pieuvre", "Vers 1800 – 1868", "Japon",
      "Crêpe de soie (chirimen), teint", "", "Une pieuvre dont les tentacules courent sur toute la veste : drôle et graphique.",
      VETEMENT)
piece("b41", "4L051", "vetements", "xixe", "floral", "Vêtement", "moyen", False, "Robe aux fleurs pourpres du Khorezm", "Fin du XIXe siècle", "Ouzbékistan, Khorezm",
      "Coton teint à l'indigo, brodé de soie", "", "De grandes fleurs pourpres brodées sur fond indigo : un motif d'Asie centrale saisissant.",
      VETEMENT)
piece("b42", "4L056", "vetements", "moyen-age", "animalier", "Vêtement", "facile", False, "Le Manteau d'enfant aux canards", "VIIIe siècle", "Iran ou Asie centrale (Sogdiane)",
      "Samit de soie (sergé façonné)", "", "Des canards dans des médaillons de perles, tissés il y a 1 300 ans : un motif d'une grande modernité.",
      "Soie très usée par endroits : médaillons à reconstituer à partir des mieux conservés.")
piece("b43", "R165", "vetements", "xviiie", "floral", "Vêtement", "moyen", True, "Robe à la française aux fleurs d'or et d'argent", "Vers 1765 – 1775", "France ou Pays-Bas (peut-être)",
      "Brocart de soie, fond crème, fleurs de soies de couleur, d'or et d'argent", "",
      "Une robe du XVIIIe siècle couverte de fleurs brochées : le motif du tissu est un vrai semis.",
      "Robe sur mannequin : le motif du tissu est à extraire et à remettre à plat.")
piece("b44", "4L061", "vetements", "xviiie", "geometrique", "Vêtement", "a-composer", True, "Kesa en patchwork de brocarts", "XVIIIe siècle", "Japon",
      "Soie brochée, fils métalliques", "", "Une étole de moine faite de brocarts assemblés : un patchwork précieux, à découper en petits motifs.", "Pièces assemblées : à composer en planche.")

# Assiettes et céramiques (6)
piece("b45", "4L075", "ceramiques", "xviie", "floral", "Carreau", "moyen", False, "Arabesques turquoise sur fond bleu, carreau persan", "XVIIe siècle", "Iran, époque safavide",
      "Céramique à décor de cuerda seca", "", "Arabesques turquoise, vertes et blanches sur un bleu profond : un carreau persan très graphique.",
      "Un seul carreau de 32 cm, au décor coupé sur les bords : le raccord se fait en le répétant ou en miroir.")
piece("b46", "4L076", "ceramiques", "xvie", "floral", "Plat", "a-composer", True, "Plat d'Iznik à la feuille saz", "Vers 1590", "Turquie, Iznik",
      "Céramique siliceuse, engobe rouge, décor sous glaçure, rehauts d'or", "",
      "Roses rouges, jacinthes bleues et feuille saz autour d'un or rarement conservé.", VOLUME)
piece("b47", "4L065", "ceramiques", "xvie", "figuratif", "Plat", "a-composer", False, "Plat de Deruta à la belle dame", "Vers 1520", "Italie, Deruta",
      "Faïence (majolique)", "", "Un profil de femme Renaissance dans un décor bleu et jaune d'or : une pièce de caractère.", VOLUME)
piece("b48", "4L091", "ceramiques", "xviiie", "figuratif", "Assiette", "a-composer", False, "L'Assiette aux cartes à jouer", "Vers 1760", "France, Lille",
      "Faïence", "", "Un trompe-l'œil de cartes jetées sur la table : amusant et très graphique.", VOLUME)
piece("b49", "4L128", "ceramiques", "xviie", "floral", "Assiette", "a-composer", False, "Cerisiers en corbeilles, coupelle japonaise", "Vers 1670 – 1710", "Japon (type Nabeshima)",
      "Porcelaine, bleu sous couverte et émaux", "", "Fleurs de cerisier dans des corbeilles tressées sur des vagues : un classique japonais.", VOLUME)
piece("b50", "4L123", "ceramiques", "xviie", "figuratif", "Carreau", "a-composer", False, "Le Porteur de vin, carreau d'Ispahan", "XVIIe siècle", "Iran, Ispahan",
      "Céramique à décor de cuerda seca", "", "Un jeune homme au turban sur fond jaune et vert : la céramique persane dans ses couleurs les plus vives.",
      "Panneau de deux carreaux : le joint est à effacer.")

# ---------------- 20 pièces de réserve ----------------
piece("r01", "C105", "indiennes", "xixe", "floral", "Étoffe imprimée", "facile", False, "Roses et rubans sur fond chamois", "1800 – 1850", "Angleterre",
      "Coton glacé imprimé", "", "Des roses grandeur nature reliées par des rubans jaunes et rouges.", "Image de 3 228 × 3 891 px : léger agrandissement nécessaire.")
piece("r02", "C377", "soieries", "xviiie", "floral", "Broderie", "moyen", False, "Fleurs et fruits brodés de laine", "1700 – 1750", "France",
      "Broderie de laine sur lin", "", "Fleurs et fruits aux couleurs vives sur des tiges ondulantes.", "Bande étroite (3 565 × 9 860 px).")
piece("r03", "C269", "soieries", "xixe", "floral", "Papier peint", "facile", False, "Losanges fleuris sur fond moutarde", "1800 – 1810", "France",
      "Papier peint imprimé à la planche", "", "Un treillage de feuillages et de rosaces sur fond moutarde : très facile à répéter.")
piece("r04", "4R031", "soieries", "xixe", "animalier", "Papier décoré", "facile", True, "Paon, hibou et oiseaux sur fond rose", "1850 – 1920", "Allemagne, Aschaffenburg",
      "Papier décoré imprimé en or", "Dessauersche Buntpapierfabrik, fabricant", "Des oiseaux d'or sur fond rose : un pendant au papier bleu.", "L'or se photographie mal : à recolorer.")
piece("r05", "4R043", "soieries", "xviiie", "animalier", "Papier décoré", "facile", False, "Oiseaux sur les rameaux", "1700 – 1850", "Non précisée (atelier anonyme)",
      "Papier décoré imprimé", "", "Des oiseaux posés sur des rameaux fleuris, en semis serré.", "Trace d'une étiquette retirée : à effacer.")
piece("r06", "4L191", "asie", "xxe", "floral", "Peinture", "a-composer", False, "Pivoines et rochers de Corée", "Début du XXe siècle", "Corée",
      "Encre et couleurs sur soie, paravent à six panneaux", "", "Pivoines sur des rochers bleus et verts : le pendant du paravent aux pivoines.", "Vendez-le panneau par panneau.")
piece("r07", "4R045", "asie", "xixe", "animalier", "Estampe", "a-composer", False, "Paons et pivoines, surimono", "1840 – 1900", "Japon",
      "Estampe gravée sur bois en couleurs (surimono)", "", "Un couple de paons dans un buisson fleuri, en couleurs douces.", "Poèmes calligraphiés à garder ou à effacer.")
piece("r08", "C506", "asie", "xviiie", "floral", "Pochoir", "facile", False, "Chrysanthèmes et éventails, pochoir japonais", "Milieu du XVIIIe – début du XIXe siècle", "Japon",
      "Pochoir (katagami) en papier de mûrier traité au kaki, renforcé de fils de soie", "", "Chrysanthèmes et éventails en silhouette : élégant en une couleur.", POCHOIR + " Coin supérieur droit abîmé.")
piece("r09", "4L171", "asie", "moyen-age", "animalier", "Peinture", "a-composer", False, "Rouge-queue sur un prunier en fleurs", "XIIe siècle", "Chine, dynastie des Song du Sud",
      "Encre et couleurs sur soie (feuille d'album)", "", "Un oiseau peint il y a neuf siècles, d'une finesse étonnante.", TABLEAU)
piece("r10", "4L030", "peintres", "xxe", "figuratif", "Dessin", "a-composer", False, "Les Trois Danseurs, d'après Kamisaka Sekka", "1909", "Japon",
      "Encre et couleurs sur papier (dessin préparatoire pour « Momoyogusa »)", "Kamisaka Sekka (1866 – 1942)", "Trois danseurs aux kimonos colorés, très graphiques.", TABLEAU)
piece("r11", "4A036", "peintres", "xixe", "figuratif", "Peinture", "a-composer", False, "La Berceuse, d'après Van Gogh", "1889", "France, Arles",
      "Huile sur toile", "Vincent van Gogh (1853 – 1890)", "Le fond aux fleurs du papier peint est un motif à lui seul.", CHICAGO + " " + TABLEAU)
piece("r12", "4L008", "peintres", "xxe", "floral", "Peinture", "a-composer", False, "Chrysanthème, d'après Mondrian", "1906 – 1942", "Pays-Bas",
      "Huile sur toile", "Piet Mondrian (1872 – 1944)", "Une seule fleur, de face : le Mondrian méconnu, avant l'abstraction.", TABLEAU)
piece("r13", "4L042", "peintres", "xixe", "floral", "Aquarelle", "a-composer", False, "Rose des prés, d'après Redouté", "1817 – 1824", "France",
      "Aquarelle", "Pierre-Joseph Redouté (1759 – 1840)", "La rose botanique par excellence, fond blanc prêt à l'emploi.",
      "Image de 3 975 × 5 759 px : léger agrandissement nécessaire.")
piece("r14", "4L013", "peintres", "xixe", "floral", "Peinture", "a-composer", False, "Fleurs de printemps, d'après Monet", "1864", "France",
      "Huile sur toile", "Claude Monet (1840 – 1926)", "Pivoines, hortensias et lilas : un Monet de jeunesse, très riche.", "Fond sombre. " + TABLEAU)
piece("r15", "4A058", "vetements", "xviiie", "floral", "Vêtement", "moyen", False, "Gilet brodé de bouquets", "Années 1780", "France (Lyon, peut-être)",
      "Satin de soie brodé de soie", "", "Des bouquets et des rinceaux brodés sur un gilet d'homme : le raffinement du XVIIIe siècle.", CHICAGO + " " + VETEMENT)
piece("r16", "4L059", "vetements", "xixe", "floral", "Vêtement", "a-composer", False, "Blouse brodée du Kutch", "XIXe siècle", "Inde, Gujarat, Kutch",
      "Broderie de fils de soie sur soie", "", "Une blouse de femme couverte de broderies dorées et colorées : un décor très riche à découper en motifs.",
      "Vêtement photographié entier : le tissu est à extraire et à remettre à plat.")
piece("r17", "4A034", "vetements", "xviiie", "floral", "Vêtement", "moyen", False, "Robe rouge aux fleurs de thé", "Fin du XVIIIe siècle", "Japon",
      "Damas de soie teint à réserve par nouage", "", "Des fleurs de théier blanches sur des courants d'eau, sur fond rouge.", CHICAGO + " " + VETEMENT)
piece("r18", "4L087", "ceramiques", "moyen-age", "floral", "Carreau", "facile", False, "Carreau étoilé au lotus", "Vers 1300 – 1350", "Iran (Sultanabad, probablement)",
      "Céramique siliceuse moulée, décor sous glaçure", "", "Une étoile à huit branches au lotus : faite pour être assemblée en mosaïque.")
piece("r19", "4L109", "ceramiques", "xviiie", "paysage", "Assiette", "a-composer", False, "L'Île des Immortels, assiette chinoise", "1723 – 1735", "Chine, Jingdezhen",
      "Porcelaine, bleu sous couverte et émaux", "", "Un pavillon sur les vagues et des grues dans les nuages.", VOLUME)
piece("r20", "4L125", "ceramiques", "xvie", "figuratif", "Plat", "a-composer", False, "Cavalier à la licorne, plat italien", "Vers 1510", "Italie",
      "Faïence (majolique)", "Jacopo Caffagiolo (attribution du musée)", "Un cavalier sur une licorne blanche : le merveilleux de la Renaissance.", VOLUME)
