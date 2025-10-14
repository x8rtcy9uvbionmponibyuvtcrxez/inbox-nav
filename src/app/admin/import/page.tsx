"use client";

import { useState, useCallback } from 'react';
import { validateCSVAction, importCSVAction, type CSVRow, type ValidationResult, type ImportResult } from './actions';
import { CloudArrowUpIcon, CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function ImportPage() {
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const parseCSV = useCallback((text: string): CSVRow[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'));
    const rows: CSVRow[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: CSVRow = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      rows.push(row);
    }
    
    return rows;
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    setIsLoading(true);
    try {
      const text = await file.text();
      const parsed = parseCSV(text);
      setCsvData(parsed);
      setValidation(null);
      setImportResult(null);
    } catch (error) {
      console.error('File parsing error:', error);
      alert('Error parsing CSV file');
    } finally {
      setIsLoading(false);
    }
  }, [parseCSV]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, [handleFileUpload]);

  const handleValidate = async () => {
    if (csvData.length === 0) return;
    
    setIsLoading(true);
    try {
      const result = await validateCSVAction(csvData);
      setValidation(result);
    } catch (error) {
      console.error('Validation error:', error);
      alert('Validation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!validation?.isValid || csvData.length === 0) return;
    
    setIsLoading(true);
    try {
      const result = await importCSVAction(csvData);
      setImportResult(result);
      
      if (result.success) {
        setCsvData([]);
        setValidation(null);
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('Import failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">CSV Import</h1>
          <p className="text-gray-400">Import existing client data from CSV files</p>
        </div>

        {/* File Upload Area */}
        <div className="mb-8">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-indigo-500 bg-indigo-500/10' 
                : 'border-gray-700 hover:border-gray-600'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <CloudArrowUpIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium">
                {dragActive ? 'Drop your CSV file here' : 'Upload CSV file'}
              </p>
              <p className="text-gray-400">
                Drag and drop or click to select a CSV file
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md cursor-pointer transition-colors"
              >
                Choose File
              </label>
            </div>
          </div>
        </div>

        {/* CSV Preview */}
        {csvData.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">CSV Preview</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleValidate}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-md transition-colors"
                >
                  {isLoading ? 'Validating...' : 'Validate'}
                </button>
                {validation?.isValid && (
                  <button
                    onClick={handleImport}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    {isLoading ? 'Importing...' : 'Import Data'}
                  </button>
                )}
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-800">
                    <tr>
                      {Object.keys(csvData[0] || {}).map((header) => (
                        <th key={header} className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {csvData.slice(0, 10).map((row, index) => (
                      <tr key={index} className="hover:bg-gray-800/50">
                        {Object.values(row).map((value, cellIndex) => (
                          <td key={cellIndex} className="px-4 py-3 text-sm text-gray-300">
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {csvData.length > 10 && (
                <div className="px-4 py-3 bg-gray-800 text-sm text-gray-400">
                  Showing first 10 rows of {csvData.length} total rows
                </div>
              )}
            </div>
          </div>
        )}

        {/* Validation Results */}
        {validation && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Validation Results</h2>
            
            <div className="space-y-4">
              {/* Errors */}
              {validation.errors.length > 0 && (
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircleIcon className="h-5 w-5 text-red-400" />
                    <h3 className="font-medium text-red-400">Errors ({validation.errors.length})</h3>
                  </div>
                  <ul className="space-y-1">
                    {validation.errors.map((error, index) => (
                      <li key={index} className="text-sm text-red-300">• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {validation.warnings.length > 0 && (
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                    <h3 className="font-medium text-yellow-400">Warnings ({validation.warnings.length})</h3>
                  </div>
                  <ul className="space-y-1">
                    {validation.warnings.map((warning, index) => (
                      <li key={index} className="text-sm text-yellow-300">• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Success */}
              {validation.isValid && validation.errors.length === 0 && (
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-400" />
                    <h3 className="font-medium text-green-400">Validation Passed</h3>
                  </div>
                  <p className="text-sm text-green-300 mt-1">
                    CSV data is valid and ready for import. {csvData.length} rows will be processed.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Import Results */}
        {importResult && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Import Results</h2>
            
            <div className={`rounded-lg p-4 ${
              importResult.success 
                ? 'bg-green-900/20 border border-green-500/30' 
                : 'bg-red-900/20 border border-red-500/30'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {importResult.success ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-400" />
                ) : (
                  <XCircleIcon className="h-5 w-5 text-red-400" />
                )}
                <h3 className={`font-medium ${
                  importResult.success ? 'text-green-400' : 'text-red-400'
                }`}>
                  {importResult.success ? 'Import Successful' : 'Import Failed'}
                </h3>
              </div>
              <p className={`text-sm ${
                importResult.success ? 'text-green-300' : 'text-red-300'
              }`}>
                {importResult.message}
              </p>
              
              {importResult.stats && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-800 rounded p-3">
                    <div className="text-2xl font-bold text-white">{importResult.stats.totalRows}</div>
                    <div className="text-sm text-gray-400">Total Rows</div>
                  </div>
                  <div className="bg-gray-800 rounded p-3">
                    <div className="text-2xl font-bold text-green-400">{importResult.stats.processedRows}</div>
                    <div className="text-sm text-gray-400">Processed</div>
                  </div>
                  <div className="bg-gray-800 rounded p-3">
                    <div className="text-2xl font-bold text-yellow-400">{importResult.stats.skippedRows}</div>
                    <div className="text-sm text-gray-400">Skipped</div>
                  </div>
                  <div className="bg-gray-800 rounded p-3">
                    <div className="text-2xl font-bold text-red-400">{importResult.stats.errors.length}</div>
                    <div className="text-sm text-gray-400">Errors</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CSV Format Help */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <h2 className="text-xl font-semibold mb-4">CSV Format Requirements</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-white mb-2">Required Columns:</h3>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• <code className="bg-gray-800 px-2 py-1 rounded">external_id</code> - Unique identifier for the order</li>
                <li>• <code className="bg-gray-800 px-2 py-1 rounded">client_email</code> - Client’s email address</li>
                <li>• <code className="bg-gray-800 px-2 py-1 rounded">product_type</code> - GOOGLE, PREWARMED, or MICROSOFT</li>
                <li>• <code className="bg-gray-800 px-2 py-1 rounded">quantity</code> - Number of inboxes (10-2000)</li>
                <li>• <code className="bg-gray-800 px-2 py-1 rounded">business_name</code> - Client’s business name</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-white mb-2">Optional Columns:</h3>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• <code className="bg-gray-800 px-2 py-1 rounded">domain</code> - Email domain</li>
                <li>• <code className="bg-gray-800 px-2 py-1 rounded">email</code> - Specific email address</li>
                <li>• <code className="bg-gray-800 px-2 py-1 rounded">persona_name</code> - Persona name</li>
                <li>• <code className="bg-gray-800 px-2 py-1 rounded">password</code> - Email password (will be encrypted)</li>
                <li>• <code className="bg-gray-800 px-2 py-1 rounded">esp_platform</code> - ESP platform (default: Smartlead)</li>
                <li>• <code className="bg-gray-800 px-2 py-1 rounded">tags</code> - Comma-separated tags</li>
                <li>• <code className="bg-gray-800 px-2 py-1 rounded">forwarding_url</code> - Domain forwarding URL</li>
                <li>• <code className="bg-gray-800 px-2 py-1 rounded">forwarding_domain</code> - Inbox forwarding domain</li>
                <li>• <code className="bg-gray-800 px-2 py-1 rounded">stripe_subscription_id</code> - Stripe subscription ID</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
