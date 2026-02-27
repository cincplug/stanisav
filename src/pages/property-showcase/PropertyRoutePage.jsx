import { Navigate, useParams } from "react-router-dom";
import linguisticConfig from "../../config/linguisticConfig.json";
import PropertyShowcase from "./PropertyShowcase.jsx";

const PropertyRoutePage = () => {
  const { propertyKey } = useParams();
  const isValidProperty = Boolean(
    propertyKey &&
    linguisticConfig[propertyKey] &&
    linguisticConfig[propertyKey].values,
  );

  if (!isValidProperty) {
    return <Navigate to="/" replace />;
  }

  return <PropertyShowcase propertyKey={propertyKey} />;
};

export default PropertyRoutePage;
