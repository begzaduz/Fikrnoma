import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

// Telegram Mini App bootstrap. The app remains usable in a normal browser too.
const telegram = window.Telegram?.WebApp;

if (telegram) {
  telegram.ready();
  telegram.expand();
  telegram.setHeaderColor("#f4f3ee");
  telegram.setBackgroundColor("#f4f3ee");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
