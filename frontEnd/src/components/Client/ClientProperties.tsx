import React, { useState } from "react";
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

  if (!visible) return null;

  const handleModalState = (isOpen: boolean) => {
    setIsModalOpen(isOpen);
    if (isOpen && onPropertyModalStateChange) {
      onPropertyModalStateChange(true);
    }
    else {
      onPropertyModalStateChange?.(false);
    }
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
        <div className="fa-solid fa-house"></div>
        </div>
        <div className="add-property-text">Add New Property</div>
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
