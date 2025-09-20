import React from 'react';

const TopBar = () => {
  return (
    <div className="bg-zinc-900 shadow-card p-4 flex justify-between items-center">
      <div className="text-lg font-semibold">Jupiter SIEM</div>
      <div className="flex items-center space-x-4">
        <button className="bg-teal-500 text-white px-4 py-2 rounded-xl">Test Alert</button>
        <div className="bg-zinc-800 text-zinc-400 px-4 py-2 rounded-xl">Profile</div>
      </div>
    </div>
  );
};

export default TopBar;
