"use client";

import { useState } from "react";

export type CSVRow = Record<string, string>;

export default function CSVUpload({ expectedHeaders, onParsed, cta }: {
  expectedHeaders: string[];
  onParsed: (rows: CSVRow[]) => void;
  cta: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [rowsPreview, setRowsPreview] = useState<CSVRow[] | null>(null);

  const handleFile = async (file: File | null) => {
    setError(null);
    setRowsPreview(null);
    if (!file) return;
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) throw new Error("Empty CSV");
      const headers = lines[0].split(',').map(h => h.trim());
      const missing = expectedHeaders.filter(h => !headers.includes(h));
      if (missing.length) throw new Error(`Missing headers: ${missing.join(', ')}`);
      const rows: CSVRow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',');
        const row: CSVRow = {};
        headers.forEach((h, idx) => row[h] = (cols[idx] || '').trim());
        rows.push(row);
      }
      setRowsPreview(rows.slice(0, 5));
      onParsed(rows);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to parse CSV');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <input type="file" accept=".csv" onChange={e => handleFile(e.target.files?.[0] ?? null)} className="text-sm" />
        <span className="text-xs text-gray-400">{cta}</span>
      </div>
      {error && <div className="text-sm text-red-400">{error}</div>}
      {rowsPreview && (
        <div className="text-xs text-gray-400">Preview {rowsPreview.length} rows (showing up to 5)</div>
      )}
    </div>
  );
}
