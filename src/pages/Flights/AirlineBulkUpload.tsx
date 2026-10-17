import { useMemo, useRef, useState } from 'react';
import Papa from 'papaparse';
import { Download, FileUp, X } from 'lucide-react';
import type { Airline } from '../../data/airlines';

type Props = {
  onClose: () => void;
  onImported: (message: string) => void;
  existingAirlines: Airline[];
  onSave: (imported: Airline[]) => void;
};

type RawRow = Record<string, string>;

type CheckedRow = {
  line: number;
  name: string;
  code: string;
  iata: string;
  country: string;
  status: boolean;
  duplicate: boolean;
  errors: string[];
};

const templateHeaders = ['airline_name', 'iata_code', 'icao_code', 'country', 'status'];
const templateRow = ['Air Peace', 'P4', 'APK', 'Nigeria', 'Active'];

export default function AirlineBulkUpload({ onClose, onImported, existingAirlines, onSave }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState<RawRow[]>([]);
  const [error, setError] = useState('');

  const checkedRows = useMemo<CheckedRow[]>(() => {
    const existingCodes = new Set(existingAirlines.map(a => a.code?.toUpperCase()).filter(Boolean));
    const existingNames = new Set(existingAirlines.map(a => a.name.toLowerCase().trim()));
    const seenCodes = new Set<string>();
    const seenNames = new Set<string>();

    return rows.map((row, index) => {
      const read = (...keys: string[]) => keys.map(key => row[key]).find(Boolean) || '';
      const name = read('airlinename', 'name', 'airline', 'carrier').trim();
      const code = read('iatacode', 'code', 'iata').trim().toUpperCase();
      const icao = read('icaocode', 'icao').trim().toUpperCase();
      const country = read('country', 'countryoforigin').trim();
      const rawStatus = read('status').toLowerCase();
      const status = !['false', '0', 'inactive', 'no'].includes(rawStatus);

      const errors: string[] = [];
      if (!name) errors.push('Airline name is required.');

      const isDup =
        (!errors.length && code && (existingCodes.has(code) || seenCodes.has(code))) ||
        (!errors.length && name && (existingNames.has(name.toLowerCase()) || seenNames.has(name.toLowerCase())));

      if (code) seenCodes.add(code);
      if (name) seenNames.add(name.toLowerCase());

      return {
        line: index + 2,
        name,
        code,
        iata: icao || code,
        country,
        status,
        duplicate: Boolean(isDup),
        errors,
      };
    });
  }, [existingAirlines, rows]);

  const ready = useMemo(() => checkedRows.filter(r => !r.errors.length && !r.duplicate), [checkedRows]);
  const duplicates = useMemo(() => checkedRows.filter(r => r.duplicate).length, [checkedRows]);
  const invalid = useMemo(() => checkedRows.filter(r => r.errors.length > 0).length, [checkedRows]);

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;
    setError('');

    Papa.parse<RawRow>(file, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: header => header.trim().toLowerCase().replace(/[^a-z0-9]/g, ''),
      transform: value => value.trim(),
      complete: result => {
        if (result.errors.length > 0) {
          setRows([]);
          setError(`Could not read ${file.name}: ${result.errors[0].message}`);
          return;
        }
        const filtered = result.data.filter(row => Object.values(row).some(value => value));
        if (filtered.length === 0) {
          setRows([]);
          setError('The file contains no tabular data rows.');
          return;
        }
        setFileName(file.name);
        setRows(filtered);
      },
      error: parseError => setError(`Import failed: ${parseError.message}`),
    });
  };

  const downloadTemplate = () => {
    const csv = `${templateHeaders.join(',')}\n${templateRow.map(val => `"${val.replace(/"/g, '""')}"`).join(',')}\n`;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    link.download = 'airlines-bulk-import-template.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const runImport = () => {
    const newItems: Airline[] = ready.map((item, idx) => ({
      id: Date.now() + idx,
      name: item.name,
      code: item.code,
      iata: item.iata,
      country: item.country,
      status: item.status,
    }));

    onSave(newItems);
    onImported(
      `Imported ${newItems.length} ${newItems.length === 1 ? 'airline' : 'airlines'} successfully. ${duplicates} duplicate rows skipped; ${invalid} rows rejected.`
    );
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-gray-950/40 p-4"
      role="presentation"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="bulk-upload-title"
        className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-lg bg-white shadow-xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-4">
          <div>
            <h2 id="bulk-upload-title" className="text-lg font-semibold text-gray-900">
              Upload Airlines in Bulk
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Upload an AIR or CSV file. Rows are validated against official airline attributes before saving.
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded p-1 text-gray-500 hover:bg-gray-100">
            <X size={18} />
          </button>
        </header>

        <div className="space-y-4 overflow-y-auto px-6 py-5">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
            >
              <FileUp size={16} /> Choose AIR / CSV file
            </button>
            <button
              type="button"
              onClick={downloadTemplate}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Download size={16} /> Download template
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".air,.csv,text/csv"
              onChange={handleFile}
              className="sr-only"
            />
            {fileName && <span className="text-sm text-gray-600">{fileName} · {rows.length} rows</span>}
          </div>

          <p className="text-xs text-gray-500">
            Accepted headers: Airline Name (required), IATA Code (2-letter), ICAO Code (3-letter), Country, Status. Duplicate airlines with the same IATA code or name are skipped.
          </p>

          {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

          {rows.length > 0 && (
            <>
              <div className="flex gap-4 text-xs font-medium">
                <span className="text-emerald-700">{ready.length} ready</span>
                <span className="text-amber-700">{duplicates} duplicates</span>
                <span className="text-red-700">{invalid} invalid</span>
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead className="bg-gray-50 text-[11px] uppercase text-gray-500">
                    <tr>
                      {['Row', 'Airline Name', 'IATA Code', 'ICAO Code', 'Country', 'Review'].map(label => (
                        <th key={label} className="px-3 py-2.5 font-semibold">
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {checkedRows.slice(0, 50).map(item => (
                      <tr key={item.line}>
                        <td className="px-3 py-2.5 text-gray-500">{item.line}</td>
                        <td className="px-3 py-2.5 font-medium text-gray-900">{item.name || '—'}</td>
                        <td className="px-3 py-2.5">{item.code || '—'}</td>
                        <td className="px-3 py-2.5">{item.iata || '—'}</td>
                        <td className="px-3 py-2.5">{item.country || '—'}</td>
                        <td className="px-3 py-2.5">
                          {item.errors.length ? (
                            <span className="text-xs text-red-700">{item.errors.join(' ')}</span>
                          ) : item.duplicate ? (
                            <span className="text-xs text-amber-700">Duplicate, will be skipped</span>
                          ) : (
                            <span className="text-xs text-emerald-700">Ready</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {checkedRows.length > 50 && (
                <p className="text-xs text-gray-500">Showing first 50 of {checkedRows.length} rows.</p>
              )}
            </>
          )}
        </div>

        <footer className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={ready.length === 0}
            onClick={runImport}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Import {ready.length} {ready.length === 1 ? 'airline' : 'airlines'}
          </button>
        </footer>
      </section>
    </div>
  );
}

