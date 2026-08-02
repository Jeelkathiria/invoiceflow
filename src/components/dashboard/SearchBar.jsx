import { Search } from 'lucide-react';
import { useState } from 'react';

export default function SearchBar({ placeholder = 'Search' }) {
  const [value, setValue] = useState('');

  return (
    <label className="flex w-full items-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:border-brand-500">
      <Search className="h-4 w-4 text-slate-400" />
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        className="w-full border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
      />
    </label>
  );
}
