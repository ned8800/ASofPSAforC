import { Container, Button, Box, Typography, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import SearchIcon from '@mui/icons-material/Search';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';


function HomePage() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ mt: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
      <Typography variant="h4" gutterBottom align="center"  fontWeight="bold">
        Libsource — ваш надёжный помощник по оформлению ссылок на источники информации онлайн
      </Typography>
      
      <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
        <Button 
          variant="contained" 
          size="large"
          onClick={() => navigate("/reference-form-multi-row")}
        >
          Оформить ссылки на источники информации
        </Button>

        <Button 
          variant="outlined" 
          size="large"
          onClick={() => navigate("/search")}
          sx={{
            borderWidth: 2,
            borderStyle: 'solid',
            backgroundColor: '#e0e0e0',
            ':hover': {
              backgroundColor: '#ddd5d5ff',
            },
          }}
        >
          Найти статьи для оформления источников информации в elibrary
        </Button>
      </Box>

      {/* БЛОК СПРАВКИ */}
      <Box
        sx={{
          p: 4,
          borderRadius: 3,
          boxShadow: 6,
          backgroundColor: '#ffffff',
          border: '2px solid #e0e0e0',
          mb: 4,
        }}
      >
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600, color: '#004d40', mb: 2, textAlign: "center" }} >
          LibSource — это система для создания ссылок на источники информации. Подходит как студентам, так и преподавателям.
        </Typography>

        <Typography variant="body1" sx={{ mb: 2, fontSize: '1.1rem' }}>
          Устали тратить время на мучительное оформление списка литературы по ГОСТу? Забудьте о рутине! Мы создали этот сервис, чтобы сделать вашу работу с источниками <b>максимально быстрой и приятной</b>.
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, p: 1, backgroundColor: '#e8f5e9', borderRadius: 1 }}>
            <CheckCircleOutlineIcon sx={{ color: '#388e3c', mr: 1 }} />
            <Typography variant="body1" sx={{ fontWeight: 500, color: '#388e3c' }}>
                Начните пользоваться нашим инструментом прямо сейчас и убедитесь, как легко и точно можно оформлять ссылки на литературу.
            </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" component="h3" sx={{ fontWeight: 600, color: '#1976d2', mb: 2 }}>
          🚀 Выберите инструмент:
        </Typography>

        {/* ОПИСАНИЕ КНОПОК */}
        {/* 1. Оформить ссылку */}
        <Box sx={{ p: 2, border: '1px solid #bbdefb', borderRadius: 2, backgroundColor: '#f9f9f9' }}>
          <a className="description_block-link" href="/reference-form-multi-row">
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1565c0', mb: 0.5, display: 'flex', alignItems: 'center' }}>
              <FormatQuoteIcon sx={{ mr: 1 }} />
              Оформить ссылки на источники информации (Составление библиографических ссылок на литературу)
          </Typography>
          </a>
          <Typography variant="body2">
              Выберите эту опцию, если у вас уже есть информация об источнике, но нужно превратить её в готовую библиографическую ссылку на литературу по всем правилам. Введите данные, следуйте подсказкам и получите идеально оформленные ссылки по ГОСТу.
          </Typography>
        </Box>

        {/* 2. Поиск источников */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ p: 2, border: '1px solid #c8e6c9', borderRadius: 2, backgroundColor: '#f9f9f9' }}>
            <a className="description_block-link" href="/search">
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#388e3c', mb: 0.5, display: 'flex', alignItems: 'center' }}>
                <SearchIcon sx={{ mr: 1 }} />
                Найти статьи для оформления источников информации в elibrary (Найти статьи в e-library)
            </Typography>
            </a>
            <Typography variant="body2">
                Выберите эту опцию, если вам нужно найти научные статьи по интересующей теме. Вы получите быстрый доступ к каталогу статей из крупнейшей российской научной библиотеки e-library. Идеально для сбора актуальной базы источников.
            </Typography>
          </Box>

        </Box>
      </Box>
      {/* КОНЕЦ БЛОКА СПРАВКИ */}


      <a href="https://freedns.afraid.org/"> Free DNS </a>

    </Container>
  );
}

export default HomePage;
