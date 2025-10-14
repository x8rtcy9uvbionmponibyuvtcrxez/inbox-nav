"use client";

import { useState } from "react";

export type CSVRow = Record<string, string>;

export type ValidationError = {
  row: number;
  field?: string;
  message: string;
  type: 'missing' | 'invalid' | 'duplicate' | 'format';
};

export default function CSVUpload({
  expectedHeaders,
  optionalHeaders = [],
  onParsed,
  cta,
}: {
  expectedHeaders: string[];
  optionalHeaders?: string[];
  onParsed: (rows: CSVRow[]) => void;
  cta: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [rowsPreview, setRowsPreview] = useState<CSVRow[] | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // Domain validation regex
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?)*$/;

  const validateRow = (row: CSVRow, rowIndex: number, headers: string[]): ValidationError[] => {
    const errors: ValidationError[] = [];
    const rowNumber = rowIndex + 2; // +2 because we start from 0 and skip header row

    // Check for missing required fields
    expectedHeaders.forEach(header => {
      if (!row[header] || row[header].trim() === '') {
        errors.push({
          row: rowNumber,
          field: header,
          message: `Missing required field: ${header}`,
          type: 'missing'
        });
      }
    });

    // Validate email format if email field exists
    if (row.email && !emailRegex.test(row.email)) {
      errors.push({
        row: rowNumber,
        field: 'email',
        message: 'Invalid email format',
        type: 'format'
      });
    }

    // Validate domain format if domain field exists
    if (row.domain && !domainRegex.test(row.domain)) {
      errors.push({
        row: rowNumber,
        field: 'domain',
        message: 'Invalid domain format',
        type: 'format'
      });
    }

    return errors;
  };

  const handleFile = async (file: File | null) => {
    setError(null);
    setRowsPreview(null);
    setValidationErrors([]);
    if (!file) return;

    setIsValidating(true);
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) throw new Error("Empty CSV");
      
      const headers = lines[0].split(',').map(h => h.trim());
      const missing = expectedHeaders.filter(h => !headers.includes(h));
      if (missing.length) throw new Error(`Missing headers: ${missing.join(', ')}`);
      
      const allowedHeaders = new Set([...expectedHeaders, ...optionalHeaders]);
      const unexpected = headers.filter((header) => header && !allowedHeaders.has(header));
      if (unexpected.length) {
        console.warn('[CSVUpload] Unexpected headers encountered:', unexpected);
      }
      
      const rows: CSVRow[] = [];
      const allErrors: ValidationError[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',');
        const row: CSVRow = {};
        headers.forEach((h, idx) => row[h] = (cols[idx] || '').trim());
        rows.push(row);
        
        // Validate each row
        const rowErrors = validateRow(row, i - 1, headers);
        allErrors.push(...rowErrors);
      }
      
      setValidationErrors(allErrors);
      setRowsPreview(rows.slice(0, 5));
      
      if (allErrors.length === 0) {
        onParsed(rows);
      } else {
        setError(`Found ${allErrors.length} validation error(s). Please fix them before proceeding.`);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to parse CSV');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input 
          type="file" 
          accept=".csv" 
          onChange={e => handleFile(e.target.files?.[0] ?? null)} 
          className="text-sm" 
          disabled={isValidating}
        />
        <span className="text-xs text-gray-400">{cta}</span>
        {isValidating && <span className="text-xs text-blue-400">Validating...</span>}
      </div>
      
      {error && (
        <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/10">
          <div className="text-sm text-red-400 font-medium">{error}</div>
        </div>
      )}
      
      {validationErrors.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-red-400">
            Validation Errors ({validationErrors.length})
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {validationErrors.slice(0, 10).map((err, idx) => (
              <div key={idx} className="text-xs text-red-300 p-2 rounded border border-red-500/20 bg-red-500/5">
                <span className="font-medium">Row {err.row}</span>
                {err.field && <span className="text-red-400"> • {err.field}</span>}
                <span className="text-red-300">: {err.message}</span>
              </div>
            ))}
            {validationErrors.length > 10 && (
              <div className="text-xs text-gray-400 p-2">
                ... and {validationErrors.length - 10} more errors
              </div>
            )}
          </div>
        </div>
      )}
      
      {rowsPreview && validationErrors.length === 0 && (
        <div className="text-xs text-green-400">✓ Valid CSV with {rowsPreview.length} rows (showing up to 5)</div>
      )}
    </div>
  );
}
