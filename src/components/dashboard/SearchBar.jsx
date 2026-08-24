import { Search } from 'lucide-react';

export default function SearchBar({ placeholder = 'Search invoices...', value = '', onChange, onFocus }) {
  return (
    <label className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 shadow-2xs focus-within:border-blue-500 focus-within:bg-white transition cursor-pointer">
      <Search className="h-4 w-4 text-slate-400 shrink-0" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        placeholder={placeholder}
        className="w-full border-0 bg-transparent text-xs font-medium text-slate-900 outline-none placeholder:text-slate-400"
      />
    </label>
  );
}
