import React from "react";
import { Box, Container, Paper, Typography, Breadcrumbs } from "@mui/material";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import EmergencyServices from "../../components/Emergency/EmergencyServices";

const EmergencyServicesPage = () => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
          {t("navigation.home")}
        </Link>
        <Typography color="text.primary">
          {t("navigation.emergency")}
        </Typography>
      </Breadcrumbs>

      <Paper sx={{ p: 3, mb: 4 }}>
        <EmergencyServices />
      </Paper>
    </Container>
  );
};

export default EmergencyServicesPage;
