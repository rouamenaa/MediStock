# Medication Catalog Service — Medistock

Microservice **Base de référence des médicaments** pour la plateforme Medistock.

## Rôle

- Référentiel des médicaments (nom, forme, dosage, principe actif, laboratoire).
- **Ajouter médicament** : création et mise à jour de médicaments.
- **Associer catégories** : liaison médicament ↔ catégories thérapeutiques.
- **Gérer équivalents (génériques)** : lier un médicament générique à un médicament de référence.
- **Rechercher par principe actif** : recherche par DCI (nom ou code du principe actif).

## Stack

- **Java 17**, **Spring Boot 3.2**
- **Spring Data JPA**, **MySQL** (Catalog DB)
- Port par défaut : **8085**

## Base de données (MySQL)

Créer la base et l’utilisateur (exemple) :

```sql
CREATE DATABASE catalog_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'medistock'@'%' IDENTIFIED BY 'medistock';
GRANT ALL ON catalog_db.* TO 'medistock'@'%';
FLUSH PRIVILEGES;
```

Variables d’environnement optionnelles :

- `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`
- `SERVER_PORT` (défaut : 8085)

## Démarrage

```bash
mvn spring-boot:run
```

## API REST (préfixe `/api/catalog`)

### Médicaments (`/api/catalog/medications`)

| Méthode | URL | Description |
|--------|-----|-------------|
| POST | `/medications` | Ajouter un médicament |
| PUT | `/medications/{id}` | Mettre à jour un médicament |
| GET | `/medications/{id}` | Détail d’un médicament |
| GET | `/medications?name=` | Recherche par nom |
| GET | `/medications/search/by-active-principle?q=` | **Recherche par principe actif** (nom ou code) |
| GET | `/medications/by-active-principle/{activePrincipleId}` | Liste par ID de principe actif |
| PUT | `/medications/{id}/categories` | Associer des catégories (body: `{ "categoryIds": [1, 2] }`) |
| POST | `/medications/{referenceId}/generics` | Ajouter un équivalent générique (body: `{ "genericMedicationId": 5 }`) |
| GET | `/medications/{referenceId}/generics` | Liste des génériques d’un médicament de référence |
| DELETE | `/medications/{id}/generic-reference` | Retirer l’association générique |

### Principes actifs (`/api/catalog/active-principles`)

| Méthode | URL | Description |
|--------|-----|-------------|
| GET | `/active-principles` | Liste (optionnel : `?search=paracétamol`) |
| GET | `/active-principles/{id}` | Détail |
| POST | `/active-principles` | Créer |
| PUT | `/active-principles/{id}` | Mettre à jour |

### Catégories (`/api/catalog/categories`)

| Méthode | URL | Description |
|--------|-----|-------------|
| GET | `/categories` | Liste |
| GET | `/categories/{id}` | Détail |
| POST | `/categories` | Créer |
| PUT | `/categories/{id}` | Mettre à jour |

## Exemple : ajouter un médicament

1. Créer un principe actif (si besoin) :
   ```json
   POST /api/catalog/active-principles
   { "code": "PARACETAMOL", "name": "Paracétamol", "description": "Antalgique, antipyrétique" }
   ```

2. Créer des catégories (si besoin) :
   ```json
   POST /api/catalog/categories
   { "name": "Antalgiques", "description": "Contre la douleur" }
   ```

3. Ajouter le médicament :
   ```json
   POST /api/catalog/medications
   {
     "name": "Doliprane 1000mg",
     "form": "comprimé",
     "dosage": "1000 mg",
     "activePrincipleId": 1,
     "categoryIds": [1],
     "laboratory": "Sanofi"
   }
   ```

## Intégration Eureka et API Gateway

- Ce service est **client Eureka** : il s’enregistre auprès du serveur Eureka (par défaut `http://localhost:8761/eureka/`). Variable : `EUREKA_URI`.
- L’**API Gateway** route les requêtes `http://localhost:8080/api/catalog/**` vers ce service via la découverte Eureka (`lb://medication-catalog-service`).

---

**Medistock** — Plateforme centralisée de disponibilité des médicaments.
