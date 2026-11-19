import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center">
      <p className="font-display text-7xl font-black text-primary italic">404</p>
      <h1 className="mt-4 font-display text-2xl font-black">Page not found</h1>
      <p className="mt-2 text-muted-foreground">This page doesn&apos;t exist or was moved. Try the shop or search for what you need.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/">Go home</ButtonLink>
        <ButtonLink href="/products" variant="outline">
          Search products
        </ButtonLink>
      </div>
    </div>
  );
}
