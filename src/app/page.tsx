export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Selamat Datang di Kognisia
        </h1>
        <p className="text-gray-600 mb-8">
          Platform Pembelajaran AI-Personalized
        </p>
        <a 
          href="/login"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Masuk ke Aplikasi
        </a>
      </div>
    </div>
  )
}
