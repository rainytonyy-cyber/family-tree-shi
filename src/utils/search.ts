import type { Person, SearchFilters } from '../types';
import { getFullName } from '../types';

export function searchPersons(persons: Person[], filters: SearchFilters): Person[] {
  return persons.filter(person => {
    if (filters.name) {
      const searchName = filters.name.toLowerCase();
      const fullName = getFullName(person);
      const previousNames = person.previousNames?.join(' ') || '';
      
      // 搜索姓、名、全名、曾用名
      const nameFields = [
        person.surname,
        person.givenName,
        fullName,
        previousNames
      ].join(' ').toLowerCase();
      
      if (!nameFields.includes(searchName)) {
        return false;
      }
    }

    if (filters.birthDateFrom) {
      if (!person.birthDate || person.birthDate < filters.birthDateFrom) {
        return false;
      }
    }

    if (filters.birthDateTo) {
      if (!person.birthDate || person.birthDate > filters.birthDateTo) {
        return false;
      }
    }

    if (filters.deathDateFrom) {
      if (!person.deathDate || person.deathDate < filters.deathDateFrom) {
        return false;
      }
    }

    if (filters.deathDateTo) {
      if (!person.deathDate || person.deathDate > filters.deathDateTo) {
        return false;
      }
    }

    if (filters.occupation) {
      const searchOccupation = filters.occupation.toLowerCase();
      if (!person.occupation?.toLowerCase().includes(searchOccupation)) {
        return false;
      }
    }

    if (filters.address) {
      const searchAddress = filters.address.toLowerCase();
      if (!person.address?.toLowerCase().includes(searchAddress)) {
        return false;
      }
    }

    if (filters.nationality) {
      const searchNationality = filters.nationality.toLowerCase();
      if (!person.nationality?.toLowerCase().includes(searchNationality)) {
        return false;
      }
    }

    if (filters.education) {
      const searchEducation = filters.education.toLowerCase();
      if (!person.education?.toLowerCase().includes(searchEducation)) {
        return false;
      }
    }

    if (filters.bloodType) {
      if (person.bloodType !== filters.bloodType) {
        return false;
      }
    }

    return true;
  });
}
