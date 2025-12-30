import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import "./InquiryForm.css";

// Schema data
const schemaData = {
  project_types: [
    {
      key: "WEDDING",
      label: "Wedding Photography",
      category: "EVENT",
      supports_multiple_events: true,
    },
    {
      key: "ELOPEMENT",
      label: "Elopement",
      category: "EVENT",
      supports_multiple_events: false,
    },
    {
      key: "ENGAGEMENT",
      label: "Engagement Session",
      category: "EVENT",
      supports_multiple_events: false,
    },
    {
      key: "FAMILY",
      label: "Family Portrait",
      category: "SESSION",
      supports_multiple_events: false,
    },
    {
      key: "NEWBORN",
      label: "Newborn Session",
      category: "SESSION",
      supports_multiple_events: false,
    },
    {
      key: "BRANDING",
      label: "Branding / Corporate",
      category: "COMMERCIAL",
      supports_multiple_events: true,
    },
  ],
  event_types: [
    { key: "PRE_WEDDING", label: "Sangeet & Cocktail" },
    { key: "HALDI", label: "Haldi Ceremony" },
    { key: "MEHENDI", label: "Mehendi Ceremony" },
    { key: "MAIN_WEDDING", label: "Wedding & Reception" },
    { key: "RECEPTION", label: "Reception" },
    { key: "ENGAGEMENT_EVENT", label: "Engagement Ceremony" },
    { key: "CORPORATE_SHOOT", label: "Corporate Shoot" },
  ],
  services: [
    {
      key: "CANDID_PHOTO",
      label: "Candid Photography",
      category: "Photography",
    },
    {
      key: "TRADITIONAL_PHOTO",
      label: "Traditional Photography",
      category: "Photography",
    },
    {
      key: "CINEMATIC_VIDEO",
      label: "Cinematography",
      category: "Videography",
    },
    {
      key: "TRADITIONAL_VIDEO",
      label: "Traditional Videography",
      category: "Videography",
    },
    { key: "DRONE", label: "Drone Coverage", category: "Add-ons" },
    { key: "LIVE_STREAM", label: "Live Streaming", category: "Add-ons" },
  ],
  // Fallback/Default services if not fetched
  default_services: [
    {
      key: "CANDID_PHOTO",
      label: "Candid Photography",
      category: "Photography",
    },
    {
      key: "TRADITIONAL_PHOTO",
      label: "Traditional Photography",
      category: "Photography",
    },
    {
      key: "CINEMATIC_VIDEO",
      label: "Cinematography",
      category: "Videography",
    },
    {
      key: "TRADITIONAL_VIDEO",
      label: "Traditional Videography",
      category: "Videography",
    },
    { key: "DRONE", label: "Drone Coverage", category: "Add-ons" },
    { key: "LIVE_STREAM", label: "Live Streaming", category: "Add-ons" },
  ],
  location_types: [
    { key: "INDOOR_BANQUET", label: "Indoor Banquet" },
    { key: "OUTDOOR_VENUE", label: "Outdoor Venue" },
    { key: "PRIVATE_HOME", label: "Private Residence" },
    { key: "HOTEL_ROOM", label: "Hotel Room" },
    { key: "VENUE", label: "Venue / Hall" },
    { key: "STUDIO", label: "Studio" },
    { key: "OFFICE", label: "Office" },
  ],
  budget_ranges: [
    { label: "Under 50K", min: 0, max: 50000 },
    { label: "50K – 1L", min: 50000, max: 100000 },
    { label: "1L – 3L", min: 100000, max: 300000 },
    { label: "3L – 5L", min: 300000, max: 500000 },
    { label: "5L+", min: 500000, max: null },
  ],
  contact_roles: ["Groom", "Bride", "Parent", "Planner", "Other"],
  delivery_methods: [
    { key: "ONLINE_GALLERY", label: "Online Gallery" },
    { key: "USB", label: "USB / Hard Drive" },
    { key: "ONLINE_GALLERY_AND_USB", label: "Online Gallery + USB" },
  ],
  video_outputs: [
    {
      key: "INSTAGRAM_REEL",
      label: "Instagram Reel",
      defaultDuration: "1 min",
    },
    { key: "TEASER", label: "Teaser Video", defaultDuration: "3–5 min" },
    {
      key: "FULL_FILM",
      label: "Full-Length Film",
      defaultDuration: "45–60 min",
    },
  ],
};

const generateId = () => Math.random().toString(36).substr(2, 9);

const getQuantityLabel = (service) => {
  if (!service) return "Quantity";
  switch (service.pricing_type) {
    case "HOURLY":
      return "Hours";
    case "DAILY":
      return "Days";
    case "PER_PHOTO": // Assuming this might be added later
      return "Number of Photos";
    case "PER_EVENT":
      return "Quantity"; // Or "Events"
    case "FIXED":
    default:
      return "Quantity";
  }
};

const createEmptyEvent = () => ({
  id: generateId(),
  event_type: "",
  date: "",
  time_start: "",
  time_end: "",
  locations: [
    {
      id: generateId(),
      name: "",
      address: "",
      location_type: "",
      activity: "",
    },
  ],
  services: [{ id: generateId(), service_key: "", quantity: 1, notes: "" }],
});

function InquiryForm() {
  const navigate = useNavigate();
  const { userId, token } = useParams();
  const [searchParams] = useSearchParams();
  const tenantId = searchParams.get("userId") || userId || "";

  // Dynamic Data State
  const [availableServices, setAvailableServices] = useState(
    schemaData.default_services
  );
  const [isLoading, setIsLoading] = useState(!!token); // Only load if token is present
  const [fetchError, setFetchError] = useState(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);

  // Fetch Services if Token is present
  useEffect(() => {
    if (userId && token) {
      const fetchServices = async () => {
        setIsLoading(true);
        try {
          // NOTE: Hardcoded API URL for demo - should be in config/env
          const response = await fetch(
            `http://localhost:3001/public/booking/${userId}/${token}/services`
          );
          const result = await response.json();
          console.log("Raw Response from Backend:", result); // DEBUG LOG
          if (result.success) {
            // Map backend services to frontend schema format
            const mappedServices = result.data.map((s) => ({
              key: s.service_key,
              label: s.service_name,
              category: s.category_name || "Other",
              id: s.id, // Keep ID for submission
              base_price: s.base_price,
              pricing_type: s.pricing_type,
              description: s.description,
              deliverables: s.deliverables,
            }));
            console.log("Mapped Services for Frontend:", mappedServices); // DEBUG LOG
            setAvailableServices(mappedServices);
          } else {
            setFetchError(result.error || "Failed to load services");
          }
        } catch (error) {
          console.error("Error fetching services:", error);
          setFetchError("Network error. Please try again.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchServices();
    }
  }, [userId, token]);

  const [formData, setFormData] = useState({
    // Primary Contact
    primary_name: "",
    primary_email: "",
    primary_phone: "",
    primary_role: "",

    // Secondary Contact
    secondary_name: "",
    secondary_email: "",
    secondary_phone: "",
    secondary_role: "",

    // Project
    project_title: "",
    project_type: "",
    estimated_guest_count: "",
    budget_min: "",
    budget_max: "",
    budget_label: "",

    // Events
    events: [createEmptyEvent()],

    // Deliverables
    delivery_method: "",
    photobook_required: false,
    photobook_copies: 1,
    video_outputs: [],

    // Additional
    additional_notes: "",
  });

  const selectedProjectType = schemaData.project_types.find(
    (p) => p.key === formData.project_type
  );
  const totalSteps = selectedProjectType?.supports_multiple_events ? 5 : 4;

  // Validation functions for each step
  const validateStep1 = () => {
    const stepErrors = {};

    if (!formData.primary_name.trim()) {
      stepErrors.primary_name = "Full name is required";
    }
    if (!formData.primary_email.trim()) {
      stepErrors.primary_email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.primary_email)) {
      stepErrors.primary_email = "Please enter a valid email";
    }
    if (!formData.primary_phone.trim()) {
      stepErrors.primary_phone = "Phone number is required";
    }
    if (!formData.primary_role) {
      stepErrors.primary_role = "Please select a role";
    }

    return stepErrors;
  };

  const validateStep2 = () => {
    const stepErrors = {};

    if (!formData.project_title.trim()) {
      stepErrors.project_title = "Project title is required";
    }
    if (!formData.project_type) {
      stepErrors.project_type = "Please select a project type";
    }
    if (!formData.budget_label) {
      stepErrors.budget_label = "Please select a budget range";
    }

    return stepErrors;
  };

  const validateStep3Events = () => {
    const stepErrors = {};

    formData.events.forEach((event, idx) => {
      if (!event.event_type) {
        stepErrors[`event_${idx}_type`] = `Event ${
          idx + 1
        }: Please select an event type`;
      }
      if (!event.date) {
        stepErrors[`event_${idx}_date`] = `Event ${idx + 1}: Date is required`;
      }

      // Check at least one location has a name
      const hasValidLocation = event.locations.some((loc) => loc.name.trim());
      if (!hasValidLocation) {
        stepErrors[`event_${idx}_location`] = `Event ${
          idx + 1
        }: At least one venue name is required`;
      }

      // Check at least one service is selected
      const hasValidService = event.services.some((svc) => svc.service_key);
      if (!hasValidService) {
        stepErrors[`event_${idx}_service`] = `Event ${
          idx + 1
        }: At least one service is required`;
      }
    });

    return stepErrors;
  };

  const validateStep3or4Deliverables = () => {
    const stepErrors = {};

    if (!formData.delivery_method) {
      stepErrors.delivery_method = "Please select a delivery method";
    }

    return stepErrors;
  };

  const validateCurrentStep = () => {
    let stepErrors = {};

    if (currentStep === 1) {
      stepErrors = validateStep1();
    } else if (currentStep === 2) {
      stepErrors = validateStep2();
    } else if (
      currentStep === 3 &&
      selectedProjectType?.supports_multiple_events
    ) {
      stepErrors = validateStep3Events();
    } else if (
      (currentStep === 3 && !selectedProjectType?.supports_multiple_events) ||
      (currentStep === 4 && selectedProjectType?.supports_multiple_events)
    ) {
      stepErrors = validateStep3or4Deliverables();
    }

    return stepErrors;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleBudgetChange = (range) => {
    setFormData((prev) => ({
      ...prev,
      budget_min: range.min,
      budget_max: range.max,
      budget_label: range.label,
    }));
    // Clear budget error
    if (errors.budget_label) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.budget_label;
        return newErrors;
      });
    }
  };

  const handleVideoOutputToggle = (key) => {
    setFormData((prev) => ({
      ...prev,
      video_outputs: prev.video_outputs.some((v) => v.key === key)
        ? prev.video_outputs.filter((v) => v.key !== key)
        : [
            ...prev.video_outputs,
            {
              key,
              duration:
                schemaData.video_outputs.find((v) => v.key === key)
                  ?.defaultDuration || "",
            },
          ],
    }));
  };

  // Event management
  const addEvent = () => {
    setFormData((prev) => ({
      ...prev,
      events: [...prev.events, createEmptyEvent()],
    }));
  };

  const removeEvent = (eventId) => {
    if (formData.events.length > 1) {
      setFormData((prev) => ({
        ...prev,
        events: prev.events.filter((e) => e.id !== eventId),
      }));
    }
  };

  const updateEvent = (eventId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      events: prev.events.map((e) =>
        e.id === eventId ? { ...e, [field]: value } : e
      ),
    }));
    // Clear related errors
    setErrors((prev) => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach((key) => {
        if (key.includes("event_")) {
          delete newErrors[key];
        }
      });
      return newErrors;
    });
  };

  // Location management within event
  const addLocation = (eventId) => {
    setFormData((prev) => ({
      ...prev,
      events: prev.events.map((e) =>
        e.id === eventId
          ? {
              ...e,
              locations: [
                ...e.locations,
                {
                  id: generateId(),
                  name: "",
                  address: "",
                  location_type: "",
                  activity: "",
                },
              ],
            }
          : e
      ),
    }));
  };

  const removeLocation = (eventId, locationId) => {
    setFormData((prev) => ({
      ...prev,
      events: prev.events.map((e) =>
        e.id === eventId
          ? {
              ...e,
              locations: e.locations.filter((l) => l.id !== locationId),
            }
          : e
      ),
    }));
  };

  const updateLocation = (eventId, locationId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      events: prev.events.map((e) =>
        e.id === eventId
          ? {
              ...e,
              locations: e.locations.map((l) =>
                l.id === locationId ? { ...l, [field]: value } : l
              ),
            }
          : e
      ),
    }));
    // Clear location errors
    setErrors((prev) => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach((key) => {
        if (key.includes("_location")) {
          delete newErrors[key];
        }
      });
      return newErrors;
    });
  };

  // Service management within event
  const addService = (eventId) => {
    setFormData((prev) => ({
      ...prev,
      events: prev.events.map((e) =>
        e.id === eventId
          ? {
              ...e,
              services: [
                ...e.services,
                { id: generateId(), service_key: "", quantity: 1, notes: "" },
              ],
            }
          : e
      ),
    }));
  };

  const removeService = (eventId, serviceId) => {
    setFormData((prev) => ({
      ...prev,
      events: prev.events.map((e) =>
        e.id === eventId
          ? {
              ...e,
              services: e.services.filter((s) => s.id !== serviceId),
            }
          : e
      ),
    }));
  };

  const updateService = (eventId, serviceId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      events: prev.events.map((e) =>
        e.id === eventId
          ? {
              ...e,
              services: e.services.map((s) =>
                s.id === serviceId ? { ...s, [field]: value } : s
              ),
            }
          : e
      ),
    }));
    // Clear service errors
    setErrors((prev) => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach((key) => {
        if (key.includes("_service")) {
          delete newErrors[key];
        }
      });
      return newErrors;
    });
  };

  const nextStep = () => {
    const stepErrors = validateCurrentStep();

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      setShowErrors(true);
      // Scroll to top of form to show errors
      document
        .querySelector(".form-card")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    setErrors({});
    setShowErrors(false);
    if (currentStep < totalSteps) setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setErrors({});
    setShowErrors(false);
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const buildSubmitData = () => {
    const now = new Date().toISOString();
    return {
      inquiry_id: `inq_${generateId()}`,
      tenant_id: tenantId,
      created_at: now,
      status: "NEW",
      stage: "INQUIRY",
      client: {
        primary_contact: {
          name: formData.primary_name,
          email: formData.primary_email,
          phone: formData.primary_phone,
          role: formData.primary_role.toUpperCase(),
        },
        secondary_contact: formData.secondary_name
          ? {
              name: formData.secondary_name,
              email: formData.secondary_email,
              phone: formData.secondary_phone,
              role: formData.secondary_role.toUpperCase(),
            }
          : null,
      },
      project: {
        title: formData.project_title,
        type: {
          key: formData.project_type,
          label: selectedProjectType?.label || "",
        },
        estimated_guest_count: parseInt(formData.estimated_guest_count) || null,
        currency: "INR",
        budget: {
          min: formData.budget_min,
          max: formData.budget_max,
          label: formData.budget_label,
        },
      },
      events: formData.events.map((event, idx) => ({
        event_id: `evt_${String(idx + 1).padStart(3, "0")}`,
        event_type: {
          key: event.event_type,
          label:
            schemaData.event_types.find((e) => e.key === event.event_type)
              ?.label || "",
        },
        date: event.date,
        time: {
          start: event.time_start,
          end: event.time_end,
          timezone: "Asia/Kolkata",
        },
        locations: event.locations.map((loc, locIdx) => ({
          order: locIdx + 1,
          name: loc.name,
          address: loc.address,
          location_type: loc.location_type,
          activity: loc.activity || null,
        })),
        services: event.services
          .filter((s) => s.service_key)
          .map((svc) => ({
            service: {
              key: svc.service_key,
              label:
                availableServices.find((s) => s.key === svc.service_key)
                  ?.label || "",
            },
            quantity: svc.quantity,
            notes: svc.notes || null,
          })),
      })),
      deliverables: {
        delivery_method: formData.delivery_method,
        photo_book: {
          required: formData.photobook_required,
          copies: formData.photobook_copies,
        },
        video_outputs: formData.video_outputs,
      },
      additional_notes: formData.additional_notes,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submitData = buildSubmitData();
    // Use token endpoint if token exists, else fall back to legacy/demo
    const url =
      userId && token
        ? `http://localhost:3001/public/booking/${userId}/${token}/submit`
        : `http://localhost:3001/public/${tenantId}/booking`; // Legacy/Demo

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (response.ok || result.success) {
        setSubmitted(true);
      } else {
        // Handle expiration or specific errors
        if (response.status === 410 || result.error === "Link already used") {
          setFetchError("This booking link has already been used.");
          setSubmitted(true); // Or show specific error state
        } else {
          alert(result.error || "Submission failed");
        }
      }
    } catch (error) {
      console.error("Submission error:", error);
      // Simulate success for demo if api fails and no token (fallback)
      if (!token) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setSubmitted(true);
      } else {
        alert("Network error during submission");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepLabel = (step) => {
    if (selectedProjectType?.supports_multiple_events) {
      return ["Contact", "Project", "Events", "Deliverables", "Review"][
        step - 1
      ];
    }
    return ["Contact", "Project", "Deliverables", "Review"][step - 1];
  };

  if (submitted) {
    return (
      <div className="inquiry-container">
        <div className="success-card">
          <div className="success-icon-ring">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2>Inquiry Submitted</h2>
          <p>
            Thank you for reaching out. We'll review your details and get back
            to you within 24 hours with a custom proposal.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className="inquiry-container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <div
          className="loading-spinner"
          style={{
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #3498db",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            animation: "spin 1s linear infinite",
          }}
        ></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="inquiry-container">
        <div
          className="error-card"
          style={{
            textAlign: "center",
            padding: "40px",
            background: "white",
            borderRadius: "16px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h2 style={{ color: "#ef4444", marginBottom: "16px" }}>
            Link Expired or Invalid
          </h2>
          <p style={{ color: "#64748b", marginBottom: "24px" }}>{fetchError}</p>
          <p style={{ fontSize: "0.9rem", color: "#94a3b8" }}>
            This booking link may have already been used or is past its
            expiration date. Please request a new link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="inquiry-container">
      {/* Header */}
      <header className="inquiry-header">
        <div className="logo">
          <span className="logo-text">HayTham</span>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <span className="hero-badge">Photography Inquiry</span>
        <h1 className="hero-title">Tell us about your shoot</h1>
        <p className="hero-subtitle">
          Share your vision and event details. We'll craft a personalized
          package that fits your needs.
        </p>
      </section>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
        <div className="progress-steps">
          {Array.from({ length: totalSteps }, (_, idx) => (
            <div
              key={idx}
              className={`progress-step ${
                currentStep > idx + 1 ? "completed" : ""
              } ${currentStep === idx + 1 ? "active" : ""}`}
            >
              <span className="step-number">{idx + 1}</span>
              <span className="step-label">{getStepLabel(idx + 1)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="form-card">
        {/* Error Messages */}
        {showErrors && Object.keys(errors).length > 0 && (
          <div className="error-banner">
            <div className="error-banner-header">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>Please complete all required fields</span>
            </div>
            <ul className="error-list">
              {Object.values(errors).map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Step 1: Contact Details */}
        {currentStep === 1 && (
          <div className="form-step">
            <div className="step-header">
              <h2 className="step-title">Contact Information</h2>
              <p className="step-description">
                Who should we reach out to regarding this inquiry?
              </p>
            </div>

            <div className="section-block">
              <h3 className="section-title">Primary Contact</h3>
              <div className="form-grid">
                <div
                  className={`form-group ${
                    errors.primary_name ? "has-error" : ""
                  }`}
                >
                  <label htmlFor="primary_name">
                    Full Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="primary_name"
                    name="primary_name"
                    value={formData.primary_name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                  />
                  {errors.primary_name && (
                    <span className="field-error">{errors.primary_name}</span>
                  )}
                </div>

                <div
                  className={`form-group ${
                    errors.primary_role ? "has-error" : ""
                  }`}
                >
                  <label htmlFor="primary_role">
                    Role <span className="required">*</span>
                  </label>
                  <select
                    id="primary_role"
                    name="primary_role"
                    value={formData.primary_role}
                    onChange={handleInputChange}
                  >
                    <option value="">Select role</option>
                    {schemaData.contact_roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  {errors.primary_role && (
                    <span className="field-error">{errors.primary_role}</span>
                  )}
                </div>

                <div
                  className={`form-group ${
                    errors.primary_email ? "has-error" : ""
                  }`}
                >
                  <label htmlFor="primary_email">
                    Email Address <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    id="primary_email"
                    name="primary_email"
                    value={formData.primary_email}
                    onChange={handleInputChange}
                    placeholder="email@example.com"
                  />
                  {errors.primary_email && (
                    <span className="field-error">{errors.primary_email}</span>
                  )}
                </div>

                <div
                  className={`form-group ${
                    errors.primary_phone ? "has-error" : ""
                  }`}
                >
                  <label htmlFor="primary_phone">
                    Phone Number <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    id="primary_phone"
                    name="primary_phone"
                    value={formData.primary_phone}
                    onChange={handleInputChange}
                    placeholder="+91 98765 43210"
                  />
                  {errors.primary_phone && (
                    <span className="field-error">{errors.primary_phone}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="section-block">
              <h3 className="section-title">
                Secondary Contact <span className="optional-tag">Optional</span>
              </h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="secondary_name">Full Name</label>
                  <input
                    type="text"
                    id="secondary_name"
                    name="secondary_name"
                    value={formData.secondary_name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="secondary_role">Role</label>
                  <select
                    id="secondary_role"
                    name="secondary_role"
                    value={formData.secondary_role}
                    onChange={handleInputChange}
                  >
                    <option value="">Select role</option>
                    {schemaData.contact_roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="secondary_email">Email Address</label>
                  <input
                    type="email"
                    id="secondary_email"
                    name="secondary_email"
                    value={formData.secondary_email}
                    onChange={handleInputChange}
                    placeholder="email@example.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="secondary_phone">Phone Number</label>
                  <input
                    type="tel"
                    id="secondary_phone"
                    name="secondary_phone"
                    value={formData.secondary_phone}
                    onChange={handleInputChange}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Project Details */}
        {currentStep === 2 && (
          <div className="form-step">
            <div className="step-header">
              <h2 className="step-title">Project Details</h2>
              <p className="step-description">
                Tell us about your photography project
              </p>
            </div>

            <div
              className="form-group full-width"
              style={{ marginBottom: "1.5rem" }}
            >
              <label htmlFor="project_title">Project Title</label>
              <input
                type="text"
                id="project_title"
                name="project_title"
                value={formData.project_title}
                onChange={handleInputChange}
                placeholder="e.g., Verma–Sharma Wedding"
                required
              />
            </div>

            <div className="section-block">
              <h3 className="section-title">Project Type</h3>
              <div className="project-types-grid">
                {schemaData.project_types.map((project) => (
                  <div
                    key={project.key}
                    className={`project-type-card ${
                      formData.project_type === project.key ? "selected" : ""
                    }`}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        project_type: project.key,
                      }))
                    }
                  >
                    <span className="project-label">{project.label}</span>
                    <span className="project-category">{project.category}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="section-block">
              <h3 className="section-title">Budget Range</h3>
              <div className="budget-grid">
                {schemaData.budget_ranges.map((range) => (
                  <label
                    key={range.label}
                    className={`budget-card ${
                      formData.budget_label === range.label ? "selected" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="budgetRange"
                      checked={formData.budget_label === range.label}
                      onChange={() => handleBudgetChange(range)}
                    />
                    <span className="budget-label">{range.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div
              className="form-group"
              style={{ marginTop: "1.5rem", maxWidth: "300px" }}
            >
              <label htmlFor="estimated_guest_count">
                Estimated Guest Count
              </label>
              <input
                type="number"
                id="estimated_guest_count"
                name="estimated_guest_count"
                value={formData.estimated_guest_count}
                onChange={handleInputChange}
                placeholder="e.g., 500"
                min="1"
              />
            </div>
          </div>
        )}

        {/* Step 3: Events (only for multi-event projects) */}
        {currentStep === 3 && selectedProjectType?.supports_multiple_events && (
          <div className="form-step">
            <div className="step-header">
              <h2 className="step-title">Event Details</h2>
              <p className="step-description">
                Add each event with its locations and services
              </p>
            </div>

            <div className="events-list">
              {formData.events.map((event, eventIndex) => (
                <div key={event.id} className="event-block">
                  <div className="event-header">
                    <span className="event-number">Event {eventIndex + 1}</span>
                    {formData.events.length > 1 && (
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => removeEvent(event.id)}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Event Type</label>
                      <select
                        value={event.event_type}
                        onChange={(e) =>
                          updateEvent(event.id, "event_type", e.target.value)
                        }
                        required
                      >
                        <option value="">Select event type</option>
                        {schemaData.event_types.map((type) => (
                          <option key={type.key} value={type.key}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Date</label>
                      <input
                        type="date"
                        value={event.date}
                        onChange={(e) =>
                          updateEvent(event.id, "date", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Start Time</label>
                      <input
                        type="time"
                        value={event.time_start}
                        onChange={(e) =>
                          updateEvent(event.id, "time_start", e.target.value)
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>End Time</label>
                      <input
                        type="time"
                        value={event.time_end}
                        onChange={(e) =>
                          updateEvent(event.id, "time_end", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  {/* Locations */}
                  <div className="nested-section">
                    <div className="nested-header">
                      <h4>Locations</h4>
                      <button
                        type="button"
                        className="btn-add-small"
                        onClick={() => addLocation(event.id)}
                      >
                        + Add Location
                      </button>
                    </div>

                    {event.locations.map((location, locIndex) => (
                      <div key={location.id} className="nested-item">
                        <div className="nested-item-header">
                          <span className="nested-item-number">
                            Location {locIndex + 1}
                          </span>
                          {event.locations.length > 1 && (
                            <button
                              type="button"
                              className="btn-remove-small"
                              onClick={() =>
                                removeLocation(event.id, location.id)
                              }
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="form-grid">
                          <div className="form-group">
                            <label>Venue Name</label>
                            <input
                              type="text"
                              value={location.name}
                              onChange={(e) =>
                                updateLocation(
                                  event.id,
                                  location.id,
                                  "name",
                                  e.target.value
                                )
                              }
                              placeholder="e.g., The Oberoi Grand"
                            />
                          </div>
                          <div className="form-group">
                            <label>Location Type</label>
                            <select
                              value={location.location_type}
                              onChange={(e) =>
                                updateLocation(
                                  event.id,
                                  location.id,
                                  "location_type",
                                  e.target.value
                                )
                              }
                            >
                              <option value="">Select type</option>
                              {schemaData.location_types.map((type) => (
                                <option key={type.key} value={type.key}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Activity</label>
                            <input
                              type="text"
                              value={location.activity}
                              onChange={(e) =>
                                updateLocation(
                                  event.id,
                                  location.id,
                                  "activity",
                                  e.target.value
                                )
                              }
                              placeholder="e.g., Getting Ready, Ceremony"
                            />
                          </div>
                          <div className="form-group">
                            <label>Address</label>
                            <input
                              type="text"
                              value={location.address}
                              onChange={(e) =>
                                updateLocation(
                                  event.id,
                                  location.id,
                                  "address",
                                  e.target.value
                                )
                              }
                              placeholder="Full address"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Services */}
                  <div className="nested-section">
                    <div className="nested-header">
                      <h4>Services Required</h4>
                      <button
                        type="button"
                        className="btn-add-small"
                        onClick={() => addService(event.id)}
                      >
                        + Add Service
                      </button>
                    </div>

                    {event.services.map((service, svcIndex) => (
                      <div key={service.id} className="nested-item">
                        <div className="nested-item-header">
                          <span className="nested-item-number">
                            Service {svcIndex + 1}
                          </span>
                          {event.services.length > 1 && (
                            <button
                              type="button"
                              className="btn-remove-small"
                              onClick={() =>
                                removeService(event.id, service.id)
                              }
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="form-grid form-grid-3">
                          <div className="form-group">
                            <label>Service</label>
                            <select
                              value={service.service_key}
                              onChange={(e) =>
                                updateService(
                                  event.id,
                                  service.id,
                                  "service_key",
                                  e.target.value
                                )
                              }
                            >
                              <option value="">Select service</option>
                              {availableServices.map((svc) => (
                                <option key={svc.key} value={svc.key}>
                                  {svc.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {service.service_key &&
                            ["HOURLY", "PER_PHOTO", "PER_EVENT"].includes(
                              availableServices.find(
                                (s) => s.key === service.service_key
                              )?.pricing_type
                            ) && (
                              <div className="form-group">
                                <label>
                                  {getQuantityLabel(
                                    availableServices.find(
                                      (s) => s.key === service.service_key
                                    )
                                  )}
                                </label>
                                <input
                                  type="number"
                                  value={service.quantity}
                                  onChange={(e) =>
                                    updateService(
                                      event.id,
                                      service.id,
                                      "quantity",
                                      parseInt(e.target.value) || 1
                                    )
                                  }
                                  min="1"
                                  max="1000"
                                />
                              </div>
                            )}
                          <div className="form-group">
                            <label>Notes</label>
                            <input
                              type="text"
                              value={service.notes}
                              onChange={(e) =>
                                updateService(
                                  event.id,
                                  service.id,
                                  "notes",
                                  e.target.value
                                )
                              }
                              placeholder="Special instructions"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button type="button" className="btn-add-event" onClick={addEvent}>
              + Add Another Event
            </button>
            <div style={{ marginTop: 20, fontSize: 12, color: "#888" }}>
              Debug: Found {availableServices.length} services. First:{" "}
              {availableServices[0]?.label || "None"}
            </div>
          </div>
        )}

        {/* Step: Deliverables */}
        {((selectedProjectType?.supports_multiple_events &&
          currentStep === 4) ||
          (!selectedProjectType?.supports_multiple_events &&
            currentStep === 3)) && (
          <div className="form-step">
            <div className="step-header">
              <h2 className="step-title">Deliverables</h2>
              <p className="step-description">
                How would you like to receive your final content?
              </p>
            </div>

            <div className="section-block">
              <h3 className="section-title">Delivery Method</h3>
              <div className="delivery-grid">
                {schemaData.delivery_methods.map((method) => (
                  <label
                    key={method.key}
                    className={`delivery-card ${
                      formData.delivery_method === method.key ? "selected" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="delivery_method"
                      value={method.key}
                      checked={formData.delivery_method === method.key}
                      onChange={handleInputChange}
                    />
                    <span className="delivery-label">{method.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="section-block">
              <h3 className="section-title">Photo Book</h3>
              <div className="photobook-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="photobook_required"
                    checked={formData.photobook_required}
                    onChange={handleInputChange}
                  />
                  <span>I would like a printed photo book</span>
                </label>

                {formData.photobook_required && (
                  <div
                    className="form-group"
                    style={{ maxWidth: "200px", marginTop: "1rem" }}
                  >
                    <label htmlFor="photobook_copies">Number of Copies</label>
                    <input
                      type="number"
                      id="photobook_copies"
                      name="photobook_copies"
                      value={formData.photobook_copies}
                      onChange={handleInputChange}
                      min="1"
                      max="10"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="section-block">
              <h3 className="section-title">Video Outputs</h3>
              <div className="video-outputs-grid">
                {schemaData.video_outputs.map((output) => (
                  <label
                    key={output.key}
                    className={`video-output-card ${
                      formData.video_outputs.some((v) => v.key === output.key)
                        ? "selected"
                        : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.video_outputs.some(
                        (v) => v.key === output.key
                      )}
                      onChange={() => handleVideoOutputToggle(output.key)}
                    />
                    <div className="video-output-content">
                      <span className="video-output-label">{output.label}</span>
                      <span className="video-output-duration">
                        {output.defaultDuration}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div
              className="form-group full-width"
              style={{ marginTop: "1.5rem" }}
            >
              <label htmlFor="additional_notes">Additional Notes</label>
              <textarea
                id="additional_notes"
                name="additional_notes"
                value={formData.additional_notes}
                onChange={handleInputChange}
                placeholder="Any specific requirements, style preferences, or questions..."
                rows={4}
              />
            </div>
          </div>
        )}

        {/* Step: Review */}
        {currentStep === totalSteps && (
          <div className="form-step">
            <div className="step-header">
              <h2 className="step-title">Review & Submit</h2>
              <p className="step-description">
                Please review your information before submitting
              </p>
            </div>

            <div className="review-sections">
              <div className="review-section">
                <h3>Contact Information</h3>
                <div className="review-grid">
                  <div className="review-item">
                    <span className="review-label">Primary Contact</span>
                    <span className="review-value">
                      {formData.primary_name} ({formData.primary_role})
                    </span>
                    <span className="review-subvalue">
                      {formData.primary_email} · {formData.primary_phone}
                    </span>
                  </div>
                  {formData.secondary_name && (
                    <div className="review-item">
                      <span className="review-label">Secondary Contact</span>
                      <span className="review-value">
                        {formData.secondary_name} ({formData.secondary_role})
                      </span>
                      <span className="review-subvalue">
                        {formData.secondary_email} · {formData.secondary_phone}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="review-section">
                <h3>Project</h3>
                <div className="review-grid">
                  <div className="review-item">
                    <span className="review-label">Title</span>
                    <span className="review-value">
                      {formData.project_title}
                    </span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">Type</span>
                    <span className="review-value">
                      {selectedProjectType?.label}
                    </span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">Budget</span>
                    <span className="review-value">
                      {formData.budget_label || "Not specified"}
                    </span>
                  </div>
                  {formData.estimated_guest_count && (
                    <div className="review-item">
                      <span className="review-label">Guests</span>
                      <span className="review-value">
                        {formData.estimated_guest_count}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {selectedProjectType?.supports_multiple_events && (
                <div className="review-section">
                  <h3>Events ({formData.events.length})</h3>
                  <div className="review-events">
                    {formData.events.map((event, idx) => (
                      <div key={event.id} className="review-event-item">
                        <span className="review-event-title">
                          {schemaData.event_types.find(
                            (e) => e.key === event.event_type
                          )?.label || "Unnamed Event"}
                        </span>
                        <span className="review-event-date">{event.date}</span>
                        <span className="review-event-details">
                          {event.locations.filter((l) => l.name).length}{" "}
                          location(s),{" "}
                          {event.services.filter((s) => s.service_key).length}{" "}
                          service(s)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="review-section">
                <h3>Deliverables</h3>
                <div className="review-grid">
                  <div className="review-item">
                    <span className="review-label">Delivery Method</span>
                    <span className="review-value">
                      {schemaData.delivery_methods.find(
                        (d) => d.key === formData.delivery_method
                      )?.label || "Not specified"}
                    </span>
                  </div>
                  {formData.photobook_required && (
                    <div className="review-item">
                      <span className="review-label">Photo Book</span>
                      <span className="review-value">
                        {formData.photobook_copies} copies
                      </span>
                    </div>
                  )}
                  {formData.video_outputs.length > 0 && (
                    <div className="review-item">
                      <span className="review-label">Video Outputs</span>
                      <span className="review-value">
                        {formData.video_outputs
                          .map(
                            (v) =>
                              schemaData.video_outputs.find(
                                (vo) => vo.key === v.key
                              )?.label
                          )
                          .join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="form-navigation">
          {currentStep > 1 && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={prevStep}
            >
              Back
            </button>
          )}

          <div className="nav-spacer"></div>

          {currentStep < totalSteps ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={nextStep}
            >
              Continue
            </button>
          ) : (
            <button
              type="submit"
              className="btn btn-primary btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Submitting...
                </>
              ) : (
                "Submit Inquiry"
              )}
            </button>
          )}
        </div>
      </form>

      {/* Footer */}
      <footer className="inquiry-footer">
        {/* <p>
          Questions? Reach out at{" "}
          <a href="mailto:hello@haytham.com">hello@haytham.com</a>
        </p> */}
      </footer>
    </div>
  );
}

export default InquiryForm;
