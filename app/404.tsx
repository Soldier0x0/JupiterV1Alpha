import Link from 'next/link'

export default function Custom404() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-dark-900 text-center">
      <h1 className="text-6xl font-bold text-jupiter-500 mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
      <p className="mb-6 text-gray-600 dark:text-gray-300">Sorry, the page you are looking for does not exist.</p>
      <Link href="/" className="px-6 py-2 bg-jupiter-500 text-white rounded-lg shadow hover:bg-jupiter-600 transition">Go Home</Link>
    </div>
  )
}
