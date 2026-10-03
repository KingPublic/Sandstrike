import { inject } from "@vercel/analytics";
import { AppShell } from "./app/AppShell";
import "./styles/main.css";

const root = document.querySelector<HTMLElement>("#app");

if (!root) {
  throw new Error("Sandstrike app root is missing.");
}

const app = new AppShell();
app.mount(root);

if (__SANDSTRIKE_ANALYTICS__) {
  inject({ mode: "production", framework: "vite", debug: false });
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    app.destroy();
  });
}
