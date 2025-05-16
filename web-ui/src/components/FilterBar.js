import React from 'react';

const FilterBar = ({ filterStatus, setFilterStatus, filterPriceMin, setFilterPriceMin, filterPriceMax, setFilterPriceMax, search, setSearch, onAdd }) => {
  return (
    <div style={{ display: 'flex', gap: 15, flexWrap: 'wrap', marginBottom: 20 }}>
      <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
        <option value="">-- Lọc trạng thái --</option>
        <option value="Available">Available</option>
        <option value="Rented">Rented</option>
        <option value="Under Maintenance">Under Maintenance</option>
      </select>

      <input type="number" placeholder="Giá min" value={filterPriceMin} onChange={e => setFilterPriceMin(e.target.value)} />
      <input type="number" placeholder="Giá max" value={filterPriceMax} onChange={e => setFilterPriceMax(e.target.value)} />

      <input
        type="text"
        placeholder="Tìm kiếm số phòng"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <button onClick={onAdd}>＋ Thêm phòng mới</button>
    </div>
  );
};

export default FilterBar;
