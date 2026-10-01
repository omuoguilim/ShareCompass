import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import PortfolioApp from "../PortfolioApp.jsx";
import { lazy, Suspense } from "react";
const App = import.meta.env.VITE_PORTFOLIO_DEMO === "true" ? PortfolioApp : lazy(() => import("../App.jsx"));
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <StrictMode><Suspense fallback={<p>Loading ShareCompass…</p>}><App /></Suspense></StrictMode>,
);

