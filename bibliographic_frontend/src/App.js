import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import ArticleSearch from "./components/ArticleSearch";
import HomePage from "./components/HomePage";
import ReferenceFormMultiRow from "./components/ReferenceFormMultiRow";
import './App.css';

///////////////////////////

function ReferenceFormAnswerWrapper() {
  const location = useLocation();
  // Извлекаем initialAnswer из state
  const initialAnswer = location.state?.initialAnswer || ""; 

  // Передаем initialAnswer в ReferenceForm
  return <ReferenceFormMultiRow initialAnswer={initialAnswer} />; 
}

function App() {
  return (
      <Router>
        <Routes>
          {/* Главная страница */}
          <Route path="/" element={<HomePage />} /> 
          
          {/* Страница многострочной формы */}
          <Route path="/reference-form-multi-row" element={<ReferenceFormAnswerWrapper />} />

          <Route path="/search" element={<ArticleSearch />} />
        </Routes>
        
      </Router>
  );
}

export default App;
