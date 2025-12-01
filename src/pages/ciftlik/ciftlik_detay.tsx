import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FrmNavbar from '../../components/frmnavbar';

function CiftlikDetay() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'products' | 'about' | 'certificates'>('products');
  const productsPerPage = 10; // 2 satır x 5 ürün = 10 ürün

  // Çiftlik verileri - gerçek uygulamada API'den gelecek
  const farms: { [key: string]: any } = {
    'guney-ciftligi': {
      name: 'Güney Çiftliği',
      city: 'Antalya',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBU2XUogdPi89L37V-OwqoOzjDWEgn5l7qKFJYifO0zvL7SN2KuQepW-sD8ntTejLyJLl9AvpVo0EfR6Eo41F2rls0XLv-J9ltixWEBGezoDE4HU9TJGt5tSRO4hx7CKmmaQU0uHSjI51D7G7GFQBfSIvLgbVtzNkqJgVjqdnIVNqwuH2iORgWT5rAVNLX35TfTsVIc80l87KpdPJC0a0L4KCJkucHK8fRGaGQ1KYh481AxML62ANtxe7K_uDRRu60OLDo7tncWmp0',
      address: 'Konyaaltı Mah. Çiftlik Sok. No: 45, Antalya, Türkiye',
      phone: '+90 242 123 45 67',
      email: 'guney@ciftlik.com',
      website: 'www.guneyciftlik.com.tr',
      description: 'Güney Çiftliği, Antalya\'nın verimli topraklarında organik tarım yaparak, sürdürülebilir tarım uygulamaları ile çevreye saygılı üretim gerçekleştirmektedir. Organik sertifikalı ürünlerimiz ile sağlıklı ve kaliteli gıda üretimi yapmaktayız.',
      certificates: ['Organik Sertifikalı', 'İyi Tarım'],
      products: [
        { name: 'Domates', qty: '20 ton', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtjKISdIoXsoFh5Dj3qhjqfkiGIb36y3_KRdUix8JVx95f3slXT42sxX0F42c_1YznwpuLAKqGPFuRVacYm1VNa5umOg01c7FzwDvVdQmtqiDc1zFdqnQ5NFNjhBYb9o78mh2AZmE9U6x-bmIeA75eelZauq5EyoWF2RXOlDqBSqLMxR0Urlz8NdCDF-ski3T9JRxSU0sV0eWONnvTIjxIxcDUQVgh7Src7vo_fYw5cf1L5yHjl9e167snHxobLEOj7L9sSOfmenc' },
        { name: 'Salatalık', qty: '15 ton', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtjKISdIoXsoFh5Dj3qhjqfkiGIb36y3_KRdUix8JVx95f3slXT42sxX0F42c_1YznwpuLAKqGPFuRVacYm1VNa5umOg01c7FzwDvVdQmtqiDc1zFdqnQ5NFNjhBYb9o78mh2AZmE9U6x-bmIeA75eelZauq5EyoWF2RXOlDqBSqLMxR0Urlz8NdCDF-ski3T9JRxSU0sV0eWONnvTIjxIxcDUQVgh7Src7vo_fYw5cf1L5yHjl9e167snHxobLEOj7L9sSOfmenc' },
        { name: 'Zeytin', qty: '5 ton', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtjKISdIoXsoFh5Dj3qhjqfkiGIb36y3_KRdUix8JVx95f3slXT42sxX0F42c_1YznwpuLAKqGPFuRVacYm1VNa5umOg01c7FzwDvVdQmtqiDc1zFdqnQ5NFNjhBYb9o78mh2AZmE9U6x-bmIeA75eelZauq5EyoWF2RXOlDqBSqLMxR0Urlz8NdCDF-ski3T9JRxSU0sV0eWONnvTIjxIxcDUQVgh7Src7vo_fYw5cf1L5yHjl9e167snHxobLEOj7L9sSOfmenc' },
        { name: 'Portakal', qty: '30 ton', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtjKISdIoXsoFh5Dj3qhjqfkiGIb36y3_KRdUix8JVx95f3slXT42sxX0F42c_1YznwpuLAKqGPFuRVacYm1VNa5umOg01c7FzwDvVdQmtqiDc1zFdqnQ5NFNjhBYb9o78mh2AZmE9U6x-bmIeA75eelZauq5EyoWF2RXOlDqBSqLMxR0Urlz8NdCDF-ski3T9JRxSU0sV0eWONnvTIjxIxcDUQVgh7Src7vo_fYw5cf1L5yHjl9e167snHxobLEOj7L9sSOfmenc' },
        { name: 'Limon', qty: '10 ton', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtjKISdIoXsoFh5Dj3qhjqfkiGIb36y3_KRdUix8JVx95f3slXT42sxX0F42c_1YznwpuLAKqGPFuRVacYm1VNa5umOg01c7FzwDvVdQmtqiDc1zFdqnQ5NFNjhBYb9o78mh2AZmE9U6x-bmIeA75eelZauq5EyoWF2RXOlDqBSqLMxR0Urlz8NdCDF-ski3T9JRxSU0sV0eWONnvTIjxIxcDUQVgh7Src7vo_fYw5cf1L5yHjl9e167snHxobLEOj7L9sSOfmenc' },
        { name: 'Elma', qty: '25 ton', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtjKISdIoXsoFh5Dj3qhjqfkiGIb36y3_KRdUix8JVx95f3slXT42sxX0F42c_1YznwpuLAKqGPFuRVacYm1VNa5umOg01c7FzwDvVdQmtqiDc1zFdqnQ5NFNjhBYb9o78mh2AZmE9U6x-bmIeA75eelZauq5EyoWF2RXOlDqBSqLMxR0Urlz8NdCDF-ski3T9JRxSU0sV0eWONnvTIjxIxcDUQVgh7Src7vo_fYw5cf1L5yHjl9e167snHxobLEOj7L9sSOfmenc' },
        { name: 'Armut', qty: '18 ton', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtjKISdIoXsoFh5Dj3qhjqfkiGIb36y3_KRdUix8JVx95f3slXT42sxX0F42c_1YznwpuLAKqGPFuRVacYm1VNa5umOg01c7FzwDvVdQmtqiDc1zFdqnQ5NFNjhBYb9o78mh2AZmE9U6x-bmIeA75eelZauq5EyoWF2RXOlDqBSqLMxR0Urlz8NdCDF-ski3T9JRxSU0sV0eWONnvTIjxIxcDUQVgh7Src7vo_fYw5cf1L5yHjl9e167snHxobLEOj7L9sSOfmenc' },
        { name: 'Üzüm', qty: '12 ton', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtjKISdIoXsoFh5Dj3qhjqfkiGIb36y3_KRdUix8JVx95f3slXT42sxX0F42c_1YznwpuLAKqGPFuRVacYm1VNa5umOg01c7FzwDvVdQmtqiDc1zFdqnQ5NFNjhBYb9o78mh2AZmE9U6x-bmIeA75eelZauq5EyoWF2RXOlDqBSqLMxR0Urlz8NdCDF-ski3T9JRxSU0sV0eWONnvTIjxIxcDUQVgh7Src7vo_fYw5cf1L5yHjl9e167snHxobLEOj7L9sSOfmenc' },
        { name: 'Şeftali', qty: '8 ton', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtjKISdIoXsoFh5Dj3qhjqfkiGIb36y3_KRdUix8JVx95f3slXT42sxX0F42c_1YznwpuLAKqGPFuRVacYm1VNa5umOg01c7FzwDvVdQmtqiDc1zFdqnQ5NFNjhBYb9o78mh2AZmE9U6x-bmIeA75eelZauq5EyoWF2RXOlDqBSqLMxR0Urlz8NdCDF-ski3T9JRxSU0sV0eWONnvTIjxIxcDUQVgh7Src7vo_fYw5cf1L5yHjl9e167snHxobLEOj7L9sSOfmenc' },
        { name: 'Kiraz', qty: '6 ton', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtjKISdIoXsoFh5Dj3qhjqfkiGIb36y3_KRdUix8JVx95f3slXT42sxX0F42c_1YznwpuLAKqGPFuRVacYm1VNa5umOg01c7FzwDvVdQmtqiDc1zFdqnQ5NFNjhBYb9o78mh2AZmE9U6x-bmIeA75eelZauq5EyoWF2RXOlDqBSqLMxR0Urlz8NdCDF-ski3T9JRxSU0sV0eWONnvTIjxIxcDUQVgh7Src7vo_fYw5cf1L5yHjl9e167snHxobLEOj7L9sSOfmenc' },
        { name: 'Kayısı', qty: '14 ton', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtjKISdIoXsoFh5Dj3qhjqfkiGIb36y3_KRdUix8JVx95f3slXT42sxX0F42c_1YznwpuLAKqGPFuRVacYm1VNa5umOg01c7FzwDvVdQmtqiDc1zFdqnQ5NFNjhBYb9o78mh2AZmE9U6x-bmIeA75eelZauq5EyoWF2RXOlDqBSqLMxR0Urlz8NdCDF-ski3T9JRxSU0sV0eWONnvTIjxIxcDUQVgh7Src7vo_fYw5cf1L5yHjl9e167snHxobLEOj7L9sSOfmenc' },
        { name: 'Erik', qty: '9 ton', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtjKISdIoXsoFh5Dj3qhjqfkiGIb36y3_KRdUix8JVx95f3slXT42sxX0F42c_1YznwpuLAKqGPFuRVacYm1VNa5umOg01c7FzwDvVdQmtqiDc1zFdqnQ5NFNjhBYb9o78mh2AZmE9U6x-bmIeA75eelZauq5EyoWF2RXOlDqBSqLMxR0Urlz8NdCDF-ski3T9JRxSU0sV0eWONnvTIjxIxcDUQVgh7Src7vo_fYw5cf1L5yHjl9e167snHxobLEOj7L9sSOfmenc' },
        { name: 'Çilek', qty: '4 ton', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtjKISdIoXsoFh5Dj3qhjqfkiGIb36y3_KRdUix8JVx95f3slXT42sxX0F42c_1YznwpuLAKqGPFuRVacYm1VNa5umOg01c7FzwDvVdQmtqiDc1zFdqnQ5NFNjhBYb9o78mh2AZmE9U6x-bmIeA75eelZauq5EyoWF2RXOlDqBSqLMxR0Urlz8NdCDF-ski3T9JRxSU0sV0eWONnvTIjxIxcDUQVgh7Src7vo_fYw5cf1L5yHjl9e167snHxobLEOj7L9sSOfmenc' },
        { name: 'Biber', qty: '16 ton', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtjKISdIoXsoFh5Dj3qhjqfkiGIb36y3_KRdUix8JVx95f3slXT42sxX0F42c_1YznwpuLAKqGPFuRVacYm1VNa5umOg01c7FzwDvVdQmtqiDc1zFdqnQ5NFNjhBYb9o78mh2AZmE9U6x-bmIeA75eelZauq5EyoWF2RXOlDqBSqLMxR0Urlz8NdCDF-ski3T9JRxSU0sV0eWONnvTIjxIxcDUQVgh7Src7vo_fYw5cf1L5yHjl9e167snHxobLEOj7L9sSOfmenc' },
        { name: 'Patlıcan', qty: '11 ton', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtjKISdIoXsoFh5Dj3qhjqfkiGIb36y3_KRdUix8JVx95f3slXT42sxX0F42c_1YznwpuLAKqGPFuRVacYm1VNa5umOg01c7FzwDvVdQmtqiDc1zFdqnQ5NFNjhBYb9o78mh2AZmE9U6x-bmIeA75eelZauq5EyoWF2RXOlDqBSqLMxR0Urlz8NdCDF-ski3T9JRxSU0sV0eWONnvTIjxIxcDUQVgh7Src7vo_fYw5cf1L5yHjl9e167snHxobLEOj7L9sSOfmenc' },
      ],
    },
    'toros-ciftligi': {
      name: 'Toros Çiftliği',
      city: 'Mersin',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4TCRb0xWP5UBMjpvg-1ETr7_Ew5aiHnTc7L7NEClMq0pNWjel0oYwh0Fvm6hRilTiHw7HGRPQXO2G8v_TXqieXs5I1F35uFX-nbidtVjcmSYdMb77U9jR__JBPZTxeOrU3Bu4-ISMxdSoh5v0qj045LUaB6lRl_5KMU_WPq2ZPsMvckfzJQtiDh3xMmzl039g0pVnl_L3C-OZVwVfGPx22wZmCOTNs389hs9ChILoFnBHVKjef5ziDcBlnUuGD0Z7H4EYMzy5fKc',
      address: 'Mezitli Mah. Toros Cad. No: 78, Mersin, Türkiye',
      phone: '+90 324 234 56 78',
      email: 'toros@ciftlik.com',
      website: 'www.torosciftlik.com.tr',
      description: 'Toros Çiftliği, Mersin\'in bereketli topraklarında modern tarım teknikleri kullanarak yüksek kaliteli ürünler yetiştirmektedir. İyi Tarım uygulamaları ile çevre dostu üretim yapmaktayız.',
      certificates: ['Organik Sertifikalı', 'İyi Tarım'],
      products: [
        { name: 'Domates', qty: '20 ton', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtjKISdIoXsoFh5Dj3qhjqfkiGIb36y3_KRdUix8JVx95f3slXT42sxX0F42c_1YznwpuLAKqGPFuRVacYm1VNa5umOg01c7FzwDvVdQmtqiDc1zFdqnQ5NFNjhBYb9o78mh2AZmE9U6x-bmIeA75eelZauq5EyoWF2RXOlDqBSqLMxR0Urlz8NdCDF-ski3T9JRxSU0sV0eWONnvTIjxIxcDUQVgh7Src7vo_fYw5cf1L5yHjl9e167snHxobLEOj7L9sSOfmenc' },
        { name: 'Salatalık', qty: '15 ton', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtjKISdIoXsoFh5Dj3qhjqfkiGIb36y3_KRdUix8JVx95f3slXT42sxX0F42c_1YznwpuLAKqGPFuRVacYm1VNa5umOg01c7FzwDvVdQmtqiDc1zFdqnQ5NFNjhBYb9o78mh2AZmE9U6x-bmIeA75eelZauq5EyoWF2RXOlDqBSqLMxR0Urlz8NdCDF-ski3T9JRxSU0sV0eWONnvTIjxIxcDUQVgh7Src7vo_fYw5cf1L5yHjl9e167snHxobLEOj7L9sSOfmenc' },
        { name: 'Zeytin', qty: '5 ton', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtjKISdIoXsoFh5Dj3qhjqfkiGIb36y3_KRdUix8JVx95f3slXT42sxX0F42c_1YznwpuLAKqGPFuRVacYm1VNa5umOg01c7FzwDvVdQmtqiDc1zFdqnQ5NFNjhBYb9o78mh2AZmE9U6x-bmIeA75eelZauq5EyoWF2RXOlDqBSqLMxR0Urlz8NdCDF-ski3T9JRxSU0sV0eWONnvTIjxIxcDUQVgh7Src7vo_fYw5cf1L5yHjl9e167snHxobLEOj7L9sSOfmenc' },
        { name: 'Portakal', qty: '30 ton', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtjKISdIoXsoFh5Dj3qhjqfkiGIb36y3_KRdUix8JVx95f3slXT42sxX0F42c_1YznwpuLAKqGPFuRVacYm1VNa5umOg01c7FzwDvVdQmtqiDc1zFdqnQ5NFNjhBYb9o78mh2AZmE9U6x-bmIeA75eelZauq5EyoWF2RXOlDqBSqLMxR0Urlz8NdCDF-ski3T9JRxSU0sV0eWONnvTIjxIxcDUQVgh7Src7vo_fYw5cf1L5yHjl9e167snHxobLEOj7L9sSOfmenc' },
        { name: 'Limon', qty: '10 ton', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtjKISdIoXsoFh5Dj3qhjqfkiGIb36y3_KRdUix8JVx95f3slXT42sxX0F42c_1YznwpuLAKqGPFuRVacYm1VNa5umOg01c7FzwDvVdQmtqiDc1zFdqnQ5NFNjhBYb9o78mh2AZmE9U6x-bmIeA75eelZauq5EyoWF2RXOlDqBSqLMxR0Urlz8NdCDF-ski3T9JRxSU0sV0eWONnvTIjxIxcDUQVgh7Src7vo_fYw5cf1L5yHjl9e167snHxobLEOj7L9sSOfmenc' },
        { name: 'Elma', qty: '25 ton', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtjKISdIoXsoFh5Dj3qhjqfkiGIb36y3_KRdUix8JVx95f3slXT42sxX0F42c_1YznwpuLAKqGPFuRVacYm1VNa5umOg01c7FzwDvVdQmtqiDc1zFdqnQ5NFNjhBYb9o78mh2AZmE9U6x-bmIeA75eelZauq5EyoWF2RXOlDqBSqLMxR0Urlz8NdCDF-ski3T9JRxSU0sV0eWONnvTIjxIxcDUQVgh7Src7vo_fYw5cf1L5yHjl9e167snHxobLEOj7L9sSOfmenc' },
        { name: 'Armut', qty: '18 ton', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtjKISdIoXsoFh5Dj3qhjqfkiGIb36y3_KRdUix8JVx95f3slXT42sxX0F42c_1YznwpuLAKqGPFuRVacYm1VNa5umOg01c7FzwDvVdQmtqiDc1zFdqnQ5NFNjhBYb9o78mh2AZmE9U6x-bmIeA75eelZauq5EyoWF2RXOlDqBSqLMxR0Urlz8NdCDF-ski3T9JRxSU0sV0eWONnvTIjxIxcDUQVgh7Src7vo_fYw5cf1L5yHjl9e167snHxobLEOj7L9sSOfmenc' },
        { name: 'Üzüm', qty: '12 ton', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtjKISdIoXsoFh5Dj3qhjqfkiGIb36y3_KRdUix8JVx95f3slXT42sxX0F42c_1YznwpuLAKqGPFuRVacYm1VNa5umOg01c7FzwDvVdQmtqiDc1zFdqnQ5NFNjhBYb9o78mh2AZmE9U6x-bmIeA75eelZauq5EyoWF2RXOlDqBSqLMxR0Urlz8NdCDF-ski3T9JRxSU0sV0eWONnvTIjxIxcDUQVgh7Src7vo_fYw5cf1L5yHjl9e167snHxobLEOj7L9sSOfmenc' },
        { name: 'Şeftali', qty: '8 ton', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtjKISdIoXsoFh5Dj3qhjqfkiGIb36y3_KRdUix8JVx95f3slXT42sxX0F42c_1YznwpuLAKqGPFuRVacYm1VNa5umOg01c7FzwDvVdQmtqiDc1zFdqnQ5NFNjhBYb9o78mh2AZmE9U6x-bmIeA75eelZauq5EyoWF2RXOlDqBSqLMxR0Urlz8NdCDF-ski3T9JRxSU0sV0eWONnvTIjxIxcDUQVgh7Src7vo_fYw5cf1L5yHjl9e167snHxobLEOj7L9sSOfmenc' },
        { name: 'Kiraz', qty: '6 ton', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtjKISdIoXsoFh5Dj3qhjqfkiGIb36y3_KRdUix8JVx95f3slXT42sxX0F42c_1YznwpuLAKqGPFuRVacYm1VNa5umOg01c7FzwDvVdQmtqiDc1zFdqnQ5NFNjhBYb9o78mh2AZmE9U6x-bmIeA75eelZauq5EyoWF2RXOlDqBSqLMxR0Urlz8NdCDF-ski3T9JRxSU0sV0eWONnvTIjxIxcDUQVgh7Src7vo_fYw5cf1L5yHjl9e167snHxobLEOj7L9sSOfmenc' },
        { name: 'Kayısı', qty: '14 ton', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtjKISdIoXsoFh5Dj3qhjqfkiGIb36y3_KRdUix8JVx95f3slXT42sxX0F42c_1YznwpuLAKqGPFuRVacYm1VNa5umOg01c7FzwDvVdQmtqiDc1zFdqnQ5NFNjhBYb9o78mh2AZmE9U6x-bmIeA75eelZauq5EyoWF2RXOlDqBSqLMxR0Urlz8NdCDF-ski3T9JRxSU0sV0eWONnvTIjxIxcDUQVgh7Src7vo_fYw5cf1L5yHjl9e167snHxobLEOj7L9sSOfmenc' },
        { name: 'Erik', qty: '9 ton', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtjKISdIoXsoFh5Dj3qhjqfkiGIb36y3_KRdUix8JVx95f3slXT42sxX0F42c_1YznwpuLAKqGPFuRVacYm1VNa5umOg01c7FzwDvVdQmtqiDc1zFdqnQ5NFNjhBYb9o78mh2AZmE9U6x-bmIeA75eelZauq5EyoWF2RXOlDqBSqLMxR0Urlz8NdCDF-ski3T9JRxSU0sV0eWONnvTIjxIxcDUQVgh7Src7vo_fYw5cf1L5yHjl9e167snHxobLEOj7L9sSOfmenc' },
        { name: 'Çilek', qty: '4 ton', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtjKISdIoXsoFh5Dj3qhjqfkiGIb36y3_KRdUix8JVx95f3slXT42sxX0F42c_1YznwpuLAKqGPFuRVacYm1VNa5umOg01c7FzwDvVdQmtqiDc1zFdqnQ5NFNjhBYb9o78mh2AZmE9U6x-bmIeA75eelZauq5EyoWF2RXOlDqBSqLMxR0Urlz8NdCDF-ski3T9JRxSU0sV0eWONnvTIjxIxcDUQVgh7Src7vo_fYw5cf1L5yHjl9e167snHxobLEOj7L9sSOfmenc' },
        { name: 'Biber', qty: '16 ton', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtjKISdIoXsoFh5Dj3qhjqfkiGIb36y3_KRdUix8JVx95f3slXT42sxX0F42c_1YznwpuLAKqGPFuRVacYm1VNa5umOg01c7FzwDvVdQmtqiDc1zFdqnQ5NFNjhBYb9o78mh2AZmE9U6x-bmIeA75eelZauq5EyoWF2RXOlDqBSqLMxR0Urlz8NdCDF-ski3T9JRxSU0sV0eWONnvTIjxIxcDUQVgh7Src7vo_fYw5cf1L5yHjl9e167snHxobLEOj7L9sSOfmenc' },
        { name: 'Patlıcan', qty: '11 ton', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtjKISdIoXsoFh5Dj3qhjqfkiGIb36y3_KRdUix8JVx95f3slXT42sxX0F42c_1YznwpuLAKqGPFuRVacYm1VNa5umOg01c7FzwDvVdQmtqiDc1zFdqnQ5NFNjhBYb9o78mh2AZmE9U6x-bmIeA75eelZauq5EyoWF2RXOlDqBSqLMxR0Urlz8NdCDF-ski3T9JRxSU0sV0eWONnvTIjxIxcDUQVgh7Src7vo_fYw5cf1L5yHjl9e167snHxobLEOj7L9sSOfmenc' },
      ],
    },
  };

  // Varsayılan çiftlik verisi
  const defaultFarm = {
    name: 'Güney Çiftliği',
    city: 'Antalya',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBU2XUogdPi89L37V-OwqoOzjDWEgn5l7qKFJYifO0zvL7SN2KuQepW-sD8ntTejLyJLl9AvpVo0EfR6Eo41F2rls0XLv-J9ltixWEBGezoDE4HU9TJGt5tSRO4hx7CKmmaQU0uHSjI51D7G7GFQBfSIvLgbVtzNkqJgVjqdnIVNqwuH2iORgWT5rAVNLX35TfTsVIc80l87KpdPJC0a0L4KCJkucHK8fRGaGQ1KYh481AxML62ANtxe7K_uDRRu60OLDo7tncWmp0',
    address: 'Konyaaltı Mah. Çiftlik Sok. No: 45, Antalya, Türkiye',
    phone: '+90 242 123 45 67',
    email: 'guney@ciftlik.com',
    website: 'www.guneyciftlik.com.tr',
    description: 'Güney Çiftliği, Antalya\'nın verimli topraklarında organik tarım yaparak, sürdürülebilir tarım uygulamaları ile çevreye saygılı üretim gerçekleştirmektedir.',
    certificates: ['Organik Sertifikalı', 'İyi Tarım'],
    products: [
      { name: 'Domates', qty: '20 ton', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtjKISdIoXsoFh5Dj3qhjqfkiGIb36y3_KRdUix8JVx95f3slXT42sxX0F42c_1YznwpuLAKqGPFuRVacYm1VNa5umOg01c7FzwDvVdQmtqiDc1zFdqnQ5NFNjhBYb9o78mh2AZmE9U6x-bmIeA75eelZauq5EyoWF2RXOlDqBSqLMxR0Urlz8NdCDF-ski3T9JRxSU0sV0eWONnvTIjxIxcDUQVgh7Src7vo_fYw5cf1L5yHjl9e167snHxobLEOj7L9sSOfmenc' },
      { name: 'Salatalık', qty: '15 ton', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtjKISdIoXsoFh5Dj3qhjqfkiGIb36y3_KRdUix8JVx95f3slXT42sxX0F42c_1YznwpuLAKqGPFuRVacYm1VNa5umOg01c7FzwDvVdQmtqiDc1zFdqnQ5NFNjhBYb9o78mh2AZmE9U6x-bmIeA75eelZauq5EyoWF2RXOlDqBSqLMxR0Urlz8NdCDF-ski3T9JRxSU0sV0eWONnvTIjxIxcDUQVgh7Src7vo_fYw5cf1L5yHjl9e167snHxobLEOj7L9sSOfmenc' },
      { name: 'Zeytin', qty: '5 ton', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtjKISdIoXsoFh5Dj3qhjqfkiGIb36y3_KRdUix8JVx95f3slXT42sxX0F42c_1YznwpuLAKqGPFuRVacYm1VNa5umOg01c7FzwDvVdQmtqiDc1zFdqnQ5NFNjhBYb9o78mh2AZmE9U6x-bmIeA75eelZauq5EyoWF2RXOlDqBSqLMxR0Urlz8NdCDF-ski3T9JRxSU0sV0eWONnvTIjxIxcDUQVgh7Src7vo_fYw5cf1L5yHjl9e167snHxobLEOj7L9sSOfmenc' },
      { name: 'Portakal', qty: '30 ton', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtjKISdIoXsoFh5Dj3qhjqfkiGIb36y3_KRdUix8JVx95f3slXT42sxX0F42c_1YznwpuLAKqGPFuRVacYm1VNa5umOg01c7FzwDvVdQmtqiDc1zFdqnQ5NFNjhBYb9o78mh2AZmE9U6x-bmIeA75eelZauq5EyoWF2RXOlDqBSqLMxR0Urlz8NdCDF-ski3T9JRxSU0sV0eWONnvTIjxIxcDUQVgh7Src7vo_fYw5cf1L5yHjl9e167snHxobLEOj7L9sSOfmenc' },
      { name: 'Limon', qty: '10 ton', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtjKISdIoXsoFh5Dj3qhjqfkiGIb36y3_KRdUix8JVx95f3slXT42sxX0F42c_1YznwpuLAKqGPFuRVacYm1VNa5umOg01c7FzwDvVdQmtqiDc1zFdqnQ5NFNjhBYb9o78mh2AZmE9U6x-bmIeA75eelZauq5EyoWF2RXOlDqBSqLMxR0Urlz8NdCDF-ski3T9JRxSU0sV0eWONnvTIjxIxcDUQVgh7Src7vo_fYw5cf1L5yHjl9e167snHxobLEOj7L9sSOfmenc' },
    ],
  };

  const farm = id ? farms[id] || defaultFarm : defaultFarm;

  // Sayfalama mantığı
  const totalPages = Math.ceil(farm.products.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = farm.products.slice(startIndex, endIndex);

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200 min-h-screen flex flex-col">
      <FrmNavbar />
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24 w-full overflow-x-hidden">
        {/* Geri Dön Butonu */}
        <button
          onClick={() => navigate('/ciftlikler')}
          className="mb-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>Çiftliklere Dön</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-8">
            {/* Çiftlik Kartı */}
            <div className="p-6 bg-white dark:bg-gray-900/50 rounded-xl shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-32"
                    style={{ backgroundImage: `url("${farm.image}")` }}
                  ></div>
                  <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-1.5">
                    <span className="material-symbols-outlined !text-base">verified</span>
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{farm.name}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{farm.city}</p>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                  {farm.certificates.map((cert: string, idx: number) => (
                    <span
                      key={idx}
                      className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(farm.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 rounded-lg transition-colors shadow-sm hover:shadow-md"
                >
                  <span className="material-symbols-outlined text-base">map</span>
                  <span>Haritada Göster</span>
                </a>
              </div>
            </div>

            {/* Çiftlik Bilgileri */}
            <div className="p-6 bg-white dark:bg-gray-900/50 rounded-xl shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Çiftlik Bilgileri</h2>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5">location_on</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-600 dark:text-gray-400">Adres</p>
                    <p className="text-gray-800 dark:text-gray-200 mb-2">{farm.address}</p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(farm.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">map</span>
                      <span>Haritada Göster</span>
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5">call</span>
                  <div>
                    <p className="font-medium text-gray-600 dark:text-gray-400">İletişim</p>
                    <p className="text-gray-800 dark:text-gray-200">{farm.phone}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5">email</span>
                  <div>
                    <p className="font-medium text-gray-600 dark:text-gray-400">E-posta</p>
                    <p className="text-gray-800 dark:text-gray-200">{farm.email}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5">language</span>
                  <div>
                    <p className="font-medium text-gray-600 dark:text-gray-400">Web Sitesi</p>
                    <a className="text-primary hover:underline" href={`https://${farm.website}`} target="_blank" rel="noopener noreferrer">
                      {farm.website}
                    </a>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="md:col-span-2 space-y-8">
            {/* Sekmeler */}
            <div className="bg-white dark:bg-gray-900/50 rounded-xl shadow-sm">
              {/* Sekme Başlıkları */}
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setActiveTab('products')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'products'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Ürünler/Atıklar
                </button>
                <button
                  onClick={() => setActiveTab('about')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'about'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Çiftlik Hakkında
                </button>
                <button
                  onClick={() => setActiveTab('certificates')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'certificates'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Belgeler/Sertifikalar
                </button>
              </div>

              {/* Sekme İçerikleri */}
              <div className="p-6">
                {/* Ürünler/Atıklar Sekmesi */}
                {activeTab === 'products' && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Mevcut Ürünler</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
                      {currentProducts.map((product: any, idx: number) => (
                        <div className="group relative w-full" key={idx}>
                          <div
                            className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg w-full shadow-sm group-hover:shadow-md transition-shadow"
                            style={{ backgroundImage: `url("${product.image}")` }}
                          />
                          <div className="mt-2 text-center">
                            <h4 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{product.name}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{product.qty}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Sayfalama */}
                    {totalPages > 1 && (
                      <div className="mt-6 flex items-center justify-center gap-2">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="material-symbols-outlined text-base">chevron_left</span>
                        </button>
                        
                        <span className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300">
                          Sayfa {currentPage} / {totalPages}
                        </span>
                        
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="material-symbols-outlined text-base">chevron_right</span>
                        </button>
                      </div>
                    )}

                    {/* Atık Bilgisi */}
                    <div className="mt-8 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <h3 className="text-base font-semibold text-orange-900 dark:text-orange-200 mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined">delete</span>
                        Atık Yönetimi
                      </h3>
                      <p className="text-sm text-orange-800 dark:text-orange-300">
                        Bu çiftlik, sürdürülebilir atık yönetimi uygulamaları ile organik atıkları kompost haline getirerek toprağa geri kazandırmaktadır.
                      </p>
                    </div>
                  </div>
                )}

                {/* Çiftlik Hakkında Sekmesi */}
                {activeTab === 'about' && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Çiftlik Hakkında</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{farm.description}</p>
                    
                    <div className="mt-6 space-y-4">
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <h3 className="text-base font-semibold text-green-900 dark:text-green-200 mb-2 flex items-center gap-2">
                          <span className="material-symbols-outlined">eco</span>
                          Sürdürülebilirlik
                        </h3>
                        <p className="text-sm text-green-800 dark:text-green-300">
                          Çevreye saygılı üretim yöntemleri ve organik tarım uygulamaları ile doğal kaynakları korumaktayız.
                        </p>
                      </div>
                      
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <h3 className="text-base font-semibold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
                          <span className="material-symbols-outlined">local_shipping</span>
                          Tedarik Zinciri
                        </h3>
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                          Ürünlerimiz tarladan sofraya güvenilir ve şeffaf bir tedarik zinciri ile ulaştırılmaktadır.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Belgeler/Sertifikalar Sekmesi */}
                {activeTab === 'certificates' && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Belgeler ve Sertifikalar</h2>
                    <div className="space-y-4">
                      {farm.certificates.map((cert: string, idx: number) => (
                        <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <span className="material-symbols-outlined text-primary">verified</span>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-base font-semibold text-gray-900 dark:text-white">{cert}</h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Geçerli sertifika - Aktif
                              </p>
                            </div>
                            <button className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 dark:hover:bg-primary/20 rounded-lg transition-colors">
                              Görüntüle
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary">description</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Faaliyet Belgesi</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              Tarım ve Orman Bakanlığı onaylı
                            </p>
                          </div>
                          <button className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 dark:hover:bg-primary/20 rounded-lg transition-colors">
                            Görüntüle
                          </button>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary">policy</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Kalite Belgesi</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              ISO 9001:2015 Kalite Yönetim Sistemi
                            </p>
                          </div>
                          <button className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 dark:hover:bg-primary/20 rounded-lg transition-colors">
                            Görüntüle
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CiftlikDetay;

