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
  const [disableScroll, setDisableScroll] = useState<boolean>(false);
  const containerRef = useRef<HTMLUListElement>(null);
  const pageOffsets = useRef<number[]>([]);
  const previousScrollTop = useRef<number>(0);

  const handleScroll = useCallback(() => {
    if (disableScroll) return;

    const container = containerRef.current;
    if (!container || loading) return;

    const { scrollTop, clientHeight, scrollHeight } = container;

    if (
      scrollTop + clientHeight + 5 >= scrollHeight &&
      currentPage < totalPages &&
      !loading
    ) {
      if (!cache.has(currentPage + 1)) {
        setLoading(true);
        loadNextPage();
      }
    } else if (scrollTop <= 5 && currentPage > 1 && !loading) {
      if (!cache.has(currentPage - 1)) {
        setLoading(true);
        loadPrevPage();
      }
    }

    let newPage: number | null = null;
    for (let i = 0; i < pageOffsets.current.length; i++) {
      if (scrollTop < pageOffsets.current[i] + container.clientHeight / 2) {
        newPage = i + 1; // Adjusting to be one-based index
        break;
      }
    }

    if (newPage !== null && newPage !== currentPage) {
      setCurrentPage(newPage);
    }

    previousScrollTop.current = scrollTop;
  }, [
    loading,
    loadNextPage,
    loadPrevPage,
    currentPage,
    totalPages,
    cache,
    setCurrentPage,
    disableScroll,
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (IsPageChange && container) {
      setDisableScroll(true);
      const newPageOffset = pageOffsets.current[currentPage - 1];
      if (newPageOffset !== undefined) {
        container.scrollTop = newPageOffset - 50;
      }
      setPageChange(false);
      setTimeout(() => {
        setDisableScroll(false);
      }, 1000); // Re-enable scrolling after 1 second
    }
  }, [currentPage, IsPageChange, setPageChange]);

  useEffect(() => {
    const sortedData = Array.from(cache.values()).flat();
    setListData(sortedData);
  }, [cache]);

  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const itemHeight = container.clientHeight / itemsPerPage;
      const newPageOffsets: number[] = [];
      let accumulatedHeight = 0;

      for (let i = 0; i < listData.length; i += itemsPerPage) {
        newPageOffsets.push(accumulatedHeight);
        accumulatedHeight += itemHeight * itemsPerPage;
      }
      pageOffsets.current = newPageOffsets;

      container.scrollTo({
        top: ,
      });
      console.log(pageOffsets);
    }
  }, [listData, itemsPerPage]);

  // Simulate loading state
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setLoading(false);
        const container = containerRef.current;
        if (container) {
          const itemHeight = container.clientHeight / itemsPerPage;
          const newPageOffset = itemHeight * itemsPerPage * (currentPage - 1);
          pageOffsets.current[currentPage - 1] = newPageOffset;
          pageOffsets.current.sort((a, b) => a - b);
          container.scrollTo({
            top: pageOffsets.current[currentPage - 1],
          });
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, currentPage, itemsPerPage]);

  // Scroll to the new page position when currentPage changes
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const itemHeight = container.clientHeight / itemsPerPage;
      const newPageOffset = itemHeight * itemsPerPage * (currentPage - 1);
      container.scrollTo({
        top: newPageOffset,
      });
    }
  }, [currentPage, itemsPerPage]);

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
