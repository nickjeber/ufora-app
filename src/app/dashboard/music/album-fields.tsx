import type { Album } from "@/lib/types";

export function AlbumFields({ album }: { album?: Album }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto]">
        <div>
          <label className="field-label" htmlFor="title">
            Title
          </label>
          <input id="title" name="title" className="input" defaultValue={album?.title} required maxLength={200} />
        </div>
        <div>
          <label className="field-label" htmlFor="release_type">
            Type
          </label>
          <select id="release_type" name="release_type" className="input" defaultValue={album?.release_type ?? "album"}>
            <option value="album">Album</option>
            <option value="ep">EP</option>
            <option value="single">Single</option>
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="release_date">
            Release date
          </label>
          <input id="release_date" name="release_date" type="date" className="input" defaultValue={album?.release_date ?? ""} />
        </div>
      </div>
      <div>
        <label className="field-label" htmlFor="description">
          Notes <span className="tracking-normal normal-case">(optional)</span>
        </label>
        <textarea
          id="description"
          name="description"
          className="input min-h-20"
          defaultValue={album?.description ?? ""}
          maxLength={2000}
          placeholder="Credits, label, a line about the record…"
        />
      </div>
    </>
  );
}
