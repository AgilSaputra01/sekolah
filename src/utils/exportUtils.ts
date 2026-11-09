// Utility to export tabular data directly to CSV / Excel format
export const exportToCSV = (
  data: Record<string, any>[],
  filename: string
) => {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvRows: string[] = [];

  // Header row
  csvRows.push(headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','));

  // Data rows
  for (const row of data) {
    const values = headers.map((header) => {
      const val = row[header] === null || row[header] === undefined ? '' : String(row[header]);
      return `"${val.replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }

  // BOM for UTF-8 Indonesian special characters
  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + csvRows.join('\r\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

