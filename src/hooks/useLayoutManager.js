import { useState, useEffect, useMemo } from "react";
import { LayoutEngine } from "../modules/layoutEngine.js";

export const useLayoutManager = (data, controls, onNodesReady) => {
  const [positions, setPositions] = useState({});

  useEffect(() => {
    if (!data) {
      return;
    }

    const calculateLayout = async () => {
      try {
        const layoutEngine = new LayoutEngine();
        const calculatedPositions = await layoutEngine.calculateLayout(
          data,
          controls
        );
        setPositions(calculatedPositions);
      } catch (error) {
        console.error("Layout calculation failed:", error);
      }
    };

    calculateLayout();
  }, [data, controls]);

  useEffect(() => {
    if (!data || Object.keys(positions).length === 0) {
      return;
    }

    const languageNodes = {};
    Object.entries(positions).forEach(([code, pos]) => {
      const position =
        pos.x !== undefined ? pos : { x: pos[0], y: pos[1], z: pos[2] };
      languageNodes[code] = {
        x: position.x,
        y: position.y,
        z: position.z,
        name: data.languageData[code] || code,
        group: data.languageGroups[code]
      };
    });
    onNodesReady(languageNodes);
  }, [data, positions, onNodesReady]);

  const formattedPositions = useMemo(() => {
    const scaledPositions = positions;

    const formatted = {};
    Object.entries(scaledPositions).forEach(([code, pos]) => {
      if (pos.x !== undefined) {
        formatted[code] = { x: pos.x, y: pos.y, z: pos.z };
      } else if (Array.isArray(pos)) {
        formatted[code] = { x: pos[0], y: pos[1], z: pos[2] };
      } else {
        formatted[code] = pos;
      }
    });
    return formatted;
  }, [positions]);

  return {
    positions,
    formattedPositions
  };
};
