// src/components/HomePage.js
import { Container, Button, Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ mt: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        LibSource - генератор списка источников
      </Typography>
      
      <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
        <Button 
          variant="contained" 
          size="large"
          onClick={() => navigate("/reference-form-multi-row")}
        >
          Оформить свой список
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

      {/* НОВЫЙ БЛОК СПРАВКИ */}
        <Box sx={{ 
            width: "100%", 
            p: 2, 
            mb: 3, 
            backgroundColor: '#f5f5f5', 
            borderRadius: 1,
            borderLeft: '4px solid #1976d2',
        }}>
          <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 'bold', mb: 1, color: '#1976d2' }}>
            Краткая справка
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Сервис предназначен для автоматизированного оформления списка источников для академических работ, а также для поиска статей и их оформления в список.
          </Typography>
        </Box>
      {/* КОНЕЦ НОВОГО БЛОКА */}

    </Container>
  );
}

export default HomePage;
