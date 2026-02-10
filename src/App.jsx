import './App.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useEffect } from 'react';
import { getDirection } from './utils/Directions';
import { Polyline } from 'react-leaflet';
import { useMap } from 'react-leaflet';
import LoadingScreen from './components/LoadingScreen';
import '@geoapify/geocoder-autocomplete/styles/round-borders.css';
import InfoPopUp from './components/InfoPopUp';
import L from 'leaflet';
import HeaderBar from './components/HeaderBar';
import Sidebar from './components/Sidebar';
import SavePopUp from './components/SavePopUp';


function FitMapToPolyline({ path }) {
  const map = useMap();

  if (path.length > 0) {
    const bounds = path.map(([lat, lon]) => [lat, lon]);
    map.fitBounds(bounds);
  }

  return null;
}

// CITATION: https://leafletjs.com/reference.html#icon, https://github.com/pointhi/leaflet-color-markers 
const greenIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const redIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const blueIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
// END CITATION


function App() {

  // state vars
  const [startCoordinate, setStartCoordinate] = React.useState([]);
  const [endCoordinate, setEndCoordinate] = React.useState([]);
  const [startAddress, setStartAddress] = React.useState("");
  const [endAddress, setEndAddress] = React.useState("");
  const [direction, setDirection] = React.useState([]);
  const [path, setPath] = React.useState([]);
  const [maxSpeed, setMaxSpeed] = React.useState(20);
  const [showLoadingScreen, setShowLoadingScreen] = React.useState(false);
  const [selectedVehicle, setSelectedVehicle] = React.useState('bicycle');
  const [expandRouteOptionSidebar, setExpandRouteOptionSidebar] = React.useState(true);
  const [userCurrentLocation, setUserCurrentLocation] = React.useState([]);
  const [maxSpeedSliderCap, setMaxSpeedSliderCap] = React.useState(20);
  const [forceDisableFreeway, setForceDisableFreeway] = React.useState(true);
  const [showInfoPopUp, setShowInfoPopUp] = React.useState(false);
  const [showSavePopUp, setShowSavePopUp] = React.useState(false);
  const [expandDirectionsSidebar, setExpandDirectionsSidebar] = React.useState(true);
  const [totalDistance, setTotalDistance] = React.useState(0);
  const [totalTime, setTotalTime] = React.useState(0);
  const [unit, setUnit] = React.useState("");
  const [showSidebar, setShowSidebar] = React.useState(true);
  const [savedTrips, setSavedTrips] = React.useState([]);

  useEffect(() => {
    // get geolocation from user
    // CITATION: https://www.shecodes.io/athena/9970-retrieve-user-location-with-geolocation-in-react
    if (navigator.geolocation) {
      console.log("getting geolocation");

      const options = {
        enableHighAccuracy: false,
        timeout: 5000,
      };

      navigator.geolocation.getCurrentPosition(success, error, options);
    }

    function success(position) {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);

      // plot the user location to map
      setUserCurrentLocation([latitude, longitude]);
    }

    function error() {
      console.log("Unable to retrieve your location or user choose to not share location");
      setShowLoadingScreen(false);
      setUserCurrentLocation([38.6488, -90.3108]); // default to washu 
    }
    // END CITATION

    // get list of saved trips from local storage
    let savedTrips = JSON.parse(localStorage.getItem('savedTrips')) || [];
    console.log("saved trips from local storage: ", savedTrips);
    setSavedTrips(savedTrips);
  }, []);

  const handlePrintClick = () => {
    window.print();
  };

  const handleSaveClick = () => {
    setShowSavePopUp(!showSavePopUp);
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const handleInfoClick = () => {
    setShowInfoPopUp(!showInfoPopUp);
  };

  const handleSpeedSliderChange = (event) => {
    let selectSpeed = event.target.value;
    setMaxSpeed(selectSpeed);

    // add speed check for motorcycles, if they have max speed < 60 the avoid highway option is automatically on 
    if (selectedVehicle === 'motorcycle') {
      const avoidHighwayCheckbox = document.getElementById('freeway-option');
      if (selectSpeed <= 60) {
        avoidHighwayCheckbox.checked = true;
      } else {
        avoidHighwayCheckbox.checked = false;
      }
    }
  }

  const handleVehicleTypeSelect = (vehicle) => {
    setSelectedVehicle(vehicle);

    // if vehicle is bicycle, set max speed to 20
    if (vehicle === 'bicycle') {
      setMaxSpeedSliderCap(20);
      setForceDisableFreeway(true);
    }
    else if (vehicle === 'scooter') {
      setMaxSpeedSliderCap(60);
      setForceDisableFreeway(true);
    }
    else if (vehicle === 'motorcycle') {
      setMaxSpeedSliderCap(100);
      setForceDisableFreeway(false);
    }

    // recompute distances
    if (startCoordinate.length > 0 && endCoordinate.length > 0) {
      handleDestinationSubmit();
    }
  }

  const toggleRouteOptions = () => {
    setExpandRouteOptionSidebar(!expandRouteOptionSidebar);
  };

  const toggleDirectionOptions = () => {
    setExpandDirectionsSidebar(!expandDirectionsSidebar);
  }

  const handleDestinationSubmit = async (event) => {
    if (event) {
      event.preventDefault();
    }

    // get avoid options
    let avoidFerry = document.getElementById('ferry-option').checked;
    let avoidFreeway = document.getElementById('freeway-option').checked;

    // // get maxspeed
    // let maxSpeed = document.getElementById('max-speed-slider').value;

    // get vehicle type
    let vehicleType = selectedVehicle;

    // debug 
    console.log("start address: ", startCoordinate);
    console.log("destination address: ", endCoordinate);
    console.log("avoid ferry: ", avoidFerry);
    console.log("avoid freeway: ", avoidFreeway);
    console.log("max speed: ", maxSpeed);
    console.log("vehicle type: ", vehicleType);

    // if we have the user's start coordinate, and if they set it as empty, then we use their coordinate as start 
    if (endCoordinate.length === 0) {
      alert("Please enter a valid destination");
      return;
    }

    if (startCoordinate.length === 0) {
      console.log("setting start location to user location, ", userCurrentLocation);
      setStartCoordinate([userCurrentLocation[0], userCurrentLocation[1]]);
    }

    setShowLoadingScreen(true);

    try {
      let startlat = startCoordinate[0];
      let startlon = startCoordinate[1];

      if (startCoordinate.length === 0) {
        startlat = userCurrentLocation[0];
        startlon = userCurrentLocation[1];
      }

      let destlat = endCoordinate[0];
      let destlon = endCoordinate[1];

      // fetch data from API
      let directions = await getDirection(`${startlat},${startlon}`, `${destlat},${destlon}`, vehicleType, maxSpeed, avoidFerry, avoidFreeway);

      // extract responses from API 
      let { modeOfTravel, units, totalDistance, totalTime, startPoint, endPoint, steps, fullPath } = directions;

      // plot the path on the map
      let path = fullPath.map(point => ([point[1], point[0]]));

      setPath(path); // set to state variable to handle
      setDirection(steps); // set to state variable to handle
      setStartCoordinate([startlat, startlon]); // set to state variable to handle
      setEndCoordinate([destlat, destlon]); // set to state variable to handle
      setTotalDistance(totalDistance);
      setTotalTime(totalTime);
      setUnit(units);

      // add the trip to saved trips
      let newTrip = {
        startAddress: startAddress,
        endAddress: endAddress,
        vehicle: selectedVehicle,
        totalDistance: totalDistance,
        totalTime: totalTime,
      };

      let currentTrips = [...savedTrips, newTrip];
      setSavedTrips(currentTrips);

      // save it to local storage
      localStorage.setItem('savedTrips', JSON.stringify(currentTrips));

      setShowLoadingScreen(false); // cancel the loading screen 
      // console.log(directions);
      // console.log(path);
    }
    catch (error) {
      console.error(error);
      setShowLoadingScreen(false);
    }
  };

  return (
    <>
      {showLoadingScreen && <LoadingScreen loadingMessage={"Finding the best route for you..."} showLoadingScreen={showLoadingScreen} />}
      {showInfoPopUp && <InfoPopUp showInfoPopUp={showInfoPopUp} onClose={() => setShowInfoPopUp(!showInfoPopUp)} />}
      {showSavePopUp && <SavePopUp savedTrips={savedTrips ?? []} showSavePopUp={showSavePopUp} onClose={() => setShowSavePopUp(!showSavePopUp)} />}
      <HeaderBar handlePrintClick={handlePrintClick} handleSaveClick={handleSaveClick} handleInfoClick={handleInfoClick} />
      <section>
        <Sidebar setStartAddress={setStartAddress} setEndAddress={setEndAddress} toggleSidebar={toggleSidebar} showSidebar={showSidebar} setStartCoordinate={setStartCoordinate} totalDistance={totalDistance} totalTime={totalTime} unit={unit} setEndCoordinate={setEndCoordinate} handleDestinationSubmit={handleDestinationSubmit} handleVehicleTypeSelect={handleVehicleTypeSelect} handleSpeedSliderChange={handleSpeedSliderChange} toggleRouteOptions={toggleRouteOptions} expandRouteOptionSidebar={expandRouteOptionSidebar} expandDirectionsSidebar={expandDirectionsSidebar} selectedVehicle={selectedVehicle} maxSpeed={maxSpeed} toggleDirectionOptions={toggleDirectionOptions} maxSpeedSliderCap={maxSpeedSliderCap} forceDisableFreeway={forceDisableFreeway} direction={direction} />
        {
          // only render MapContainer if userCurrentLocation is set
          userCurrentLocation && userCurrentLocation.length > 0 ? (
            <MapContainer
              className="mapContainer"
              center={userCurrentLocation}
              zoom={15}
              scrollWheelZoom={true}
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {startCoordinate.length > 0 && (
                <Marker position={startCoordinate} icon={greenIcon}>
                  <Popup>Start</Popup>
                </Marker>
              )}
              {endCoordinate.length > 0 && (
                <Marker position={endCoordinate} icon={redIcon}>
                  <Popup>End</Popup>
                </Marker>
              )}
              {userCurrentLocation.length > 0 && (
                <Marker icon={blueIcon} position={userCurrentLocation}>
                  {userCurrentLocation == [38.6488, -90.3108] ? (
                    <Popup>Washington University in St. Louis</Popup>
                  ) : (
                    <Popup>Your Location</Popup>
                  )}
                </Marker>
              )}
              {path.length > 0 && (
                <>
                  <Polyline positions={path} color="green" />
                  <FitMapToPolyline path={path} />
                </>
              )}
            </MapContainer>
          ) : (
            // this is shown until userCurrentLocation is available
            <LoadingScreen loadingMessage={"Determining your location...\nThis might take longer if you are using Chrome"} showLoadingScreen={true} />
          )
        }
      </section>
    </>
  );
}

export default App;
