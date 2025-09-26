import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  LocalHospital as HospitalIcon,
  Home as ShelterIcon,
  LocalPolice as PoliceIcon,
  Fireplace as FireStationIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  ExpandMore as ExpandMoreIcon,
  Emergency as EmergencyIcon,
  DirectionsCar as VehicleIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useGeolocation } from "../../hooks/useGeolocation";
import emergencyServiceClient from "../../services/emergencyServiceClient";

// Helper component to display emergency contacts
const EmergencyContactCard = ({ contacts, onCallEmergency }) => {
  const { t } = useTranslation();

  return (
    <Card elevation={3} sx={{ mb: 3, border: "1px solid #f44336" }}>
      <Box sx={{ bgcolor: "#f44336", color: "white", p: 2 }}>
        <Typography variant="h6" sx={{ display: "flex", alignItems: "center" }}>
          <EmergencyIcon sx={{ mr: 1 }} />
          {t("emergency.emergencyContacts")}
        </Typography>
      </Box>
      <CardContent>
        <List dense>
          {contacts.map((contact, index) => (
            <ListItem
              key={index}
              secondaryAction={
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={() => onCallEmergency(contact.number)}
                >
                  {t("emergency.call")}
                </Button>
              }
            >
              <ListItemIcon>
                {contact.type === "police" && <PoliceIcon color="primary" />}
                {contact.type === "fire" && <FireStationIcon color="error" />}
                {contact.type === "medical" && <HospitalIcon color="success" />}
                {contact.type === "ambulance" && (
                  <HospitalIcon color="success" />
                )}
                {contact.type === "disaster" && (
                  <EmergencyIcon color="warning" />
                )}
                {contact.type === "ndrf" && <EmergencyIcon color="warning" />}
              </ListItemIcon>
              <ListItemText primary={contact.name} secondary={contact.number} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

// Helper component to display emergency resources
const EmergencyResourcesList = ({ resources, resourceType, title, icon }) => {
  const { t } = useTranslation();

  if (!resources || resources.length === 0) return null;

  return (
    <Accordion defaultExpanded={resourceType === "hospitals"}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {icon}
          <Typography variant="subtitle1" sx={{ ml: 1 }}>
            {title} ({resources.length})
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <List dense disablePadding>
          {resources.map((resource) => (
            <ListItem key={resource.id} divider>
              <ListItemText
                primary={
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body1">{resource.name}</Typography>
                    <Chip
                      size="small"
                      label={`${resource.distance.toFixed(1)} km`}
                      color={resource.distance < 2 ? "success" : "primary"}
                      variant="outlined"
                    />
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 1 }}>
                    {resource.address && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        <LocationIcon fontSize="small" sx={{ mr: 0.5 }} />
                        {resource.address}
                      </Typography>
                    )}
                    {resource.phone && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        <PhoneIcon fontSize="small" sx={{ mr: 0.5 }} />
                        {resource.phone}
                      </Typography>
                    )}
                    {resourceType === "hospitals" &&
                      resource.beds_available !== undefined && (
                        <Typography variant="body2" color="text.secondary">
                          {t("emergency.bedsAvailable")}:{" "}
                          {resource.beds_available}
                        </Typography>
                      )}
                    {resourceType === "shelters" &&
                      resource.available_space !== undefined && (
                        <Typography variant="body2" color="text.secondary">
                          {t("emergency.availableSpace")}:{" "}
                          {resource.available_space}/{resource.capacity}
                        </Typography>
                      )}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </AccordionDetails>
    </Accordion>
  );
};

// Main emergency services component
const EmergencyServices = () => {
  const { t } = useTranslation();
  const { coordinates } = useGeolocation();

  const [contacts, setContacts] = useState([]);
  const [resources, setResources] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => {
    // Fetch emergency contacts when component mounts
    const fetchEmergencyContacts = async () => {
      try {
        const contactsData =
          await emergencyServiceClient.getEmergencyContacts();
        setContacts(contactsData);
      } catch (err) {
        console.error("Error fetching emergency contacts:", err);
        setError(t("emergency.errorFetchingContacts"));
      }
    };

    fetchEmergencyContacts();
  }, [t]);

  useEffect(() => {
    // Fetch nearby emergency resources when coordinates change
    const fetchEmergencyResources = async () => {
      if (!coordinates || !coordinates.latitude || !coordinates.longitude) {
        return;
      }

      setLoading(true);
      try {
        const resourcesData =
          await emergencyServiceClient.getNearbyEmergencyResources(
            coordinates.longitude,
            coordinates.latitude,
            5000, // 5km radius
            ["hospital", "shelter", "police", "fire_station"]
          );
        setResources(resourcesData);
      } catch (err) {
        console.error("Error fetching emergency resources:", err);
        setError(t("emergency.errorFetchingResources"));
      } finally {
        setLoading(false);
      }
    };

    fetchEmergencyResources();
  }, [coordinates, t]);

  const handleCallEmergency = (phoneNumber) => {
    setSelectedContact(phoneNumber);
    setShowEmergencyDialog(true);
  };

  const handleConfirmCall = () => {
    if (selectedContact) {
      window.location.href = `tel:${selectedContact}`;
    }
    setShowEmergencyDialog(false);
  };

  const handleReportEmergency = async () => {
    if (!coordinates || !coordinates.latitude || !coordinates.longitude) {
      setError(t("emergency.locationRequired"));
      return;
    }

    // In a real application, this would open a form to collect emergency details
    alert(t("emergency.reportEmergencyPrompt"));
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        {t("emergency.emergencyServices")}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        variant="contained"
        color="error"
        fullWidth
        size="large"
        startIcon={<EmergencyIcon />}
        sx={{ mb: 3, py: 1.5, fontSize: "1.1rem" }}
        onClick={handleReportEmergency}
      >
        {t("emergency.reportEmergency")}
      </Button>

      <EmergencyContactCard
        contacts={contacts}
        onCallEmergency={handleCallEmergency}
      />

      <Typography variant="h5" gutterBottom>
        {t("emergency.nearbyResources")}
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {!resources.hospitals &&
          !resources.shelters &&
          !resources.police_stations &&
          !resources.fire_stations ? (
            <Alert severity="info">{t("emergency.noResourcesFound")}</Alert>
          ) : (
            <Card elevation={2}>
              <CardContent>
                <EmergencyResourcesList
                  resources={resources.hospitals}
                  resourceType="hospitals"
                  title={t("emergency.hospitals")}
                  icon={<HospitalIcon color="primary" />}
                />

                <EmergencyResourcesList
                  resources={resources.shelters}
                  resourceType="shelters"
                  title={t("emergency.shelters")}
                  icon={<ShelterIcon color="secondary" />}
                />

                <EmergencyResourcesList
                  resources={resources.police_stations}
                  resourceType="police"
                  title={t("emergency.policeStations")}
                  icon={<PoliceIcon color="info" />}
                />

                <EmergencyResourcesList
                  resources={resources.fire_stations}
                  resourceType="fire"
                  title={t("emergency.fireStations")}
                  icon={<FireStationIcon color="error" />}
                />
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Dialog
        open={showEmergencyDialog}
        onClose={() => setShowEmergencyDialog(false)}
      >
        <DialogTitle sx={{ bgcolor: "error.main", color: "white" }}>
          {t("emergency.emergencyCall")}
        </DialogTitle>
        <DialogContent sx={{ pt: 2, mt: 2 }}>
          <Typography>
            {t("emergency.confirmEmergencyCall")} {selectedContact}?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            {t("emergency.onlyUseForEmergencies")}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEmergencyDialog(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmCall}
            autoFocus
          >
            {t("emergency.callNow")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmergencyServices;
