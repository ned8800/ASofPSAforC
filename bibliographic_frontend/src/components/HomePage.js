// src/components/HomePage.js
import { Container, Button, Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ mt: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        Генератор библиографических записей
      </Typography>
      
      <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
        <Button 
          variant="contained" 
          size="large"
          onClick={() => navigate("/reference-form-multi-row")}
        >
          Создать библиографические ссылки
        </Button>

        <Button 
          variant="outlined" 
          size="large"
          onClick={() => navigate("/search")}
          sx={{
            borderWidth: 2,
            borderStyle: 'solid',
            backgroundColor: '#e0e0e0', // устанавливаем фоновое оформление
            ':hover': {               // применяем эффекты при наведении
              backgroundColor: '#ddd5d5ff', // цвет фона при наведении
            },
          }}
        >
          Найти статьи для оформления в elibrary
        </Button>
      </Box>
    </Container>
  );
}

export default HomePage;
