import React, { useState } from 'react';
import { motion } from 'framer-motion';

const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');

  return (
    isOpen && (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        onClick={onClose}
      >
        <div
          className="bg-zinc-900 rounded-2xl shadow-card p-4 w-96"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="text"
            placeholder="Type a command..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-3 rounded-xl bg-zinc-800 text-zinc-200 focus:outline-none"
          />
          <ul className="mt-4 space-y-2">
            <li className="p-2 bg-zinc-800 rounded-xl">Command 1</li>
            <li className="p-2 bg-zinc-800 rounded-xl">Command 2</li>
            <li className="p-2 bg-zinc-800 rounded-xl">Command 3</li>
          </ul>
        </div>
      </motion.div>
    )
  );
};

export default CommandPalette;
