// // src/App.js
// import React from "react";
// import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
// import ReferenceForm from "./components/ReferenceForm";
// import ArticleSearch from "./components/ArticleSearch";

// function HomeWrapper() {
//   const location = useLocation();
//   // ✅ Извлекаем initialAnswer из state
//   const initialAnswer = location.state?.initialAnswer || ""; 
  
//   // ✅ Передаем initialAnswer в ReferenceForm
//   return <ReferenceForm initialAnswer={initialAnswer} />; 
// }

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<HomeWrapper />} /> 
//         <Route path="/search" element={<ArticleSearch />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;


// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import ReferenceForm from './components/ReferenceForm'; // Ваша старая форма
import ReferenceFormMultiRow from './components/ReferenceFormMultiRow'; // Ваша новая форма

// Вам также нужно импортировать ArticleSearch, если он на /search
// import ArticleSearch from './components/ArticleSearch'; 

function App() {
  return (
    <Routes>
      {/* Главная страница */}
      <Route path="/" element={<HomePage />} /> 
      
      {/* Страница стандартной формы */}
      <Route path="/reference-form" element={<ReferenceForm />} /> 
      
      {/* Страница многострочной формы */}
      <Route path="/reference-form-multi-row" element={<ReferenceFormMultiRow />} />

      {/* P.S. Не забудьте добавить роут для /search, который у вас был */}
      {/* <Route path="/search" element={<ArticleSearch />} /> */}
      
      <Route path="/search" element={<ArticleSearch />} />
    </Routes>
  );
}

export default App;