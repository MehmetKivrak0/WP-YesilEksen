import type { ChangeLogEntry } from '../types';

type ChangeLogProps = {
  entries: ChangeLogEntry[];
};

function ChangeLog({ entries }: ChangeLogProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-border-light bg-background-light p-4 text-sm text-subtle-light dark:border-border-dark dark:bg-background-dark dark:text-subtle-dark">
        Henüz kayıt bulunmuyor.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {entries.map((entry) => (
        <li
          key={`${entry.name}-${entry.timestamp}`}
          className="rounded-xl border border-border-light bg-background-light px-4 py-3 text-sm dark:border-border-dark dark:bg-background-dark"
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="font-medium text-content-light dark:text-content-dark">{entry.name}</span>
              <span className="text-xs text-subtle-light dark:text-subtle-dark">
                {new Date(entry.timestamp).toLocaleString('tr-TR')}
              </span>
            </div>
            <p className="text-subtle-light dark:text-subtle-dark">
              <span className="font-semibold text-content-light dark:text-content-dark">{entry.field}</span> {entry.from} → {entry.to}
            </p>
            {entry.reason && <p className="text-xs text-subtle-light dark:text-subtle-dark">Not: {entry.reason}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default ChangeLog;
