// src/components/RecentSearches.jsx
import React from "react";

const RecentSearches = ({ history, onSelect }) => {
  return (
    <div className="mt-4">
      <h3 className="font-bold mb-2 text-lg">Recent Searches:</h3>
      <div className="flex flex-wrap gap-2">
        {history.map((city, index) => (
          <button
            key={index}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            onClick={() => onSelect(city)}
          >
            {city}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RecentSearches;
