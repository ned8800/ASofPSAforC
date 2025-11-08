// src/components/HomePage.js
import React from "react";
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
          onClick={() => navigate("/reference-form")}
        >
          Форма (стандартный ввод)
        </Button>

        <Button 
          variant="outlined" 
          size="large"
          onClick={() => navigate("/reference-form-multi-row")}
        >
          Форма (многострочный ввод)
        </Button>
      </Box>
    </Container>
  );
}

export default HomePage;
