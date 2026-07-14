/** Crawlable SEO content — mirrors the FAQPage JSON-LD in index.html. */
export default function About() {
  const h3 = { fontSize: 14, color: 'var(--ink)', margin: '16px 0 6px' };
  return (
    <section className="panel" id="about">
      <h2>About this tool</h2>
      <div style={{ maxWidth: 720, fontSize: '14.5px', color: 'var(--muted)' }}>
        <p style={{ color: 'var(--ink)', fontSize: 15, marginBottom: 10 }}>
          <strong>Color Coordinator</strong> is a free online color wheel and palette generator for web
          designers, developers, marketers and small business owners. Pick a base color, apply color
          theory harmony rules, and get a complete, ready-to-use color scheme for your website, app,
          logo, social media posts or brand kit.
        </p>
        <h3 style={h3}>How to create a color palette in 3 steps</h3>
        <p>
          1. Drag on the color wheel to choose your base hue and saturation, or type a hex code.
          2. Pick a harmony mode: analogous for calm brand themes, complementary for high-contrast
          designs, triadic or tetradic for vibrant creative work. 3. Copy the hex codes, download a
          PNG, or export CSS variables, a Tailwind config, SCSS or JSON straight into your project.
        </p>
        <h3 style={h3}>Who is this for?</h3>
        <p>
          Frontend developers building Tailwind CSS or React themes, graphic designers preparing brand
          guidelines, digital marketers designing ad creatives and social posts, and shop owners
          choosing colors for signage, packaging or a new website. The WCAG contrast checker also
          makes it useful for accessibility audits.
        </p>
        <h3 style={h3}>Private by design</h3>
        <p>
          Everything runs entirely in your browser. Images you upload for palette extraction are
          analyzed locally on your device and never uploaded to any server. Saved palettes stay in
          your own browser storage.
        </p>
      </div>
    </section>
  );
}
