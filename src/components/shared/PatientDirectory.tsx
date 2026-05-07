import * as React from 'react';
import { Patient } from '../../types';
import { useDashboardState } from '../../hooks/useDashboardState';
import { GenericTable, Column } from './GenericTable';
import { TRANSLATIONS } from '../../constants/mp_data';

interface PatientDirectoryProps {
  patients: Patient[];
  columns: Column<Patient>[];
  itemsPerPage?: number;
  onPatientSelect: (patient: Patient) => void;
  lang: 'en' | 'hi';
  title?: string;
  description?: string;
  emptyState?: React.ReactNode;
}

export function PatientDirectory({
  patients,
  columns,
  itemsPerPage = 10,
  onPatientSelect,
  lang,
  title,
  description,
  emptyState,
}: PatientDirectoryProps) {
  const t = TRANSLATIONS[lang];
  const {
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    paginatedPatients,
    totalPages,
    totalCount,
  } = useDashboardState({ patients, itemsPerPage });

  return (
    <GenericTable
      title={title || (lang === 'en' ? "Patient Directory" : "मरीज निर्देशिका")}
      description={description || (lang === 'en' ? "Manage and track patient records." : "मरीज के रिकॉर्ड प्रबंधित करें।")}
      data={paginatedPatients}
      columns={columns}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder={lang === 'en' ? "Search by Name, ABHA ID or Contact..." : "नाम, आभा आईडी या संपर्क से खोजें..."}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
      itemsPerPage={itemsPerPage}
      totalItems={totalCount}
      onRowClick={onPatientSelect}
      emptyState={emptyState}
    />
  );
}
