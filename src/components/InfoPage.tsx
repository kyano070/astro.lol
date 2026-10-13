export default function InfoPage({ title, updated, children }: { title: string; updated?: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-bold tracking-tight text-white">{title}</h1>
      {updated && <p className="mt-2 text-sm text-zinc-500">Last updated: {updated}</p>}
      <div className="mt-8 space-y-5 leading-relaxed text-zinc-400 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white [&_a]:text-astro-soft [&_a:hover]:underline [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
        {children}
      </div>
    </main>
  );
}
