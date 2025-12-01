type FarmSearchBarProps = {
  query: string;
  onChange: (value: string) => void;
};

function FarmSearchBar({ query, onChange }: FarmSearchBarProps) {
  return (
    <div className="relative w-full sm:max-w-xs">
      <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark">
        search
      </span>
      <input
        type="search"
        value={query}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Çiftlik, çiftçi veya durum ara"
        className="w-full rounded-lg border border-border-light bg-background-light py-2 pl-10 pr-3 text-sm text-content-light placeholder:text-subtle-light/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark dark:text-content-dark"
      />
    </div>
  );
}

export default FarmSearchBar;
