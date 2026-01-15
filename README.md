*README généré par IA*

# Parking SAE - Application de Gestion de Parkings

Application web de navigation et gestion de parkings avec géolocalisation en temps réel. Trouvez les parkings disponibles autour de vous, calculez des itinéraires optimisés, gérez vos véhicules et sauvegardez vos parkings favoris. 

**Fonctionnalités principales :**
- 🗺️ Carte interactive (Leaflet) avec parkings en France (OpenStreetMap) et Londres (16MB GeoJSON)
- 📍 Géolocalisation temps réel et calcul automatique du parking le plus proche
- 🚗 Gestion multi-véhicules (voiture, électrique, moto) avec filtrage des parkings compatibles
- 🧭 Navigation turn-by-turn avec OSRM et suivi GPS en temps réel
- ⭐ Sauvegarde de parkings favoris par profil utilisateur
- 🔐 Authentification sécurisée et gestion de comptes

**Architecture :** Frontend SOLID (TypeScript) + Backend MVC (PHP) avec API REST.

## 🏗️ Architecture du Projet

### Structure des Dossiers

```
SAE3.01/
├── app/                         # Backend PHP (MVC)
│   ├── config/                  # Configuration
│   │   └── Database.php         # Singleton de connexion BDD
│   ├── controllers/             # Contrôleurs MVC
│   │   ├── AuthController.php   # Authentification
│   │   ├── ProfileController.php # Gestion profils
│   │   └── FavoriteController.php # Gestion favoris
│   ├── models/                  # Modèles de données
│   │   ├── User.php
│   │   ├── Profile.php
│   │   ├── Parking.php
│   │   └── Favorite.php
│   ├── api/                     # Endpoints API REST
│   │   ├── profile.php          # GET /app/api/profile.php
│   │   ├── user.php             # GET /app/api/user.php
│   │   ├── favorites.php        # GET/POST/DELETE /app/api/favorites.php
│   │   ├── vehicles.php         # GET/POST/DELETE /app/api/vehicles.php
│   │   ├── parking-coords.php   # POST /app/api/parking-coords.php
│   │   └── route.php            # POST /app/api/route.php (proxy ORS)
│   ├── views/                   # Pages HTML
│   │   ├── login.php
│   │   ├── register.php
│   │   └── logout.php
│   └── autoload.php             # PSR-4 Autoloader
│
├── src/                         # TypeScript source (SOLID)
│   ├── MobileApp.ts             # Application principale
│   ├── config/
│   │   └── DIContainer.ts       # Injection de dépendances
│   ├── controleur/
│   │   ├── ItineraryController.ts
│   │   ├── LocationController.ts
│   │   └── ParkingController.ts
│   ├── interfaces/              # Contrats (DIP)
│   │   ├── IItineraryService.ts
│   │   ├── ILocationService.ts
│   │   ├── IMapView.ts
│   │   └── IParkingService.ts
│   ├── modele/
│   │   ├── GeoLocation.ts
│   │   ├── Itinerary.ts
│   │   ├── Parking.ts
│   │   ├── UserProfile.ts
│   │   └── NavigationInstruction.ts  # Instructions de navigation
│   ├── services/                # Services métier (SRP)
│   │   ├── DistanceCalculator.ts
│   │   ├── NearestParkingFinder.ts
│   │   ├── NavigationService.ts     # Gestion navigation turn-by-turn
│   │   └── RouteFormatter.ts
│   ├── types/
│   │   └── index.ts             # Types TypeScript
│   └── ui/
│       ├── MapView.ts
│       └── NavigationUI.ts      # Interface de navigation
│
├── public/                      # Fichiers publics
│   ├── Application.html         # Interface carte
│   ├── assets/
│   │   └── logo.svg
│   └── js/                      # JavaScript compilé (gitignored)
│       ├── MobileApp.js
│       ├── config/
│       │   └── DIContainer.js
│       ├── controleur/
│       │   ├── ItineraryController.js
│       │   ├── LocationController.js
│       │   └── ParkingController.js
│       ├── interfaces/
│       ├── modele/
│       │   ├── GeoLocation.js
│       │   ├── Itinerary.js
│       │   ├── Parking.js
│       │   ├── UserProfile.js
│       │   └── NavigationInstruction.js
│       ├── services/
│       │   ├── DistanceCalculator.js
│       │   ├── NearestParkingFinder.js
│       │   ├── NavigationService.js
│       │   └── RouteFormatter.js
│       ├── types/
│       │   └── index.js
│       └── ui/
│           ├── MapView.js
│           ├── NavigationUI.js      # UI navigation turn-by-turn
│           ├── initApp.js           # Point d'entrée app
│           ├── panelUI.js
│           ├── vehiclesUI.js
│           ├── favoritesUI.js
│           └── routeButtons.js      # Gestion boutons d'itinéraire
│
├── styles/                      # CSS organisé
│   ├── variables.css            # Design tokens
│   ├── base.css                 # Reset & base
│   ├── components.css           # Composants réutilisables
│   ├── map.css                  # Interface carte
│   ├── navigation.css           # Interface de navigation
│   └── pages/
│       └── auth.css             # Pages connexion/inscription
│
├── data/                        # Données statiques
│   └── londres/
│       └── Parking_Bays_20260109.geojson  # Données parkings Londres (16 MB)
│
├── vendor/                      # Dépendances externes
│   └── leaflet/                 # Leaflet.js pour la carte
│
├── .env                         # Variables d'environnement (gitignored)
├── .env.example                 # Template de configuration
├── .gitignore
├── index.php                    # Point d'entrée (connexion)
├── tsconfig.json                # Configuration TypeScript (outDir: public/js)
└── README.md
```

## 🚀 Installation

### Prérequis

- PHP 7.4+
- MySQL/MariaDB
- Node.js & npm (pour compiler TypeScript)

### Configuration

1. **Cloner le projet**
   ```bash
   git clone https://github.com/fortesque152/SAE3.01
   cd SAE3.01
   ```

2. **Configurer les variables d'environnement**
   ```bash
   cp .env.example .env
   ```
   
   Éditer `.env` avec vos informations :
   ```env
   DB_HOST=votre_host
   DB_NAME=votre_base
   DB_USER=votre_user
   DB_PASS=votre_password
   ORS_API_KEY=votre_cle_openrouteservice
   ```

3. **Compiler TypeScript**
   ```bash
   tsc
   ```
   
   Le code TypeScript de `src/` sera compilé dans `public/js/`

4. **Configurer le serveur web**
   - DocumentRoot : `/chemin/vers/SAE3.01`
   - Point d'entrée : `index.php`


## 🎨 Design System

Le projet utilise un design system cohérent basé sur des variables CSS :

- **Couleurs** : Palette noir & blanc avec nuances de gris
- **Espacements** : Système à 6 niveaux (xs, sm, md, lg, xl, 2xl)
- **Typographie** : Système de fonts sans-serif optimisé

Voir [styles/variables.css](styles/variables.css) pour les détails.

## 🏛️ Principes SOLID / MVC

### Backend PHP (MVC)
- **Models** : Gestion des données (User, Profile, Parking, Favorite)
- **Controllers** : Logique métier (Auth, Profile, Favorite)
- **Views** : Templates HTML/PHP séparés

### Frontend TypeScript
- **S**ingle Responsibility : Chaque classe a une seule responsabilité
- **O**pen/Closed : Extensible sans modification
- **L**iskov Substitution : Les implémentations sont interchangeables
- **I**nterface Segregation : Interfaces spécifiques et ciblées
- **D**ependency Inversion : Dépendance aux abstractions, pas aux implémentations


## 🔒 Sécurité

- ✅ Mots de passe hashés avec `password_hash()`
- ✅ Requêtes préparées (PDO) contre les injections SQL
- ✅ Variables d'environnement dans `.env` (gitignored)
- ✅ Sessions PHP sécurisées
- ✅ Validation des entrées utilisateur


## 📄 Licence

Projet SAE IUT - Usage éducatif

---

**Auteurs** : Équipe SAE 3.01 

> CORONA, LADURELLE, LUPO, EL-AAMERY, GRAINE.

