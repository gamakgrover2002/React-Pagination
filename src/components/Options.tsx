import React from "react";

interface OptionsProps {
  limit: number;
  setLimit: (limit: number) => void;
}

const options = [10, 20, 50, 100];

const Options: React.FC<OptionsProps> = ({ limit, setLimit }) => {
  return (
    <div className="options">
      <label htmlFor="limit-select">Items per page:</label>
      <select
        id="limit-select"
        value={limit}
        onChange={(e) => setLimit(Number(e.target.value))}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Options;
