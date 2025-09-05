import React from 'react';
import { Copy, Download, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface BoltOutputProps {
  output: string;
  error: string;
  loading: boolean;
}

export function BoltOutput({ output, error, loading }: BoltOutputProps) {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadAsFile = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bolt-api-descriptors.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-fit">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Bolt.new API Descriptors
        </h2>
        
        {output && (
          <div className="flex items-center space-x-2">
            <button
              onClick={copyToClipboard}
              className="flex items-center px-3 py-1 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded-md transition-colors"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </>
              )}
            </button>
            
            <button
              onClick={downloadAsFile}
              className="flex items-center px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
            >
              <Download className="w-4 h-4 mr-1" />
              Download
            </button>
          </div>
        )}
      </div>

      <div className="min-h-64">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <Loader2 className="w-6 h-6 mr-2 animate-spin" />
            Processing your Swagger document...
          </div>
        ) : error ? (
          <div className="flex items-start p-4 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800 mb-1">
                Conversion Error
              </h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        ) : output ? (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-2">
              Generated {output.split('\n\n').filter(block => block.trim()).length} API descriptor(s)
            </div>
            <pre className="bg-gray-50 p-4 rounded-md text-sm font-mono whitespace-pre-wrap overflow-x-auto border">
              {output}
            </pre>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Your converted API descriptors will appear here</p>
              <p className="text-sm mt-1">Paste your Swagger JSON and click convert</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FileText({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}