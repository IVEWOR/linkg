// components/home/MasonryGrid.jsx
export default function MasonryGrid({ items = [] }) {
  if (!items?.length) return null;
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10">
      <h2 className="mb-5 text-sm font-semibold tracking-wide text-gray-300">
        Trending in the Stack
      </h2>
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [column-fill:_balance]">
        {items.map((it) => (
          <article
            key={it.id}
            className="mb-4 break-inside-avoid rounded-2xl border border-white/10 bg-white/10 p-4 shadow-lg backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <div className="flex items-start gap-3">
              {it.imageUrl ? (
                <img
                  src={it.imageUrl}
                  alt=""
                  className="h-12 w-12 rounded-xl object-cover ring-1 ring-white/10"
                />
              ) : (
                <img
                  src={`https://www.google.com/s2/favicons?domain=${(() => {
                    try {
                      return new URL(it.url).hostname;
                    } catch {
                      return "example.com";
                    }
                  })()}&sz=64`}
                  alt=""
                  className="h-12 w-12 rounded-xl ring-1 ring-white/10"
                />
              )}
              <div className="min-w-0">
                <div className="truncate font-semibold">{it.title}</div>
                <div className="truncate text-xs text-gray-300">
                  {it.category || "—"}
                </div>
              </div>
            </div>

            <a
              href={it.url}
              target="_blank"
              className="mt-3 inline-block rounded-lg border border-white/10 bg-white/10 px-3 py-1 text-xs text-gray-200 hover:bg-white/15"
            >
              Visit
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
