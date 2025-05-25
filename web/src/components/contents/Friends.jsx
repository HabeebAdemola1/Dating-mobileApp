
function Friends() {
  return (
     <div className="p-2 sm:p-4">
    <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-800">Friends</h2>
    <ul className="space-y-2">
      <li className="flex items-center space-x-2">
        <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gray-300 rounded-full"></div>
        <span className="text-sm sm:text-base">Friend 1</span>
      </li>
      <li className="flex items-center space-x-2">
        <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gray-300 rounded-full"></div>
        <span className="text-sm sm:text-base">Friend 2</span>
      </li>
    </ul>
  </div>
  )
}

export default Friends
