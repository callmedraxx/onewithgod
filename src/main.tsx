import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

/* Marks the document as script-capable. Every reveal's hidden state is
   scoped to this class, so it only ever applies once we know the code that
   removes it is running. Set before render, so nothing flashes. */
document.documentElement.classList.add("js");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
