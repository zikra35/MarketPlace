export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow animate-pulse">
    <div className="w-full h-48 bg-gray-200 rounded-t-lg"></div>
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="flex justify-between items-center pt-2">
        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
  </div>
);

export const OrderRowSkeleton = () => (
  <div className="border-b p-4 animate-pulse">
    <div className="grid grid-cols-4 gap-4">
      <div className="h-4 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded"></div>
    </div>
  </div>
);

export const WishlistItemSkeleton = () => (
  <div className="flex gap-4 p-4 border-b animate-pulse">
    <div className="w-20 h-20 bg-gray-200 rounded"></div>
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
    </div>
  </div>
);

export const ReviewCardSkeleton = () => (
  <div className="border rounded-lg p-4 animate-pulse">
    <div className="flex justify-between items-start mb-3">
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/6"></div>
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  </div>
);

export const GridSkeleton = ({ count = 12 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

export const ListSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="space-y-2">
    {Array.from({ length: count }).map((_, i) => (
      <OrderRowSkeleton key={i} />
    ))}
  </div>
);
