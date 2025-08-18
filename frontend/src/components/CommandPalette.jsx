import React, { useState } from 'react';
import { motion } from 'framer-motion';

const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const commands = [
    { name: 'Command 1', shortcut: 'Ctrl+1' },
    { name: 'Command 2', shortcut: 'Ctrl+2' },
    { name: 'Command 3', shortcut: 'Ctrl+3' },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.name.toLowerCase().includes(query.toLowerCase())
  );

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
            {filteredCommands.map((cmd, index) => (
              <li key={index} className="p-2 bg-zinc-800 rounded-xl flex justify-between">
                <span>{cmd.name}</span>
                <span className="text-xs text-zinc-400">{cmd.shortcut}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    )
  );
};

export default CommandPalette;
