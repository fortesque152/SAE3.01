# Just Park It - Application de localisation de parkings avec guidage

- 🗺️ Carte interactive avec Mapbox
- 🎯 Géolocalisation de l'utilisateur
- 📍 Localisation des parkings en temps réel
- 🧭 Guidage vers les parkings disponibles
- 👤 Système d'authentification (connexion/inscription)
- 📊 Affichage des informations de parking

## Installation

1. Creer un fichier `.env` à la racine du projet avec les variables d'environnement nécessaires (voir `.env.example`).
2. Installer les dépendances :
   ```bash
   npm i
   ```
3. Démarrer l'application en mode développement :
   ```bash
   npm run dev
   ```
4. Ouvrir [http://localhost:5173/](http://localhost:5173/) dans votre navigateur.

5. Pour mettre le server en marche, naviguer dans le dossier `/api` et lancer la commande :
   ```bash
   php -S localhost:8000
   ```

## Technologies utilisées

- Frontend : Vite, React, Mapbox GL JS
- Backend : PHP, MySQL
- Authentification : JWT (JSON Web Tokens)

## Structure du projet

```
parking-sae/
│
├── api/                          # Backend PHP
│   ├── config.php               # Configuration de la base de données
│   ├── db.sql                   # Script SQL pour créer la base de données
│   ├── load_env.php             # Chargement des variables d'environnement
│   ├── login.php                # Endpoint d'authentification (connexion)
│   ├── logout.php               # Endpoint de déconnexion
│   ├── register.php             # Endpoint d'inscription
│   └── verify.php               # Vérification du token JWT
│
├── public/                       # Fichiers statiques accessibles publiquement
│   └── asset/
│       └── images/
│           └── Logo.svg         # Logo de l'application
│
├── src/                          # Code source React
│   ├── components/              # Composants React
│   │   ├── LoginPage.tsx        # Page de connexion/inscription
│   │   ├── LoginPage.module.css # Styles de la page de connexion
│   │   ├── Map.tsx              # Composant principal de la carte Mapbox
│   │   ├── ParkingMarker.tsx    # Marqueurs de parking sur la carte
│   │   ├── Profil.tsx           # Page de profil utilisateur
│   │   ├── Profil.module.css    # Styles du profil
│   │   └── UserLocation.tsx     # Gestion de la position de l'utilisateur
│   │
│   ├── hooks/                    # Hooks React personnalisés
│   │   ├── index.ts             # Export des hooks
│   │   ├── useAuth.ts           # Gestion de l'authentification
│   │   ├── useGeolocation.ts    # Gestion de la géolocalisation
│   │   └── useParkings.ts       # Récupération des données de parking
│   │
│   ├── services/                 # Services pour les appels API
│   │   ├── api.ts               # Configuration Axios de base
│   │   ├── authService.ts       # Services d'authentification
│   │   └── parkingService.ts    # Services de gestion des parkings
│   │
│   ├── types/                    # Types TypeScript
│   │   ├── Parking.ts           # Interface pour les objets Parking
│   │   └── User.ts              # Interface pour les objets User
│   │
│   ├── App.tsx                   # Composant racine de l'application
│   ├── App.css                   # Styles globaux
│   ├── App.module.css            # Styles modulaires de l'App
│   └── main.tsx                  # Point d'entrée de l'application React
│
├── .env.example                  # Exemple de variables d'environnement
├── eslint.config.js              # Configuration ESLint
├── index.html                    # Page HTML principale
├── package.json                  # Dépendances et scripts npm
├── tsconfig.json                 # Configuration TypeScript
├── tsconfig.app.json             # Configuration TypeScript pour l'app
├── tsconfig.node.json            # Configuration TypeScript pour Node
└── vite.config.ts                # Configuration Vite
```

### Explication des principaux dossiers et fichiers

#### 📁 **`/api`** - Backend PHP

Contient tous les endpoints API pour l'authentification et la gestion des données.

- `config.php` : Connexion à la base de données MySQL
- `login.php` / `register.php` : Gestion des utilisateurs
- `verify.php` : Validation des tokens JWT pour les requêtes authentifiées

#### 📁 **`/src/components`** - Composants React

- `LoginPage.tsx` : Interface de connexion et inscription avec validation
- `Map.tsx` : Carte interactive Mapbox avec contrôles de navigation
- `ParkingMarker.tsx` : Affiche les parkings disponibles sur la carte
- `UserLocation.tsx` : Affiche la position actuelle de l'utilisateur
- `Profil.tsx` : Page de profil avec informations utilisateur

#### 📁 **`/src/hooks`** - Hooks personnalisés

Hooks React réutilisables pour la logique métier :

- `useAuth` : Gère l'état d'authentification (login, logout, token)
- `useGeolocation` : Récupère et suit la position GPS de l'utilisateur
- `useParkings` : Charge et gère la liste des parkings disponibles

#### 📁 **`/src/services`** - Services API

Abstraction des appels HTTP vers le backend :

- `api.ts` : Instance Axios configurée avec l'URL de base
- `authService.ts` : Méthodes pour login, register, verify
- `parkingService.ts` : Méthodes pour récupérer les parkings

#### 📁 **`/src/types`** - Types TypeScript

Définitions des interfaces pour un typage fort :

```typescript
// Parking.ts
interface Parking {
  id: number;
  nom: string;
  latitude: number;
  longitude: number;
  places_disponibles: number;
  // ...
}

// User.ts
interface User {
  id: number;
  email: string;
  nom: string;
  // ...
}
```
