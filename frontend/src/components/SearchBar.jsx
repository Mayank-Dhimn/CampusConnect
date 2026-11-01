import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange, onSubmit, placeholder = 'Search products...' }) {
  return (
    <form
      className="input-group"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit && onSubmit();
      }}
    >
      <span className="input-group-text bg-white"><Search size={18} /></span>
      <input
        type="text"
        className="form-control"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button className="btn btn-primary" type="submit">Search</button>
    </form>
  );
}
