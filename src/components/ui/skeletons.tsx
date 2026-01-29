'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

// Card skeleton for result cards
export function CardSkeleton({ className }: SkeletonProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-32 mb-1" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  );
}

// Grid of card skeletons
export function CardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

// Table skeleton
export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="w-full space-y-3">
      {/* Header */}
      <div className="flex gap-4 px-4 py-3 bg-muted/50 rounded-lg">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 px-4 py-3 border-b last:border-b-0">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              className={cn(
                'h-4 flex-1',
                colIndex === 0 && 'max-w-[150px]',
                colIndex === columns - 1 && 'max-w-[100px]'
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Chart skeleton (pie/bar)
export function ChartSkeleton({ type = 'pie' }: { type?: 'pie' | 'bar' }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-center justify-center">
          {type === 'pie' ? (
            <Skeleton className="h-48 w-48 rounded-full" />
          ) : (
            <div className="flex items-end gap-2 h-48 w-full">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="flex-1"
                  style={{ height: `${Math.random() * 60 + 40}%` }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 flex-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Form section skeleton
export function FormSectionSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: fields }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Comodo/Room item skeleton
export function ComodoSkeleton() {
  return (
    <div className="grid grid-cols-12 gap-2 items-end p-3 bg-muted/50 rounded-lg">
      <div className="col-span-4 space-y-1">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-9 w-full" />
      </div>
      <div className="col-span-2 space-y-1">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-9 w-full" />
      </div>
      <div className="col-span-2 space-y-1">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-9 w-full" />
      </div>
      <div className="col-span-2 space-y-1">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-9 w-full" />
      </div>
      <div className="col-span-1 flex justify-center">
        <Skeleton className="h-9 w-12" />
      </div>
      <div className="col-span-1 flex justify-center">
        <Skeleton className="h-9 w-9 rounded" />
      </div>
    </div>
  );
}

// Grid of comodo skeletons
export function ComodosGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-8 w-24" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: count }).map((_, i) => (
            <ComodoSkeleton key={i} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Sidebar/Summary skeleton
export function SidebarSkeleton() {
  return (
    <Card className="sticky top-4">
      <CardHeader>
        <Skeleton className="h-5 w-24" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="pt-3 border-t">
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-8 w-32" />
        </div>

        {/* Buttons */}
        <div className="space-y-2 pt-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

// Full page loading skeleton
export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="space-y-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-9 w-9 rounded" />
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <FormSectionSkeleton fields={4} />
            <ComodosGridSkeleton count={2} />
          </div>
          <div className="lg:col-span-1">
            <SidebarSkeleton />
          </div>
        </div>
      </main>
    </div>
  );
}
