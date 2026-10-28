import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const server = new Server(
  {
    name: "mcp-outils-metier",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Schemas
const CodaMeetingSchema = z.object({
  title: z.string().describe("Titre de la réunion"),
  date: z.string().describe("Date de la réunion au format YYYY-MM-DD"),
  summary: z.string().describe("Résumé structuré de la réunion"),
  actionItems: z.array(z.string()).describe("Liste des actions à réaliser"),
});

const CodaPurgeSchema = z.object({
  daysOld: z.number().describe("Nombre de jours avant purge (ex: 30)"),
  dryRun: z.boolean().optional().describe("Mode simulation sans suppression réelle"),
});

const LocatikSyncSchema = z.object({
  tenantEmail: z.string().email().describe("Email du candidat locataire"),
  status: z.enum(["En attente", "Validé", "Refusé"]).describe("Nouveau statut du dossier"),
});

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "coda_add_meeting_summary",
        description: "Ajoute un compte-rendu de réunion structuré dans Coda (Workflow: Noota -> Claude -> Coda)",
        inputSchema: {
          type: "object",
          properties: {
            title: { type: "string", description: "Titre de la réunion" },
            date: { type: "string", description: "Date au format YYYY-MM-DD" },
            summary: { type: "string", description: "Résumé complet" },
            actionItems: { type: "array", items: { type: "string" }, description: "Actions à réaliser" }
          },
          required: ["title", "date", "summary", "actionItems"]
        }
      },
      {
        name: "coda_hygiene_purge",
        description: "Nettoie les vieilles tâches fermées ou obsolètes pour garder Coda propre (Balayage des stocks)",
        inputSchema: {
          type: "object",
          properties: {
            daysOld: { type: "number", description: "Nombre de jours d'ancienneté" },
            dryRun: { type: "boolean", description: "Si true, retourne les tâches à supprimer sans agir" }
          },
          required: ["daysOld"]
        }
      },
      {
        name: "locatik_sync_tenant",
        description: "Synchronise l'état d'un dossier candidat locataire vers Locatik et déclenche une relance",
        inputSchema: {
          type: "object",
          properties: {
            tenantEmail: { type: "string", description: "Email du candidat" },
            status: { type: "string", enum: ["En attente", "Validé", "Refusé"], description: "Statut du dossier" }
          },
          required: ["tenantEmail", "status"]
        }
      }
    ]
  };
});

// Handle tools execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "coda_add_meeting_summary": {
      const args = CodaMeetingSchema.parse(request.params.arguments);
      // Faux appel API vers Coda
      console.error(`[Mock Coda API] Ajout de la réunion : ${args.title}`);
      return {
        content: [{ type: "text", text: `Réunion '${args.title}' enregistrée avec succès dans Coda avec ${args.actionItems.length} actions.` }]
      };
    }

    case "coda_hygiene_purge": {
      const args = CodaPurgeSchema.parse(request.params.arguments);
      const isDry = args.dryRun !== false; // dryRun par défaut à true pour la sécurité
      const deletedCount = 12; // Valeur mockée
      
      return {
        content: [{ 
          type: "text", 
          text: isDry 
            ? `[Dry Run] ${deletedCount} tâches vieilles de plus de ${args.daysOld} jours seraient purgées.`
            : `Succès: ${deletedCount} tâches ont été supprimées de Coda.` 
        }]
      };
    }

    case "locatik_sync_tenant": {
      const args = LocatikSyncSchema.parse(request.params.arguments);
      return {
        content: [{ type: "text", text: `Le dossier du locataire ${args.tenantEmail} a été mis à jour avec le statut: ${args.status}. Relance Brevo programmée.` }]
      };
    }

    default:
      throw new McpError(ErrorCode.MethodNotFound, "Unknown tool");
  }
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("mcp-outils-metier : serveur MCP à l'écoute sur stdio");
}

run().catch(console.error);
