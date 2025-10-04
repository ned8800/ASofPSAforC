// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import ReferenceForm from "./components/ReferenceForm";
import ArticleSearch from "./components/ArticleSearch";

// Обертка для ReferenceForm, чтобы получить данные из роута
function HomeWrapper() {
  const location = useLocation();
  const initialRequest = location.state?.initialRequest || "";
  return <ReferenceForm initialRequest={initialRequest} />;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Главная страница: форма */}
        <Route path="/" element={<HomeWrapper />} /> 
        
        {/* Страница поиска статей */}
        <Route path="/search" element={<ArticleSearch />} />
      </Routes>
    </Router>
  );
}
export default App;
