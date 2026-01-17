import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import InquiryForm from "./pages/InquiryForm";
import Download from "./pages/Download";
import "./App.css";

function Home() {
  return (
    <div className="home-container">
      <img src="/haytham-logo.png" alt="Haytham Logo" className="home-logo" />
      <h1 className="home-title">Haytham</h1>
      <p className="home-subtitle">India's Fastest Quotation Maker</p>
      <p className="home-description">
        Streamline your photography business with professional quotations,
        booking management, and client tools.
      </p>

      {/* Features Grid */}
      <div className="features-grid">
        {[
          { icon: "📸", text: "Manage Bookings" },
          { icon: "👥", text: "Client Management" },
          { icon: "📊", text: "Analytics Dashboard" },
          { icon: "📧", text: "Easy Invoicing" },
        ].map((feature, index) => (
          <div key={index} className="feature-item">
            <span className="feature-icon">{feature.icon}</span>
            <span className="feature-text">{feature.text}</span>
          </div>
        ))}
      </div>

      {/* Download Button */}
      <a
        href="https://expo.dev/artifacts/eas/9gbbr5jroY3xkKrx3yfbZ6.apk"
        target="_blank"
        rel="noopener noreferrer"
        className="download-btn"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H8l4-4 4 4h-3v4h-2z"
            transform="rotate(180 12 12)"
          />
        </svg>
        Download for Android
      </a>

      {/* App Info Badges */}
      <div className="app-badges">
        <span className="app-badge">Android APK</span>
        <span className="app-badge">Free Download</span>
      </div>

      {/* Footer Note */}
      <p className="footer-note">
        Version 1.0 • Built with ❤️ for photographers
      </p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/download" element={<Download />} />
        <Route path="/inquiryform" element={<InquiryForm />} />
        <Route path="/inquiryform/:userId" element={<InquiryForm />} />
        {/* New Booking Route with Token */}
        <Route path="/book/:userId/:token" element={<InquiryForm />} />
      </Routes>
    </Router>
  );
}

export default App;
