# mcp-outils-metier

Serveur MCP de démonstration, en TypeScript, qui donne trois outils métier à Claude. Les appels aux API sont simulés.

Fait en une journée, en octobre 2026.

## Ce que ça fait

MCP (Model Context Protocol) permet à Claude d'appeler des outils externes. Ce serveur en expose trois :

| Outil | Arguments | Réponse |
|---|---|---|
| `coda_add_meeting_summary` | `title`, `date` (YYYY-MM-DD), `summary`, `actionItems` (liste) | Confirme l'ajout du compte rendu de réunion dans Coda, avec le nombre d'actions. Prévu pour le flux Noota, Claude, Coda. |
| `coda_hygiene_purge` | `daysOld` (nombre), `dryRun` (booléen, optionnel) | Annonce la purge des tâches plus vieilles que `daysOld` jours. |
| `locatik_sync_tenant` | `tenantEmail` (e-mail valide), `status` (`En attente`, `Validé` ou `Refusé`) | Confirme la mise à jour du dossier du candidat locataire et annonce une relance Brevo. |

`dryRun` vaut `true` quand il est absent. Il faut passer `dryRun: false` pour demander une suppression.

### Les appels sont simulés

Aucun outil ne contacte Coda, Locatik ou Brevo. Le code ne contient ni appel réseau ni clé d'API.

- `coda_add_meeting_summary` écrit une ligne `[Mock Coda API]` sur la sortie d'erreur et renvoie un message de succès. Rien n'est enregistré.
- `coda_hygiene_purge` renvoie toujours 12 tâches, une valeur écrite en dur. Rien n'est supprimé, même avec `dryRun: false`.
- `locatik_sync_tenant` renvoie un message de succès. Aucun statut n'est modifié, aucune relance n'est envoyée.

## Comment c'est fait

- TypeScript 5, strict, cible ES2022, modules NodeNext.
- Node.js 20 (image Docker et CI).
- `@modelcontextprotocol/sdk` pour le serveur, avec le transport stdio.
- `zod` pour valider les arguments de chaque outil.
- `tsx` pour le mode développement.
- Tout le code tient dans un fichier : `src/index.ts`.

## Lancer le projet

Le serveur parle MCP sur l'entrée et la sortie standard (stdio). Lancé à la main, il affiche une ligne sur la sortie d'erreur puis attend des messages MCP.

### Avec npm

```bash
git clone https://github.com/Rateur/mcp-outils-metier.git
cd mcp-outils-metier
npm install
npm run build
npm start
```

`npm run dev` relance le serveur à chaque modification de `src/index.ts`.

### Avec Docker

```bash
docker build -t mcp-outils-metier .
docker run -i mcp-outils-metier
```

L'option `-i` est obligatoire : MCP passe par stdio, le conteneur doit garder l'entrée standard ouverte. Le conteneur n'ouvre aucun port.

### Avec Claude Desktop

Ajoute ceci dans `claude_desktop_config.json`, puis redémarre Claude Desktop :

```json
{
  "mcpServers": {
    "outils-metier": {
      "command": "node",
      "args": ["/chemin/vers/mcp-outils-metier/build/index.js"]
    }
  }
}
```

Pour utiliser l'image Docker à la place :

```json
{
  "mcpServers": {
    "outils-metier": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "mcp-outils-metier"]
    }
  }
}
```

Exemple de demande à Claude : « Fais une purge d'hygiène sur Coda pour les tâches de plus de 30 jours. » Claude appelle `coda_hygiene_purge` et affiche la réponse simulée.

## État et limites

- Version 1.0.0. Démonstration, pas un outil de production.
- Aucun test automatique. La CI (GitHub Actions, sur push et pull request vers `main`) installe les dépendances avec `npm ci`, compile le TypeScript et vérifie que `build/index.js` existe. Elle ne lance pas le serveur.
- `date` est une simple chaîne : le format YYYY-MM-DD n'est pas vérifié.
- Pas d'authentification ni de journalisation, hors deux messages sur la sortie d'erreur (démarrage et ajout de réunion).
- Brancher de vraies API demande de remplacer les réponses écrites en dur dans `src/index.ts` par des appels réseau et de gérer les clés d'API.

## Auteur

Valentin Périès, développeur IA à Lyon. [valentinperies.fr](https://valentinperies.fr) · [GitHub](https://github.com/Rateur)

Licence ISC, déclarée dans `package.json`. Le dépôt ne contient pas de fichier `LICENSE`.
