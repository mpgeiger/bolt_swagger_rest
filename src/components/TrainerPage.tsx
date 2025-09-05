import React, { useState } from 'react';
import { Play, Search, X, Copy, CheckCircle, AlertCircle, Loader2, FileText } from 'lucide-react';
import { convertSwaggerToBolt, diagnoseSwaggerDoc, isValidSwaggerDoc } from '../services/swagger-converter';

const PRESETS = {
  'minimal-v3': {
    name: 'Minimal v3 (pets)',
    json: {
      "openapi": "3.0.3",
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
        }
      }
    }
  },
  'items-api': {
    name: 'Items API (your sample)',
    json: {
      "openapi": "3.0.3",
      "info": { "title": "Simple Items API", "description": "A basic API for managing a list of items.", "version": "1.0.0" },
      "paths": {
        "/items": {
          "get": {
            "summary": "Retrieve a list of items",
            "responses": {
              "200": {
                "description": "A list of items.",
                "content": {
                  "application/json": {
                    "schema": { "type": "array", "items": { "$ref": "#/components/schemas/Item" } }
                  }
                }
              }
            }
          },
          "post": {
            "summary": "Create a new item",
            "requestBody": {
              "required": true,
              "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Item" } } }
            },
            "responses": { "201": { "description": "Item created successfully." } }
          }
        },
        "/items/{itemId}": {
          "get": {
            "summary": "Retrieve an item by ID",
            "parameters": [{ "name": "itemId", "in": "path", "required": true, "schema": { "type": "integer" } }],
            "responses": {
              "200": { "description": "An item object.", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Item" } } } },
              "404": { "description": "Item not found." }
            }
          },
          "delete": {
            "summary": "Delete an item by ID",
            "parameters": [{ "name": "itemId", "in": "path", "required": true, "schema": { "type": "integer" } }],
            "responses": {
              "204": { "description": "Item deleted successfully." },
              "404": { "description": "Item not found." }
            }
          }
        }
      },
      "components": {
        "schemas": {
          "Item": {
            "type": "object",
            "properties": { "id": { "type": "integer" }, "name": { "type": "string" }, "description": { "type": "string" } }
          }
        }
      }
    }
  }
};

export function TrainerPage() {
  const [input, setInput] = useState(JSON.stringify(PRESETS['items-api'].json, null, 2));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [prettyPrint, setPrettyPrint] = useState(false);
  const [activeTab, setActiveTab] = useState<'descriptors' | 'diagnostics'>('descriptors');
  const [descriptorsOutput, setDescriptorsOutput] = useState('');
  const [diagnosticsOutput, setDiagnosticsOutput] = useState('');
  const [statusBadge, setStatusBadge] = useState('');
  const [copied, setCopied] = useState(false);
  const [wordWrap, setWordWrap] = useState(true);

  const handleInputChange = (value: string) => {
    setInput(value);
    setError('');
  };

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const presetKey = e.target.value;
    if (presetKey && PRESETS[presetKey as keyof typeof PRESETS]) {
      const preset = PRESETS[presetKey as keyof typeof PRESETS];
      setInput(JSON.stringify(preset.json, null, 2));
      setError('');
    }
  };

  const handleRun = async () => {
    await processInput('descriptors');
  };

  const handleDiagnose = async () => {
    await processInput('diagnostics');
  };

  const processInput = async (mode: 'descriptors' | 'diagnostics') => {
    setError('');
    setStatusBadge('');
    setLoading(true);

    let parsedJson;
    try {
      parsedJson = JSON.parse(input);
    } catch (e) {
      setError(`Invalid JSON: ${(e as Error).message}`);
      setLoading(false);
      return;
    }

    if (prettyPrint) {
      setInput(JSON.stringify(parsedJson, null, 2));
    }

    // Validate if it's a valid Swagger/OpenAPI document
    if (!isValidSwaggerDoc(parsedJson)) {
      setError('Body must contain a valid OpenAPI/Swagger JSON document.');
      setLoading(false);
      return;
    }

    const startTime = performance.now();
    try {
      if (mode === 'descriptors') {
        const text = convertSwaggerToBolt(parsedJson);
        setDescriptorsOutput(text);
        setActiveTab('descriptors');
      } else {
        const diagnostic = diagnoseSwaggerDoc(parsedJson);
        setDiagnosticsOutput(JSON.stringify(diagnostic, null, 2));
        setActiveTab('diagnostics');
      }
      
      const elapsed = Math.max(1, Math.round(performance.now() - startTime));
      setStatusBadge(`200 OK • ${elapsed}ms`);
    } catch (error) {
      setStatusBadge('Processing error');
      setError(String(error));
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setInput('');
    setError('');
    setDescriptorsOutput('');
    setDiagnosticsOutput('');
    setStatusBadge('');
  };

  const handleCopy = async () => {
    const content = activeTab === 'descriptors' ? descriptorsOutput : diagnosticsOutput;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatCharCount = (count: number) => {
    return `${count.toLocaleString()} chars`;
  };

  const currentOutput = activeTab === 'descriptors' ? descriptorsOutput : diagnosticsOutput;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <FileText className="w-7 h-7 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              Swagger-Bolt – Trainer
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Advanced testing and diagnostics for the Swagger to Bolt.new converter
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          {/* Left Column - Input */}
          <div className="bg-white rounded-lg shadow-sm border flex flex-col">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Input & Controls
              </h2>
              
              {/* Preset Dropdown */}
              <div className="mb-3">
                <select
                  id="ddlPreset"
                  onChange={handlePresetChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  defaultValue="items-api"
                >
                  <option value="">— choose preset —</option>
                  <option value="minimal-v3">Minimal v3 (pets)</option>
                  <option value="items-api">Items API (your sample)</option>
                </select>
              </div>
              
              {/* Controls Row */}
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <button
                  id="btnRun"
                  onClick={handleRun}
                  disabled={loading || !input.trim()}
                  className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors"
                >
                  {loading && activeTab === 'descriptors' ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Run
                    </>
                  )}
                </button>
                
                <button
                  id="btnDiag"
                  onClick={handleDiagnose}
                  disabled={loading || !input.trim()}
                  className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors"
                >
                  {loading && activeTab === 'diagnostics' ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Diagnosing...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Diagnose
                    </>
                  )}
                </button>
                
                <button
                  id="btnClear"
                  onClick={handleClear}
                  className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </button>
                
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    id="chkPretty"
                    type="checkbox"
                    checked={prettyPrint}
                    onChange={(e) => setPrettyPrint(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Pretty-print</span>
                </label>
              </div>

              {/* Character Count */}
              <div id="lblCount" className="text-xs text-gray-500">
                {formatCharCount(input.length)}
              </div>
            </div>

            {/* Input Error */}
            {error && (
              <div id="errBox" className="mx-4 mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Textarea */}
            <div className="flex-1 p-4">
              <textarea
                id="specInput"
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Paste OpenAPI/Swagger JSON…"
                className="w-full h-full resize-none border border-gray-300 rounded-md p-3 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ minHeight: '500px' }}
              />
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="bg-white rounded-lg shadow-sm border flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  Results
                </h2>
                
                <div className="flex items-center space-x-3">
                  {statusBadge && (
                    <div id="badgeStatus" className="flex items-center px-2 py-1 bg-gray-100 rounded-md text-xs font-medium text-gray-700">
                      {statusBadge}
                    </div>
                  )}
                  
                  <button
                    id="btnCopy"
                    onClick={handleCopy}
                    disabled={!currentOutput}
                    className="flex items-center px-3 py-1 text-sm bg-green-100 hover:bg-green-200 disabled:bg-gray-100 text-green-700 disabled:text-gray-400 rounded-md transition-colors"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        Copy output
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 mb-3">
                <button
                  onClick={() => setActiveTab('descriptors')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    activeTab === 'descriptors'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  Descriptors
                </button>
                <button
                  onClick={() => setActiveTab('diagnostics')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    activeTab === 'diagnostics'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  Diagnostics
                </button>
              </div>

              {/* Word Wrap Toggle */}
              <label className="flex items-center space-x-2 text-sm">
                <input
                  id="toggleWrap"
                  type="checkbox"
                  checked={wordWrap}
                  onChange={(e) => setWordWrap(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">Wrap lines</span>
              </label>
            </div>

            {/* Output Area */}
            <div className="flex-1 p-4">
              {loading ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                  Processing...
                </div>
              ) : (
                <pre
                  id={activeTab === 'descriptors' ? 'outText' : 'outDiag'}
                  className="w-full h-full bg-gray-50 border border-gray-200 rounded-md p-3 font-mono text-sm overflow-auto"
                  style={{
                    whiteSpace: activeTab === 'descriptors' ? (wordWrap ? 'pre-wrap' : 'pre') : 'pre-wrap',
                    minHeight: '500px'
                  }}
                >
                  {currentOutput || (activeTab === 'descriptors' 
                    ? 'Descriptors will appear here after running conversion'
                    : 'Diagnostic report will appear here after running diagnostics'
                  )}
                </pre>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}