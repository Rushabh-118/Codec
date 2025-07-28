import React from "react";

const SkeletonHero = () => (
  <section className="min-h-[110vh] flex items-center justify-center bg-gradient-to-b from-gray-50 to-white pt-16 pb-24 dark:from-gray-900 dark:to-gray-800">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col md:flex-row items-center md:items-start gap-12">
      {/* Left Image Skeleton */}
      <div className="w-full md:w-1/2">
        <div className="w-full h-96 bg-gray-300 dark:bg-gray-600 rounded-xl"></div>
      </div>

      {/* Right Content Skeleton */}
      <div className="w-full md:w-1/2 space-y-6">
        <div className="w-48 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        <div className="w-full h-12 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
        <div className="w-3/4 h-6 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
        <div className="flex flex-wrap gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-24 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"
            ></div>
          ))}
        </div>
        <div className="w-40 h-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
      </div>
    </div>
  </section>
);

export default SkeletonHero;
