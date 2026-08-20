# Visual evidence

Screenshots taken against a production build (`next build` + `next start`), 1280px wide.

| File | What it shows |
|---|---|
| `focus-ring-BEFORE.png` / `focus-ring-AFTER.png` | The "Consulting" nav link with **keyboard focus on it**. Before, there is no ring at all — only the hover underline, which is indistinguishable from a mouse hover. After, a 2px ring. This is finding #1, the Critical one. |
| `contact-form-dark-BEFORE.png` / `-AFTER.png` | Contact form in dark mode. Field borders go from 1.64:1 to 3.25:1 contrast. The layout, type and spacing are unchanged — the fields are simply visible now. |
| `admin-login-dark-BEFORE.png` / `-AFTER.png` | Admin login in dark mode, same border change. |

The light-mode contact form screenshot was **byte-for-byte identical** before and after, confirming the light theme was not touched.
