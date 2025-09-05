import { useState, useEffect } from 'react';
import { Copy, Play, X, FileText, Clock, CheckCircle } from 'lucide-react';
import { convertSwaggerToBolt, isValidSwaggerDoc } from './services/swagger-converter';

const DEFAULT_SWAGGER = `{
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
}`;

function App() {
  const [inputSpec, setInputSpec] = useState(DEFAULT_SWAGGER);
  const [output, setOutput] = useState('');
  const [inputError, setInputError] = useState('');
  const [prettyPrint, setPrettyPrint] = useState(false);
  const [wordWrap, setWordWrap] = useState(true);
  const [statusBadge, setStatusBadge] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCharCount(inputSpec.length);
  }, [inputSpec]);

  const handleInputChange = (value: string) => {
    setInputSpec(value);
    setInputError('');
  };

  const handleGenerate = async () => {
    setInputError('');
    setOutput('');
    setStatusBadge('');
    setLoading(true);

    let parsedJson;
    try {
      parsedJson = JSON.parse(inputSpec);
    } catch (e) {
      setInputError(`Invalid JSON: ${(e as Error).message}`);
      setLoading(false);
      return;
    }

    if (prettyPrint) {
      setInputSpec(JSON.stringify(parsedJson, null, 2));
    }

    // Validate if it's a valid Swagger/OpenAPI document
    if (!isValidSwaggerDoc(parsedJson)) {
      setInputError('Body must contain a valid OpenAPI/Swagger JSON document.');
      setLoading(false);
      return;
    }

    const startTime = performance.now();
    try {
      // Process the conversion client-side
      const text = convertSwaggerToBolt(parsedJson);
      const elapsed = Math.max(1, Math.round(performance.now() - startTime));
      setStatusBadge(`200 OK • ${elapsed}ms`);
      setOutput(text);
    } catch (error) {
      setStatusBadge('Processing error');
      setInputError(String(error));
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setInputSpec('');
    setInputError('');
    setOutput('');
    setStatusBadge('');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatCharCount = (count: number) => {
    return `${count.toLocaleString()} chars`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <FileText className="w-7 h-7 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              Swagger-Bolt – Test Harness
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Test the Swagger to Bolt.new converter API endpoint
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
                Swagger/OpenAPI JSON
              </h2>
              
              {/* Controls Row */}
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <button
                  id="btnRun"
                  onClick={handleGenerate}
                  disabled={loading || !inputSpec.trim()}
                  className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Generate Descriptors
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
                  <span className="text-gray-700">Pretty-print input before send</span>
                </label>
              </div>

              {/* Character Count */}
              <div id="lblChars" className="text-xs text-gray-500">
                {formatCharCount(charCount)}
              </div>
            </div>

            {/* Input Error */}
            {inputError && (
              <div id="inputError" className="mx-4 mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{inputError}</p>
              </div>
            )}

            {/* Textarea */}
            <div className="flex-1 p-4">
              <textarea
                id="inputSpec"
                value={inputSpec}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Paste OpenAPI/Swagger JSON…"
                className="w-full h-full resize-none border border-gray-300 rounded-md p-3 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ minHeight: '420px' }}
              />
            </div>
          </div>

          {/* Right Column - Output */}
          <div className="bg-white rounded-lg shadow-sm border flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  Output (text/plain)
                </h2>
                
                <div className="flex items-center space-x-3">
                  {statusBadge && (
                    <div id="badgeStatus" className="flex items-center px-2 py-1 bg-gray-100 rounded-md text-xs font-medium text-gray-700">
                      <Clock className="w-3 h-3 mr-1" />
                      {statusBadge}
                    </div>
                  )}
                  
                  <button
                    id="btnCopy"
                    onClick={handleCopy}
                    disabled={!output}
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

              {/* Word Wrap Toggle */}
              <label className="flex items-center space-x-2 text-sm">
                <input
                  id="toggleWordWrap"
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
              <pre
                id="txtOutput"
                className="w-full h-full bg-gray-50 border border-gray-200 rounded-md p-3 font-mono text-sm overflow-auto"
                style={{
                  whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
                  minHeight: '420px'
                }}
              >
                {output || (loading ? 'Processing...' : 'Output will appear here after conversion')}
              </pre>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;