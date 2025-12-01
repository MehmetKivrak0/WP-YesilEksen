import type { FarmApplication } from '../../types';

type RejectModalProps = {
  application: FarmApplication;
  rejectReason: string;
  onChangeReason: (reason: string) => void;
  onCancel: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

function RejectModal({ application, rejectReason, onChangeReason, onCancel, onSubmit }: RejectModalProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-border-light bg-background-light p-6 shadow-2xl dark:border-border-dark dark:bg-background-dark">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-content-light dark:text-content-dark">Reddet ve Bilgilendir</h2>
            <p className="text-sm text-subtle-light dark:text-subtle-dark">
              {application.farm} başvurusu için reddetme nedenini belirterek çiftliği bilgilendirin.
            </p>
          </div>
          <button
            className="group flex items-center justify-center rounded-lg border border-border-light/70 dark:border-border-dark/70 bg-background-light/95 dark:bg-background-dark/90 backdrop-blur-sm p-2 transition-colors hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
            onClick={onCancel}
          >
            <span className="material-symbols-outlined text-xl text-subtle-light dark:text-subtle-dark group-hover:text-red-600 dark:group-hover:text-red-300 transition-colors">close</span>
          </button>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-content-light dark:text-content-dark" htmlFor="reject-reason">
              Geçerli Neden
            </label>
            <textarea
              id="reject-reason"
              required
              rows={4}
              className="w-full rounded-lg border border-border-light bg-background-light px-3 py-2 text-sm text-content-light focus:outline-none focus:ring-2 focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-content-dark"
              placeholder="Örneğin: Belirtilen eksikler giderilmedi. Güncel belgeleri yükleyiniz..."
              value={rejectReason}
              onChange={(event) => onChangeReason(event.target.value)}
            />
          </div>

          <div>
            <label
              className="mb-2 block text-sm font-medium text-content-light dark:text-content-dark"
              htmlFor="farm-owner-message"
            >
              Çiftlik Sahibine Mesaj
            </label>
            <textarea
              id="farm-owner-message"
              rows={4}
              className="w-full rounded-lg border border-border-light bg-background-light px-3 py-2 text-sm text-content-light focus:outline-none focus:ring-2 focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-content-dark"
              placeholder={`${application.contact.name} için ileti: Reddetme nedenini ve düzeltme için talimatları paylaşın.`}
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              className="rounded-lg border-2 border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800/50 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all"
              onClick={onCancel}
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500"
            >
              <span className="material-symbols-outlined text-base">send</span>
              Reddi Gönder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RejectModal;

