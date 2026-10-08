# Aluvio MCP Server

Ce projet est une candidature technique pour le poste de **Alternant·e AI Builder (Automatisation & IA)** chez [Aluvio Rénovation](https://aluvio.fr/).

Il a été développé en une journée pour démontrer la maîtrise des technologies attendues et une compréhension approfondie des enjeux de l'entreprise.

## Pourquoi ce projet ?

La fiche de poste mentionne :
> "Créer et faire évoluer les skills Claude de l'équipe, et les agents qui travaillent sur Coda, Google Workspace, Brevo, Noota, Pennylane, Locatik."
> "[...] connecteurs MCP, outils et petites applications internes"

Afin de répondre à ce besoin, j'ai développé un **serveur MCP (Model Context Protocol)**. MCP est le tout dernier standard open-source (soutenu par Anthropic/Claude) permettant de connecter les IA génératives (comme Claude Desktop) à des sources de données et outils locaux ou API.

## Fonctionnalités (Tools exposés à Claude)

Ce serveur expose actuellement 3 outils ("Tools") qui simulent les processus d'Aluvio :

1. **`coda_add_meeting_summary`** : 
   - **Cas d'usage** : "comptes rendus de réunion automatiques (Noota -> Claude -> Coda)".
   - **Rôle** : L'IA reçoit un transcript de Noota, le synthétise, puis utilise ce Tool pour l'envoyer dans la base Coda de manière structurée.
2. **`coda_hygiene_purge`** : 
   - **Cas d'usage** : "Hygiène Coda - Balayage des stocks, purges".
   - **Rôle** : Permet à Claude de nettoyer automatiquement les anciennes tâches fermées de Coda. Comprend un mode `dryRun` pour respecter la règle "Aucune action destructive sans validation explicite".
3. **`locatik_sync_tenant`** : 
   - **Cas d'usage** : Automatisation des dossiers candidats locataires (Locatik, Brevo).
   - **Rôle** : Met à jour le statut d'un locataire dans le SI interne et déclenche fictivement les workflows Brevo associés.

## Technologies utilisées

- **TypeScript / Node.js** : Typage fort, standard du marché pour les scripts et API.
- **Model Context Protocol (MCP)** : Standard pour l'extension des capacités des LLMs.
- **Zod** : Validation stricte des inputs (Prompt injection / Structure validation).

## Lancement

### Prérequis
- Node.js > 18 et npm
- *Ou* Docker (si exécution conteneurisée)

### Installation et compilation (Locale)
```bash
npm install
npm run build
```

### Exécution via Docker (Recommandé)
Le serveur est fourni avec un `Dockerfile` multi-stage optimisé pour la production.
```bash
docker build -t aluvio-mcp-server .
docker run -i aluvio-mcp-server
```
*(Note : L'option `-i` est indispensable car MCP communique via `stdio`, le conteneur doit donc écouter l'entrée standard).*

### CI/CD (GitHub Actions)
Le projet inclut une pipeline d'intégration continue (`.github/workflows/ci.yml`) qui vérifie automatiquement l'installation des dépendances et la compilation TypeScript à chaque push ou pull request sur `main`.


### Utiliser avec Claude Desktop
Ajoutez la configuration suivante dans le fichier `claude_desktop_config.json` :

```json
{
  "mcpServers": {
    "aluvio": {
      "command": "node",
      "args": [
        "/chemin/vers/aluvio-mcp-server/build/index.js"
      ]
    }
  }
}
```

Puis redémarrez Claude. Vous pourrez alors demander : *"Peux-tu faire une purge d'hygiène sur Coda pour les tâches de plus de 30 jours ?"* et Claude exécutera l'outil.

## Principes Aluvio respectés

- **Agent-First** : Planification de la tâche via `tasks/todo.md`.
- **Règle #5 des automatisations** : "Aucune action destructive sur les données de production sans validation explicite" (Implémenté via le booléen `dryRun` par défaut sur le script de purge).
- **Simplicité** : Le projet est concis, sans frameworks inutiles (pas de NestJS ou autre overkill).

---
*Projet réalisé par Valentin Périès pour Aluvio (Octobre).*
