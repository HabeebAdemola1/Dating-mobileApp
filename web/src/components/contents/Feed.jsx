
export default function Feed() {
  return (
   <div className="p-2 sm:p-4">
    <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-800">News Feed</h2>
    <div className="space-y-3 sm:space-y-4">
      <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md border transition-all duration-200" style={{ borderColor: '#F6643BFF' }}>
        <p className="font-semibold text-sm sm:text-base">User 1</p>
        <p className="text-xs sm:text-sm text-gray-600">Just posted a status update!</p>
      </div>
      <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md border transition-all duration-200" style={{ borderColor: '#F6643BFF' }}>
        <p className="font-semibold text-sm sm:text-base">User 2</p>
        <p className="text-xs sm:text-sm text-gray-600">Shared a photo.</p>
      </div>
    </div>
  </div>
  )
}
