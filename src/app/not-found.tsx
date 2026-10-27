import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <p className="text-sm uppercase tracking-widest text-muted">404</p>
      <h1 className="mt-3 text-4xl sm:text-5xl">This page could not be found</h1>
      <p className="mt-4 text-lg text-muted">
        The path may be mistyped, or the passage or chapter may not be in our dataset.
      </p>
      <p className="mt-8 flex flex-wrap justify-center gap-6">
        <Link href="/" className="text-accent underline">
          Home
        </Link>
        <Link href="/scriptures" className="text-accent underline">
          Scripture Explorer
        </Link>
        <Link href="/companions" className="text-accent underline">
          Companions
        </Link>
      </p>
    </div>
  );
}
