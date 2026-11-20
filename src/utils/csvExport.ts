export interface CSVColumn<T> {
  header: string;
  getValue: (item: T) => string | number | boolean | null | undefined;
}

function escapeCsvCell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // Prevent spreadsheet formula injection by prefixing with apostrophe
  if (/^[=+\-@]/.test(stringValue)) {
    return `'${stringValue}`;
  }

  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  if (/[,"'\n\r]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

export function generateCSV<T>(
  items: T[],
  columns: CSVColumn<T>[]
): string {
  if (items.length === 0) {
    return '';
  }

  // Add UTF-8 BOM to ensure Excel displays special characters correctly
  const utf8BOM = '\ufeff';

  const header = columns.map((col) => escapeCsvCell(col.header)).join(',');

  const rows = items.map((item) =>
    columns.map((col) => escapeCsvCell(col.getValue(item))).join(',')
  );

  return utf8BOM + [header, ...rows].join('\n');
}

export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatDateForFilename(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
