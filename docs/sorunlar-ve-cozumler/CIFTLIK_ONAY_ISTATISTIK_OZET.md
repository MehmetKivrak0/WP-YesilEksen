## Çiftlik Onay İstatistiği Güncellemesi

- Dashboard API’de `ciftlikler` tablosundan aktif çiftlik sayısı `farmSummary.approved` alanına eklendi.
- `useFarmApplications` hook’u bu istatistiği çekip `approvedFarmCount` state’ine aktarıyor.
- `ciftlik_onay` sayfasındaki üst kartlar artık bu toplamı göstererek onaylı çiftliklerin gerçek sayısını yansıtıyor.

