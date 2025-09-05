import React, { useState } from 'react';
import { Upload, Code, Loader2 } from 'lucide-react';

interface SwaggerInputProps {
  onConvert: (json: string) => void;
  loading: boolean;
}

export function SwaggerInput({ onConvert, loading }: SwaggerInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onConvert(input.trim());
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setInput(content);
      };
      reader.readAsText(file);
    }
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed, null, 2));
    } catch (err) {
      // Invalid JSON, do nothing
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Code className="w-5 h-5 mr-2 text-blue-600" />
          Swagger/OpenAPI JSON Input
        </h2>
        
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={formatJson}
            disabled={!input.trim() || loading}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
          >
            Format JSON
          </button>
          
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
              disabled={loading}
            />
            <div className="flex items-center px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors">
              <Upload className="w-4 h-4 mr-1" />
              Upload File
            </div>
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your OpenAPI 3.x or Swagger 2.0 JSON document here..."
            className="w-full h-64 p-4 border border-gray-300 rounded-md font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Converting...
            </>
          ) : (
            'Convert to Bolt.new Format'
          )}
        </button>
      </form>
    </div>
  );
}