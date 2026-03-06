import { Navigate, useParams } from "react-router-dom";
import linguisticConfig from "../../config/linguisticConfig.json";
import PropertyShowcase from "./PropertyShowcase.jsx";

const PropertyRoutePage = () => {
  const { locale, propertyKey } = useParams();
  const isValidProperty = Boolean(
    propertyKey &&
    linguisticConfig[propertyKey] &&
    linguisticConfig[propertyKey].values,
  );

  if (!isValidProperty) {
    return <Navigate to={`/${locale}`} replace />;
  }

  return <PropertyShowcase propertyKey={propertyKey} />;
};

export default PropertyRoutePage;
