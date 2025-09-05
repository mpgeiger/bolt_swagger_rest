interface SwaggerDoc {
    openapi?: string;
    swagger?: string;
    servers?: Array<{
        url: string;
    }>;
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
    schema?: any;
}
interface MediaType {
    example?: any;
    examples?: Record<string, {
        value: any;
    }>;
    schema?: any;
}
export declare function convertSwaggerToBolt(doc: SwaggerDoc): string;
export {};
