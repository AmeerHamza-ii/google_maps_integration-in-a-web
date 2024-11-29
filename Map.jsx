import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import CloseIcon from '@mui/icons-material/Close';
import { Button, Card, CardContent, Typography, Box, Grid, Paper } from '@mui/material';
import { display, width } from '@mui/system';

// Haversine formula for distance calculation
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const Routing = ({ currentLocation, destination }) => {
  const map = useMap();

  useEffect(() => {
    if (currentLocation && destination) {
      const routingControl = L.Routing.control({
        waypoints: [L.latLng(currentLocation.lat, currentLocation.lng), L.latLng(destination.lat, destination.lng)],
        routeWhileDragging: true,
        lineOptions: {
          styles: [{ color: 'black', weight: 4, opacity: 0.7 }]
        },
        router: L.Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1'
        }),
        createMarker: () => null // Disable default markers
      }).addTo(map);

      return () => {
        map.removeControl(routingControl);
      };
    }
  }, [currentLocation, destination, map]);

  return null;
};

function Locations() {
  const locations = [
    {
      position: { lat: 24.7136, lng: 46.6753 },
      name: 'Riyadh',
      image: 'https://bit.ly/3Bb1EKH',
      icon: 'https://cdn-icons-png.flaticon.com/512/684/684908.png'
    },
    {
      position: { lat: 24.7265, lng: 46.708 },
      name: 'Location 2',
      image: 'https://bit.ly/3Bb1EKH',
      icon: 'https://cdn-icons-png.flaticon.com/512/847/847969.png'
    },
    {
      position: { lat: 24.7, lng: 46.65 },
      name: 'Location 3fa is a good location',
      image: 'https://bit.ly/3Bb1EKH',
      icon: 'https://cdn-icons-png.flaticon.com/512/3253/3253749.png'
    }
  ];

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false); // New state to control visibility of the details box

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          alert('Unable to retrieve your location.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  }, []);

  const handleMarkerClick = (location) => {
    setSelectedLocation(location);
    setIsDetailsOpen(true); // Open the details box when a location is selected
    if (currentLocation) {
      const dist = calculateDistance(currentLocation.lat, currentLocation.lng, location.position.lat, location.position.lng);
      setDistance(dist.toFixed(2)); // Round to 2 decimal places
    }
  };

  const handleCloseDetails = () => {
    setSelectedLocation(null); // Reset the selected location
    setIsDetailsOpen(false); // Close the details box
  };

  const handleOpenInGoogleMaps = (location) => {
    const { lat, lng } = location.position;
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  return (
    <Grid container direction="column">
      <MapContainer style={{ height: '100vh', width: '100%' }} center={[24.7136, 46.6753]} zoom={12} scrollWheelZoom={false}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {currentLocation && (
          <Circle center={currentLocation} radius={100} pathOptions={{ color: 'blue' }}>
            <Popup>Your current location</Popup>
          </Circle>
        )}
        {locations.map((location, index) => (
          <Marker
            key={index}
            position={location.position}
            icon={
              new L.Icon({
                iconUrl: location.image,
                iconSize: [40, 40],
                iconAnchor: [10, 10],
                popupAnchor: [0, -40]
              })
            }
            eventHandlers={{
              click: () => handleMarkerClick(location)
            }}
          >
            <Popup>{location.name}</Popup>
          </Marker>
        ))}
        {selectedLocation && currentLocation && <Routing currentLocation={currentLocation} destination={selectedLocation.position} />}
      </MapContainer>

      {/* If no location is selected, show horizontal scrolling locations */}
      {!selectedLocation && (
        <div style={{ overflowX: 'scroll', whiteSpace: 'nowrap', marginTop: '10px' }}>
          {locations.map((location, index) => (
            <Paper
              key={index}
              onClick={() => handleMarkerClick(location)}
              style={{
                display: 'inline-block',
                width: '40%',
                height: '120px',
                marginRight: '10px',
                marginBottom: '10px',
                cursor: 'pointer',
                borderRadius: '2%',
                padding: '5px',
                textAlign: 'center',
                border: selectedLocation?.name === location.name ? '2px solid #4caf50' : '2px solid transparent',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                backgroundColor: '#fff'
              }}
            >
              <Grid
                container
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  alignItems: 'left'
                }}
              >
                {/* Image Section */}
                <Grid item>
                  <img
                    src={location.image}
                    alt={location.name}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '100%',
                      objectFit: 'cover',
                      marginBottom: '10px'
                    }}
                  />
                </Grid>

                {/* Text Section */}
                <Grid item sx={{ marginTop: '8px', marginLeft: '4px' }}>
                  <Typography variant="h4">{location.name}</Typography>
                </Grid>
              </Grid>
            </Paper>
          ))}
        </div>
      )}

      {/* Location Details - Only visible when a location is selected                   X*/}
      {selectedLocation && isDetailsOpen && (
        <Box sx={{ paddingTop: 1, backgroundColor: '#f4f4f4', marginTop: 2, textAlign: 'center' }}>
          <Card sx={{ maxWidth: '500px', margin: '0 auto', position: 'relative' }}>
            <CardContent>
              {/* Close button */}
              <Grid
                xs={12}
                sx={{
                  marginTop: '120px',
                  alignItems: 'center',

                  height: '7px',
                  float: 'right',
                  display: 'flex',
                  justifyContent: 'flex-end'
                }}
                spacing={0}
              >
                <Grid item xs={6} sx={{ height: '30px' }}>
                  <CloseIcon
                    sx={{
                      fontSize: 24, // Adjust size
                      cursor: 'pointer', // Add hover effect
                      color: 'inherit',
                      top: '15px',
                      zIndex: 1,
                      left: '0px',
                      height: '30px',
                      minWidth: '30px',
                      boxShadow: 'none',
                      padding: '0.5rem',
                      position: 'absolute',
                      backgroundColor: 'white',
                      '&:hover': {
                        backgroundColor: 'white',
                        boxShadow: 'none'
                      }
                    }}
                    onClick={handleCloseDetails} // Your close function
                  />
                </Grid>

                <Grid
                  container
                  spacing={12}
                  alignItems="right"
                  sx={{
                    display: 'flex',
                    margintop: '0px',
                    height: '70px',
                    justifyContent: 'flex-end',
                    alignItems: 'right',
                    alignContent: 'right',
                    marginBottom: '17px',
                    border: '1px solid black'
                  }}
                >
                  {/* Column for Text (Name and Coordinates) */}
                  <Grid
                    container
                    spacing={0}
                    xs={6}
                    sx={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      alignItems: 'flex-end',
                      marginBottom: '1px',
                      alignContent: 'right',
                      border: '1px solid black',
                      width: '200px',
                      height: '40px',
                      marginRight: '-50px'
                    }}
                  >
                    <Grid
                      container
                      xs={6}
                      direction="column"
                      spacing={0}
                      sx={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                        textAlign: 'right',
                        alignItems: 'right',
                        float: 'right',
                        marginRight: 'auto',
                        margintop: '19px',
                        width: '160px',
                        border: '2px solid green'
                      }}
                    >
                      <Grid item sx={{ border: '3px solid brown', width: '150px' }}>
                        <Typography variant="h4" gutterBottom sx={{ display: 'inline' }}>
                          {selectedLocation.name}
                        </Typography>
                      </Grid>
                      <Grid item sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', mt: -0 }}>
                        <Typography variant="body2" color="textSecondary" sx={{ display: 'inline', fontWeight: 'bold' }}>
                          {selectedLocation.position.lat}, {selectedLocation.position.lng}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* Column for Image */}
                  <Grid
                    container
                    xs={2}
                    display={'flex'}
                    justifyContent="flex-end"
                    sx={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      textAlign: 'right',
                      alignContent: 'center',
                      float: 'right',
                      border: '3px solid blue',
                      height: '80px',
                      width: '280px',
                      marginBottom: '40px'
                    }}
                  >
                    <img
                      src={selectedLocation.image}
                      alt={selectedLocation.name}
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '100%',
                        objectFit: 'cover',
                        marginBottom: '0px',
                        marginRight: '1px'
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid
                container
                direction="row"
                spacing={3}
                xs={12}
                sx={{
                  marginTop: '2%',
                  float: 'right',
                  flexDirection: {
                    xs: 'column',
                    sm: 'row'
                  },
                  justifyContent: {
                    xs: 'center'
                  },
                  alignItems: {
                    xs: 'center'
                  },
                  '@media (max-width: 300px)': {
                    float: 'none',
                    marginTop: '5%' // Adjust margin if needed for smaller screens
                  }
                }}
              >
                <Grid item xs={6} spacing={0} sx={{ color: 'green' }}>
                  {distance && (
                    <Paper
                      sx={{
                        paddingTop: 2,
                        paddingBottom: 2,
                        marginBottom: 2,
                        border: '2px solid rgb(237,247,245)',
                        backgroundColor: 'rgb(237,247,245)',
                        borderRadius: '6px',
                        color: '#4DB8A6'
                      }}
                    >
                      <Typography variant="h4" color="textPrimary" sx={{ display: 'inline', color: '#4DB8A6' }}>
                        Distance :
                      </Typography>
                      <Typography
                        variant="h5"
                        color="textPrimary"
                        sx={{
                          display: 'inline',
                          color: '#4DB8A6'
                        }}
                      >
                        {distance} KM
                      </Typography>
                    </Paper>
                  )}
                </Grid>
                <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '12px' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpenInGoogleMaps(selectedLocation)}
                    sx={{
                      '&:hover': {
                        color: 'white',
                        backgroundColor: 'rgb(132,99,166)'
                      },
                      color: 'white',
                      marginTop: 0,
                      width: '200px',
                      marginBottom: 2,
                      backgroundColor: 'rgb(132,99,166)',
                      borderRadius: '8px',
                      padding: '14px 3px'
                    }}
                  >
                    Google Maps
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      )}
    </Grid>
  );
}

export default Locations;
