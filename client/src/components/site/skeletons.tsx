import { Skeleton } from "@/components/ui/skeleton";

export function ServicesSkeleton() {
  return (
    <section className="relative pt-20 pb-4 md:pt-32 md:pb-8 bg-[color:var(--cream)] text-[color:var(--charcoal)] animate-pulse">
      <div className="container-luxe relative z-10">
        {/* Header */}
        <div className="mb-24 md:mb-32 max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-[1px] bg-[color:var(--gold)]/30" />
            <Skeleton className="h-4 w-48 bg-primary/10" />
          </div>
          <Skeleton className="h-12 md:h-16 w-3/4 max-w-lg mb-8 bg-primary/10" />
          <Skeleton className="h-4 w-full max-w-md bg-primary/10" />
        </div>

        {/* Grid Items */}
        <div className="space-y-28 md:space-y-40">
          {[0, 1, 2].map((idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center"
              >
                {/* Image Placeholder */}
                <div
                  className={`md:col-span-7 rounded-lg overflow-hidden ${
                    isEven ? "md:col-start-1" : "md:col-start-6"
                  } ${!isEven && "md:order-2"}`}
                >
                  <Skeleton
                    className={`w-full bg-primary/10 ${
                      idx === 1
                        ? "aspect-[3/4] md:aspect-[4/5]"
                        : "aspect-[4/3] md:aspect-[4/3]"
                    }`}
                  />
                </div>

                {/* Content Placeholder */}
                <div
                  className={`md:col-span-5 flex flex-col justify-center ${
                    isEven ? "md:col-start-9" : "md:col-start-1"
                  } ${isEven && "md:order-2"}`}
                >
                  <Skeleton className="h-4 w-32 mb-4 bg-primary/10" />
                  <Skeleton className="h-8 md:h-10 w-2/3 mb-5 bg-primary/10" />
                  <Skeleton className="h-4 w-full mb-2 bg-primary/10" />
                  <Skeleton className="h-4 w-5/6 mb-6 bg-primary/10" />

                  {/* Price & Duration */}
                  <div className="flex items-end justify-between border-b border-[color:var(--charcoal)]/20 pb-4 mb-7">
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-3 w-16 bg-primary/10" />
                      <Skeleton className="h-8 w-24 bg-primary/10" />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Skeleton className="h-3 w-16 bg-primary/10" />
                      <Skeleton className="h-6 w-20 bg-primary/10" />
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Skeleton className="h-12 w-36 rounded-full bg-primary/10" />
                    <Skeleton className="h-12 w-36 rounded-full bg-primary/10" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function ArtistsSkeleton() {
  return (
    <section className="pt-8 pb-20 md:pt-12 md:pb-28 animate-pulse">
      <div className="container-luxe">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-2xl w-full">
            <Skeleton className="h-4 w-24 bg-primary/10" />
            <Skeleton className="h-10 md:h-14 w-5/6 mt-5 bg-primary/10" />
            <Skeleton className="h-4 w-full mt-5 bg-primary/10" />
          </div>
          <div className="hidden md:flex gap-3">
            <Skeleton className="w-12 h-12 rounded-full bg-primary/10" />
            <Skeleton className="w-12 h-12 rounded-full bg-primary/10" />
          </div>
        </div>

        <div className="mt-6 md:mt-14 flex gap-6 overflow-x-hidden pb-6">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="w-[280px] sm:w-[310px] md:w-[340px] flex-shrink-0"
            >
              <Skeleton className="relative aspect-[4/5] rounded-[1.5rem] bg-primary/10 w-full" />
              <div className="mt-5 space-y-2">
                <Skeleton className="h-6 w-2/3 bg-primary/10" />
                <Skeleton className="h-4 w-1/2 bg-primary/10" />
                <Skeleton className="h-3 w-1/3 mt-2 bg-primary/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function InstaGridSkeleton() {
  return (
    <section className="py-20 md:py-24 bg-secondary/40 animate-pulse">
      <div className="container-luxe">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <Skeleton className="h-4 w-24 bg-primary/10" />
            <Skeleton className="h-10 md:h-14 w-48 mt-5 bg-primary/10" />
          </div>
          <Skeleton className="h-4 w-36 bg-primary/10" />
        </div>

        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 grid-rows-[180px] md:grid-rows-[220px] auto-rows-[180px] md:auto-rows-[220px] gap-3 md:gap-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => {
            const span = idx % 3 === 0 ? "row-span-2" : "";
            return (
              <Skeleton
                key={idx}
                className={`w-full h-full rounded-2xl bg-primary/10 ${span}`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function PricingSkeleton() {
  return (
    <section className="py-28 md:py-36 bg-secondary/40 animate-pulse">
      <div className="container-luxe">
        <div className="text-center max-w-2xl mx-auto flex flex-col items-center">
          <Skeleton className="h-4 w-20 bg-primary/10" />
          <Skeleton className="h-10 md:h-14 w-5/6 mt-5 bg-primary/10" />
        </div>

        <div className="mt-16 grid gap-7 md:grid-cols-3">
          {[0, 1, 2].map((idx) => (
            <div
              key={idx}
              className="relative rounded-[1.75rem] p-8 md:p-10 border border-border bg-card/50 flex flex-col justify-between min-h-[400px]"
            >
              <div>
                <Skeleton className="h-8 w-1/2 bg-primary/10 mb-2" />
                <Skeleton className="h-4 w-3/4 bg-primary/10 mb-6" />
                <Skeleton className="h-10 w-1/3 bg-primary/10 mb-8" />
                <div className="space-y-3">
                  {[0, 1, 2, 3].map((f) => (
                    <div key={f} className="flex items-center gap-3">
                      <Skeleton className="w-5 h-5 rounded-full bg-primary/10" />
                      <Skeleton className="h-4 w-5/6 bg-primary/10" />
                    </div>
                  ))}
                </div>
              </div>
              <Skeleton className="h-12 w-full rounded-full bg-primary/10 mt-10" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TestimonialsSkeleton() {
  return (
    <section className="py-28 md:py-36 animate-pulse">
      <div className="container-luxe">
        <div className="max-w-2xl">
          <Skeleton className="h-4 w-24 bg-primary/10" />
          <Skeleton className="h-10 md:h-14 w-3/4 mt-5 bg-primary/10" />
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[0, 1, 2].map((idx) => (
            <div
              key={idx}
              className="bg-card border border-border rounded-3xl p-8 md:p-9 flex flex-col"
            >
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((star) => (
                  <Skeleton key={star} className="w-4.5 h-4.5 rounded bg-primary/10" />
                ))}
              </div>
              <Skeleton className="h-6 w-full mt-6 bg-primary/10" />
              <Skeleton className="h-6 w-4/5 mt-2 bg-primary/10" />
              <div className="mt-8 pt-6 border-t border-border flex items-center gap-3">
                <Skeleton className="w-11 h-11 rounded-full bg-primary/10" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-24 bg-primary/10" />
                  <Skeleton className="h-3 w-16 bg-primary/10" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ContactSkeleton() {
  return (
    <section className="py-20 md:py-24 animate-pulse">
      <div className="container-luxe grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <Skeleton className="h-4 w-20 bg-primary/10" />
            <Skeleton className="h-10 md:h-14 w-4/5 mt-4 bg-primary/10" />
            <Skeleton className="h-4 w-full mt-4 bg-primary/10" />
            <Skeleton className="h-4 w-5/6 mt-2 bg-primary/10" />

            <ul className="mt-8 space-y-6">
              {[0, 1, 2].map((idx) => (
                <li key={idx} className="flex items-start gap-5">
                  <Skeleton className="w-11 h-11 rounded-full bg-primary/10" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-3 w-16 bg-primary/10" />
                    <Skeleton className="h-4 w-3/4 bg-primary/10" />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-7 flex flex-col gap-6 w-full">
          <Skeleton className="h-10 w-64 rounded-2xl bg-primary/10" />
          <Skeleton className="h-[300px] md:h-[350px] rounded-3xl bg-primary/10 w-full" />
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Skeleton className="h-12 flex-1 rounded-full bg-primary/10" />
            <Skeleton className="h-12 flex-1 rounded-full bg-primary/10" />
          </div>
        </div>
      </div>
    </section>
  );
}
