export type ActivityType = 'kayit' | 'guncelleme' | 'onay' | 'red' | 'durum_degisikligi';

export type Activity = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: ActivityType;
};

export type ActivityFilter = 'hepsi' | ActivityType;

export type ActivityFilterOption = {
  value: ActivityFilter;
  label: string;
};

export type ActivityTypeMeta = {
  label: string;
  icon: string;
  badgeClass: string;
  bubbleClass: string;
  iconClass: string;
};

export type ActivityTypeMetaMap = Record<ActivityType, ActivityTypeMeta>;

export type FarmerStatusLabel = 'Aktif' | 'Beklemede';

export type RegisteredFarmer = {
  id: string;
  name: string;
  farm: string;
  registrationDate: string;
  status: FarmerStatusLabel;
  detailPath: string;
};

export type ProductStatusLabel = 'Stokta' | 'İncelemede' | 'Tükendi';

export type DashboardProduct = {
  id: string;
  name: string;
  producer: string;
  status: ProductStatusLabel;
  lastUpdate: string;
};

export type ProductSummary = {
  pending: number;
  approved: number;
  revision: number;
};

export type FarmSummary = {
  newApplications: number;
  inspections: number;
  missingDocuments: number;
  rejected: number;
  totalApplications: number;
  approved: number;
};

