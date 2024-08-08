import React, { useState, useEffect, useCallback, useRef } from "react";
import { Data } from "../Models/Data";

interface ItemListProps {
  totalPages: number;
  cache: Map<number, Data[]>;
  currentPage: number;
  itemsPerPage: number;
  loadNextPage: () => void;
  loadPrevPage: () => void;
  setCurrentPage: (num: number) => void;
  IsPageChange: boolean;
  setPageChange: (bool: boolean) => void;
}

const ItemList: React.FC<ItemListProps> = ({
  totalPages,
  cache,
  currentPage,
  itemsPerPage,
  loadNextPage,
  loadPrevPage,
  setCurrentPage,
  IsPageChange,
  setPageChange,
}) => {
  const [listData, setListData] = useState<Data[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const containerRef = useRef<HTMLUListElement>(null);
  const pages = useRef<number[]>([]);
  const disableScroll = useRef<boolean>(false);

  const handleScroll = useCallback(() => {
    if (disableScroll.current || loading) return;

    const container = containerRef.current;
    if (!container) return;

    const { scrollTop, clientHeight, scrollHeight } = container;
    const threshold = 5; // Trigger next page loading when near bottom

    // Load next page
    if (
      scrollTop + clientHeight + threshold >= scrollHeight &&
      currentPage < totalPages
    ) {
      if (!cache.has(currentPage + 1)) {
        setLoading(true);
        loadNextPage();
      }
    }

    // Load previous page
    if (
      scrollTop <= (pages.current[currentPage - 1] || 0) - threshold &&
      currentPage > 1
    ) {
      if (!cache.has(currentPage - 1)) {
        setLoading(true);
        loadPrevPage();
      }
    }

    // Update current page based on scroll position
    const newPage =
      pages.current.findIndex(
        (offset) => scrollTop < offset + clientHeight / 2
      ) + 1;
    if (newPage && newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  }, [
    loading,
    loadNextPage,
    loadPrevPage,
    currentPage,
    totalPages,
    cache,
    setCurrentPage,
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (IsPageChange && container) {
      disableScroll.current = true;

      // Avoid adding duplicate pages
      if (!pages.current.includes(currentPage)) {
        pages.current.push(container.scrollTop);
      }

      setPageChange(false);
      setTimeout(() => {
        disableScroll.current = false;
      }, 1000);
    }
  }, [currentPage, IsPageChange, setPageChange]);

  useEffect(() => {
    const sortedData = Array.from(cache.values()).flat();
    setListData(sortedData);
  }, [cache]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      // Scroll to the correct position when data is loaded
      const offset = pages.current[currentPage - 1];
      if (offset !== undefined) {
        container.scrollTo({ top: offset });
      } else if (currentPage === 1) {
        container.scrollTo({ top: 0 });
      }
    }
  }, [listData, currentPage]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Handle loading state
    if (loading) {
      const timer = setTimeout(() => {
        setLoading(false);
        const offset = pages.current[currentPage - 1];
        if (offset !== undefined) {
          container.scrollTo({ top: offset });
        }
      }, 1000);
      return () => clearTimeout(timer);
    }

    // Handle scroll position based on page change
    const idx = pages.current.findIndex(
      (offset) => offset === container.scrollTop
    );
    const offset =
      idx !== -1
        ? (container.scrollHeight / pages.current.length) * (idx + 1)
        : container.scrollHeight - container.clientHeight / 2;

    container.scrollTo({ top: offset });
  }, [loading, currentPage, itemsPerPage]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => {
        container.removeEventListener("scroll", handleScroll);
      };
    }
  }, [handleScroll]);

  return (
    <ul className="item-list" ref={containerRef}>
      {listData.map((item) => (
        <li key={item.id} className="item-list-item">
          {item.title}
        </li>
      ))}
      {loading && <li className="loading-indicator">Loading...</li>}
    </ul>
  );
};

export default ItemList;
