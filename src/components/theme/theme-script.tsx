// Runs before first paint: applies the saved theme (or the OS preference)
// so dark-mode users never see a white flash.
export const THEME_STORAGE_KEY = "topx-theme";

const script = `(function(){try{
var k="${THEME_STORAGE_KEY}",d=document.documentElement,m=window.matchMedia("(prefers-color-scheme: dark)");
function a(){var t=localStorage.getItem(k);var dark=t?t==="dark":m.matches;d.classList.toggle("dark",dark);d.style.colorScheme=dark?"dark":"light";}
a();m.addEventListener("change",function(){if(!localStorage.getItem(k))a();});
}catch(e){}})()`;

export function ThemeScript() {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: script }}
    />
  );
}
