import { Navigate, useParams } from "react-router-dom";
import { isPropertyDescribed } from "../../utils/linguisticUtils";
import PropertyShowcase from "./PropertyShowcase.jsx";

const PropertyRoutePage = () => {
  const { locale, propertyKey } = useParams();
  if (!isPropertyDescribed(propertyKey)) {
    return <Navigate to={`/${locale}`} replace />;
  }
  return <PropertyShowcase propertyKey={propertyKey} />;
};

export default PropertyRoutePage;
