# PDF Görüntüleme Sorunu Çözümü

## Sorun
PDF görüntülemede iki hata vardı:

1. **CSP (Content Security Policy) Hatası:**
   - iframe'de doğrudan URL kullanıldığında Content Security Policy ihlali
   - Hata: `Refused to frame 'http://localhost:5000/' because an ancestor violates the following Content Security Policy directive: "frame-ancestors 'self'"`

2. **401 Unauthorized Hatası:**
   - iframe token gönderemediği için authentication hatası
   - Hata: `Failed to load resource: the server responded with a status of 401`

## Çözüm

### 1. PDF'ler için Blob URL Kullanımı

PDF'ler artık resimler gibi blob URL ile yükleniyor:

```typescript
// PDF dosyası ise blob URL oluştur
const isPdf = /\.pdf$/i.test(cleanUrl);

if (isPdf) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (response.ok) {
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      setDocumentBlobUrl(blobUrl);
    }
  } catch (error) {
    console.error('PDF yükleme hatası:', error);
    setDocumentError(true);
  }
}
```

### 2. State Yönetimi Birleştirme

PDF ve resimler için ortak state kullanılıyor:

```typescript
// Önceki (ayrı state'ler)
const [imageBlobUrl, setImageBlobUrl] = useState<string | null>(null);
const [imageError, setImageError] = useState(false);

// Yeni (birleşik state'ler)
const [documentBlobUrl, setDocumentBlobUrl] = useState<string | null>(null);
const [documentError, setDocumentError] = useState(false);
const [documentLoading, setDocumentLoading] = useState(false);
```

### 3. iframe'de Blob URL Kullanımı

PDF'ler blob URL ile iframe'de gösteriliyor:

```typescript
if (isPdf && documentBlobUrl) {
  return (
    <iframe
      src={documentBlobUrl}
      className="w-full h-[70vh] rounded-lg border-0"
      title={viewingDocument.name}
    />
  );
}
```

## Kod Değişiklikleri

### handleViewDocument Fonksiyonu Güncellendi

```typescript
const handleViewDocument = async (url: string, name: string) => {
  setViewingDocument({ url, name });
  setDocumentError(false);
  setDocumentBlobUrl(null);
  setDocumentLoading(true);
  
  const cleanUrl = url.split('?')[0];
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(cleanUrl);
  const isPdf = /\.pdf$/i.test(cleanUrl);
  
  // Resim veya PDF ise blob URL oluştur
  if (isImage || isPdf) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        setDocumentBlobUrl(blobUrl);
      } else {
        setDocumentError(true);
      }
    } catch (error) {
      console.error('Belge yükleme hatası:', error);
      setDocumentError(true);
    } finally {
      setDocumentLoading(false);
    }
  } else {
    setDocumentLoading(false);
  }
};
```

### Modal Kapanışında Temizlik

```typescript
onClick={() => {
  if (documentBlobUrl) {
    URL.revokeObjectURL(documentBlobUrl);
  }
  setViewingDocument(null);
  setDocumentBlobUrl(null);
  setDocumentError(false);
  setDocumentLoading(false);
}}
```

## Sonuç

Artık PDF'ler:
- ✅ Authentication token ile yükleniyor
- ✅ Blob URL ile iframe'de görüntüleniyor
- ✅ CSP hatası çözüldü (blob URL kullanıldığı için)
- ✅ 401 hatası çözüldü (token ile fetch yapılıyor)
- ✅ Loading durumu gösteriliyor
- ✅ Hata durumunda kullanıcıya bilgi veriliyor
- ✅ Memory leak önlendi (blob URL'ler temizleniyor)

## Teknik Detaylar

### Neden Blob URL?
- **CSP Uyumluluğu:** Blob URL'ler aynı origin'den geldiği için CSP kurallarını ihlal etmez
- **Authentication:** Fetch API ile token gönderilebilir, iframe ile gönderilemez
- **Güvenlik:** Blob URL'ler geçicidir ve kontrol edilebilir

### Avantajlar
1. Hem PDF hem resimler için aynı yaklaşım
2. Authentication sorunu çözüldü
3. CSP uyumlu
4. Memory yönetimi yapılıyor
5. Loading ve error state'leri var

