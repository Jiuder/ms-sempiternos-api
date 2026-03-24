import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const swaggerDescription = `
Comprehensive API for **high-performance log ingestion**, **real-time exploration**, and **error analytics**.

| Feature | Description |
|---------|-------------|
| **Ingestion** | Stream massive log files or individual log messages without blocking the event loop |
| **Statistics** | Real-time dashboards, top 10 error rankings, and aggregation counts |
| **Filter History** | Manage query states with full Undo/Redo mechanisms using an optimized Stack |
| **Deduplication** | Identifies and counts duplicate log messages globally using sliding windows |

**Docs version:** 1.0.0
`;

const customSwaggerCss = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  :root {
    --accent: #3b82f6;
    --accent-light: #60a5fa;
    --accent-dark: #2563eb;
    --bg-primary: #0f172a;
    --bg-secondary: #1e293b;
    --bg-card: #1e293b;
    --bg-elevated: #334155;
    --text-primary: #f1f5f9;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --border: #334155;
    --border-light: #475569;
    --get: #34d399;
    --post: #60a5fa;
    --put: #fbbf24;
    --patch: #a78bfa;
    --delete: #f87171;
    --radius: 10px;
    --shadow: 0 1px 3px rgba(0,0,0,0.3);
    --shadow-lg: 0 4px 16px rgba(0,0,0,0.4);
  }

  *, *::before, *::after { box-sizing: border-box; }

  body {
    margin: 0;
    background: var(--bg-primary);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  /* ── TOPBAR ──────────────────────────────────────── */
  .swagger-ui .topbar {
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border);
    padding: 0;
    height: 56px;
  }
  .swagger-ui .topbar-wrapper {
    display: flex;
    align-items: center;
    max-width: 1320px;
    margin: 0 auto;
    padding: 0 24px;
    height: 100%;
  }
  .swagger-ui .topbar-wrapper .link { display: none; }
  .swagger-ui .topbar-wrapper::before {
    content: "";
    width: 32px; height: 32px;
    background: url('https://cdn-icons-png.flaticon.com/512/2888/2888407.png') center/contain no-repeat;
    border-radius: 6px;
    margin-right: 12px;
    flex-shrink: 0;
    filter: invert(1);
    opacity: 0.8;
  }
  .swagger-ui .topbar-wrapper::after {
    content: "Log-Stream Engine";
    font-size: 17px;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.2px;
  }

  /* ── LAYOUT ──────────────────────────────────────── */
  .swagger-ui .wrapper {
    max-width: 1320px;
    margin: 0 auto;
    padding: 0 24px;
  }
  .swagger-ui .information-container { margin-bottom: 12px; }

  /* ── INFO / HEADER ───────────────────────────────── */
  .swagger-ui .info {
    margin: 28px 0 16px;
  }
  .swagger-ui .info hgroup.main {
    margin: 0;
  }
  .swagger-ui .info .title {
    font-family: 'Inter', sans-serif;
    font-size: 28px;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.5px;
  }
  .swagger-ui .info .title small { display: none; }
  .swagger-ui .info .title small.version-stamp {
    display: inline-flex;
    background: var(--accent);
    color: white;
    font-size: 11px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 20px;
    vertical-align: middle;
    margin-left: 10px;
    letter-spacing: 0;
  }
  .swagger-ui .info .description {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px 24px;
    margin-top: 16px;
  }
  .swagger-ui .info .description p,
  .swagger-ui .info .description li {
    color: var(--text-secondary);
    font-size: 13.5px;
    line-height: 1.7;
  }
  .swagger-ui .info .description strong {
    color: var(--text-primary);
    font-weight: 600;
  }
  .swagger-ui .info .description a {
    color: var(--accent-light);
    text-decoration: none;
  }
  .swagger-ui .info .description a:hover {
    text-decoration: underline;
  }
  .swagger-ui .info .description h3 {
    color: var(--text-primary);
    font-size: 15px;
    margin: 18px 0 8px;
    font-weight: 600;
  }
  .swagger-ui .info .description table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    margin: 12px 0;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--border);
  }
  .swagger-ui .info .description table th {
    background: var(--bg-elevated);
    color: var(--text-primary);
    font-weight: 600;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 10px 16px;
    text-align: left;
    border-bottom: 1px solid var(--border);
  }
  .swagger-ui .info .description table td {
    background: var(--bg-card);
    color: var(--text-secondary);
    font-size: 13px;
    padding: 10px 16px;
    border-bottom: 1px solid var(--border);
  }
  .swagger-ui .info .description table tr:last-child td {
    border-bottom: none;
  }
  .swagger-ui .info .description code {
    background: var(--bg-elevated);
    color: var(--accent-light);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
  }
  .swagger-ui .info .description hr {
    border: none;
    border-top: 1px solid var(--border);
    margin: 16px 0;
  }

  /* ── SCHEME / SERVER SELECTOR ────────────────────── */
  .swagger-ui .scheme-container {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px 20px;
    margin: 12px 0 24px;
    box-shadow: none;
  }
  .swagger-ui .scheme-container .schemes > label {
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .swagger-ui .servers { background: transparent; padding: 0; box-shadow: none; }
  .swagger-ui .servers label { color: var(--text-secondary); font-weight: 600; font-size: 13px; }
  .swagger-ui .servers > label > select,
  .swagger-ui select {
    background: var(--bg-elevated);
    color: var(--text-primary);
    border: 1px solid var(--border-light);
    border-radius: 6px;
    padding: 6px 10px;
    font-size: 13px;
  }

  /* ── AUTHORIZE BUTTON ────────────────────────────── */
  .swagger-ui .btn.authorize {
    background: var(--accent);
    border: none;
    border-radius: 6px;
    padding: 8px 18px;
    font-weight: 600;
    font-size: 13px;
    color: white;
    cursor: pointer;
    transition: all 0.15s ease;
    box-shadow: 0 1px 2px rgba(0,0,0,0.2);
  }
  .swagger-ui .btn.authorize:hover {
    background: var(--accent-dark);
    box-shadow: 0 2px 8px rgba(59,130,246,0.3);
    transform: translateY(-1px);
  }
  .swagger-ui .btn.authorize svg { fill: white; }
  .swagger-ui .authorization__btn { opacity: 0.7; }
  .swagger-ui .authorization__btn:hover { opacity: 1; }

  /* ── TAG GROUPS ──────────────────────────────────── */
  .swagger-ui .opblock-tag-section { margin-bottom: 8px; }
  .swagger-ui .opblock-tag {
    border-bottom: 1px solid var(--border);
    padding: 14px 4px;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    font-family: 'Inter', sans-serif;
  }
  .swagger-ui .opblock-tag:hover { background: rgba(255,255,255,0.02); }
  .swagger-ui .opblock-tag small {
    color: var(--text-muted);
    font-size: 12.5px;
    font-weight: 400;
    padding: 0 0 0 8px;
  }

  /* ── OPERATION BLOCKS ────────────────────────────── */
  .swagger-ui .opblock {
    border-radius: 8px;
    margin: 6px 0;
    border: 1px solid var(--border);
    box-shadow: none;
    overflow: hidden;
    background: var(--bg-card);
  }
  .swagger-ui .opblock.opblock-get {
    border-color: color-mix(in srgb, var(--get) 30%, var(--border));
    background: color-mix(in srgb, var(--get) 5%, var(--bg-card));
  }
  .swagger-ui .opblock.opblock-post {
    border-color: color-mix(in srgb, var(--post) 30%, var(--border));
    background: color-mix(in srgb, var(--post) 5%, var(--bg-card));
  }
  .swagger-ui .opblock.opblock-put {
    border-color: color-mix(in srgb, var(--put) 30%, var(--border));
    background: color-mix(in srgb, var(--put) 5%, var(--bg-card));
  }
  .swagger-ui .opblock.opblock-patch {
    border-color: color-mix(in srgb, var(--patch) 30%, var(--border));
    background: color-mix(in srgb, var(--patch) 5%, var(--bg-card));
  }
  .swagger-ui .opblock.opblock-delete {
    border-color: color-mix(in srgb, var(--delete) 30%, var(--border));
    background: color-mix(in srgb, var(--delete) 5%, var(--bg-card));
  }
  .swagger-ui .opblock .opblock-summary {
    padding: 10px 16px;
  }
  .swagger-ui .opblock .opblock-summary-method {
    border-radius: 4px;
    font-weight: 700;
    font-size: 11px;
    padding: 4px 10px;
    min-width: 60px;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  .swagger-ui .opblock.opblock-get .opblock-summary-method { background: var(--get); color: #022c22; }
  .swagger-ui .opblock.opblock-post .opblock-summary-method { background: var(--post); color: #1e1b4b; }
  .swagger-ui .opblock.opblock-put .opblock-summary-method { background: var(--put); color: #422006; }
  .swagger-ui .opblock.opblock-patch .opblock-summary-method { background: var(--patch); color: #1e1b4b; }
  .swagger-ui .opblock.opblock-delete .opblock-summary-method { background: var(--delete); color: #450a0a; }
  .swagger-ui .opblock .opblock-summary-path {
    color: var(--text-primary);
    font-size: 13px;
    font-weight: 500;
    font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', monospace;
  }
  .swagger-ui .opblock .opblock-summary-description {
    color: var(--text-muted);
    font-size: 12.5px;
  }
  .swagger-ui .opblock .opblock-section-header {
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border);
    box-shadow: none;
  }
  .swagger-ui .opblock .opblock-section-header h4 {
    color: var(--text-primary);
    font-size: 13px;
  }

  /* ── OPERATION BODY / EXPANDED ───────────────────── */
  .swagger-ui .opblock-body { background: var(--bg-secondary); }
  .swagger-ui .opblock-body pre {
    background: var(--bg-primary) !important;
    color: var(--text-primary);
    border-radius: 6px;
    border: 1px solid var(--border);
    font-size: 12.5px;
  }
  .swagger-ui .opblock-description-wrapper,
  .swagger-ui .opblock-external-docs-wrapper {
    color: var(--text-secondary);
    font-size: 13px;
    padding: 12px 20px;
  }
  .swagger-ui table thead tr th,
  .swagger-ui table thead tr td {
    color: var(--text-secondary);
    font-weight: 600;
    font-size: 12px;
    border-bottom: 1px solid var(--border);
    padding: 10px 8px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  .swagger-ui .parameter__name { color: var(--text-primary); font-weight: 600; font-size: 13px; }
  .swagger-ui .parameter__name.required::after {
    color: var(--delete);
    font-size: 14px;
  }
  .swagger-ui .parameter__type { color: var(--accent-light); font-weight: 500; font-size: 12px; }
  .swagger-ui .parameter__in { color: var(--text-muted); font-size: 11px; }

  /* ── INPUTS ──────────────────────────────────────── */
  .swagger-ui input[type=text],
  .swagger-ui textarea {
    background: var(--bg-primary);
    color: var(--text-primary);
    border: 1px solid var(--border-light);
    border-radius: 6px;
    padding: 8px 12px;
    font-size: 13px;
    font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', monospace;
    transition: border-color 0.15s;
  }
  .swagger-ui input[type=text]:focus,
  .swagger-ui textarea:focus {
    border-color: var(--accent);
    outline: none;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
  }

  /* ── RESPONSE ────────────────────────────────────── */
  .swagger-ui .responses-inner { padding: 12px 20px; }
  .swagger-ui .response-col_status { color: var(--text-primary); font-weight: 700; }
  .swagger-ui .response-col_description {
    color: var(--text-secondary);
  }
  .swagger-ui .response-col_description__inner p {
    margin: 0;
    padding: 8px 12px;
    background: var(--bg-primary);
    border-radius: 6px;
    color: var(--text-secondary);
    font-size: 13px;
  }
  .swagger-ui .responses-table .response {
    border-bottom: 1px solid var(--border);
  }

  /* ── EXECUTE / ACTION BUTTONS ────────────────────── */
  .swagger-ui .btn.execute {
    background: var(--accent);
    border: none;
    border-radius: 6px;
    font-weight: 600;
    font-size: 13px;
    color: white;
    padding: 8px 24px;
    cursor: pointer;
    transition: all 0.15s;
  }
  .swagger-ui .btn.execute:hover {
    background: var(--accent-dark);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(59,130,246,0.3);
  }
  .swagger-ui .btn.cancel { border-radius: 6px; font-size: 13px; }
  .swagger-ui .btn { font-family: 'Inter', sans-serif; }

  /* ── MODELS ──────────────────────────────────────── */
  .swagger-ui section.models {
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-secondary);
  }
  .swagger-ui section.models h4 {
    color: var(--text-primary);
    font-size: 16px;
    font-weight: 600;
    border-bottom: 1px solid var(--border);
  }
  .swagger-ui .model-box {
    background: var(--bg-primary);
    border-radius: 6px;
    padding: 12px;
    border: 1px solid var(--border);
  }
  .swagger-ui .model {
    font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', monospace;
    font-size: 12.5px;
    color: var(--text-secondary);
  }
  .swagger-ui .model .prop-type { color: var(--accent-light); }
  .swagger-ui .model-title { color: var(--text-primary); font-weight: 600; }

  /* ── FILTER INPUT ────────────────────────────────── */
  .swagger-ui .filter-container {
    margin: 0 0 16px;
  }
  .swagger-ui .filter-container .operation-filter-input {
    background: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 10px 16px;
    font-size: 14px;
    transition: border-color 0.15s;
  }
  .swagger-ui .filter-container .operation-filter-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
    outline: none;
  }

  /* ── LOADING ─────────────────────────────────────── */
  .swagger-ui .loading-container {
    background: var(--bg-primary);
  }
  .swagger-ui .loading-container .loading::after {
    color: var(--accent);
  }

  /* ── MISC OVERRIDES ──────────────────────────────── */
  .swagger-ui .markdown p, .swagger-ui .markdown li {
    color: var(--text-secondary);
  }
  .swagger-ui .renderedMarkdown p {
    color: var(--text-secondary);
  }
  .swagger-ui .opblock-tag a { color: var(--text-primary); }
  .swagger-ui .opblock-tag a:hover { color: var(--accent-light); }
  .swagger-ui svg.arrow { fill: var(--text-muted); }
  .swagger-ui .expand-operation svg { fill: var(--text-muted); }
  .swagger-ui .expand-operation:hover svg { fill: var(--text-primary); }
  .swagger-ui .copy-to-clipboard { bottom: 10px; right: 10px; }
  .swagger-ui .dialog-ux .modal-ux {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow-lg);
  }
  .swagger-ui .dialog-ux .modal-ux-header h3 { color: var(--text-primary); }
  .swagger-ui .dialog-ux .modal-ux-content p { color: var(--text-secondary); }
  .swagger-ui .dialog-ux .modal-ux-header { border-bottom: 1px solid var(--border); }
  .swagger-ui .auth-wrapper input[type=text] {
    background: var(--bg-primary);
    color: var(--text-primary);
    border: 1px solid var(--border-light);
  }
`;

export function setupSwagger(app: INestApplication, port: number): void {
  const config = new DocumentBuilder()
    .setTitle('Log-Stream Analyzer API')
    .setDescription(swaggerDescription)
    .setVersion('1.0.0')
    .addServer(`http://localhost:${port}`, 'Local Environment')
    .addTag(
      '📜 Logs',
      'High-performance stream ingestion, query filtering, and real-time deduplication',
    )
    .addTag('📊 Stats', 'Aggregated system insights, including top 10 ranked error tracking')
    .addTag(
      '⏳ Filter History',
      'Interactive queries state management with O(1) Undo/Redo operations',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (_controllerKey: string, methodKey: string) => methodKey,
  });

  SwaggerModule.setup('/api/docs', app, document, {
    customSiteTitle: 'Logs OS - API Docs',
    customfavIcon: 'https://cdn-icons-png.flaticon.com/512/2888/2888407.png',
    customCss: customSwaggerCss,
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      syntaxHighlight: { activate: true, theme: 'monokai' },
      tryItOutEnabled: true,
      displayRequestDuration: true,
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 1,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });
}
