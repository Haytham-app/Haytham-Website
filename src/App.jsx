import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import InquiryForm from "./pages/InquiryForm";
import "./App.css";

function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
        background:
          "linear-gradient(135deg, #FFE4B8 0%, #FFD6E4 50%, #ffffff 100%)",
      }}
    >
      <h1 style={{ fontSize: "2.5rem", color: "#FF6B35" }}>
        HayTham Photography
      </h1>
      <p style={{ color: "#666", marginTop: "1rem" }}>
        Visit{" "}
        <a href="/inquiryform/demo-user-123" style={{ color: "#FFC107" }}>
          /inquiryform/:userId
        </a>{" "}
        to see the inquiry form
      </p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/inquiryform" element={<InquiryForm />} />
        <Route path="/inquiryform/:userId" element={<InquiryForm />} />
        {/* New Booking Route with Token */}
        <Route path="/book/:userId/:token" element={<InquiryForm />} />
      </Routes>
    </Router>
  );
}

export default App;
