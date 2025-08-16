import React, { useState } from 'react';
import { BarChart, XAxis, YAxis, Tooltip, Bar } from 'recharts';

const Explore = () => {
  const [query, setQuery] = useState('');
  const histogramData = [
    { time: '00:00', count: 10 },
    { time: '00:01', count: 15 },
    { time: '00:02', count: 20 },
  ];

  const fields = [
    { name: 'Field A', type: 'String' },
    { name: 'Field B', type: 'Number' },
    { name: 'Field C', type: 'Date' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Explore</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-3 rounded-xl bg-zinc-800 text-zinc-200 focus:outline-none"
        />
      </div>
      <div>
        <h2 className="text-lg font-medium">Histogram</h2>
        <BarChart width={300} height={200} data={histogramData}>
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#22d3ee" />
        </BarChart>
      </div>
      <div className="mt-4">
        <h2 className="text-lg font-medium">Fields</h2>
        <ul className="space-y-2">
          {fields.map((field, index) => (
            <li key={index} className="flex justify-between">
              <span>{field.name}</span>
              <span>{field.type}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Explore;
