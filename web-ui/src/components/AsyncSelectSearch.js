import React, { useState, useEffect, useRef } from 'react';

const AsyncSelectSearch = ({
  apiCall,
  value,
  onChange,
  placeholder,
  disabled,
  defaultInputValue = '',
}) => {
  const [inputValue, setInputValue] = useState(defaultInputValue);
  const [options, setOptions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [manualInput, setManualInput] = useState(false); // Đánh dấu người dùng gõ input
  const debounceTimeout = useRef(null);
  const containerRef = useRef();

  // Xử lý click ngoài để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Khi inputValue thay đổi và dropdown mở, gọi API lấy options debounce 300ms
  useEffect(() => {
    if (!showDropdown) return;

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(async () => {
      if (inputValue.trim() === '') {
        setOptions([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const dataList = await apiCall(inputValue.trim());
        const list = Array.isArray(dataList)
          ? dataList
          : (dataList.properties || dataList.roomTypes || []);
        setOptions(list);
      } catch {
        setOptions([]);
      }
      setLoading(false);
    }, 300);
  }, [inputValue, showDropdown, apiCall]);

  // Xử lý thay đổi input người dùng
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setShowDropdown(true);
    setManualInput(true);
  };

  // Xử lý chọn item trong dropdown
  const handleSelect = (id, label) => {
    onChange(id);
    setInputValue(label);
    setManualInput(false);
    setShowDropdown(false);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <input
        type="text"
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => !disabled && setShowDropdown(true)}
        onChange={handleInputChange}
        value={inputValue}
        style={{
          width: '100%',
          padding: 8,
          borderRadius: 6,
          border: '1px solid #ccc',
          cursor: disabled ? 'not-allowed' : 'text',
        }}
      />
      {showDropdown && (
        <ul
          style={{
            position: 'absolute',
            zIndex: 1000,
            background: '#fff',
            border: '1px solid #ccc',
            width: '100%',
            maxHeight: 150,
            overflowY: 'auto',
            margin: 0,
            paddingLeft: 0,
            listStyle: 'none',
            borderRadius: 6,
          }}
        >
          {loading && <li style={{ padding: 8, color: '#888' }}>Đang tìm...</li>}
          {!loading && options.length === 0 && (
            <li style={{ padding: 8, color: '#999' }}>Không tìm thấy</li>
          )}
          {!loading &&
            options.map((opt) => {
              const label = opt.name || opt.room_type_name;
              const id = opt.property_id || opt.room_type_id;
              return (
                <li
                  key={id}
                  style={{ padding: 8, cursor: 'pointer' }}
                  onClick={() => handleSelect(id, label)}
                >
                  {label}
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
};

export default AsyncSelectSearch;
