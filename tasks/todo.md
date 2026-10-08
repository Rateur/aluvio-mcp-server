# Plan du Projet : Aluvio MCP Server

## Contexte
Projet de candidature pour le poste "Alternant·e AI Builder" chez Aluvio. 
L'objectif est de démontrer une maîtrise des technologies demandées (TypeScript, API, IA génératives) et une compréhension des enjeux de l'entreprise (Hygiène Coda, connecteurs MCP, intégration Claude).

## Architecture
Création d'un serveur MCP (Model Context Protocol) en TypeScript.
Ce serveur exposera des "Tools" à Claude pour interagir avec l'écosystème Aluvio de manière fictive mais réaliste (API mockées).

### Tools exposés :
1. `coda_add_meeting_summary` : Traite et formate un compte rendu (Noota -> Claude -> Coda).
2. `coda_hygiene_purge` : Nettoie les vieilles tâches (Balayage des stocks).
3. `locatik_sync_tenant` : Synchronise un dossier locataire.

## Étapes (Progression de la journée)
- [x] 09:00 - Initialisation du projet (Repo, TypeScript, ESLint)
- [x] 10:30 - Mise en place de l'architecture MCP de base (Server, SDK Anthropic)
- [x] 13:00 - Implémentation du tool `coda_add_meeting_summary` (Logique métier)
- [x] 15:00 - Implémentation du tool `coda_hygiene_purge` et `locatik_sync_tenant`
- [x] 16:30 - Tests, documentation et refactoring
- [x] 18:00 - README.md final et préparation au push
