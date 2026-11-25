export interface ExportExtraFile {
  filename: string;
  mimeType: string;
  content: string;
}

export interface ExportResult {
  filename: string;
  mimeType: string;
  content: string;
  description: string;
  extraFiles?: ExportExtraFile[];
}

export function allExportFiles(result: ExportResult): ExportExtraFile[] {
  return [
    {
      filename: result.filename,
      mimeType: result.mimeType,
      content: result.content,
    },
    ...(result.extraFiles ?? []),
  ];
}