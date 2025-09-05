import React from 'react';
import { Play, BookOpen } from 'lucide-react';

interface ExampleSectionProps {
  onLoadExample: (json: string) => void;
}

export function ExampleSection({ onLoadExample }: ExampleSectionProps) {
  const exampleSwagger = {
    "openapi": "3.0.3",
    "info": {
      "title": "Pet Store API",
      "version": "1.0.0"
    },
    "servers": [{ "url": "https://api.example.com/v1" }],
    "paths": {
      "/pets": {
        "get": {
          "summary": "List pets",
          "responses": {
            "200": {
              "description": "OK",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "items": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "id": { "type": "integer" },
                            "name": { "type": "string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "post": {
          "operationId": "CreatePet",
          "responses": {
            "201": {
              "description": "Created",
              "content": {
                "application/json": {
                  "example": { "id": 1, "name": "Fido" }
                }
              }
            }
          }
        }
      },
      "/pets/{id}": {
        "get": {
          "summary": "Get pet by ID",
          "responses": {
            "200": {
              "description": "OK",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "id": { "type": "integer" },
                      "name": { "type": "string" },
                      "status": { "type": "string" }
                    }
                  },
                  "example": {
                    "id": 1,
                    "name": "Fido",
                    "status": "available"
                  }
                }
              }
            }
          }
        }
      }
    }
  };

  const dogCeoExample = {
    "openapi": "3.0.3",
    "info": {
      "title": "Dog CEO API",
      "version": "1.0.0"
    },
    "servers": [{ "url": "https://dog.ceo/api" }],
    "paths": {
      "/breeds/image/random": {
        "get": {
          "summary": "Dog CEO – Random Dog Image",
          "responses": {
            "200": {
              "description": "Random dog image",
              "content": {
                "application/json": {
                  "example": {
                    "message": "https://images.dog.ceo/breeds/hound-afghan/n02088094_1003.jpg",
                    "status": "success"
                  }
                }
              }
            }
          }
        }
      }
    }
  };

  const handleLoadExample = (example: any) => {
    const jsonString = JSON.stringify(example, null, 2);
    onLoadExample(jsonString);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <BookOpen className="w-5 h-5 mr-2 text-green-600" />
        Try Examples
      </h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
          <div>
            <h4 className="font-medium text-gray-900">Pet Store API</h4>
            <p className="text-sm text-gray-600">
              Basic CRUD operations with different response types
            </p>
          </div>
          <button
            onClick={() => handleLoadExample(exampleSwagger)}
            className="flex items-center px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors"
          >
            <Play className="w-4 h-4 mr-1" />
            Try
          </button>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
          <div>
            <h4 className="font-medium text-gray-900">Dog CEO API</h4>
            <p className="text-sm text-gray-600">
              Matches the reference example from the specification
            </p>
          </div>
          <button
            onClick={() => handleLoadExample(dogCeoExample)}
            className="flex items-center px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors"
          >
            <Play className="w-4 h-4 mr-1" />
            Try
          </button>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <h4 className="text-sm font-medium text-blue-900 mb-1">
          Supported Formats
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• OpenAPI 3.x JSON documents</li>
          <li>• Swagger 2.0 JSON documents</li>
          <li>• Media types ending with +json (e.g., application/hal+json)</li>
        </ul>
      </div>
    </div>
  );
}