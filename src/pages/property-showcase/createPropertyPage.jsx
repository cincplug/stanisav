import PropertyShowcase from "./PropertyShowcase.jsx";

const createPropertyPage = (propertyKey) => {
  const PropertyPage = () => <PropertyShowcase propertyKey={propertyKey} />;
  return PropertyPage;
};

export default createPropertyPage;