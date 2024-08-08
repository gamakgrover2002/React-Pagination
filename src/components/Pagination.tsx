import React, { useEffect } from "react";

export interface PaginationProps {
  loadNextPage: () => void;
  loadPrevPage: () => void;
  loadPage: (num: number) => void;
  totalPages: number;
  currentPage: number;
}

const Pagination: React.FC<PaginationProps> = ({
  loadNextPage,
  loadPrevPage,
  loadPage,
  totalPages,
  currentPage,
}) => {
  useEffect(() => {
    const pagination = document.querySelectorAll(".pagination-scroll")[0];
    pagination.scrollLeft =
      (pagination.scrollWidth / totalPages) * (currentPage - 3);
  }, [currentPage, totalPages]);

  return (
    <div className="pagination-container">
      <button
        className="pagination-button"
        onClick={loadPrevPage}
        disabled={currentPage === 1}
      >
        Prev
      </button>
      <div className="pagination-scroll">
        <ul>
          {[...Array(totalPages).keys()].map((pageNumber) => (
            <li key={pageNumber + 1}>
              <button
                onClick={() => loadPage(pageNumber + 1)}
                className={`pagination-button ${
                  currentPage === pageNumber + 1 ? "active" : ""
                }`}
              >
                {pageNumber + 1}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <button
        className="pagination-button"
        onClick={loadNextPage}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
