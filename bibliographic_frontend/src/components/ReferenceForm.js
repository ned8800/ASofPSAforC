// src/components/ReferenceForm.js
import React, { useState } from "react";
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

function ReferenceForm({ initialRequest = "" }) {
  const [userRequest, setUserRequest] = useState(initialRequest);
  const [promptType, setPromptType] = useState("");
  const [customType, setCustomType] = useState("");
  const [exampleRecord, setExampleRecord] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Инициализация useNavigate
  const navigate = useNavigate();

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
      setAnswer(data.answer);
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
        {/* ... (Поля формы остаются без изменений) */}
        
        <TextField
          label="Запрос пользователя"
          value={userRequest}
          onChange={(e) => setUserRequest(e.target.value)}
          required
        />
        {/* ... (Select и customType TextField) */}
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
        
        {/* Измененная кнопка с useNavigate и отступом сверху */}
        <Button 
          variant="outlined" 
          size="large"
          onClick={() => navigate("/search")} // Используем navigate
          sx={{ mt: 1 }} // Добавляем отступ сверху (mt: 1)
        >
          Найти статьи в e-library
        </Button>
      </Box>

      {/* ... (Loading, error, answer остаются без изменений) */}
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
