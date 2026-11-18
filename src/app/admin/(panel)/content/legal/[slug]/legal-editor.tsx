"use client";

import { ExternalLink } from "lucide-react";
import { useState, useTransition } from "react";
import { AddButton, Card, move, RowTools, SaveBar, uid, useDirty } from "@/components/admin/editor-bits";
import { FormError } from "@/components/admin/form-bits";
import { Field, Input, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { saveLegalPageAction } from "@/server/admin/content-actions";
import type { LegalPageInput } from "@/server/admin/content-types";
import type { LegalSection } from "@/types/content";

type PartState = { uid: string; id: string; heading: string; paragraphs: string; bullets: string };

const toPart = (s: LegalSection): PartState => ({
  uid: uid(),
  id: s.id,
  heading: s.heading,
  paragraphs: (s.paragraphs ?? []).join("\n\n"),
  bullets: (s.bullets ?? []).join("\n"),
});
const toSection = (p: PartState): LegalSection => ({
  id: p.id,
  heading: p.heading.trim(),
  paragraphs: p.paragraphs.split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean),
  bullets: p.bullets.split("\n").map((x) => x.trim()).filter(Boolean),
});

export function LegalEditor({ initial, updated }: { initial: LegalPageInput; updated: string }) {
  const toast = useToast();
  const [saving, start] = useTransition();
  const [error, setError] = useState<string>();
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [parts, setParts] = useState<PartState[]>(() => initial.sections.map(toPart));

  const payload = (): LegalPageInput => ({ slug: initial.slug, title: title.trim(), description: description.trim(), sections: parts.map(toSection) });
  const { dirty, markSaved } = useDirty(JSON.stringify(payload()));
  const set = (u: string, patch: Partial<PartState>) => setParts((all) => all.map((p) => (p.uid === u ? { ...p, ...patch } : p)));

  return (
    <form
      noValidate
      className="pb-28"
      onSubmit={(e) => {
        e.preventDefault();
        setError(undefined);
        const data = payload();
        start(async () => {
          const r = await saveLegalPageAction(data);
          if (r.error) {
            setError(r.error);
            return toast({ type: "error", title: r.error });
          }
          toast({ type: "success", title: r.message ?? "Saved." });
          markSaved(JSON.stringify(data));
        });
      }}
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title || "Legal page"}</h1>
          <p className="text-sm text-muted-foreground">
            Last updated {new Date(updated).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <a href={`/${initial.slug}`} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 rounded-xl border border-input bg-surface px-4 text-sm font-semibold hover:bg-muted">
          See it on the website <ExternalLink className="size-4" />
        </a>
      </div>
      <FormError error={error} />
      <div className="mt-4 flex flex-col gap-6">
        <Card title="Page title & summary">
          <div className="flex flex-col gap-5">
            <Field label="Title" required>
              {(id) => <Input id={id} name="title" value={title} onChange={(e) => setTitle(e.target.value)} />}
            </Field>
            <Field label="Summary" required help="Shown under the title and in Google.">
              {(id, d) => <Textarea id={id} aria-describedby={d} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-0" />}
            </Field>
          </div>
        </Card>
        <Card title="Parts of the page" description="Each part has a heading, some text and/or a list. They also appear in the page’s table of contents.">
          <ol className="flex flex-col gap-3" data-part-list>
            {parts.map((p, i) => (
              <li key={p.uid} className="rounded-xl border border-border p-4" data-part>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="text-sm font-bold">
                    Part {i + 1}
                    {p.heading && <span className="font-normal text-muted-foreground"> · {p.heading}</span>}
                  </span>
                  <RowTools index={i} count={parts.length} onMove={(d) => setParts((all) => move(all, i, d))} onRemove={() => setParts((all) => all.filter((x) => x.uid !== p.uid))} removeLabel="Remove part" />
                </div>
                <div className="flex flex-col gap-3">
                  <Field label="Heading" required>
                    {(id) => <Input id={id} value={p.heading} onChange={(e) => set(p.uid, { heading: e.target.value })} data-part-heading />}
                  </Field>
                  <Field label="Text" help="Leave an empty line between paragraphs.">
                    {(id, d) => <Textarea id={id} aria-describedby={d} rows={4} value={p.paragraphs} onChange={(e) => set(p.uid, { paragraphs: e.target.value })} />}
                  </Field>
                  <Field label="List" help="One point per line (shown with bullets).">
                    {(id, d) => <Textarea id={id} aria-describedby={d} rows={3} value={p.bullets} onChange={(e) => set(p.uid, { bullets: e.target.value })} />}
                  </Field>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-4">
            <AddButton onClick={() => setParts((all) => [...all, { uid: uid(), id: "", heading: "", paragraphs: "", bullets: "" }])}>Add part</AddButton>
          </div>
        </Card>
      </div>
      <SaveBar backHref="/admin/content/legal" backLabel="Legal pages" dirty={dirty} saving={saving} />
    </form>
  );
}
