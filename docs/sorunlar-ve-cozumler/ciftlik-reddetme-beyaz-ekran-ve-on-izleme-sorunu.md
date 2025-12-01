# Çiftlik Reddetme Beyaz Ekran ve Ön İzleme Sorunu

## Sorun Tanımı

1. **Beyaz Ekran Sorunu**: Çiftlik başvuruları sayfasında belge reddetme işlemi yapılırken, "Reddet" butonuna basıldığında ve reddetme nedeni yazılırken sayfa beyaz ekran veriyordu ve yüklenmiyordu.

2. **Ön İzleme Sorunu**: Ön izleme modal'ında tüm belgeler "Onaylandı" kısmında görünüyordu, oysa sadece değişiklik yapılan belgeler gösterilmeliydi.

## Sorunun Nedeni

### 1. Tanımsız Değişken Hatası
`InspectModal.tsx` dosyasında 618. satırda `updatingDocumentId` adında tanımsız bir değişken kullanılıyordu:

```typescript
disabled={!localReasons[document.name]?.trim() || updatingDocumentId === document.belgeId || isApproving}
```

Bu değişken hiçbir yerde tanımlanmamıştı ve bu durum JavaScript hatasına yol açarak sayfanın beyaz ekran vermesine neden oluyordu.

### 2. Ön İzleme Modal'ında Yanlış Filtreleme
`PreviewApprovalModal.tsx` dosyasında, belgeler filtrelenirken sadece durumlarına bakılıyordu, ancak değişiklik yapılıp yapılmadığı kontrol edilmiyordu. Bu nedenle tüm belgeler (değişiklik yapılmayanlar dahil) ön izlemede görünüyordu.

## Çözüm

### 1. Tanımsız Değişkenin Kaldırılması

**Dosya**: `src/pages/admin/ziraat/farms/components/modals/InspectModal.tsx`

**Değişiklik Öncesi**:
```typescript
disabled={!localReasons[document.name]?.trim() || updatingDocumentId === document.belgeId || isApproving}
```

**Değişiklik Sonrası**:
```typescript
disabled={!localReasons[document.name]?.trim() || isApproving}
```

Tanımsız `updatingDocumentId` değişkeni kaldırıldı. Artık sadece `localReasons` kontrolü ve `isApproving` durumu kontrol ediliyor.

### 2. Ön İzleme Modal'ında Sadece Değişiklik Yapılan Belgelerin Gösterilmesi

**Dosya**: `src/pages/admin/ziraat/farms/components/modals/PreviewApprovalModal.tsx`

**Değişiklik Öncesi**:
```typescript
// Onaylanan belgeleri bul
const approvedDocuments = application.documents.filter((doc) => {
  const review = documentReviews[doc.name];
  const status = review?.status ?? doc.status;
  return status === 'Onaylandı';
});

// Reddedilen belgeleri bul
const rejectedDocuments = application.documents.filter((doc) => {
  const review = documentReviews[doc.name];
  const status = review?.status ?? doc.status;
  return status === 'Reddedildi';
});

// Değişiklik yapılan belgeleri bul
const changedDocuments = application.documents.filter((doc) => {
  // ... değişiklik kontrolü
});
```

**Değişiklik Sonrası**:
```typescript
// Önce değişiklik yapılan belgeleri bul
const changedDocuments = application.documents.filter((doc) => {
  const review = documentReviews[doc.name];
  if (!review) return false;
  // Status değişikliği var mı?
  const statusChanged = review.status !== doc.status;
  // Reason eklenmiş mi? (orijinalde yoksa ve şimdi varsa)
  const reasonAdded = !doc.farmerNote && review.reason && review.reason.trim();
  // AdminNote eklenmiş mi? (orijinalde yoksa ve şimdi varsa)
  const adminNoteAdded = !doc.adminNote && review.adminNote && review.adminNote.trim();
  // Reason değişmiş mi?
  const reasonChanged = doc.farmerNote !== review.reason;
  // AdminNote değişmiş mi?
  const adminNoteChanged = doc.adminNote !== review.adminNote;
  
  return statusChanged || reasonAdded || adminNoteAdded || reasonChanged || adminNoteChanged;
});

// Sadece değişiklik yapılan belgelerden onaylananları bul
const approvedDocuments = changedDocuments.filter((doc) => {
  const review = documentReviews[doc.name];
  const status = review?.status ?? doc.status;
  return status === 'Onaylandı';
});

// Sadece değişiklik yapılan belgelerden reddedilenleri bul
const rejectedDocuments = changedDocuments.filter((doc) => {
  const review = documentReviews[doc.name];
  const status = review?.status ?? doc.status;
  return status === 'Reddedildi';
});
```

Artık önce `changedDocuments` listesi oluşturuluyor, sonra bu listeden onaylanan ve reddedilen belgeler filtreleniyor. Bu sayede sadece değişiklik yapılan belgeler ön izlemede gösteriliyor.

### 3. Kod Temizliği

**Dosya**: `src/pages/admin/ziraat/farms/components/modals/InspectModal.tsx`

Kullanılmayan değişkenler kaldırıldı:
- `showDocumentActions`
- `setShowDocumentActions`
- `showConfirmApproveModal`
- `setShowConfirmApproveModal`

## Sonuç

1. ✅ **Beyaz Ekran Sorunu Çözüldü**: `updatingDocumentId` hatası düzeltildi, artık reddet butonuna basıldığında sayfa normal çalışıyor.

2. ✅ **Ön İzleme Sorunu Çözüldü**: Ön izleme modal'ında sadece değişiklik yapılan belgeler gösteriliyor. Değişiklik yapılmayan belgeler ön izlemede görünmüyor.

3. ✅ **Kod Kalitesi İyileştirildi**: Kullanılmayan değişkenler temizlendi, kod daha sade ve okunabilir hale geldi.

## Test Adımları

1. Çiftlik başvuruları sayfasına gidin.
2. Bir başvuruyu inceleyin (InspectModal açın).
3. Bir belge için "Reddet" butonuna basın.
4. Reddetme nedeni yazın - sayfa beyaz ekran vermemeli.
5. "Onayla" butonuna basın.
6. Ön izleme modal'ında sadece değişiklik yapılan belgelerin göründüğünü kontrol edin.

## İlgili Dosyalar

- `src/pages/admin/ziraat/farms/components/modals/InspectModal.tsx`
- `src/pages/admin/ziraat/farms/components/modals/PreviewApprovalModal.tsx`
- `src/pages/admin/ziraat/farms/hooks/useFarmApplications.ts`

## Tarih

- **Sorun Tespit Edildi**: 2024
- **Çözüm Uygulandı**: 2024
- **Dokümantasyon**: 2024

