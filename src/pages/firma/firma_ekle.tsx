import FrmNavbar from '../../components/frmnavbar';

function FirmaEkle() {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-stone-900 dark:text-stone-100 min-h-screen flex flex-col">
      <FrmNavbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50">Yeni Firma Ekle</h2>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">Türkiye’deki tarımsal ağa yeni bir iş ortağı ekleyin.</p>
          </div>
          <form className="space-y-8">
            <div className="space-y-6 bg-background-light dark:bg-background-dark p-6 rounded-lg border border-primary/20 dark:border-primary/30">
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300" htmlFor="company-name">Firma Adı</label>
                <input className="form-input mt-1 block w-full rounded-lg border-primary/30 bg-primary/10 dark:bg-primary/20 dark:border-primary/40 focus:ring-primary focus:border-primary text-stone-900 dark:text-stone-100" id="company-name" name="company-name" type="text" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300" htmlFor="address">Adres</label>
                <input className="form-input mt-1 block w-full rounded-lg border-primary/30 bg-primary/10 dark:bg-primary/20 dark:border-primary/40 focus:ring-primary focus:border-primary text-stone-900 dark:text-stone-100" id="address" name="address"  type="text" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300" htmlFor="phone">Telefon Numarası</label>
                  <input className="form-input mt-1 block w-full rounded-lg border-primary/30 bg-primary/10 dark:bg-primary/20 dark:border-primary/40 focus:ring-primary focus:border-primary text-stone-900 dark:text-stone-100" id="phone" name="phone"  type="tel" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300" htmlFor="email">E-posta Adresi</label>
                  <input className="form-input mt-1 block w-full rounded-lg border-primary/30 bg-primary/10 dark:bg-primary/20 dark:border-primary/40 focus:ring-primary focus:border-primary text-stone-900 dark:text-stone-100" id="email" name="email"  type="email" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300" htmlFor="about">Firma Hakkında</label>
                <textarea className="form-input mt-1 block w-full rounded-lg border-primary/30 bg-primary/10 dark:bg-primary/20 dark:border-primary/40 focus:ring-primary focus:border-primary text-stone-900 dark:text-stone-100" id="about" name="about"  rows={4}></textarea>
              </div>
            </div>

            <div className="space-y-6 bg-background-light dark:bg-background-dark p-6 rounded-lg border border-primary/20 dark:border-primary/30">
              <h3 className="text-lg font-medium leading-6 text-stone-900 dark:text-stone-100">Doğrulama Belgeleri</h3>
              <div className="mt-1 flex justify-center rounded-lg border-2 border-dashed border-primary/40 dark:border-primary/60 px-6 pt-5 pb-6">
                <div className="text-center">
                  <span className="material-symbols-outlined text-6xl text-primary/50 dark:text-primary/70">cloud_upload</span>
                  <div className="mt-4 flex text-sm text-stone-600 dark:text-stone-400">
                    <label className="relative cursor-pointer rounded font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary" htmlFor="file-upload">
                      <span>Dosyaları Yükle</span>
                      <input className="sr-only" id="file-upload" name="file-upload" type="file" />
                    </label>
                    <p className="pl-1">veya sürükleyip bırakın</p>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400">PDF, JPG, PNG 10MB'a kadar</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button className="px-6 py-2 text-sm font-medium rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 text-stone-800 dark:text-stone-200 transition-colors" type="button">İptal</button>
              <button className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-6 rounded-lg transition-colors" type="submit">Kaydet</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default FirmaEkle;
