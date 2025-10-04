// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import ReferenceForm from "./components/ReferenceForm";
import ArticleSearch from "./components/ArticleSearch";

function HomeWrapper() {
  const location = useLocation();
  // ✅ Извлекаем initialAnswer из state
  const initialAnswer = location.state?.initialAnswer || ""; 
  
  // ✅ Передаем initialAnswer в ReferenceForm
  return <ReferenceForm initialAnswer={initialAnswer} />; 
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeWrapper />} /> 
        <Route path="/search" element={<ArticleSearch />} />
      </Routes>
    </Router>
  );
}

export default App;
