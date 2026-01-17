import { useEffect } from "react";
import "./Download.css";

function Download() {
  useEffect(() => {
    // Update document title and favicon for this page
    document.title = "Download Haytham App";
  }, []);

  const handleDownload = () => {
    window.open(
      "https://expo.dev/artifacts/eas/9gbbr5jroY3xkKrx3yfbZ6.apk",
      "_blank",
    );
  };

  return (
    <div className="download-page">
      {/* Background decorative elements */}
      <div className="bg-gradient"></div>
      <div className="bg-circle bg-circle-1"></div>
      <div className="bg-circle bg-circle-2"></div>
      <div className="bg-circle bg-circle-3"></div>

      <div className="download-container">
        {/* Logo */}
        <div className="logo-wrapper">
          <img
            src="/haytham-logo.png"
            alt="Haytham Logo"
            className="haytham-logo"
          />
        </div>

        {/* Title */}
        <h1 className="download-title">Haytham</h1>
        <p className="download-subtitle">India's Fastest Quotation Maker</p>

        {/* Description */}
        <p className="download-description">
          Streamline your photography business with our powerful mobile app.
          Create professional quotations in seconds, manage bookings, clients,
          and deliverables all in one place.
        </p>

        {/* Features List */}
        <div className="features-grid">
          <div className="feature-item">
            <span className="feature-icon">📸</span>
            <span className="feature-text">Manage Bookings</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">👥</span>
            <span className="feature-text">Client Management</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📊</span>
            <span className="feature-text">Analytics Dashboard</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📧</span>
            <span className="feature-text">Easy Invoicing</span>
          </div>
        </div>

        {/* Download Button */}
        <button className="download-button" onClick={handleDownload}>
          <span className="download-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="24"
              height="24"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H8l4-4 4 4h-3v4h-2z"
                transform="rotate(180 12 12)"
              />
            </svg>
          </span>
          Download for Android
        </button>

        {/* App info */}
        <div className="app-info">
          <span className="info-badge">Android APK</span>
          <span className="info-badge">Free Download</span>
        </div>

        {/* Footer note */}
        <p className="footer-note">
          Version 1.0 • Built with ❤️ for photographers
        </p>
      </div>
    </div>
  );
}

export default Download;
