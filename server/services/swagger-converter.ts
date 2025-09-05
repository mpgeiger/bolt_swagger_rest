interface SwaggerDoc {
  openapi?: string;
  swagger?: string;
  servers?: Array<{ url: string }>;
  host?: string;
  basePath?: string;
  schemes?: string[];
  paths: Record<string, Record<string, Operation>>;
}

interface Operation {
  summary?: string;
  operationId?: string;
  responses: Record<string, Response>;
}

interface Response {
  description: string;
  content?: Record<string, MediaType>;
  schema?: any; // For Swagger 2.0
}

interface MediaType {
  example?: any;
  examples?: Record<string, { value: any }>;
  schema?: any;
}

export function convertSwaggerToBolt(doc: SwaggerDoc): string {
  const operations: string[] = [];
  
  // Get base URL
  const baseUrl = getBaseUrl(doc);
  
  // Process each path
  for (const [path, pathItem] of Object.entries(doc.paths)) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (isHttpMethod(method)) {
        const descriptor = createBoltDescriptor(
          operation,
          method.toUpperCase(),
          path,
          baseUrl
        );
        operations.push(descriptor);
      }
    }
  }
  
  return operations.join('\n\n');
}

function getBaseUrl(doc: SwaggerDoc): string {
  // OpenAPI 3.x
  if (doc.servers && doc.servers.length > 0) {
    return doc.servers[0].url.replace(/\/$/, '');
  }
  
  // Swagger 2.0
  if (doc.host) {
    const scheme = doc.schemes?.[0] || 'https';
    const basePath = doc.basePath?.replace(/\/$/, '') || '';
    return `${scheme}://${doc.host}${basePath}`;
  }
  
  return '';
}

function createBoltDescriptor(
  operation: Operation,
  method: string,
  path: string,
  baseUrl: string
): string {
  // Get title
  const title = getOperationTitle(operation, method, path);
  
  // Get endpoint
  const endpoint = baseUrl ? `${baseUrl}${path}` : path;
  
  // Get example response
  const exampleJson = getExampleResponse(operation);
  
  return `API: ${title}
Endpoint: ${endpoint}
Method: ${method}
Response:
${exampleJson}`;
}

function getOperationTitle(operation: Operation, method: string, path: string): string {
  if (operation.summary && operation.summary.trim()) {
    return operation.summary.trim();
  }
  
  if (operation.operationId) {
    return operation.operationId;
  }
  
  return `${method} ${path}`;
}

function getExampleResponse(operation: Operation): string {
  // Find first 2xx response (prefer 200, then 201, then any 2xx)
  const responseKeys = Object.keys(operation.responses);
  const successKey = ['200', '201'].find(key => responseKeys.includes(key)) ||
                    responseKeys.find(key => key.startsWith('2'));
  
  if (!successKey) {
    return '\t{}';
  }
  
  const response = operation.responses[successKey];
  let example = null;
  
  // Try to get example from content (OpenAPI 3.x)
  if (response.content) {
    const jsonContent = findJsonContent(response.content);
    if (jsonContent) {
      // Try direct example
      if (jsonContent.example !== undefined) {
        example = jsonContent.example;
      }
      // Try first example from examples
      else if (jsonContent.examples) {
        const firstExample = Object.values(jsonContent.examples)[0];
        if (firstExample?.value !== undefined) {
          example = firstExample.value;
        }
      }
      // Try schema example
      else if (jsonContent.schema?.example !== undefined) {
        example = jsonContent.schema.example;
      }
      // Generate from schema
      else if (jsonContent.schema) {
        example = generateExampleFromSchema(jsonContent.schema);
      }
    }
  }
  // Try Swagger 2.0 schema
  else if (response.schema) {
    if (response.schema.example !== undefined) {
      example = response.schema.example;
    } else {
      example = generateExampleFromSchema(response.schema);
    }
  }
  
  // Default to empty object if no example found
  if (example === null) {
    example = {};
  }
  
  // Format with tabs
  const jsonString = JSON.stringify(example, null, 2);
  return jsonString.split('\n').map(line => `\t${line}`).join('\n');
}

function findJsonContent(content: Record<string, MediaType>): MediaType | null {
  // Look for exact match first
  if (content['application/json']) {
    return content['application/json'];
  }
  
  // Look for +json suffix
  for (const [mediaType, mediaTypeObj] of Object.entries(content)) {
    if (mediaType.endsWith('+json')) {
      return mediaTypeObj;
    }
  }
  
  return null;
}

function generateExampleFromSchema(schema: any): any {
  if (!schema || typeof schema !== 'object') {
    return {};
  }
  
  // Handle references (simplified)
  if (schema.$ref) {
    return {};
  }
  
  switch (schema.type) {
    case 'string':
      if (schema.format === 'date-time') {
        return '2023-01-01T00:00:00Z';
      }
      if (schema.format === 'uuid') {
        return '123e4567-e89b-12d3-a456-426614174000';
      }
      return 'string';
      
    case 'integer':
      return 0;
      
    case 'number':
      return 0;
      
    case 'boolean':
      return false;
      
    case 'array':
      if (schema.items) {
        return [generateExampleFromSchema(schema.items)];
      }
      return [];
      
    case 'object':
      const obj: any = {};
      if (schema.properties) {
        for (const [key, propSchema] of Object.entries(schema.properties)) {
          obj[key] = generateExampleFromSchema(propSchema);
        }
      }
      return obj;
      
    default:
      return {};
  }
}

function isHttpMethod(method: string): boolean {
  const httpMethods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'];
  return httpMethods.includes(method.toLowerCase());
}