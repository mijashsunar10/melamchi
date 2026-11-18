"use client";

import { ChevronDown, ExternalLink } from "lucide-react";
import { useState, useTransition } from "react";
import { AddButton, fromQA, move, type QA, QAList, RowTools, SaveBar, toQA, uid, useDirty } from "@/components/admin/editor-bits";
import { FormError } from "@/components/admin/form-bits";
import { IconPicker } from "@/components/admin/icon-picker";
import { Icon } from "@/components/icon";
import { Field, Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { saveSupportTopicsAction } from "@/server/admin/content-actions";
import type { SupportTopicInput } from "@/server/admin/content-types";
import type { IconName } from "@/types/catalog";

type TopicState = { uid: string; slug: string; name: string; icon: IconName; faqs: QA[] };

const toPayload = (topics: TopicState[]): SupportTopicInput[] =>
  topics.map((t) => ({ slug: t.slug, name: t.name.trim(), icon: t.icon, faqs: fromQA(t.faqs) }));

export function HelpTopicsEditor({ initial }: { initial: SupportTopicInput[] }) {
  const toast = useToast();
  const [saving, start] = useTransition();
  const [error, setError] = useState<string>();
  const [topics, setTopics] = useState<TopicState[]>(() => initial.map((t) => ({ ...t, uid: uid(), faqs: toQA(t.faqs) })));
  const [open, setOpen] = useState<string | null>(null);
  const { dirty, markSaved } = useDirty(JSON.stringify(toPayload(topics)));

  const set = (u: string, patch: Partial<TopicState>) => setTopics((all) => all.map((t) => (t.uid === u ? { ...t, ...patch } : t)));

  return (
    <form
      className="pb-28"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setError(undefined);
        start(async () => {
          const r = await saveSupportTopicsAction(toPayload(topics));
          if (r.error) {
            setError(r.error);
            return toast({ type: "error", title: r.error });
          }
          toast({ type: "success", title: r.message ?? "Saved." });
          markSaved();
        });
      }}
    >
      <FormError error={error} />
      <div className="mb-4 flex justify-end">
        <a href="/support" target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-xl border border-input bg-surface px-4 text-sm font-semibold hover:bg-muted">
          See it on the website <ExternalLink className="size-4" />
        </a>
      </div>
      <ul className="flex flex-col gap-3" data-topic-list>
        {topics.map((t, i) => {
          const isOpen = open === t.uid;
          return (
            <li key={t.uid} className="rounded-2xl border border-border bg-surface shadow-card" data-topic>
              <div className="flex items-center gap-3 p-4 sm:px-5">
                <button type="button" onClick={() => setOpen(isOpen ? null : t.uid)} aria-expanded={isOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20">
                    <Icon name={t.icon} className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{t.name || "New topic"}</span>
                    <span className="block text-sm text-muted-foreground">
                      {t.faqs.length} {t.faqs.length === 1 ? "question" : "questions"} · {isOpen ? "click to close" : "click to edit"}
                    </span>
                  </span>
                  <ChevronDown className={cn("size-5 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                </button>
                <RowTools
                  index={i}
                  count={topics.length}
                  onMove={(d) => setTopics((all) => move(all, i, d))}
                  onRemove={() => {
                    if (window.confirm(`Remove the topic “${t.name}” and its questions? (Nothing changes until you press Save.)`))
                      setTopics((all) => all.filter((x) => x.uid !== t.uid));
                  }}
                  removeLabel="Remove topic"
                />
              </div>
              {isOpen && (
                <div className="flex flex-col gap-5 border-t border-border p-4 sm:p-5">
                  <Field label="Topic name" required help="Example: Payments">
                    {(id, d) => <Input id={id} aria-describedby={d} value={t.name} onChange={(e) => set(t.uid, { name: e.target.value })} data-topic-name />}
                  </Field>
                  <div>
                    <p className="mb-2 text-sm font-semibold">Icon</p>
                    <IconPicker name={`icon-${t.uid}`} defaultValue={t.icon} onChange={(icon) => set(t.uid, { icon })} />
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-semibold">Questions in this topic</p>
                    <QAList items={t.faqs} onChange={(faqs) => set(t.uid, { faqs })} />
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <div className="mt-4">
        <AddButton
          onClick={() => {
            const u = uid();
            setTopics((all) => [...all, { uid: u, slug: "", name: "", icon: "LifeBuoy", faqs: [] }]);
            setOpen(u);
          }}
        >
          Add topic
        </AddButton>
      </div>
      <SaveBar backHref="/admin/content" backLabel="Content" dirty={dirty} saving={saving} />
    </form>
  );
}
