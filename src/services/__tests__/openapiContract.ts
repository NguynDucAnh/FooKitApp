import fs from 'node:fs';
import path from 'node:path';

interface OpenApiSchema {
  properties?: Record<string, unknown>;
  $ref?: string;
}

interface OpenApiOperation {
  requestBody?: {
    content?: Record<string, {
      schema?: OpenApiSchema;
    }>;
  };
}

interface OpenApiDocument {
  paths: Record<string, Record<string, OpenApiOperation>>;
  components: {
    schemas: Record<string, OpenApiSchema>;
  };
}

const OPENAPI_PATH = path.resolve(
  process.cwd(),
  '.agents/skills/fookit-react-native/references/openapi-v1.json'
);
const FALLBACK_CONTRACT_PATH = path.resolve(
  __dirname,
  'fixtures/openapi-request-contracts.json'
);

let cachedDocument: OpenApiDocument | null = null;

function getDocument() {
  if (!cachedDocument) {
    const contractPath = fs.existsSync(OPENAPI_PATH)
      ? OPENAPI_PATH
      : FALLBACK_CONTRACT_PATH;
    cachedDocument = JSON.parse(fs.readFileSync(contractPath, 'utf8')) as OpenApiDocument;
  }
  return cachedDocument;
}

export function getJsonRequestFieldNames(route: string, method: string) {
  const document = getDocument();
  const operation = document.paths[route]?.[method.toLowerCase()];
  const schema = operation?.requestBody?.content?.['application/json']?.schema;

  if (!schema) {
    throw new Error(`OpenAPI request schema not found for ${method.toUpperCase()} ${route}`);
  }

  const resolvedSchema = schema.$ref
    ? document.components.schemas[schema.$ref.split('/').pop() ?? '']
    : schema;

  if (!resolvedSchema?.properties) {
    throw new Error(`OpenAPI request properties not found for ${method.toUpperCase()} ${route}`);
  }

  return Object.keys(resolvedSchema.properties).sort();
}
