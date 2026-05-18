// src/components/ReferenceForm.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom"; 

// ✅ Принимаем initialAnswer вместо initialRequest
function ReferenceForm({ initialAnswer = "" }) {
  const [userRequest, setUserRequest] = useState("");
  const [promptType, setPromptType] = useState("");
  const [customType, setCustomType] = useState("");
  const [exampleRecord, setExampleRecord] = useState("");
  // ✅ Устанавливаем answer из пропсов
  const [answer, setAnswer] = useState(initialAnswer); 
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Используем useEffect для установки ответа только при монтировании
  useEffect(() => {
    if (initialAnswer) {
      setAnswer(initialAnswer);
    }
  }, [initialAnswer]); // Зависимость гарантирует, что ответ установится, если он пришел


  const handleSubmit = async (e) => {
    e.preventDefault();
    setAnswer("");
    setError("");
    setLoading(true);

    const finalType = promptType === "Другой" ? customType || null : promptType || null;

    const payload = {
      user_request: userRequest,
      prompt_type: finalType,
      example_record: exampleRecord || null,
    };

   
    try {
        const res = await fetch("http://localhost:8080/request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const text = await res.text();
            setError(`Ошибка: ${res.status} - ${text}`);
            setLoading(false);
            return;
        }

        const data = await res.json();
        setAnswer(data.answer); // Обновляем ответ
    } catch (err) {
        setError("Ошибка сети: " + err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Typography variant="h4" gutterBottom align="center">
        Составление библиографической записи
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
        {/* ... (Все поля формы) */}
        <TextField
          label="Запрос пользователя"
          value={userRequest}
          onChange={(e) => setUserRequest(e.target.value)}
          required
        />
        {/* ... (Select, customType TextField, exampleRecord TextField) */}
        
        <FormControl fullWidth>
          <InputLabel>Выбрать тип записи (или оставить по умолчанию)</InputLabel>
          <Select
            value={promptType}
            label="Выбрать тип записи (или оставить по умолчанию)"
            onChange={(e) => setPromptType(e.target.value)}
          >
            <MenuItem value=""><em>-- Выберите тип --</em></MenuItem>
            <MenuItem value="Книга">Книга</MenuItem>
            <MenuItem value="Интернет-ресурс">Интернет-ресурс</MenuItem>
            <MenuItem value="Закон, нормативный акт и т.п.">Закон, нормативный акт и т.п.</MenuItem>
            <MenuItem value="Диссертация">Диссертация</MenuItem>
            <MenuItem value="Автореферат">Автореферат</MenuItem>
            <MenuItem value="Статья из журнала">Статья из журнала</MenuItem>
            <MenuItem value="Статья из сборника">Статья из сборника</MenuItem>
            <MenuItem value="Статья из газеты">Статья из газеты</MenuItem>
            <MenuItem value="Другой">Другой</MenuItem>
          </Select>
        </FormControl>

        {promptType === "Другой" && (
          <TextField
            label="Указать свой тип записи"
            value={customType}
            onChange={(e) => setCustomType(e.target.value)}
          />
        )}

        <TextField
          label="Указать определенный формат записи (или оставить пустым по умолчанию)"
          value={exampleRecord}
          onChange={(e) => setExampleRecord(e.target.value)}
        />

        <Button type="submit" variant="contained" size="large">
          Отправить
        </Button>
        
        <Button 
          variant="outlined" 
          size="large"
          onClick={() => navigate("/search")}
          sx={{ mt: 1 }}
        >
          Найти статьи в e-library
        </Button>
      </Box>

      {/* ✅ Этот блок теперь будет отображать ответ, переданный из ArticleSearch */}
      {loading && <CircularProgress sx={{ mt: 3 }} />}
      {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
      {answer && (
        <TextField
          value={answer}
          multiline
          rows={10}
          fullWidth
          InputProps={{ readOnly: true }}
          sx={{ mt: 3 }}
        />
      )}
    </Container>
  );
}

export default ReferenceForm;

