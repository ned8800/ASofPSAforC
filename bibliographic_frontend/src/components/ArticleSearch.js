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
  Checkbox,
  Link,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom"; // Убедитесь, что импортировано

function ArticleSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [articles, setArticles] = useState([]);
  const [selectedArticles, setSelectedArticles] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Инициализация useNavigate
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSearch = async (e) => {
    e.preventDefault();
    setArticles([]);
    setSelectedArticles(new Set());
    setError("");
    setLoading(true);

    try {
      // Использование URLSearchParams для GET-запроса с параметром
      const res = await fetch(`http://localhost:8080/search_elibrary?query=${encodeURIComponent(searchTerm)}`);

      if (!res.ok) {
        const text = await res.text();
        setError(`Ошибка: ${res.status} - ${text}`);
        return;
      }

      const data = await res.json();
      
      // Предполагаем, что data - это массив объектов { title: string, link: string }
      setArticles(data);
    } catch (err) {
      setError("Ошибка сети: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (link) => () => {
    const newSelected = new Set(selectedArticles);
    if (newSelected.has(link)) {
      newSelected.delete(link);
    } else {
      newSelected.add(link);
    }
    setSelectedArticles(newSelected);
  };

  const handleGenerateReferences = async () => {
    if (selectedArticles.size === 0) {
      alert("Выберите хотя бы одну статью.");
      return;
    }

    setLoading(true);
    setError("");
    const links = Array.from(selectedArticles);
    const requestText = links.join("\n");

    // Идея 1: Передать ссылки в виде текста в запрос пользователя на главной странице
    // Это не соответствует требованию 'fetches request on localhost:8080/request 
    // with chosen with checkbox links of articles'
    // navigate("/", { state: { initialRequest: requestText } }); 
    
    // Идея 2: Сделать POST-запрос с ссылками и вернуться на главную страницу с результатом
    try {
        const payload = {
            // Предполагаем, что бэкенд поймет, что это ссылки для обработки
            user_request: "Сгенерируй библиографические записи для следующих статей:", 
            prompt_type: "Статья из журнала", // Устанавливаем тип, если это статьи
            article_links: links, // Отправляем массив ссылок, бэкенд должен принять это поле
        };

        const res = await fetch("http://localhost:8080/request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const text = await res.text();
            setError(`Ошибка при генерации: ${res.status} - ${text}`);
            return;
        }

        const data = await res.json();
        const initialRequest = data.answer || "Библиографические записи сгенерированы.";
        
        // Переход на главную страницу, используя полученный ответ как начальный запрос
        // Для этого нужно изменить ReferenceForm для приема state.
        navigate("/", { state: { initialRequest: initialRequest } });

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

      {/* Кнопка "Вернуться к форме" вверху для удобства */}
      <Box sx={{ mb: 2 }}>
         <Button 
            variant="text" 
            onClick={() => navigate("/")} // Используем navigate для перехода на главную страницу
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

      {/* ... (Loading, error, List, Checkboxes и handleGenerateReferences Button) */}

      {loading && <CircularProgress sx={{ display: "block", mx: "auto" }} />}
      {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}

      {articles.length > 0 && (
        <>
          <List>
            {articles.map((article) => (
              <ListItem 
                key={article.link} 
                secondaryAction={
                    <Checkbox
                        edge="end"
                        onChange={handleToggle(article.link)}
                        checked={selectedArticles.has(article.link)}
                    />
                }
                disablePadding
              >
                <ListItemText
                    primary={article.title}
                    secondary={
                        <Link href={article.link} target="_blank" rel="noopener" variant="body2">
                            {article.link}
                        </Link>
                    }
                />
              </ListItem>
            ))}
          </List>
          
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleGenerateReferences}
            disabled={selectedArticles.size === 0 || loading}
            sx={{ mt: 3, mb: 2 }} // mb: 2 для отступа от нижней кнопки
          >
            Сгенерировать библиографические записи ({selectedArticles.size})
          </Button>

          {/* Кнопка "Вернуться к форме" внизу */}
           <Button 
                variant="outlined" 
                fullWidth
                onClick={() => navigate("/")} // Используем navigate для перехода на главную страницу
            >
                Вернуться к форме (отмена выбора)
           </Button>
        </>
      )}
    </Container>
  );
}
export default ArticleSearch;
