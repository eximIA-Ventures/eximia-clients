export interface EntitySchema {
  [field: string]: string;
}

export interface EntityDefinition {
  operations: string[];
  schema: EntitySchema;
}

export interface Catalog {
  app: string;
  version: string;
  contract: string;
  entities: Record<string, EntityDefinition>;
}

export function getCatalog(): Catalog {
  return {
    app: "eximia-clients",
    version: "1.0.0",
    contract: "eximia-integration/v1",
    entities: {
      clients: {
        operations: ["list", "get", "create", "update"],
        schema: {
          id: "uuid",
          name: "text",
          company: "text",
          email: "text",
          phone: "text",
          logo_url: "text",
          brand_color: "text",
          created_at: "timestamptz",
          updated_at: "timestamptz",
        },
      },
      projects: {
        operations: ["list", "get", "create", "update"],
        schema: {
          id: "uuid",
          client_id: "uuid",
          title: "text",
          description: "text",
          status: "text",
          start_date: "date",
          end_date: "date",
          created_at: "timestamptz",
          updated_at: "timestamptz",
        },
      },
      milestones: {
        operations: ["list", "get", "create", "update"],
        schema: {
          id: "uuid",
          project_id: "uuid",
          title: "text",
          description: "text",
          due_date: "date",
          status: "text",
          sort_order: "integer",
          created_at: "timestamptz",
        },
      },
      updates: {
        operations: ["list", "get", "create"],
        schema: {
          id: "uuid",
          project_id: "uuid",
          title: "text",
          content: "text",
          type: "text",
          created_at: "timestamptz",
        },
      },
      documents: {
        operations: ["list", "get", "create"],
        schema: {
          id: "uuid",
          project_id: "uuid",
          title: "text",
          file_url: "text",
          file_type: "text",
          file_size: "bigint",
          uploaded_at: "timestamptz",
        },
      },
    },
  };
}
