import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center bg-background text-foreground">
      <div className="mx-auto w-full max-w-[42rem] px-4 sm:px-6">
        <p className="text-[0.95rem] leading-5 text-muted tabular-nums">404</p>
        <h1 className="mt-3 text-[1.85rem] font-semibold leading-none sm:text-[2rem]">
          Page not found
        </h1>
        <p className="mt-3 text-[0.96rem] leading-5 text-muted">
          This page does not exist. Everything lives on the homepage.
        </p>
        <Link
          className="mt-6 inline-block text-[0.95rem] leading-5 underline decoration-foreground/40 transition-colors hover:decoration-foreground"
          href="/"
        >
          Back to portfolio
        </Link>
      </div>
    </main>
  );
}
