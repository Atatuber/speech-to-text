import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import TranscriptionApp from "./TranscriptionApp";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <TranscriptionApp />
  </StrictMode>
);
