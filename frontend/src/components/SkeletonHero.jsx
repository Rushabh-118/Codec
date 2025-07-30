const SkeletonHero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-200 dark:bg-gray-800 overflow-hidden pt-16 pb-24">
      {/* Overlay Skeleton */}
      <div className="absolute inset-0 bg-gray-300/50 dark:bg-gray-700/80" />
      
      {/* Gradient blobs Skeleton */}
      <div className="absolute inset-0 overflow-hidden opacity-20 dark:opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gray-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gray-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-gray-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" />
      </div>

      {/* Main content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col items-center gap-12 relative z-10 text-center">
        <div className="w-full text-center px-4 lg:px-0">
          {/* Badge Skeleton */}
          <div className="inline-block px-4 py-2 mb-4 text-sm font-semibold bg-gray-100 dark:bg-gray-700 rounded-full shadow-sm w-48 h-8 mx-auto animate-pulse" />
          
          {/* Title Skeleton */}
          <div className="mb-6">
            <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded-lg w-3/4 mx-auto mb-6 animate-pulse" />
            <div className="relative h-24 w-64 mx-auto">
              <div className="absolute inset-0 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse" />
            </div>
          </div>
          
          {/* Description Skeleton */}
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded-lg max-w-2xl mx-auto mb-8 animate-pulse" />
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded-lg max-w-xl mx-auto mb-8 animate-pulse" />
          
          {/* Features Skeleton */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {[1, 2, 3].map((item) => (
              <div 
                key={item}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-sm font-medium rounded-full shadow-sm w-32 h-8 animate-pulse"
              />
            ))}
          </div>
          
          {/* Button Skeleton */}
          <div className="flex justify-center">
            <div className="px-8 py-4 bg-gray-300 dark:bg-gray-600 rounded-xl w-48 h-14 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Scroll Indicator Skeleton */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden md:block">
        <div className="flex flex-col items-center">
          <div className="text-sm bg-gray-300 dark:bg-gray-600 rounded-lg w-20 h-4 mb-2 animate-pulse" />
          <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonHero;