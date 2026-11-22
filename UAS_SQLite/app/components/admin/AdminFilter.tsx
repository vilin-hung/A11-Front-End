type AdminFilterOption = {
  value: string;
  label: string;
};

type AdminFilterControl = {
  key: string;
  label: string;
  value: string;
  options: AdminFilterOption[];
  onChange: (value: string) => void;
};

type AdminFilterProps = {
  searchValue: string;
  searchPlaceholder: string;
  onSearchChange: (value: string) => void;
  filters: AdminFilterControl[];
  onReset: () => void;
  resetClassName?: string;
};

export default function AdminFilter({
  searchValue,
  searchPlaceholder,
  onSearchChange,
  filters,
  onReset,
  resetClassName = "btn btn-outline-secondary w-100",
}: AdminFilterProps) {
  return (
    <div className="admin-filter row g-3 align-items-end mb-3">
      <div className="col-12 col-md-5">
        <label className="form-label" htmlFor="admin-filter-search">
          Cari
        </label>
        <input
          id="admin-filter-search"
          type="search"
          className="form-control"
          value={searchValue}
          placeholder={searchPlaceholder}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      {filters.map((filter) => (
        <div className="col-12 col-sm-6 col-md" key={filter.key}>
          <label className="form-label" htmlFor={`admin-filter-${filter.key}`}>
            {filter.label}
          </label>
          <select
            id={`admin-filter-${filter.key}`}
            className="form-select"
            value={filter.value}
            onChange={(event) => filter.onChange(event.target.value)}
          >
            <option value="">Semua</option>
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ))}

      <div className="col-12 col-md-auto">
        <button
          type="button"
          className={resetClassName}
          onClick={onReset}
        >
          Reset
        </button>
      </div>
    </div>
  );
}