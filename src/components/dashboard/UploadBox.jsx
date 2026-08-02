import { CloudUpload, FileText, ImageIcon } from 'lucide-react';

export default function UploadBox({ file, onFileChange }) {
  const handleFile = (event) => {
    const selected = event.target.files?.[0];
    if (selected) onFileChange(selected);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) onFileChange(dropped);
  };

  return (
    <label
      htmlFor="invoice-upload"
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
      className="group relative flex min-h-[240px] flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-brand-500 hover:bg-white"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-500/10 text-brand-600">
        <CloudUpload className="h-7 w-7" />
      </div>
      <div className="mt-6 max-w-md">
        <p className="text-lg font-semibold text-slate-900">Drag & drop an invoice file</p>
        <p className="mt-2 text-sm text-slate-500">Supports PDF, PNG, JPEG. Or click to browse.</p>
      </div>
      <input
        id="invoice-upload"
        type="file"
        accept="application/pdf,image/png,image/jpeg"
        className="sr-only"
        onChange={handleFile}
      />
      {file ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 mx-auto flex w-fit items-center gap-3 rounded-full bg-slate-950/95 px-4 py-2 text-sm text-white shadow-lg shadow-slate-950/20">
          <FileText className="h-4 w-4 text-brand-300" />
          <span>{file.name}</span>
        </div>
      ) : null}
    </label>
  );
}
