export interface PaginationProps {
  loadNextPage: () => void;
  loadPrevPage: () => void;
  loadPage: (num: number) => void;
  totalPages: number;
  currentPage: number;
}
