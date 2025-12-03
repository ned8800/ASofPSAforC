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
import { REF_FORM_MULTYROW_URL, SEARCH_ELIBRARY_URL } from '../consts';

function ArticleSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [articles, setArticles] = useState([]); 
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
      const res = await fetch(`${SEARCH_ELIBRARY_URL}?query=${encodeURIComponent(searchTerm)}`);

      if (!res.ok) {
        const text = await res.text();
        setError('Что-то пошло не так')
        console.log(`Ошибка: ${res.status} - ${text}`);
        return;
      }

      const data = await res.json();

      if (data) {
        setArticles(data);
      } else {
        setArticles([]);
        setError('Поиск не дал результатов');
      }
    } catch (err) {
      setError("Ошибка сети: сервер на обслуживании");
      console.log("Ошибка сети: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ФУНКЦИЯ ДЛЯ ПЕРЕКЛЮЧЕНИЯ ФЛАЖКА
  const handleToggle = (link, title) => (e) => {
    const key = link + title; 
    const newSelected = new Set(selectedArticles); 
    
    if (e.target.checked) {
      newSelected.add(key);
    } else {
      newSelected.delete(key);
    }
    
    setSelectedArticles(newSelected);
  };

  // функция для генерации ссылок по выбраным источникам
  const handleGenerateReferences = async () => {
    if (selectedArticles.size === 0) {
      alert("Выберите хотя бы одну статью.");
      return;
    }

    setLoading(true);
    setError("");
    const links = [...selectedArticles]
              .map((item, index) => `${index + 1}) ${item}`)
              .join(';\n ');

    try {
      const payload = {
        user_request: links, 
        prompt_type: "Статья из журнала", // ищем именно в elibrary, поэтому тип определен заранее
        example_record: null,
      };

      const res = await fetch(`${REF_FORM_MULTYROW_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        setError('Что-то пошло не так')
        console.log(`Ошибка при генерации: ${res.status} - ${text}`);
        setLoading(false);
        return;
      }

      const data = await res.json();
      const generatedAnswer = data.answer || "Библиографические записи сгенерированы.";
      
      navigate("/reference-form-multi-row", { state: { initialAnswer: generatedAnswer } });

    } catch (err) {
      console.log(err.message)
      setError("Ошибка сети: сервер на обслуживании");
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
            onClick={() => navigate("/reference-form-multi-row")}
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
              const checkboxKey = article.link + article.title; 
              
              return (
                <ListItem 
                  key={article.link} 
                  sx={{ display: 'flex', alignItems: 'flex-start' }} 
                >
                  <input
                      type="checkbox"
                      checked={selectedArticles.has(checkboxKey)} 
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
            disabled={selectedArticles.size === 0 || loading} 
            sx={{ mt: 3, mb: 2 }}
          >
            Сгенерировать библиографические записи ({selectedArticles.size})
          </Button>

           <Button 
                variant="outlined" 
                fullWidth
                onClick={() => navigate("/reference-form-multi-row")}
                sx={{
                  borderWidth: 2,
                  borderStyle: 'solid',
                  backgroundColor: '#e0e0e0', // устанавливаем фоновое оформление
                  ':hover': {               // применяем эффекты при наведении
                    backgroundColor: '#ddd5d5ff', // цвет фона при наведении
                  },
                }}
            >
                Вернуться к форме (отмена выбора)
           </Button>
        </>
      )}
    </Container>
  );
}

export default ArticleSearch;
