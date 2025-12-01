import type { Activity, ActivityFilter } from '../types';
import { activityFilters } from '../data/activityFilters';
import { activityTypeMeta } from '../data/activityTypeMeta';

type ActivityFeedProps = {
  activities: Activity[];
  activeFilter: ActivityFilter;
  onFilterChange: (filter: ActivityFilter) => void;
};

function ActivityFeed({ activities, activeFilter, onFilterChange }: ActivityFeedProps) {
  return (
    <div className="rounded-xl border border-border-light bg-background-light p-6 dark:border-border-dark dark:bg-background-dark">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl font-semibold text-content-light dark:text-content-dark">Son Aktiviteler</h2>
        <div className="flex flex-wrap gap-2">
          {activityFilters.map((filter) => {
            const isActive = activeFilter === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => onFilterChange(filter.value)}
                aria-pressed={isActive}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'border border-border-light text-subtle-light hover:bg-primary/10 dark:border-border-dark dark:text-subtle-dark dark:hover:bg-primary/20'
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity) => {
            // Meta bilgisini al, eğer yoksa varsayılan meta kullan
            const meta = activityTypeMeta[activity.type] || {
              label: 'Aktivite',
              icon: 'info',
              badgeClass: 'bg-gray-100 text-gray-700 dark:bg-gray-900/70 dark:text-gray-200',
              bubbleClass: 'bg-gray-100 dark:bg-gray-900/40',
              iconClass: 'text-gray-600 dark:text-gray-300',
            };
            return (
              <div
                key={activity.id}
                className="flex flex-col gap-3 rounded-lg border border-border-light p-4 transition-colors hover:border-primary/40 dark:border-border-dark dark:hover:border-primary/40 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${meta.bubbleClass}`}>
                    <span className={`material-symbols-outlined text-lg ${meta.iconClass}`}>{meta.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-content-light dark:text-content-dark">{activity.title}</p>
                    <p className="text-xs text-subtle-light dark:text-subtle-dark">{activity.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:flex-col md:items-end md:gap-1">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${meta.badgeClass}`}>
                    {meta.label}
                  </span>
                  <span className="text-xs text-subtle-light dark:text-subtle-dark">{activity.timestamp}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-lg border border-dashed border-border-light p-6 text-center text-sm text-subtle-light dark:border-border-dark dark:text-subtle-dark">
            Bu filtre için aktivite bulunmuyor.
          </div>
        )}
      </div>
    </div>
  );
}

export default ActivityFeed;

