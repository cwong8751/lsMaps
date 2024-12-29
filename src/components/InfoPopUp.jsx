import './InfoPopUp.css';

const InfoPopUp = ({ showInfoPopUp, onClose }) => {
  return (
    <div
      className={`info-popup ${
        showInfoPopUp ? "fade-in" : "fade-out"
      }`}
    >
      <h2>How to use MotoMaps</h2>
      <p>
        Welcome to MotoMaps! This website allows you to search for bicycle/scooter/motorcycle
        routes in your area. To get started, simply enter a location in the
        search bar and click the search button.
      </p>
      <h4>Vehicle Options</h4>
      <ul>
        <li>Bicycle: Best for push bikes, highway access is disabled, prefer bike lanes, max speed is also ignored.</li>
        <li>Scooter: Best for motor scooters 50-150cc, highway access is disabled.</li>
        <li>Motorcycle: Best for motorcycles 150cc and above, highway access is allowed, max speed under 60mph will be considered as scooter.</li>
      </ul>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default InfoPopUp;