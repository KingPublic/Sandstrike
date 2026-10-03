import { AppShell } from "./app/AppShell";
import "./styles/main.css";

const root = document.querySelector<HTMLElement>("#app");

if (!root) {
  throw new Error("Sandstrike app root is missing.");
}

const app = new AppShell();
app.mount(root);

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    app.destroy();
  });
}
