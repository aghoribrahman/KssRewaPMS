import { useState, useMemo, useEffect } from 'react';
import { Patient } from '../types';

interface UseDashboardStateOptions {
  patients: Patient[];
  itemsPerPage?: number;
}

export function useDashboardState({ patients, itemsPerPage = 10 }: UseDashboardStateOptions) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Reset to page 1 when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredPatients = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return patients;

    return patients.filter(p => {
      return (
        p.name?.toLowerCase().includes(q) ||
        p.contact?.includes(q) ||
        p.abha_id?.toLowerCase().includes(q) ||
        p.aadhar_number?.includes(q) ||
        p.district?.toLowerCase().includes(q)
      );
    });
  }, [patients, searchQuery]);

  const totalPages = useMemo(() => 
    Math.ceil(filteredPatients.length / itemsPerPage), 
    [filteredPatients.length, itemsPerPage]
  );

  const paginatedPatients = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPatients.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPatients, currentPage, itemsPerPage]);

  return {
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    selectedPatient,
    setSelectedPatient,
    filteredPatients,
    paginatedPatients,
    totalPages,
    totalCount: filteredPatients.length,
  };
}
