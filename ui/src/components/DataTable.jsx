import React from 'react';
import { useVirtual } from '@tanstack/react-virtual';

const DataTable = ({ data = [], columns = [] }) => {
  const parentRef = React.useRef();

  const rowVirtualizer = useVirtual({
    size: data.length,
    parentRef,
    estimateSize: React.useCallback(() => 50, []),
  });

  return (
    <div className="overflow-auto" ref={parentRef} style={{ height: '400px' }}>
      <table className="table-auto w-full border-collapse border border-zinc-800">
        <thead className="bg-zinc-900">
          <tr>
            {columns.map((col) => (
              <th key={col.accessor} className="border border-zinc-800 p-2 text-left">
                {col.Header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowVirtualizer.virtualItems.map((virtualRow) => {
            const row = data[virtualRow.index];
            return (
              <tr key={virtualRow.index} className="odd:bg-zinc-950 even:bg-zinc-900">
                {columns.map((col) => (
                  <td key={col.accessor} className="border border-zinc-800 p-2">
                    {row[col.accessor]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
