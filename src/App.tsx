import React, { useState } from 'react';
import { SwaggerInput } from './components/SwaggerInput';
import { BoltOutput } from './components/BoltOutput';
import { ExampleSection } from './components/ExampleSection';
import { Header } from './components/Header';

function App() {
  const [output, setOutput] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleConvert = async (swaggerJson: string) => {
    setLoading(true);
    setError('');
    setOutput('');

    try {
      const parsedJson = JSON.parse(swaggerJson);
      
      const response = await fetch('/api/swagger-bolt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsedJson),
      });

      const result = await response.text();

      if (!response.ok) {
        setError(result);
      } else {
        setOutput(result);
      }
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Invalid JSON format. Please check your input.');
      } else {
        setError('An error occurred while processing the request.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <SwaggerInput onConvert={handleConvert} loading={loading} />
            <ExampleSection onLoadExample={handleConvert} />
          </div>
          
          <div>
            <BoltOutput 
              output={output} 
              error={error} 
              loading={loading} 
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;