"use client";

import { useState } from "react";
import { XMarkIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { parseCsv } from '@/lib/csv';

type CSVRow = {
  existingEmail: string
  newEmail?: string
  firstName?: string
  lastName?: string
  personaName?: string
  password?: string
  status?: string
  tags?: string
  businessName?: string
  forwardingDomain?: string
  espPlatform?: string
}

type UpdateResult = {
  success: number
  warnings: Array<{ email: string; message: string }>
  details: Array<{ email: string; updatedFields: string[] }>
}

export default function BulkInboxUpdate({
  orderId,
  isOpen,
  onClose
}: {
  orderId: string
  isOpen: boolean
  onClose: () => void
}) {
  const [error, setError] = useState<string | null>(null);
  const [rowsPreview, setRowsPreview] = useState<CSVRow[] | null>(null);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<UpdateResult | null>(null);

  const requiredHeaders = ['existingEmail', 'newEmail'];
  const optionalHeaders = ['firstName', 'lastName', 'personaName', 'password', 'status', 'tags', 'businessName', 'forwardingDomain', 'espPlatform'];

  const downloadSampleCSV = () => {
    const sampleData = [
      ['existingEmail', 'newEmail', 'firstName', 'lastName', 'personaName', 'password', 'status', 'tags', 'businessName', 'forwardingDomain', 'espPlatform'],
      ['john@example.com', 'john@newdomain.com', 'John', 'Doe', 'John Doe', 'newpass123', 'LIVE', 'tag1,tag2', 'Example Corp', 'example.com', 'mailgun'],
      ['jane@example.com', 'jane@example.com', 'Jane', 'Smith', 'Jane Smith', '', 'LIVE', '', '', '', '']
    ];

    const csvContent = sampleData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inbox_bulk_update_sample.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = async (file: File | null) => {
    setError(null);
    setRowsPreview(null);
    setTotalRows(0);
    setResult(null);
    if (!file) return;

    try {
      const text = await file.text();
      const parsedRows = parseCsv(text);

      if (parsedRows.length === 0) throw new Error("Empty CSV");

      const headers = parsedRows[0].map(h => h.trim());
      const missing = requiredHeaders.filter(h => !headers.includes(h));
      if (missing.length) throw new Error(`Missing required headers: ${missing.join(', ')}`);

      const rows: CSVRow[] = [];
      for (let i = 1; i < parsedRows.length; i++) {
        const row = parsedRows[i];
        const rowData: CSVRow = { existingEmail: '' };

        headers.forEach((header, index) => {
          const value = row[index]?.trim() || '';
          if (header === 'existingEmail') rowData.existingEmail = value;
          else if (header === 'newEmail') rowData.newEmail = value;
          else if (header === 'firstName') rowData.firstName = value;
          else if (header === 'lastName') rowData.lastName = value;
          else if (header === 'personaName') rowData.personaName = value;
          else if (header === 'password') rowData.password = value;
          else if (header === 'status') rowData.status = value;
          else if (header === 'tags') rowData.tags = value;
          else if (header === 'businessName') rowData.businessName = value;
          else if (header === 'forwardingDomain') rowData.forwardingDomain = value;
          else if (header === 'espPlatform') rowData.espPlatform = value;
        });

        if (rowData.existingEmail) {
          rows.push(rowData);
        }
      }

      if (rows.length === 0) throw new Error("No valid rows found");

      setRowsPreview(rows.slice(0, 5)); // Show first 5 rows
      setTotalRows(rows.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse CSV");
    }
  };

  const handleSubmit = async () => {
    if (!rowsPreview || totalRows === 0) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Re-parse the file to get all rows
      const fileInput = document.getElementById('bulk-csv-input') as HTMLInputElement;
      if (!fileInput.files || !fileInput.files[0]) throw new Error("File not found");

      const text = await fileInput.files[0].text();
      const parsedRows = parseCsv(text);
      const headers = parsedRows[0].map(h => h.trim());

      const rows: CSVRow[] = [];
      for (let i = 1; i < parsedRows.length; i++) {
        const row = parsedRows[i];
        const rowData: CSVRow = { existingEmail: '' };

        headers.forEach((header, index) => {
          const value = row[index]?.trim() || '';
          if (header === 'existingEmail') rowData.existingEmail = value;
          else if (header === 'newEmail') rowData.newEmail = value;
          else if (header === 'firstName') rowData.firstName = value;
          else if (header === 'lastName') rowData.lastName = value;
          else if (header === 'personaName') rowData.personaName = value;
          else if (header === 'password') rowData.password = value;
          else if (header === 'status') rowData.status = value;
          else if (header === 'tags') rowData.tags = value;
          else if (header === 'businessName') rowData.businessName = value;
          else if (header === 'forwardingDomain') rowData.forwardingDomain = value;
          else if (header === 'espPlatform') rowData.espPlatform = value;
        });

        if (rowData.existingEmail) {
          rows.push(rowData);
        }
      }

      const response = await fetch(`/api/admin/orders/${orderId}/inboxes/bulk-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update inboxes');
      }

      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process update');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-white">Bulk Update Inboxes</h2>
            <p className="text-sm text-gray-400 mt-1">Upload CSV to update multiple inboxes at once</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Download Sample */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <ArrowDownTrayIcon className="h-5 w-5 text-blue-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-blue-200 font-medium">Need a template?</p>
                <p className="text-xs text-blue-300/70 mt-1">
                  Download a sample CSV with all available columns and example data
                </p>
              </div>
              <button
                onClick={downloadSampleCSV}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                Download Sample
              </button>
            </div>
          </div>

          {/* CSV Format Info */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-white mb-2">CSV Format</h3>
            <div className="text-xs text-gray-400 space-y-1">
              <p><strong className="text-gray-300">Required columns:</strong> existingEmail, newEmail</p>
              <p><strong className="text-gray-300">Optional columns:</strong> firstName, lastName, personaName, password, status, tags, businessName, forwardingDomain, espPlatform</p>
              <p className="mt-2">• Inboxes are matched by <span className="text-blue-400">existingEmail</span></p>
              <p>• If inbox not found, row will be skipped with warning</p>
              <p>• Leave optional columns empty to keep existing values</p>
              <p>• Tags should be comma-separated: <span className="text-blue-400">tag1,tag2,tag3</span></p>
            </div>
          </div>

          {/* File Upload */}
          {!result && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Upload CSV File
              </label>
              <input
                id="bulk-csv-input"
                type="file"
                accept=".csv"
                onChange={(e) => handleFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Preview */}
          {rowsPreview && !result && (
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">
                Preview ({totalRows} total row{totalRows !== 1 ? 's' : ''})
              </h3>
              <div className="overflow-x-auto border border-gray-800 rounded-lg">
                <table className="min-w-full divide-y divide-gray-800 text-xs">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-3 py-2 text-left text-gray-400">Existing Email</th>
                      <th className="px-3 py-2 text-left text-gray-400">New Email</th>
                      <th className="px-3 py-2 text-left text-gray-400">Name</th>
                      <th className="px-3 py-2 text-left text-gray-400">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800 bg-gray-900">
                    {rowsPreview.map((row, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 text-gray-300">{row.existingEmail}</td>
                        <td className="px-3 py-2 text-blue-300">{row.newEmail || row.existingEmail}</td>
                        <td className="px-3 py-2 text-gray-400">{[row.firstName, row.lastName].filter(Boolean).join(' ') || '—'}</td>
                        <td className="px-3 py-2 text-gray-400">{row.status || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalRows > 5 && (
                <p className="text-xs text-gray-500 mt-2">
                  Showing first 5 rows. All {totalRows} rows will be processed.
                </p>
              )}
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <p className="text-green-300 font-medium">
                  ✓ Updated {result.success} inbox(es) successfully
                </p>
                {result.warnings.length > 0 && (
                  <p className="text-yellow-400 text-sm mt-1">
                    {result.warnings.length} warning(s)
                  </p>
                )}
              </div>

              {/* Warnings */}
              {result.warnings.length > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-yellow-300 mb-2">Warnings</h4>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {result.warnings.map((warning, idx) => (
                      <div key={idx} className="text-xs text-yellow-200">
                        <span className="font-mono">{warning.email}</span>: {warning.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Success Details */}
              {result.details.length > 0 && (
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Updated Inboxes</h4>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {result.details.map((detail, idx) => (
                      <div key={idx} className="text-xs text-gray-300">
                        <span className="font-mono text-blue-300">{detail.email}</span>: {detail.updatedFields.join(', ')}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-4 p-6 border-t border-gray-800">
          {!result ? (
            <>
              <button
                onClick={handleSubmit}
                disabled={!rowsPreview || isProcessing}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : `Update ${totalRows} Inbox${totalRows !== 1 ? 'es' : ''}`}
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setResult(null);
                setRowsPreview(null);
                setTotalRows(0);
                onClose();
                window.location.reload(); // Refresh to show updated data
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Close & Refresh
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
