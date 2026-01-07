import { useState, useEffect } from "react";
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
import {
  REF_FORM_MULTYROW_URL,
  bibl_type_book,
  bibl_type_internet_resourse,
  bibl_type_law,
  bibl_type_dissertation,
  bibl_type_autodissertation,
  bibl_type_journal_article,
  bibl_type_article_from_the_collection,
  bibl_type_article_from_the_newspaper,
  bibl_type_custom_type
} from '../consts';

const StyledTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  '& .MuiTooltip-tooltip': {
    fontSize: '1.2rem',
  },
}));

const StyledTextField = styled(TextField)({
  '& .MuiInputBase-input': {
    whiteSpace: 'pre-wrap', // Устанавливаем правильное поведение переноса
  },
});

// модифицированный для работы с мобильными устройствами компонент Tooltip
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
  const [exampleRecord, setExampleRecord] = useState("");
  const [answer, setAnswer] = useState(initialAnswer); 
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [fieldIsInvalid, setFieldIsInvalid] = useState(false); // Состояние для красной рамки обязательного поля ввода

  useEffect(() => {
    if (initialAnswer) {
      setAnswer(initialAnswer);
    }
  }, [initialAnswer]); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAnswer("");
    setError("");
    setLoading(false);

    const finalType = promptType === "" ? null : promptType;

    const payload = {
      user_request: userRequest,
      prompt_type: finalType,
      example_record: exampleRecord || null,
    };

    setLoading(true);
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
        Оформление ссылок на источники информации
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
          label="Информация об источнике"
          value={userRequest}
          onChange={(e) => {
            e.target.setCustomValidity("");
            setFieldIsInvalid(false);
            setUserRequest(e.target.value);
          }}
          required
          onInvalid={(e) => {
            e.target.setCustomValidity("Это поле обязательно к заполнению");
            setFieldIsInvalid(true);
            }
          }
          error={fieldIsInvalid}
          multiline
          maxRows={10}
          slotProps={{ input: {
            maxLength: 1500,
            endAdornment: (
              <InputAdornment position="end">
                <ClickableTooltip title="Введите информацию об источнике (например: 'И.И. Иванов <Название статьи> в журнале вестник науки').
                 Каждая отдельная библиографическая ссылка должна разделяться знаком новой строки">
                  <IconButton edge="end">
                    <InfoOutlinedIcon />
                  </IconButton>
                </ClickableTooltip>
              </InputAdornment>
            ),
          } }}
        />
        
        <StyledTextField
          select
          fullWidth
          multiline
          maxRows={10}
          minRows={2}
          label='Выбрать тип записи (или оставить по умолчанию)'
          value={promptType}
          onChange={(e) => {
            setPromptType(e.target.value);
            if (e.target.value !== "Другой") {
              setExampleRecord("");
            }
          }}
          slotProps={{ 
            input: {
              maxLength: 50,
              endAdornment: (
                <InputAdornment position="end" sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton size="small" sx={{ 
                      p: 0, 
                      m: 0,
                      color: 'action.active' 
                  }}>
                    <ArrowDropDownIcon />
                  </IconButton>

                  <ClickableTooltip title="Выберите тип источника (книга, статья и т.д.) для более точного форматирования. Или оставьте по умолчанию, тогда система сама определит тип">
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
          <MenuItem value={bibl_type_book} >Книга</MenuItem>
          <MenuItem value={bibl_type_internet_resourse}>Интернет-ресурс</MenuItem>
          <MenuItem value={bibl_type_law}>Закон, нормативный акт и т.п.</MenuItem>
          <MenuItem value={bibl_type_dissertation}>Диссертация</MenuItem>
          <MenuItem value={bibl_type_autodissertation}>Автореферат</MenuItem>
          <MenuItem value={bibl_type_journal_article}>Статья из журнала</MenuItem>
          <MenuItem value={bibl_type_article_from_the_collection}>Статья из сборника</MenuItem>
          <MenuItem value={bibl_type_article_from_the_newspaper}>Статья из газеты</MenuItem>
          <MenuItem value={bibl_type_custom_type}>Другой (вставить пример нестандартного оформления)</MenuItem>
        </StyledTextField>

        {promptType === bibl_type_custom_type && (
          <TextField
            required
            label="Вставить пример нестандартного оформления"
            value={exampleRecord}
            onChange={(e) => {
              e.target.setCustomValidity("");
              setFieldIsInvalid(false);
              setExampleRecord(e.target.value)
            }}
            onInvalid={(e) => {
              e.target.setCustomValidity("Это поле обязательно к заполнению");
              setFieldIsInvalid(true);
              }
            }
            error={fieldIsInvalid}
            slotProps={{ input: {
              maxLength: 200,
              endAdornment: (
                <InputAdornment position="end">
                  <ClickableTooltip title="Если вам нужен специфический стиль оформления, укажите его в этом поле ввода: вставьте сюда пример правильно оформленной записи">
                    <IconButton edge="end">
                      <InfoOutlinedIcon />
                    </IconButton>
                  </ClickableTooltip>
                </InputAdornment>
              ),
            } }}
          />
        )}

        <Button type="submit" variant="contained" size="large">
          Оформить
        </Button>
        
        <Button 
          variant="outlined" 
          size="large"
          onClick={() => navigate("/search")}
          sx={{
            borderWidth: 2,
            borderStyle: 'solid',
            mt: 1,
            backgroundColor: '#e0e0e0',
            ':hover': {
              backgroundColor: '#ddd5d5ff',
            },
          }}
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

      {/* БЛОК СПРАВКИ */}
      <Box sx={{ 
          width: "100%", 
          p: 2, 
          mt: 3,
          mb: 3, 
          backgroundColor: '#f5f5f5', 
          borderRadius: 1,
          borderLeft: '4px solid #1976d2',
      }}>
        <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 'bold', mb: 1, color: '#1976d2' }}>
          Краткая справка
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Этот инструмент предназначен для автоматизированного создания библиографических ссылок на источники информации из запроса пользователя в соответствии с ГОСТ.
          Он позволяет создавать несколько источников за раз: информация о каждом новом источнике должна начинаться с новой строки в одноименном поле ввода.
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>
          Как пользоваться:
        </Typography>
        <Box component="ul" sx={{ mt: 0, pl: 2, '& li': { mb: 0.5 } }}>
            <Typography component="li" variant="body2">Введите данные в поле "Информация об источнике": введите информацию об источнике (можно без оформления), например:
              <i>"И.И. Иванов Распространение папоротников журнал вестник науки example.com"</i>. Информация об источнике должна быть записана строго в одну строку.
               Новые данные для создания очередной отдельной библиографической ссылки должны разделяться знаком новой строки. </Typography>
            <Typography component="li" variant="body2">Выберите тип источника по ГОСТ (опционально) для большей точности. Или оставьте по умолчанию, тогда система сама определит тип источника информации</Typography>
            <Typography component="li" variant="body2">Если вам нужно получить нестандартное оформление ссылки на источник литературы, то: выберите тип записи "другой", затем в появившееся поле ввода вставьте пример того,
               как должна быть оформлена ссылка на литературу (нужно вставить вместе со всеми нужными знаками препинания и разделения).
               <br /> Например вставить в появившееся поле "Вставить пример нестандартного оформления" текст: <i>"Иванов И.И., Карпатов К.К. Параметризация модели продукционного процесса для экосистем // Мат. биология и биоинформатика. 2019. Т. 14. Вып. 1. С. 54–76."</i>. </Typography>

            <Typography component="li" variant="body2">Нажмите "Оформить" и получите готовые ссылки на источники литературы. Ссылки на источники можно сразу скопировать прямо в вашу работу, ничего дополнительно форматировать не нужно!</Typography>
        </Box>
      </Box>
      {/* КОНЕЦ БЛОКА СПРАВКИ */}

    </Container>
  );
}

export default ReferenceFormMultiRow;
