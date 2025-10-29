import Link from 'next/link'
import Image from 'next/image'

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
            <Image
              src="/logo.png"
              alt="Marsoft Logo"
              width={360}
              height={100}
              priority
              className="h-25 w-auto"
            />
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="text-gray-700 hover:text-[#8BBE3F] font-medium transition-colors"
            >
              Strona główna
            </Link>
            <Link
              href="/admin"
              className="px-4 py-2 bg-gradient-to-r from-[#8BBE3F] to-[#6FA832] text-white rounded-lg hover:shadow-lg transition-all font-medium"
            >
              Panel administracyjny
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}