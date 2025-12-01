import { useEffect, useMemo, useState } from 'react';
import type { ChangeLogEntry, FarmListRow, FarmStatus } from '../types';

export type ToastState = { message: string; tone: 'success' | 'error' } | null;

type StatusModalState = {
  open: boolean;
  farmName: string | null;
  currentStatus: Extract<FarmStatus, 'Aktif' | 'Beklemede' | 'Askıda'> | null;
  nextStatus: Extract<FarmStatus, 'Aktif' | 'Beklemede' | 'Askıda'> | null;
  reason: string;
  error: string | null;
};

type DeleteModalState = {
  open: boolean;
  farmName: string | null;
  reason: string;
  error: string | null;
};

type FarmProductsModalState = {
  open: boolean;
  farmName: string | null;
  products: string[];
};

type UseFarmListOptions = {
  initialFarms: FarmListRow[];
  productsCatalog: Record<string, string[]>;
};

const initialStatusModalState: StatusModalState = {
  open: false,
  farmName: null,
  currentStatus: null,
  nextStatus: null,
  reason: '',
  error: null,
};

const initialDeleteModalState: DeleteModalState = {
  open: false,
  farmName: null,
  reason: '',
  error: null,
};

const initialProductsModalState: FarmProductsModalState = {
  open: false,
  farmName: null,
  products: [],
};

export function useFarmList({ initialFarms, productsCatalog }: UseFarmListOptions) {
  const [farms, setFarms] = useState<FarmListRow[]>(initialFarms);
  const [statusModal, setStatusModal] = useState<StatusModalState>(initialStatusModalState);
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>(initialDeleteModalState);
  const [productsModal, setProductsModal] = useState<FarmProductsModalState>(initialProductsModalState);
  const [changeLog, setChangeLog] = useState<ChangeLogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timeout = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const stats = useMemo(() => {
    const totalFarmers = new Set(farms.map((farm) => farm.farmer)).size;
    const totalActiveFarms = farms.filter((farm) => farm.status === 'Aktif').length;
    const totalProduction = farms.reduce((sum, farm) => sum + farm.productionTons, 0);
    const totalRevenue = farms.reduce((sum, farm) => sum + farm.annualRevenue, 0);

    return {
      totalFarmers,
      totalActiveFarms,
      totalProduction,
      totalRevenue,
    };
  }, [farms]);

  const filteredFarms = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return farms;
    }

    return farms.filter((farm) =>
      [farm.name, farm.farmer, farm.status].some((value) => value.toLowerCase().includes(normalizedQuery)),
    );
  }, [farms, searchQuery]);

  const openStatusModal = (farm: FarmListRow, nextStatus: Extract<FarmStatus, 'Aktif' | 'Beklemede' | 'Askıda'>) => {
    if (farm.status === nextStatus) {
      return;
    }

    setStatusModal({
      open: true,
      farmName: farm.name,
      currentStatus: farm.status,
      nextStatus,
      reason: '',
      error: null,
    });
  };

  const updateStatusReason = (reason: string) => {
    setStatusModal((prev) => ({
      ...prev,
      reason,
      error: null,
    }));
  };

  const selectNextStatus = (nextStatus: Extract<FarmStatus, 'Aktif' | 'Beklemede' | 'Askıda'>) => {
    setStatusModal((prev) => ({
      ...prev,
      nextStatus,
      error: null,
    }));
  };

  const closeStatusModal = () => setStatusModal(initialStatusModalState);

  const confirmStatusChange = () => {
    if (!statusModal.farmName || !statusModal.nextStatus) {
      closeStatusModal();
      return;
    }

    const reason = statusModal.reason.trim();

    if (!reason) {
      setStatusModal((prev) => ({ ...prev, error: 'Lütfen bir neden belirtin.' }));
      return;
    }

    const currentFarm = farms.find((farm) => farm.name === statusModal.farmName);

    if (!currentFarm || currentFarm.status === statusModal.nextStatus) {
      closeStatusModal();
      return;
    }

    setFarms((prev) =>
      prev.map((farm) =>
        farm.name === statusModal.farmName ? { ...farm, status: statusModal.nextStatus as typeof farm.status } : farm,
      ),
    );

    setChangeLog((log) => [
      {
        name: statusModal.farmName!,
        field: 'Durum',
        from: currentFarm.status,
        to: statusModal.nextStatus,
        reason,
        timestamp: new Date().toISOString(),
      },
      ...log,
    ]);

    setToast({
      message: `${statusModal.farmName} durumu ${statusModal.nextStatus} olarak güncellendi.`,
      tone: 'success',
    });

    closeStatusModal();
  };

  const openDeleteModal = (farm: FarmListRow) => {
    setDeleteModal({
      open: true,
      farmName: farm.name,
      reason: '',
      error: null,
    });
  };

  const updateDeleteReason = (reason: string) => {
    setDeleteModal((prev) => ({
      ...prev,
      reason,
      error: null,
    }));
  };

  const closeDeleteModal = () => setDeleteModal(initialDeleteModalState);

  const confirmDelete = () => {
    if (!deleteModal.farmName) {
      closeDeleteModal();
      return;
    }

    const reason = deleteModal.reason.trim();

    if (!reason) {
      setDeleteModal((prev) => ({ ...prev, error: 'Lütfen silme gerekçesini belirtin.' }));
      return;
    }

    setFarms((prev) => prev.filter((farm) => farm.name !== deleteModal.farmName));
    setChangeLog((log) => [
      {
        name: deleteModal.farmName!,
        field: 'Silme',
        from: reason,
        to: '-',
        timestamp: new Date().toISOString(),
      },
      ...log,
    ]);

    setToast({ message: `${deleteModal.farmName} listeden kaldırıldı.`, tone: 'success' });
    closeDeleteModal();
  };

  const openProductsModal = (farmName: string) => {
    setProductsModal({
      open: true,
      farmName,
      products: productsCatalog[farmName] ?? [],
    });
  };

  const closeProductsModal = () => setProductsModal(initialProductsModalState);

  return {
    farms,
    setFarms,
    stats,
    changeLog,
    filteredFarms,
    searchQuery,
    setSearchQuery,
    statusModal,
    openStatusModal,
    closeStatusModal,
    confirmStatusChange,
    updateStatusReason,
    selectNextStatus,
    deleteModal,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
    updateDeleteReason,
    productsModal,
    openProductsModal,
    closeProductsModal,
    toast,
    setToast,
  };
}
