export default function OrcResultLoading() {
  return (
    <div className="flex space-x-4">
      <div className="flex-1 space-y-4 py-1">
        <div className="text-center text-gray-500 ">
          <p>
            Processing your document <span className="animate-pulse">...</span>
          </p>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-[80%]"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>

        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-[80%]"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}
