import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ActivityFilter, DashboardProduct, RegisteredFarmer } from '../types';

type UseDashboardFiltersParams = {
  farmers: RegisteredFarmer[];
  products: DashboardProduct[];
  farmersPerPage?: number;
};

type FarmerRange = {
  start: number;
  end: number;
};

const DEFAULT_FARMERS_PER_PAGE = 5;

export function useDashboardFilters({
  farmers,
  products,
  farmersPerPage = DEFAULT_FARMERS_PER_PAGE,
}: UseDashboardFiltersParams) {
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('hepsi');
  const [farmerSearch, setFarmerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [farmerPage, setFarmerPage] = useState(1);

  const filteredFarmers = useMemo(() => {
    const normalizedSearch = farmerSearch.trim().toLowerCase();
    if (!normalizedSearch) {
      return farmers;
    }

    return farmers.filter((farmer) => {
      return (
        farmer.name.toLowerCase().includes(normalizedSearch) ||
        farmer.farm.toLowerCase().includes(normalizedSearch) ||
        farmer.status.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [farmers, farmerSearch]);

  const totalFarmerPages = useMemo(
    () => Math.max(1, Math.ceil(filteredFarmers.length / farmersPerPage)),
    [filteredFarmers.length, farmersPerPage],
  );

  useEffect(() => {
    setFarmerPage((previousPage) => {
      if (previousPage < 1) {
        return 1;
      }
      if (previousPage > totalFarmerPages) {
        return totalFarmerPages;
      }
      return previousPage;
    });
  }, [totalFarmerPages]);

  const paginatedFarmers = useMemo(() => {
    const startIndex = (farmerPage - 1) * farmersPerPage;
    return filteredFarmers.slice(startIndex, startIndex + farmersPerPage);
  }, [filteredFarmers, farmerPage, farmersPerPage]);

  const farmerRange: FarmerRange = useMemo(() => {
    if (filteredFarmers.length === 0) {
      return { start: 0, end: 0 };
    }

    const start = (farmerPage - 1) * farmersPerPage + 1;
    const end = Math.min(farmerPage * farmersPerPage, filteredFarmers.length);
    return { start, end };
  }, [filteredFarmers.length, farmerPage, farmersPerPage]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = productSearch.trim().toLowerCase();
    if (!normalizedSearch) {
      return products;
    }

    return products.filter((product) => {
      return (
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.producer.toLowerCase().includes(normalizedSearch) ||
        product.status.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [productSearch, products]);

  const goToPreviousFarmerPage = useCallback(() => {
    setFarmerPage((previousPage) => Math.max(previousPage - 1, 1));
  }, []);

  const goToNextFarmerPage = useCallback(() => {
    setFarmerPage((previousPage) => Math.min(previousPage + 1, totalFarmerPages));
  }, [totalFarmerPages]);

  return {
    activityFilter,
    setActivityFilter,
    farmerSearch,
    setFarmerSearch,
    productSearch,
    setProductSearch,
    farmerPage,
    totalFarmerPages,
    filteredFarmers,
    paginatedFarmers,
    farmerRange,
    filteredProducts,
    goToPreviousFarmerPage,
    goToNextFarmerPage,
    setFarmerPage,
  };
}

