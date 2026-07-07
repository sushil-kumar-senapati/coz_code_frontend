import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import {
  UserCircle,
  Phone,
  MapPin,
  Buildings,
  SignOut,
} from "@phosphor-icons/react";
import { motion } from "framer-motion";

export default function Profile() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const fields = [
    { label: "Name", value: user.name || "—", icon: <UserCircle size={16} /> },
    { label: "Phone", value: user.phone, icon: <Phone size={16} /> },
    {
      label: "PIN Code",
      value: user.home_pin_code,
      icon: <MapPin size={16} />,
    },
    { label: "City", value: user.home_city || "—", icon: <MapPin size={16} /> },
    {
      label: "District",
      value: user.home_district || "—",
      icon: <MapPin size={16} />,
    },
    {
      label: "State",
      value: user.home_state || "—",
      icon: <MapPin size={16} />,
    },
    {
      label: "Constituency",
      value: user.home_constituency || "—",
      icon: <Buildings size={16} />,
    },
    {
      label: "Role",
      value: user.role === "mp" ? "Member of Parliament" : "Citizen",
      icon: <UserCircle size={16} />,
    },
    {
      label: "Total Submissions",
      value: user.total_submissions ?? 0,
      icon: null,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: 540, margin: "0 auto" }}
    >
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Your account information</p>
      </div>

      <div className="card" style={{ padding: "24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 24,
            paddingBottom: 20,
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <UserCircle size={36} weight="fill" color="white" />
          </div>
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: "1.1rem",
                color: "var(--text-primary)",
              }}
            >
              {user.name || user.phone}
            </div>
            <div
              style={{
                fontSize: "0.85rem",
                color: "var(--text-muted)",
                marginTop: 2,
              }}
            >
              {user.role === "mp" ? "Member of Parliament" : "Citizen"} ·{" "}
              {user.home_constituency || user.home_state || ""}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {fields.map(({ label, value, icon }) => (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 0",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <span
                style={{
                  fontSize: "0.88rem",
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {icon}
                {label}
              </span>
              <span
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  color: "var(--text-primary)",
                }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button
            className="btn btn-secondary"
            style={{ flex: 1 }}
            onClick={() =>
              navigate(user.role === "mp" ? "/mp-dashboard" : "/dashboard")
            }
          >
            Dashboard
          </button>
          <button
            className="btn btn-danger"
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
            onClick={handleLogout}
          >
            <SignOut size={16} /> Logout
          </button>
        </div>
      </div>
    </motion.div>
  );
}
