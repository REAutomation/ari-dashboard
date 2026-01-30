/**
 * RE Automation GmbH - 2026
 * Ari Dashboard - File viewer widget component
 */

import type { FileViewerWidgetData } from '@/types/widget';

interface FileViewerWidgetProps {
  data: FileViewerWidgetData;
}

export function FileViewerWidget({ data }: FileViewerWidgetProps) {
  // PDF: Full-height iframe
  if (data.fileType === 'pdf') {
    return (
      <iframe
        src={data.fileUrl}
        title={data.fileName}
        className="w-full h-full border-0 block"
      />
    );
  }

  // Image: Centered with padding
  if (data.fileType === 'image') {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <img
          src={data.fileUrl}
          alt={data.fileName}
          className="max-w-full max-h-full object-contain rounded-lg"
        />
      </div>
    );
  }

  // Excel/CSV: Table preview
  if ((data.fileType === 'excel' || data.fileType === 'csv') && data.previewData) {
    return (
      <div className="h-full overflow-auto p-4">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-secondary">
              {data.previewData.headers.map((header, index) => (
                <th
                  key={index}
                  className="border border-border px-3 py-2 text-left font-semibold"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.previewData.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-secondary/50">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="border border-border px-3 py-2">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Other files: Download prompt
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 space-y-4">
      <div className="text-6xl">📄</div>
      <div className="text-center">
        <p className="text-lg font-medium mb-2">{data.fileName}</p>
        <p className="text-sm text-muted-foreground mb-4">
          File type: {data.fileType}
        </p>
        <a
          href={data.fileUrl}
          download={data.fileName}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors"
        >
          Download File
        </a>
      </div>
    </div>
  );
}
