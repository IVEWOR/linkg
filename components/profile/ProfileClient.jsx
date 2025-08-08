"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import UploadButton from "@/components/common/UploadButton";
import { Pencil, Check, GripVertical, Plus, Trash2, X } from "lucide-react";

const BRAND_BORDER = "border-green-500/20";
const BRAND_HOVER = "hover:shadow-green-500/20";

const safeHost = (url) => {
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
  } catch {
    return "";
  }
};
const Favicon = ({ url }) => {
  const host = safeHost(url);
  if (!host)
    return (
      <div className="size-12 rounded-lg bg-gray-200/60 dark:bg-white/5" />
    );
  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${host}&sz=64`}
      className="size-12 rounded-lg"
      alt=""
    />
  );
};

export default function ProfileClient({
  initialProfile,
  initialStack,
  isOwner,
}) {
  const router = useRouter();
  const [edit, setEdit] = useState(false);
  const [profile, setProfile] = useState(initialProfile);
  const [stack, setStack] = useState(initialStack);
  const [usernameErr, setUsernameErr] = useState("");
  const originalUsernameRef = useRef(initialProfile.username);

  // ---------- API helpers ----------
  const saveProfile = async (patch) => {
    const current = originalUsernameRef.current;
    const res = await fetch(`/api/users/${encodeURIComponent(current)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      const { user } = await res.json();
      setProfile(user);
      if (patch.username && patch.username !== current) {
        originalUsernameRef.current = user.username;
        router.replace(`/${user.username}`);
      } else {
        router.refresh();
      }
      return { ok: true };
    } else {
      return { ok: false, status: res.status, msg: await res.text() };
    }
  };

  const addFromOrigin = async (originItemId) => {
    const res = await fetch("/api/stack", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ originItemId }),
    });
    if (!res.ok) return alert(await res.text());
    const { item } = await res.json();
    setStack((p) => [...p, item].sort((a, b) => a.position - b.position));
    closeAddModal();
  };

  const addCustom = async (payload) => {
    if (!payload.title || !payload.url || !payload.category) {
      return alert("Title, URL and Category are required");
    }
    const res = await fetch("/api/stack", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return alert(await res.text());
    const { item } = await res.json();
    setStack((p) => [...p, item].sort((a, b) => a.position - b.position));
    closeAddModal();
  };

  const updateItem = async (id, patch) => {
    const res = await fetch(`/api/stack/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) return alert(await res.text());
    const { item } = await res.json();
    setStack((p) => p.map((i) => (i.id === id ? item : i)));
  };

  const deleteItem = async (id) => {
    if (!confirm("Delete this item?")) return;
    const res = await fetch(`/api/stack/${id}`, { method: "DELETE" });
    if (!res.ok) return alert(await res.text());
    setStack((p) =>
      p
        .filter((i) => i.id !== id)
        .map((i, idx) => ({ ...i, position: idx + 1 }))
    );
    await persistOrder();
  };

  // ---------- reorder ----------
  const [dragId, setDragId] = useState(null);
  const onDragStart = (id) => setDragId(id);
  const onDragOver = (e, overId, groupIds) => {
    e.preventDefault();
    if (!dragId || dragId === overId) return;
    // only reorder within this group
    if (!groupIds.includes(dragId) || !groupIds.includes(overId)) return;
    const next = [...stack];
    const ai = next.findIndex((i) => i.id === dragId);
    const bi = next.findIndex((i) => i.id === overId);
    const [moved] = next.splice(ai, 1);
    next.splice(bi, 0, moved);
    // re-number globally (keeps uniqueness)
    setStack(next.map((i, idx) => ({ ...i, position: idx + 1 })));
  };
  const persistOrder = async () => {
    const ids = stack.map((i) => i.id);
    await fetch("/api/stack/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
  };

  // ---------- add modal ----------
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [customDraft, setCustomDraft] = useState({
    title: "",
    url: "",
    category: "",
    imageUrl: "",
  });

  useEffect(() => {
    if (!showAdd || !search) {
      setSearchResults([]);
      return;
    }
    const t = setTimeout(async () => {
      const res = await fetch(
        `/api/items?q=${encodeURIComponent(search)}&take=10`
      );
      const json = await res.json();
      setSearchResults(json.items || []);
    }, 250);
    return () => clearTimeout(t);
  }, [search, showAdd]);

  const closeAddModal = () => {
    setShowAdd(false);
    setSearch("");
    setSearchResults([]);
    setCustomDraft({ title: "", url: "", category: "", imageUrl: "" });
  };

  // ---------- grouping by category ----------
  const grouped = useMemo(() => {
    const map = new Map();
    for (const it of stack) {
      const key = it.category || "Uncategorized";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(it);
    }
    // stable sort categories alphabetically (you can customize)
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [stack]);

  // ---------- left panel (sticky) ----------
  const LeftPanel = (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div
        className={`rounded-2xl border ${BRAND_BORDER} bg-white/60 dark:bg-white/5 backdrop-blur-xl p-6 shadow-lg`}
      >
        <div className="flex flex-col items-center text-center">
          <img
            src={
              profile.avatarUrl ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${profile.username}`
            }
            className="size-28 rounded-full border border-white/20 object-cover shadow"
            alt=""
          />
          {isOwner && edit && (
            <div className="mt-3">
              <UploadButton
                folder="avatars"
                onUploaded={(url) => saveProfile({ avatarUrl: url })}
              >
                Change Avatar
              </UploadButton>
            </div>
          )}

          {/* username + name */}
          <div className="mt-4 w-full">
            {edit ? (
              <>
                <input
                  className="w-full rounded-lg border border-white/10 bg-white/60 dark:bg-white/5 px-3 py-1.5 text-center text-base font-semibold outline-none focus:ring-2 focus:ring-green-500/40"
                  defaultValue={profile.username}
                  onBlur={async (e) => {
                    const next = e.target.value.trim();
                    setUsernameErr("");
                    if (!next || next === profile.username) return;
                    const res = await saveProfile({ username: next });
                    if (!res.ok) {
                      if (res.status === 409)
                        setUsernameErr("Username already taken");
                      else
                        setUsernameErr(res.msg || "Unable to change username");
                    }
                  }}
                />
                {usernameErr && (
                  <p className="mt-1 text-xs text-red-500">{usernameErr}</p>
                )}
                <input
                  className="mt-2 w-full rounded-lg border border-white/10 bg-white/60 dark:bg-white/5 px-3 py-1.5 text-center text-sm outline-none focus:ring-2 focus:ring-green-500/40"
                  placeholder="Your name"
                  defaultValue={profile.name || ""}
                  onBlur={(e) => saveProfile({ name: e.target.value })}
                />
              </>
            ) : (
              <>
                <h1 className="text-lg font-semibold">@{profile.username}</h1>
                {profile.name ? (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {profile.name}
                  </p>
                ) : null}
              </>
            )}
          </div>

          {/* bio */}
          <div className="mt-3 w-full">
            {edit ? (
              <textarea
                className="w-full rounded-lg border border-white/10 bg-white/60 dark:bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500/40"
                defaultValue={profile.descriptionShort || ""}
                placeholder="Say something about you..."
                onBlur={(e) =>
                  saveProfile({ descriptionShort: e.target.value })
                }
              />
            ) : profile.descriptionShort ? (
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {profile.descriptionShort}
              </p>
            ) : null}
          </div>

          {/* socials */}
          <div className="mt-4 w-full">
            <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Social
            </h3>
            {edit ? (
              <SocialEditor
                social={profile.socialLinks || []}
                onChange={(links) => saveProfile({ socialLinks: links })}
              />
            ) : (
              <SocialView social={profile.socialLinks || []} />
            )}
          </div>

          {/* edit toggle */}
          {isOwner && (
            <button
              className={`mt-6 inline-flex items-center justify-center rounded-xl border ${BRAND_BORDER} bg-white/70 dark:bg-white/5 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-white/80 dark:hover:bg-white/10 transition ${BRAND_HOVER}`}
              onClick={async () => {
                if (edit) await persistOrder();
                setEdit((v) => !v);
              }}
              title={edit ? "Done" : "Edit profile"}
            >
              {edit ? (
                <>
                  <Check size={16} className="mr-2" /> Done
                </>
              ) : (
                <>
                  <Pencil size={16} className="mr-2" /> Edit
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </aside>
  );

  return (
    <div className="lg:grid lg:grid-cols-[320px,1fr] lg:gap-10">
      {LeftPanel}

      {/* Right column: its own scroll, grouped by category */}
      <main className="mt-6 lg:mt-0 lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto pr-1">
        <div className="space-y-8">
          {isOwner && edit && (
            <div className="flex justify-end">
              <button
                className={`inline-flex items-center gap-2 rounded-xl border ${BRAND_BORDER} bg-white/70 dark:bg-white/5 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-white/80 dark:hover:bg-white/10 transition ${BRAND_HOVER}`}
                onClick={() => setShowAdd(true)}
              >
                <Plus size={16} /> Add Item
              </button>
            </div>
          )}

          {grouped.map(([category, items]) => (
            <section key={category} className="space-y-3">
              <h2 className="text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-300">
                {category}
              </h2>

              <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {items.map((it) => (
                  <li
                    key={it.id}
                    className={`rounded-2xl border ${BRAND_BORDER} bg-white/60 dark:bg-white/5 p-4 backdrop-blur-xl shadow-lg hover:shadow-xl transition ${BRAND_HOVER}`}
                    draggable={isOwner && edit}
                    onDragStart={() => onDragStart(it.id)}
                    onDragOver={(e) =>
                      onDragOver(
                        e,
                        it.id,
                        items.map((x) => x.id)
                      )
                    }
                  >
                    <div className="flex gap-3">
                      {isOwner && edit && (
                        <GripVertical
                          className="mt-1 shrink-0 text-gray-400"
                          size={16}
                        />
                      )}

                      {it.imageUrl ? (
                        <img
                          src={it.imageUrl}
                          className="size-12 rounded-lg object-cover"
                          alt=""
                        />
                      ) : (
                        <Favicon url={it.url} />
                      )}

                      <div className="min-w-0 flex-1">
                        {edit ? (
                          <input
                            className="w-full rounded-md border border-white/10 bg-white/60 dark:bg-white/5 px-2 py-1 text-sm font-medium outline-none focus:ring-2 focus:ring-green-500/40"
                            defaultValue={it.title}
                            onBlur={(e) =>
                              updateItem(it.id, { title: e.target.value })
                            }
                          />
                        ) : (
                          <a
                            href={it.url}
                            target="_blank"
                            className="truncate font-medium hover:underline"
                          >
                            {it.title}
                          </a>
                        )}

                        {edit ? (
                          <input
                            className="mt-1 w-full rounded-md border border-white/10 bg-white/60 dark:bg-white/5 px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-green-500/40"
                            defaultValue={it.url}
                            onBlur={(e) =>
                              updateItem(it.id, { url: e.target.value })
                            }
                          />
                        ) : (
                          <p className="truncate text-xs text-gray-600 dark:text-gray-400">
                            {safeHost(it.url)}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center rounded-full border border-white/15 bg-white/50 px-2 py-0.5 text-[11px] text-gray-700 dark:bg-white/10 dark:text-gray-300">
                            {it.category || "—"}
                          </span>

                          {edit && (
                            <>
                              <UploadButton
                                folder="stack-images"
                                onUploaded={(url) =>
                                  updateItem(it.id, { imageUrl: url })
                                }
                              >
                                Image
                              </UploadButton>
                              <input
                                className="w-36 rounded-md border border-white/10 bg-white/60 dark:bg-white/5 px-2 py-1 text-[11px] outline-none focus:ring-2 focus:ring-green-500/40"
                                placeholder="Category"
                                defaultValue={it.category}
                                onBlur={(e) =>
                                  updateItem(it.id, {
                                    category: e.target.value,
                                  })
                                }
                              />
                            </>
                          )}
                        </div>
                      </div>

                      {isOwner && edit && (
                        <button
                          className="ml-2 h-8 rounded-md border border-white/10 bg-white/60 px-2 text-xs text-red-600 dark:bg-white/5"
                          onClick={() => deleteItem(it.id)}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>

      {/* Add Item Modal */}
      {isOwner && edit && showAdd && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <div
            className={`w-full max-w-xl rounded-2xl border ${BRAND_BORDER} bg-[#0b0f0c] text-white shadow-2xl`}
          >
            <div className="flex items-center justify-between p-4">
              <h3 className="text-lg font-semibold">Add Item</h3>
              <button
                className="rounded-lg p-2 text-gray-300 hover:bg-white/5"
                onClick={closeAddModal}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 p-4 pt-0">
              <input
                autoFocus
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none placeholder:text-gray-400"
                placeholder="Search existing items (VS Code, GitHub...)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {searchResults.length > 0 && (
                <ul className="max-h-48 divide-y divide-white/10 overflow-auto rounded-lg border border-white/10">
                  {searchResults.map((it) => (
                    <li
                      key={it.id}
                      className="flex items-center justify-between p-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{it.title}</p>
                        <p className="truncate text-xs text-gray-400">
                          {it.category} • {it.url}
                        </p>
                      </div>
                      <button
                        className="rounded-md border border-white/10 bg-white/10 px-3 py-1 text-xs hover:bg-white/15"
                        onClick={() => addFromOrigin(it.id)}
                      >
                        Add
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="rounded-xl border border-white/10 p-3">
                <p className="mb-2 text-sm font-medium text-gray-200">
                  Or create a custom item
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none"
                    placeholder="Title"
                    value={customDraft.title}
                    onChange={(e) =>
                      setCustomDraft((s) => ({ ...s, title: e.target.value }))
                    }
                  />
                  <input
                    className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none"
                    placeholder="Category"
                    value={customDraft.category}
                    onChange={(e) =>
                      setCustomDraft((s) => ({
                        ...s,
                        category: e.target.value,
                      }))
                    }
                  />
                  <input
                    className="col-span-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none"
                    placeholder="URL"
                    value={customDraft.url}
                    onChange={(e) =>
                      setCustomDraft((s) => ({ ...s, url: e.target.value }))
                    }
                  />
                  <div className="col-span-2 flex items-center gap-2">
                    <input
                      className="flex-1 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none"
                      placeholder="Image URL (optional)"
                      value={customDraft.imageUrl}
                      onChange={(e) =>
                        setCustomDraft((s) => ({
                          ...s,
                          imageUrl: e.target.value,
                        }))
                      }
                    />
                    <UploadButton
                      folder="stack-images"
                      onUploaded={(url) =>
                        setCustomDraft((s) => ({ ...s, imageUrl: url }))
                      }
                    >
                      Upload
                    </UploadButton>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                    onClick={() => addCustom(customDraft)}
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Social components ---------- */

function SocialView({ social }) {
  if (!social || social.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No social links.
      </p>
    );
  }
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {social.map((s, i) => (
        <a
          key={i}
          href={s.url}
          target="_blank"
          className="rounded-lg border border-white/10 bg-white/60 px-3 py-1 text-xs text-gray-700 hover:bg-white/70 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10"
        >
          {s.platform || "link"}
        </a>
      ))}
    </div>
  );
}

function SocialEditor({ social, onChange }) {
  const [rows, setRows] = useState(social || []);
  useEffect(() => {
    setRows(social || []);
  }, [social]);
  const set = (idx, key, val) => {
    const next = rows.map((r, i) => (i === idx ? { ...r, [key]: val } : r));
    setRows(next);
    onChange(next);
  };
  const add = () => {
    const next = [...rows, { platform: "", url: "" }];
    setRows(next);
    onChange(next);
  };
  const del = (idx) => {
    const next = rows.filter((_, i) => i !== idx);
    setRows(next);
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <div key={i} className="flex gap-2">
          <input
            className="w-32 rounded-md border border-white/10 bg-white/60 px-2 py-1 text-xs outline-none dark:bg-white/5"
            placeholder="Platform"
            value={r.platform || ""}
            onChange={(e) => set(i, "platform", e.target.value)}
          />
          <input
            className="flex-1 rounded-md border border-white/10 bg-white/60 px-2 py-1 text-xs outline-none dark:bg-white/5"
            placeholder="URL"
            value={r.url || ""}
            onChange={(e) => set(i, "url", e.target.value)}
          />
          <button
            className="rounded-md border border-white/10 bg-white/60 px-2 py-1 text-xs text-red-600 dark:bg-white/5"
            onClick={() => del(i)}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        className="rounded-md border border-white/10 bg-white/60 px-3 py-1 text-xs hover:bg-white/70 dark:bg-white/5 dark:hover:bg-white/10"
        onClick={add}
      >
        Add link
      </button>
    </div>
  );
}
