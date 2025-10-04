// src/components/ArticleSearch.js
import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Box,
  List,
  ListItem,
  ListItemText,
  Link,
} from "@mui/material";
import { useNavigate } from "react-router-dom"; 

function ArticleSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [articles, setArticles] = useState([]); 
  // Используем Set для хранения УНИКАЛЬНЫХ ссылок (link) выбранных статей
  const [selectedArticles, setSelectedArticles] = useState(new Set()); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    
    
     e.preventDefault();
    setArticles([]);
    setSelectedArticles(new Set());
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:8080/search_elibrary?query=${encodeURIComponent(searchTerm)}`);

      if (!res.ok) {
        const text = await res.text();
        setError(`Ошибка: ${res.status} - ${text}`);
        return;
      }

      const data = await res.json();
      setArticles(data);
    } catch (err) {
      setError("Ошибка сети: " + err.message);
    } finally {
      setLoading(false);
    }
  };

// ✅ ФУНКЦИЯ ДЛЯ ПЕРЕКЛЮЧЕНИЯ ФЛАЖКА (работает для одного элемента)
  const handleToggle = (link, title) => (e) => {
    // Формируем ключ для хранения, как вы просили: link + title
    const key = link + title; 

    // Создаем НОВЫЙ Set для обеспечения иммутабельности состояния React
    const newSelected = new Set(selectedArticles); 
    
    // Проверяем состояние текущего флажка
    if (e.target.checked) {
      newSelected.add(key); // Добавляем ключ (link + title)
    } else {
      newSelected.delete(key); // Удаляем ключ (link + title)
    }
    
    // Обновляем состояние
    setSelectedArticles(newSelected);
  };

  const handleGenerateReferences = async () => {
    if (selectedArticles.size === 0) {
      alert("Выберите хотя бы одну статью.");
      return;
    }

    setLoading(true);
    setError("");
    const links = [...selectedArticles]
              .map((item, index) => `${index + 1}) ${item}`)
              .join('; ');

    try {
      const payload = {
        user_request: links, 
        prompt_type: "Статья из журнала", 
        example_record: null,
      };

      const res = await fetch("http://localhost:8080/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        setError(`Ошибка при генерации: ${res.status} - ${text}`);
        setLoading(false);
        return;
      }

      const data = await res.json();
      const generatedAnswer = data.answer || "Библиографические записи сгенерированы.";
      
      navigate("/", { state: { initialAnswer: generatedAnswer } });

    } catch (err) {
      setError("Ошибка сети при генерации: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom align="center">
        Поиск статей в e-library
      </Typography>

      <Box sx={{ mb: 2 }}>
         <Button 
            variant="text" 
            onClick={() => navigate("/")}
         >
            ← Вернуться к форме
         </Button>
      </Box>

      <Box component="form" onSubmit={handleSearch} sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          label="Поисковый запрос"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          required
        />
        <Button type="submit" variant="contained" disabled={loading}>
          Поиск
        </Button>
      </Box>

      {loading && <CircularProgress sx={{ display: "block", mx: "auto" }} />}
      {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}

      {articles.length > 0 && (
        <>
          <List>
            {articles.map((article) => {
              // ✅ Формируем ключ для проверки состояния флажка
              const checkboxKey = article.link + article.title; 
              
              return (
                <ListItem 
                  // Используем уникальный ключ для React
                  key={article.link} 
                  sx={{ display: 'flex', alignItems: 'flex-start' }} 
                >
                  <input
                      type="checkbox"
                      // ✅ Проверяем наличие нового ключа (link + title) в Set
                      checked={selectedArticles.has(checkboxKey)} 
                      // ✅ Передаем link И title в обработчик
                      onChange={handleToggle(article.link, article.title)} 
                      style={{ marginTop: '8px', marginRight: '16px' }} 
                  />
                  
                  <ListItemText
                      primary={article.title}
                      secondary={
                          <Link href={article.link} target="_blank" rel="noopener" variant="body2">
                              {article.link}
                          </Link>
                      }
                  />
                </ListItem>
              )
            })}
          </List>
          
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleGenerateReferences}
            // Количество выбранных элементов корректно считается
            disabled={selectedArticles.size === 0 || loading} 
            sx={{ mt: 3, mb: 2 }}
          >
            Сгенерировать библиографические записи ({selectedArticles.size})
          </Button>

           <Button 
                variant="outlined" 
                fullWidth
                onClick={() => navigate("/")}
            >
                Вернуться к форме (отмена выбора)
           </Button>
        </>
      )}
    </Container>
  );
}

export default ArticleSearch;
