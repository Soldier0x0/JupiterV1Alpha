import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Custom404() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-space-900 via-dark-900 to-jupiter-100 text-center">
      <motion.div
        initial={{ scale: 0.8, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, type: 'spring' }}
        className="mb-6"
      >
        <span className="text-[6rem]">🪐</span>
      </motion.div>
      <h1 className="text-6xl font-extrabold text-jupiter-500 mb-2 tracking-tight">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Lost in Orbit!</h2>
      <p className="mb-6 text-gray-600 dark:text-gray-300">Looks like you’ve drifted off course.<br />This page doesn’t exist in our galaxy.</p>
      <Link href="/" className="px-6 py-2 bg-jupiter-500 text-white rounded-lg shadow hover:bg-jupiter-600 transition font-bold">Return to Mission Control</Link>
    </div>
  )
}
