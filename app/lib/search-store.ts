import { create } from 'zustand';

type SearchStore = {
  searchValue: string;
  setSearchValue: (value: string) => void;
};

export const useSearchStore = create<SearchStore>()((set) => ({
  searchValue: '',
  setSearchValue: (value) => set({ searchValue: value }),
}));
