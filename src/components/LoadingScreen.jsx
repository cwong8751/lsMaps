import './LoadingScreen.css';
const LoadingScreen = ({ showLoadingScreen, loadingMessage }) => {
  return (
    <div
      className={`loading-screen ${
        showLoadingScreen ? "fade-in" : "fade-out"
      }`}
    >
      <div className="loading-message">{loadingMessage}</div>
    </div>
  );
};

export default LoadingScreen;