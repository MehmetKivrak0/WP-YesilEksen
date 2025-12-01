import { useEffect, useMemo, useState } from 'react';
import type { DocumentReviewState, ProductApplication, ProductStatus } from '../types';

type UseProductApplicationsOptions = {
  applications: ProductApplication[];
};

export function useProductApplications({ applications }: UseProductApplicationsOptions) {
  const [selectedStatus, setSelectedStatus] = useState<'Hepsi' | ProductStatus>('Hepsi');
  const [records, setRecords] = useState<ProductApplication[]>(applications);
  const [inspectedApplication, setInspectedApplication] = useState<ProductApplication | null>(null);
  const [rejectedApplication, setRejectedApplication] = useState<ProductApplication | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [documentReviews, setDocumentReviews] = useState<DocumentReviewState>({});

  useEffect(() => {
    if (!inspectedApplication) {
      setDocumentReviews({});
      return;
    }

    const initial = inspectedApplication.documents.reduce<DocumentReviewState>((acc, doc) => {
      acc[doc.name] = { status: doc.status, reason: doc.farmerNote };
      return acc;
    }, {});

    setDocumentReviews(initial);
  }, [inspectedApplication]);

  const filteredApplications = useMemo(() => {
    if (selectedStatus === 'Hepsi') {
      return records;
    }

    return records.filter((application) => application.status === selectedStatus);
  }, [records, selectedStatus]);

  const updateDocumentStatus = (name: string, status: DocumentReviewState[string]['status']) => {
    setDocumentReviews((prev) => ({
      ...prev,
      [name]: {
        status,
        reason: status === 'Reddedildi' ? prev[name]?.reason : undefined,
      },
    }));
  };

  const updateDocumentReason = (name: string, reason: string) => {
    setDocumentReviews((prev) => ({
      ...prev,
      [name]: {
        status: prev[name]?.status ?? 'Reddedildi',
        reason,
      },
    }));
  };

  return {
    selectedStatus,
    setSelectedStatus,
    applications: records,
    setApplications: setRecords,
    inspectedApplication,
    setInspectedApplication,
    rejectedApplication,
    setRejectedApplication,
    rejectReason,
    setRejectReason,
    documentReviews,
    updateDocumentStatus,
    updateDocumentReason,
    filteredApplications,
  };
}
