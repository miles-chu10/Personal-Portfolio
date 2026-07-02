"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center bg-background text-foreground">
      <div className="mx-auto w-full max-w-[42rem] px-4 sm:px-6">
        <p className="text-[0.95rem] leading-5 text-muted">Error</p>
        <h1 className="mt-3 text-[1.85rem] font-semibold leading-none sm:text-[2rem]">
          Something went wrong
        </h1>
        <p className="mt-3 text-[0.96rem] leading-5 text-muted">
          An unexpected error interrupted this page.
        </p>
        <button
          className="mt-6 inline-block rounded-sm border border-line px-3 py-1.5 text-[0.95rem] leading-5 text-foreground transition-colors hover:border-line-strong hover:bg-foreground/5"
          onClick={reset}
          type="button"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
