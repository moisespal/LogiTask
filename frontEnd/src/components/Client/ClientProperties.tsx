import React, { useState, useEffect } from "react";
import "../../styles/components/ClientProperties.css";
import AddPropertyModal from "../Property/AddPropertyModal";
import { useNavigate } from "react-router-dom";
import { ClientDataID} from "../../types/interfaces";

interface ClientPropertiesProps {
  client: ClientDataID;
  visible: boolean;
  onPropertyModalStateChange?: (isOpen: boolean) => void;
}

const ClientProperties: React.FC<ClientPropertiesProps> = ({
  client,
  visible,
  onPropertyModalStateChange,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (onPropertyModalStateChange) {
      onPropertyModalStateChange(isModalOpen);
    }
  }, [isModalOpen, onPropertyModalStateChange]);

  if (!visible) return null;

  const handleModalState = (isOpen: boolean) => {
    setIsModalOpen(isOpen);
  };

   const handlePropertyClick = (propertyIndex: number) => {

    const property = client.properties[propertyIndex];
    
    navigate(`/property-view/`, {
      state: {
        property: property,
        client: client,
      }
    });
  };

  return (
    <div className="properties-container">
      {client.properties && client.properties.length > 0 ? (
        client.properties.map((property, index: number) => (
          <div
            key={index}
            className="property-item"
            style={{
              animationDelay: `${100 + index * 100}ms`,
            }}
          >
            <button
              onClick={() => handlePropertyClick(index)}
              className="property-button"
            >
              <div className="property-content">
                <div className="property-address">{property.street}</div>
                <div className="property-location">
                  {property.city}, {property.state || "TX"} {property.zipCode}
                </div>
              </div>
            </button>
          </div>
        ))
      ) : (
        <div className="no-properties">No properties found for this client</div>
      )}
      <div
        className="add-property-item"
        onClick={() => handleModalState(true)}
        style={{
          animationDelay: `${100 + (client.properties?.length || 0) * 100}ms`,
        }}
      >
        <div className="add-property-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
            <line x1="12" y1="5" x2="12" y2="9"></line>
            <line x1="10" y1="7" x2="14" y2="7"></line>
          </svg>
        </div>
        <div className="add-property-text">ADD NEW PROPERTY</div>
      </div>

      <AddPropertyModal
        isOpen={isModalOpen}
        onClose={() => handleModalState(false)}
        clientId={client.id}
      />
            
    </div>
  );
};

export default ClientProperties;
