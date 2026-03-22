import { createContext } from "react";

// Context to signal if a Mesha part is being interacted with (clicked/tapped)
const MeshaInteractionContext = createContext(false);

export default MeshaInteractionContext;
