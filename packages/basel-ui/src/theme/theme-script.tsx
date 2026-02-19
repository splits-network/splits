/**
 * ThemeScript — Inline blocking script to prevent flash of wrong theme.
 *
 * Renders a <script> that runs synchronously before React hydrates.
 * It reads the stored theme from localStorage and sets `data-theme`
 * on <html> immediately so the browser paints the correct palette
 * from the first frame.
 *
 * Must be placed inside <head> or at the very top of <body>.
 */
export function ThemeScript({ defaultTheme = "splits-light" }: { defaultTheme?: string }) {
    const script = `
(function(){
  try {
    var t = localStorage.getItem("splits-theme");
    if (t === "splits-light" || t === "splits-dark") {
      document.documentElement.setAttribute("data-theme", t);
    } else {
      document.documentElement.setAttribute("data-theme", "${defaultTheme}");
    }
  } catch(e) {
    document.documentElement.setAttribute("data-theme", "${defaultTheme}");
  }
})();
`.trim();

    return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
