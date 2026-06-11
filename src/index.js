import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import "./FestivalEvents.css";
import "./StartScreenPremium.css";
import "./TeamSelectPremium.css";
import "./FinalPolish.css";
import "./RepairPolish.css";
import "./SaveDogBallFix.css";
import "./HeaderTeamFix.css";
import "./HeaderBallRevision.css";
import "./SleekFinalPolish.css";
import "./randomDistractions";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
