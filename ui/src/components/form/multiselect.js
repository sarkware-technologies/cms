import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from "react";

const SearchableMultiSelect = (props, ref) => {
  const [options, setOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef(null); // Ref to detect clicks outside

  const toggleOption = (option) => {
    setSelectedOptions((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    fetch_retailer();
  };

  useEffect(() => {
    fetch_retailer();
  }, []);

  const fetch_retailer = () => {
    const request = {
      method: "GET",
      endpoint: "/system/v1/api_manager/retailers/list?&search=" + searchTerm,
    };

    window._controller.docker.dock(request)
      .then((_res) => {
        setOptions(_res);
      })
      .catch((e) => {
        window._controller.notify(e.message, "error");
      });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false); // Close the dropdown if clicked outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useImperativeHandle(ref, () => ({
    getState: () => selectedOptions,
  }));

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      <div
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        style={{
          border: "1px solid #ccc",
          borderRadius: "5px",
          padding: "10px",
          cursor: "pointer",
        }}
      >
        {selectedOptions.length > 0
          ? selectedOptions.length + " Retailer selected"
          : "Add Retailer..."}
      </div>
      {isDropdownOpen && (
        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: "5px",
            marginTop: "5px",
            overflowY: "auto",
            position: "absolute",
            backgroundColor: "white",
            zIndex: 1000,
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchChange}
            style={{
              width: "100%",
              padding: "10px",
              boxSizing: "border-box",
              border: "none",
              borderBottom: "1px solid #ccc",
              outline: "none",
            }}
          />
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              maxHeight: "340px",
              overflowY: "auto",
              paddingBottom: "35px",
            }}
          >
            {options.map((option) => (
              <li
                key={option.RetailerId}
                style={{
                  padding: "10px",
                  cursor: "pointer",
                  backgroundColor: selectedOptions.includes(option.RetailerId)
                    ? "#f0f0f0"
                    : "white",
                }}
                onClick={() => toggleOption(option.RetailerId)}
              >
                <input
                  type="checkbox"
                  checked={selectedOptions.includes(option.RetailerId)}
                  readOnly
                  style={{ marginRight: "10px" }}
                />
                {option.Username}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default forwardRef(SearchableMultiSelect);
