"use client";

import { ExternalLink } from "lucide-react";
import { useState, useTransition } from "react";
import { Card, fromQA, type QA, QAList, SaveBar, toQA, useDirty } from "@/components/admin/editor-bits";
import { FormError } from "@/components/admin/form-bits";
import { useToast } from "@/components/ui/toast";
import { saveFaqListAction } from "@/server/admin/content-actions";
import type { FAQ } from "@/types/catalog";

export function FaqEditor({ scope, pageName, pageHref, initial }: { scope: string; pageName: string; pageHref: string; initial: FAQ[] }) {
  const toast = useToast();
  const [saving, start] = useTransition();
  const [error, setError] = useState<string>();
  const [items, setItems] = useState<QA[]>(() => toQA(initial));
  const snapshot = JSON.stringify(fromQA(items));
  const { dirty, markSaved } = useDirty(snapshot);

  return (
    <form
      className="pb-28"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setError(undefined);
        start(async () => {
          const r = await saveFaqListAction(scope, fromQA(items));
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
      <Card
        className="mt-4"
        title={`${pageName} questions`}
        description="Shown as a list customers can open and close."
        action={
          <a href={pageHref} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-xl border border-input px-4 text-sm font-semibold hover:bg-muted">
            See it on the website <ExternalLink className="size-4" />
          </a>
        }
      >
        <QAList items={items} onChange={setItems} />
      </Card>
      <SaveBar backHref="/admin/content" backLabel="Content" dirty={dirty} saving={saving} />
    </form>
  );
}
