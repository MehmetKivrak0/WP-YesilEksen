export type DocumentStatus = 'Onaylandı' | 'Eksik' | 'Beklemede' | 'Reddedildi';

export type FarmStatus = 'Onaylandı' | 'Reddedildi' | 'İlk İnceleme' | 'Belge Eksik' | 'Güncel Belge' | 'Aktif' | 'Beklemede' | 'Askıda';

export type FarmContact = {
  name: string;
  phone: string;
  email: string;
};

export type FarmDocument = {
  name: string;
  status: DocumentStatus;
  url?: string;
  belgeId?: string;
  farmerNote?: string;
  adminNote?: string;
  redNedeni?: string;
  yoneticiNotu?: string;
  zorunlu?: boolean;
};

export type FarmApplication = {
  id: string;
  farm: string;
  owner: string;
  location: string;
  status: Exclude<FarmStatus, 'Aktif' | 'Beklemede' | 'Askıda'>;
  lastUpdate: string;
  notes: string;
  wasteTypes?: string[];
  contact: FarmContact;
  documents: FarmDocument[];
};

export type FarmListRow = {
  name: string;
  farmer: string;
  registrationDate: string;
  status: Extract<FarmStatus, 'Aktif' | 'Beklemede' | 'Askıda'>;
  productionTons: number;
  annualRevenue: number;
};

export type ChangeLogEntry = {
  name: string;
  field: 'Durum' | 'Silme';
  from: string;
  to: string;
  reason?: string;
  timestamp: string;
};

export type DocumentReviewState = Record<string, { status: DocumentStatus; reason?: string; adminNote?: string; isSent?: boolean }>;

