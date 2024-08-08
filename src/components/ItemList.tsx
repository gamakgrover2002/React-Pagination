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

    if (
      scrollTop + clientHeight + 5 >= scrollHeight &&
      currentPage < totalPages
    ) {
      if (!cache.has(currentPage + 1)) {
        setLoading(true);
        loadNextPage();
      }
    } else if (scrollTop <= pages.current[currentPage - 2] && currentPage > 1) {
      if (!cache.has(currentPage - 1)) {
        setLoading(true);
        loadPrevPage();
      }
    }

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
      pages.current.push(currentPage);
      console.log(pages.current);
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
      if (currentPage === 1) {
        container.scrollTo({ top: 0 });
      } else {
        const offset = pages.current[currentPage - 1];
        container.scrollTo({ top: offset });
      }
    }
  }, [listData, itemsPerPage, currentPage, totalPages]);

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setLoading(false);
        const container = containerRef.current;
        if (container) {
          pages.current.sort((a, b) => a - b);
          const offset = pages.current[currentPage - 1];
          container.scrollTo({ top: offset });
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, currentPage, itemsPerPage, totalPages]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTo({
        top: (container.scrollHeight / totalPages) * (currentPage - 1),
      });
    }
  }, [currentPage, itemsPerPage, totalPages]);

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
