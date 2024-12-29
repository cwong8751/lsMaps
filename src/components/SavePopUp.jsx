import './SavePopUp.css';
const SavePopUp = ({ showSavePopUp, onClose, savedTrips }) => {
  return (
    <div
      className={`info-popup ${
        showSavePopUp ? "fade-in" : "fade-out"
      }`}
    >
      <h2>Your Trips</h2>
      <p>Every time you search for a route, it will get saved here.</p>

      {
        (savedTrips && savedTrips.length === 0) ? (
            <p>No saved trips yet.</p>
        ) :
        (
            <ul className='saved-trip-list'>
                {
                    savedTrips.map((trip, index) => (
                        <li key={index} className='saved-trip-list-card'>
                            <p>{`Trip from ${trip.startAddress} to ${trip.endAddress}`}</p>
                            <p>By {trip.vehicle}</p>
                            <div className='horizontal-checkbox-container'>
                                <p>{`Total time: ${Math.round(trip.totalTime / 60)} min`}</p>
                                <p>{`Total Distance: ${(trip.totalDistance).toFixed(1)} miles` }</p>
                            </div>
                        </li>
                    ))
                }
            </ul>
        )
      }
     
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default SavePopUp;