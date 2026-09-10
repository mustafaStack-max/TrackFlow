
export function downloadCsv(rows, filename = 'export.csv') {
  const content = rows.map((row) => row.join(',')).join('\n');

  const blob = new Blob(['\uFEFF' + content], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}