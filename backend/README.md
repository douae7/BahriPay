# Bahripay — Backend Java 21 / Spring Boot 3 / MySQL

Backend REST complet pour l'application de gestion maritime et halieutique **Bahripay**, conçu pour alimenter directement le frontend React (via Axios).

## 1. Stack Technique

- **Java 21** & **Maven**
- **Spring Boot 3.3.5** (Web, Security, Data JPA, Validation)
- **JWT (JJWT 0.12.6)** + **BCrypt** + gestion de liste noire de déconnexion (`TokenBlacklistService`)
- **MySQL 8+** (`schema.sql` avec 19 tables normalisées + `data.sql` + `DataInitializer`)
- **OceanAI** : analyse historique réelle depuis MySQL + intégration Gemini côté serveur optionnelle (`GEMINI_API_KEY`)

---

## 2. Architecture & Base de Données (19 Entités)

1. `User` (`users`)
2. `Role` (`roles`)
3. `Marin` (`marins`)
4. `Grade` (`grades`)
5. `Contrat` (`contrats`)
6. `Absence` (`absences`)
7. `DocumentAdministratif` (`documents_administratifs`)
8. `Bateau` (`bateaux`)
9. `SortiePeche` (`sorties_peche`)
10. `Equipage` (`equipages`)
11. `EspecePoisson` (`especes_poisson`)
12. `ProductionPeche` (`productions_peche`)
13. `Vente` (`ventes`)
14. `Depense` (`depenses`)
15. `RegleRepartition` (`regles_repartition`) — **configurable en base, jamais codée en dur**
16. `Paiement` (`paiements`)
17. `FichePaiement` (`fiches_paiement`)
18. `Notification` (`notifications`)
19. `PredictionIA` (`predictions_ia`)

---

## 3. Démarrage Rapide

### Prérequis
- JDK 21+
- Maven 3.9+
- MySQL 8.0+ démarré localement sur `localhost:3306`

### Configuration
Copiez `backend/.env.example` ou exportez vos variables d'environnement :

```bash
export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=bahripay_maritime
export DB_USERNAME=root
export DB_PASSWORD=votre_mot_de_passe
export JWT_SECRET=BahripayMaritimeSecureJwtSecretKey2026ConcarneauLorientSeteLaRochelle!
# Optionnel : pour activer Gemini côté serveur dans OceanAI
export GEMINI_API_KEY=votre_cle_gemini
```

### Compilation & Lancement

```bash
cd backend
mvn clean compile
mvn spring-boot:run
```

Le serveur démarre sur **`http://localhost:8080`** avec création automatique de la base `bahripay_maritime`, exécution de `schema.sql`, `data.sql`, et création des comptes utilisateurs via `DataInitializer`.

### Comptes de Démonstration Seedés
Mot de passe commun (haché en BCrypt) : **`Bahripay2026!`**
- **Armateur** : `direction@bahripay-armement.fr`
- **Capitaine** : `y.keravec@bahripay-armement.fr`
- **Financier** : `finances@bahripay-armement.fr`
- **Observateur** : `audit@bahripay-armement.fr`
- **Admin** : `admin@bahripay-armement.fr`

---

## 4. Endpoints REST (`/api/*`)

- **Auth & Utilisateurs** : `/api/auth/{register,login,demo-login,refresh,logout,forgot-password,me}`, `/api/users`
- **Marins & RH** : `/api/marins`, `/api/grades`, `/api/contrats`, `/api/absences`, `/api/documents` (`POST /upload`, `GET /{id}/download`)
- **Flotte & Pêche** : `/api/bateaux`, `/api/sorties` (`PUT /{id}/equipage`), `/api/especes`, `/api/productions`
- **Finances & Paie à la part** : `/api/ventes`, `/api/depenses`, `/api/paiements` (`GET/PUT /regle-repartition`, `POST /generer/{sortieId}`, `PATCH /{id}/payer`, `GET /{id}/fiche`)
- **Tableau de bord, Alertes & IA** : `/api/dashboard/{summary,monthly,vessels}`, `/api/notifications`, `/api/ai/{analyse,ask,history}`

---

## 5. Tests Rapides via `curl`

```bash
# 1. Connexion JWT
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"direction@bahripay-armement.fr","password":"Bahripay2026!"}' \
  | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8')); console.log(d.token);")

# 2. Vérifier le Dashboard calculé depuis MySQL
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/dashboard/summary

# 3. Vérifier la règle de répartition en base et analyser OceanAI
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/paiements/regle-repartition
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/ai/analyse
```
