import React, { useState, useEffect } from "react";
import ItemList from "./components/ItemList";
import Pagination from "./components/Pagination";
import Options from "./components/Options";
import { Data } from "./Models/Data";
import FetchItems from "./api/fetchItems";
import { BaseAPI } from "./api/BaseAPI";

import "./style.css";

const App: React.FC = () => {
  const fetchItems = new FetchItems();
  const [IsPageChange, setPageChange] = useState<boolean>(false);
  const [limit, setLimit] = useState<number>(10);
  const [cache, setCache] = useState<Map<number, Data[]>>(new Map());
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [data, setData] = useState<Data[]>([]);
  const [error, setError] = useState<string | null>(null);

  const totalData = BaseAPI.totalData;

  const loadNextPage = () => {
    setCurrentPage((prev) => prev + 1);
    setPageChange(true);
  };

  const loadPrevPage = () => {
    setCurrentPage((prev) => prev - 1);
    setPageChange(true);
  };

  const loadPage = (num: number) => {
    setCurrentPage(num);
    setPageChange(true);
  };

  const handleLimitChange = (newLimit: number) => {
    const oldPage = currentPage;
    const newPage = Math.floor(((oldPage - 1) * limit) / newLimit) + 1;

    setLimit(newLimit);
    setCurrentPage(newPage);

    if (cache.has(newPage)) {
      setData(cache.get(newPage) || []);
    } else {
      fetchData(newPage, newLimit);
    }
  };

  const fetchData = async (page: number, limit: number) => {
    try {
      if (cache.has(page)) {
        setData(cache.get(page) as Data[]);
        return;
      }

      const newData: Data[] | unknown = await fetchItems.fetchItems(
        (page - 1) * limit,
        limit
      );

      setCache((prevCache) => new Map(prevCache).set(page, newData as Data[]));

      if (page === currentPage) {
        setData(newData as Data[]);
      }
    } catch (err) {
      setError("Error fetching data");
    }
  };

  useEffect(() => {
    fetchData(currentPage, limit);
  }, [currentPage, limit]);

  useEffect(() => {
    if (totalData > 0 && limit > 0) {
      setTotalPages(Math.ceil(totalData / limit));
    }
  }, [totalData, limit]);

  return (
    <div className="main-page">
      {error ? (
        <div>Error: {error}</div>
      ) : (
        <>
          <ItemList
            totalPages={totalPages}
            cache={cache}
            currentPage={currentPage}
            itemsPerPage={limit}
            loadNextPage={loadNextPage}
            loadPrevPage={loadPrevPage}
            setCurrentPage={setCurrentPage}
            IsPageChange={IsPageChange}
            setPageChange={setPageChange}
          />
          <Pagination
            loadNextPage={loadNextPage}
            loadPrevPage={loadPrevPage}
            loadPage={loadPage}
            totalPages={totalPages}
            currentPage={currentPage}
          />
          <Options limit={limit} setLimit={handleLimitChange} />
        </>
      )}
    </div>
  );
};

export default App;
