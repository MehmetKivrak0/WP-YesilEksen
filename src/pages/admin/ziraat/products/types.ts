export type DocumentStatus = 'Onaylandı' | 'Eksik' | 'Beklemede' | 'Reddedildi';

export type ProductStatus = 'Onaylandı' | 'İncelemede' | 'Revizyon';

export type ProductContact = {
  name: string;
  phone: string;
  email: string;
};

export type ProductDocument = {
  name: string;
  status: DocumentStatus;
  url?: string;
  farmerNote?: string;
};

export type ProductApplication = {
  product: string;
  applicant: string;
  category: string;
  status: ProductStatus;
  submittedAt: string;
  lastUpdate: string;
  notes: string;
  farm: string;
  contact: ProductContact;
  documents: ProductDocument[];
};

export type DocumentReviewState = Record<string, { status: DocumentStatus; reason?: string }>;
