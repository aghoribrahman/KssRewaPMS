import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PatientMaster } from '../types';
import { usePatients } from './usePatients';

export function usePatientLookup(contact: string, aadhar?: string, abha?: string) {
  const [match, setMatch] = useState<PatientMaster | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isOfflineFallback, setIsOfflineFallback] = useState(false);
  const { patients } = usePatients({ limit: 500 }); // Local offline cache fallback

  useEffect(() => {
    const hasValidContact = contact && contact.length === 10;
    const hasValidAadhar = aadhar && aadhar.length === 12;
    const hasValidAbha = abha && abha.length > 5;

    if (!hasValidContact && !hasValidAadhar && !hasValidAbha) {
      setMatch(null);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);

      // If offline, fall back to matching from local cache
      if (!navigator.onLine) {
        setIsOfflineFallback(true);
        const found = patients.find(p => 
          (hasValidContact && p.contact === contact) ||
          (hasValidAadhar && p.aadhar_number === aadhar) ||
          (hasValidAbha && p.abha_id === abha)
        );

        if (found) {
          setMatch({
            id: found.master_patient_id || found.id,
            name: found.name,
            age: found.age,
            gender: found.gender,
            contact: found.contact,
            address: found.address || '',
            district: found.district,
            block: found.block || '',
            village: found.village || '',
            abha_id: found.abha_id || null,
            aadhar_number: found.aadhar_number || null,
            sickle_cell_status: found.sickle_cell_status,
            pre_existing_diagnosis: found.pre_existing_diagnosis || false,
            date_of_diagnosis: found.date_of_diagnosis || null,
            created_at: found.created_at,
            updated_at: found.updated_at
          });
        } else {
          setMatch(null);
        }
        setIsSearching(false);
        return;
      }

      setIsOfflineFallback(false);
      try {
        const { data, error } = await supabase.rpc('find_patient_by_identity', {
          p_contact: hasValidContact ? contact : null,
          p_aadhar: hasValidAadhar ? aadhar : null,
          p_abha: hasValidAbha ? abha : null
        });

        if (!error && data && data.length > 0) {
          setMatch(data[0] as any);
        } else {
          setMatch(null);
        }
      } catch (err) {
        console.error("Patient lookup RPC failed:", err);
        setMatch(null);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [contact, aadhar, abha, patients]);

  return { match, isSearching, isOfflineFallback };
}
