import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
  Box,
  Tooltip,
  IconButton,
  InputAdornment,
  styled,
  ClickAwayListener,
} from "@mui/material";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useNavigate } from "react-router-dom";
import { REF_FORM_MULTYROW_URL } from '../consts';

const StyledTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  '& .MuiTooltip-tooltip': {
    fontSize: '1.2rem', // Изменяем размер шрифта подсказки
  },
}));

// НОВЫЙ ПЕРЕИСПОЛЬЗУЕМЫЙ КОМПОНЕНТ Tooltip
const ClickableTooltip = ({ title, children }) => {
  const [open, setOpen] = useState(false);

  // Обработчик закрытия (по клику вне тултипа или при нажатии Esc)
  const handleClose = () => {
    setOpen(false);
  };

  // Обработчик открытия/закрытия по клику на дочерний элемент
  const handleToggle = (e) => {
    e.stopPropagation(); 
    setOpen((prev) => !prev);
  };

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <StyledTooltip
        title={title}
        open={open}
        onClose={handleClose}
        disableFocusListener
        // disableHoverListener
        // Добавляем click listener к корневому элементу, который будет его открывать
        onClick={handleToggle} 
        arrow
      >
        <Box component="span" sx={{ display: 'flex' }}>
          {children}
        </Box>
      </StyledTooltip>
    </ClickAwayListener>
  );
};

function ReferenceFormMultiRow({ initialAnswer = "" }) {
  const [userRequest, setUserRequest] = useState("");
  const [promptType, setPromptType] = useState("");
  const [customType, setCustomType] = useState("");
  const [exampleRecord, setExampleRecord] = useState("");
  const [answer, setAnswer] = useState(initialAnswer); 
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (initialAnswer) {
      setAnswer(initialAnswer);
    }
  }, [initialAnswer]); 


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
        const res = await fetch(`${REF_FORM_MULTYROW_URL}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const text = await res.text();
            setError('Что-то пошло не так')
            console.log(`Ошибка: ${res.status} - ${text}`);
            setLoading(false);
            return;
        }

        const data = await res.json();
        setAnswer(data.answer); 
    } catch (err) {
        console.log(err)
        setError("Ошибка сети: сервер на обслуживании");
    } finally {
        setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Typography variant="h4" gutterBottom align="center">
        Составление библиографических ссылок на литературу
      </Typography>

      <Box sx={{ width: "100%", display: "flex", flexDirection: "row", justifyContent: "flex-start", mb: 2 }}>
          <Button 
            variant="text" 
            onClick={() => navigate("/")}
          >
            ← Вернуться на главную
          </Button>
      </Box>

      <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Запрос пользователя"
          value={userRequest}
          onChange={(e) => setUserRequest(e.target.value)}
          required
          multiline
          maxRows={10}
          slotProps={{ input: {
            endAdornment: (
              <InputAdornment position="end">
                <ClickableTooltip title="Введите информацию об источнике (например: 'статья иванова и и в журнале вестник науки'). Каждая отдельная библиографическая ссылка должна разделяться знаком новой строки">
                  <IconButton edge="end">
                    <InfoOutlinedIcon />
                  </IconButton>
                </ClickableTooltip>
              </InputAdornment>
            ),
          } }}
        />
        
        <TextField
          select
          fullWidth
          multiline
          maxRows={10}
          label='Выбрать тип записи (или оставить по умолчанию, тогда система сама определит тип)'
          value={promptType}
          onChange={(e) => setPromptType(e.target.value)}
          
          slotProps={{ input: {
            endAdornment: (
              <InputAdornment position="end" sx={{ display: 'flex', alignItems: 'center' }}>

                {/* 2. Добавляем иконку стрелочки первой */}
                <IconButton size="small" sx={{ 
                    p: 0, 
                    m: 0, // Отступ от иконки информации
                    color: 'action.active' 
                }}>
                  <ArrowDropDownIcon />
                </IconButton>

                <ClickableTooltip title="Выберите тип источника (книга, статья и т.д.) для более точного форматирования. Или оставить по умолчанию, тогда система сама определит тип">
                  <Box> 
                    <IconButton edge="end">
                      <InfoOutlinedIcon />
                    </IconButton>
                  </Box>
                </ClickableTooltip>
              </InputAdornment>
            ),
          },
          select: { IconComponent: () => null },
         }}
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
        </TextField>

        {promptType === "Другой" && (
          <TextField
            label="Указать свой тип записи"
            value={customType}
            onChange={(e) => setCustomType(e.target.value)}
            slotProps={{ input: {
              endAdornment: (
                <InputAdornment position="end">
                  <ClickableTooltip title="Введите свой собственный тип источника, если его нет в списке.">
                    <IconButton edge="end">
                      <InfoOutlinedIcon />
                    </IconButton>
                  </ClickableTooltip>
                </InputAdornment>
              ),
            } }}
          />
        )}

        <TextField
          label="Указать определенный формат записи (или оставить пустым по умолчанию)"
          value={exampleRecord}
          onChange={(e) => setExampleRecord(e.target.value)}
          slotProps={{ input: {
            endAdornment: (
              <InputAdornment position="end">
                <ClickableTooltip title="Если вам нужен конкретный ГОСТ или стиль (например, 'ГОСТ Р 7.0.5-2008' или 'APA'), укажите его здесь.">
                  <IconButton edge="end">
                    <InfoOutlinedIcon />
                  </IconButton>
                </ClickableTooltip>
              </InputAdornment>
            ),
          } }}
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

      {/* Блок вывода ответа */}
      {loading && <CircularProgress sx={{ mt: 3 }} />}
      {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
      {answer && (
        <TextField
          value={answer}
          multiline
          rows={10}
          fullWidth
          slotProps={{ input: { readOnly: true } }}
          sx={{ mt: 3 }}
        />
      )}
    </Container>
  );
}

export default ReferenceFormMultiRow;
