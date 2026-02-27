import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useControls } from "../../contexts/ControlsContext";
import linguisticConfig from "../../config/linguisticConfig.json";
import Mesha from "../../components/r3f/Mesha";
import StageLight from "../../components/r3f/StageLight";
import createPropertyPage from "../property-showcase/createPropertyPage.jsx";

const Morphology = createPropertyPage("morphology");

export default Morphology;
