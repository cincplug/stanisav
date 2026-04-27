import { useEffect, useRef, useMemo, useCallback } from "react";
import { useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { useLanguageSelection } from "../contexts/LanguageSelectionContext";
import sceneConfig from "../config/sceneConfig.json";

export const useCameraController = ({
  languageNodes,
  data,
  controls,
  selectedLanguage,
}) => {
  const { cameraFocusRequest } = useLanguageSelection();
  const { camera, controls: threeControls } = useThree();
  const animationRef = useRef(null);
  const lastFocusedRef = useRef(null);
  const initializedViewRef = useRef(false);

  const config = useMemo(
    () => ({
      ...controls,
    }),
    [controls],
  );

  const cameraSystem = useMemo(
    () => ({
      camera,
      controls: threeControls,
      animationRef,
    }),
    [camera, threeControls],
  );

  const focusOnLanguage = useCallback(
    (languageCode) => {
      const node = languageNodes[languageCode];
      const { isSegmented } = controls;
      if (!node) {
        return;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      const languagePosition = new Vector3(node.x, node.y, node.z);
      const zoomDistance = config.zoomDistance;
      const targetCameraPosition = calculateCameraPosition(
        languagePosition,
        zoomDistance,
        isSegmented,
      );
      animateCamera(
        cameraSystem,
        targetCameraPosition,
        languagePosition,
        config,
      );
    },
    [cameraSystem, languageNodes, config],
  );

  const setInitialCameraPosition = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    const initialCameraPosition = new Vector3(
      config.cameraX,
      config.cameraY,
      config.cameraZ,
    );
    const initialTarget = new Vector3(0, 0, 0);
    animateCamera(cameraSystem, initialCameraPosition, initialTarget, config);
  }, [cameraSystem, config]);

  const fitToNodes = useCallback(() => {
    const positions = Object.values(languageNodes);
    if (positions.length === 0) return;

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    let minX = Infinity,
      maxX = -Infinity;
    let minY = Infinity,
      maxY = -Infinity;
    let minZ = Infinity,
      maxZ = -Infinity;
    positions.forEach((p) => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
      if (p.z < minZ) minZ = p.z;
      if (p.z > maxZ) maxZ = p.z;
    });

    const center = new Vector3(
      (minX + maxX) / 2,
      (minY + maxY) / 2,
      (minZ + maxZ) / 2,
    );

    const halfW = (maxX - minX) / 2;
    const halfH = (maxY - minY) / 2;

    const aspect = camera.aspect;
    const fovRad = (config.fov * Math.PI) / 180;
    const halfFovV = fovRad / 2;
    const halfFovH = Math.atan(Math.tan(halfFovV) * aspect);

    const distForWidth = halfW / Math.tan(halfFovH);
    const distForHeight = halfH / Math.tan(halfFovV);
    const distance =
      Math.max(distForWidth, distForHeight) * sceneConfig.clustersMargin;

    const targetCameraPosition = new Vector3(
      center.x,
      center.y,
      center.z + (maxZ - minZ) / 2 + distance,
    );
    animateCamera(cameraSystem, targetCameraPosition, center, config);
  }, [cameraSystem, languageNodes, config, camera]);

  // On first load use the configured initial position; on subsequent layout
  // changes fit everything in view (unless a language is focused)
  useEffect(() => {
    if (!languageNodes || Object.keys(languageNodes).length === 0) return;

    if (!initializedViewRef.current) {
      initializedViewRef.current = true;
      setInitialCameraPosition();
      return;
    }

    if (!selectedLanguage) {
      fitToNodes();
    }
  }, [languageNodes]);

  useEffect(() => {
    if (!cameraFocusRequest || !languageNodes) {
      return;
    }
    const { type, target } = cameraFocusRequest;
    switch (type) {
      case "language":
        focusOnLanguage(target);
        break;
      case "fitAll":
        fitToNodes();
        break;
      case "viewAll":
        setInitialCameraPosition();
        break;
    }
  }, [
    cameraFocusRequest,
    languageNodes,
    data,
    focusOnLanguage,
    setInitialCameraPosition,
    fitToNodes,
    selectedLanguage,
  ]);

  useEffect(() => {
    if (!selectedLanguage || !languageNodes) {
      return;
    }
    if (lastFocusedRef.current === selectedLanguage) {
      return;
    }
    lastFocusedRef.current = selectedLanguage;
    focusOnLanguage(selectedLanguage);
  }, [selectedLanguage, languageNodes, focusOnLanguage]);

  useEffect(
    () => () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    },
    [],
  );

  return { setInitialCameraPosition, fitToNodes };
};

const animateCamera = (cameraSystem, targetPosition, lookAtTarget, config) => {
  const { camera, controls, animationRef } = cameraSystem;

  const startPosition = camera.position.clone();
  const startTarget = controls?.target?.clone() || new Vector3();
  const duration = config.switchDuration;
  const startTime = Date.now();

  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeInOut =
      progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

    camera.position.lerpVectors(startPosition, targetPosition, easeInOut);

    if (controls && controls.target) {
      controls.target.lerpVectors(startTarget, lookAtTarget, easeInOut);
      controls.update();
    }

    if (progress < 1) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      camera.position.copy(targetPosition);
      if (controls && controls.target) {
        controls.target.copy(lookAtTarget);
        controls.update();
      }
      animationRef.current = null;
    }
  };

  animationRef.current = requestAnimationFrame(animate);
};

const calculateCameraPosition = (nodePosition, zoomDistance, isSegmented) => {
  if (isSegmented) {
    return new Vector3(
      nodePosition.x,
      nodePosition.y,
      nodePosition.z + zoomDistance * 2,
    );
  }

  const directionFromCenter = nodePosition.clone().normalize();
  return nodePosition
    .clone()
    .add(directionFromCenter.multiplyScalar(zoomDistance));
};
