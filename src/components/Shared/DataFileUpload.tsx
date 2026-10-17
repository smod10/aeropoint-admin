import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import Papa from 'papaparse';

type DataFileUploadProps = {
  onUpload: (rows: Record<string, string>[]) => number;
};

export default function DataFileUpload({ onUpload }: DataFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: header => header.trim().toLowerCase().replace(/[^a-z0-9]/g, ''),
      transform: value => value.trim(),
      complete: result => {
        if (result.errors.length > 0) {
          setStatus(`Could not parse ${file.name}. Check the file format and headers.`);
          return;
        }

        const rows = result.data.filter(row => Object.values(row).some(value => value));
        if (rows.length === 0) {
          setStatus('No tabular rows found in this file.');
          return;
        }

        const importedCount = onUpload(rows);
        setStatus(importedCount > 0
          ? `Imported ${importedCount} ${importedCount === 1 ? 'record' : 'records'}.`
          : 'No rows contained the required record identifier.');
      },
      error: error => setStatus(`Import failed: ${error.message}`),
    });

    event.currentTarget.value = '';
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <input ref={inputRef} type="file" accept=".air,.csv,text/csv" onChange={handleFileChange} className="sr-only" />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label="Upload AIR or CSV file"
        title="Upload AIR or CSV file"
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-primary-600"
      >
        <Upload size={17} />
      </button>
      {status && <span role="status" className="max-w-48 text-right text-xs text-gray-500">{status}</span>}
    </div>
  );
}
