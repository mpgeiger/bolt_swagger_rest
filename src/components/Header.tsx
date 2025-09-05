import React from 'react';
import { FileText, ArrowRight } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              Swagger to Bolt.new Converter
            </h1>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
          <div className="text-sm text-gray-600">
            Convert OpenAPI/Swagger specs to Bolt.new API descriptors
          </div>
        </div>
        
        <p className="mt-2 text-gray-600 max-w-3xl">
          Transform your OpenAPI 3.x or Swagger 2.0 JSON documents into clean, 
          readable API descriptors formatted for Bolt.new. Simply paste your 
          Swagger JSON and get instant conversion results.
        </p>
      </div>
    </header>
  );
}