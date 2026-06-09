import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import "./FestivalEvents.css";
import "./StartScreenPremium.css";
import "./randomDistractions";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
