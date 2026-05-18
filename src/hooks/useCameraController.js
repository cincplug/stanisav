import { useEffect, useRef, useCallback } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { useLanguageSelection } from "../contexts/LanguageSelectionContext";
import { useThrottledFrame } from "./useThrottledFrame";
import sceneConfig from "../config/sceneConfig.json";

export const useCameraController = ({
  languageNodes,
  data,
  controls,
  selectedLanguage,
}) => {
  const { cameraFocusRequest } = useLanguageSelection();
  const { camera, controls: threeControls } = useThree();

  // Holds the state for the currently running camera animation.
  // Set to null when no animation is in progress.
  const animationStateRef = useRef(null);

  const lastFocusedRef = useRef(null);
  const initializedViewRef = useRef(false);

  // Drive camera animation inside r3f's render loop instead of a competing
  // rAF loop. This avoids double-animation and syncs with OrbitModifier.
  useThrottledFrame(() => {
    const state = animationStateRef.current;
    if (!state) return;

    if (state.startTime === null) {
      state.startTime = performance.now();
    }

    const elapsed = performance.now() - state.startTime;
    const progress = Math.min(elapsed / state.duration, 1);
    const easeInOut =
      progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

    camera.position.lerpVectors(state.startPos, state.targetPos, easeInOut);

    if (threeControls?.target) {
      threeControls.target.lerpVectors(
        state.startTarget,
        state.lookAt,
        easeInOut,
      );
      threeControls.update();
    }

    if (progress >= 1) {
      camera.position.copy(state.targetPos);
      if (threeControls?.target) {
        threeControls.target.copy(state.lookAt);
        threeControls.update();
      }
      animationStateRef.current = null;
    }
  });

  // Start a new camera animation toward targetPosition, looking at lookAtTarget.
  // Captures current camera position/target as the start of the animation.
  const startCameraAnimation = useCallback(
    (targetPosition, lookAtTarget) => {
      animationStateRef.current = {
        startPos: camera.position.clone(),
        startTarget: threeControls?.target?.clone() || new Vector3(),
        targetPos: targetPosition,
        lookAt: lookAtTarget,
        startTime: null, // set on the first useFrame tick so elapsed starts at 0
        duration: controls.switchDuration,
      };
    },
    [camera, threeControls, controls.switchDuration],
  );

  const focusOnLanguage = useCallback(
    (languageCode) => {
      const node = languageNodes[languageCode];
      if (!node) return;

      const languagePosition = new Vector3(node.x, node.y, node.z);
      const targetCameraPosition = calculateCameraPosition(
        languagePosition,
        controls.zoomDistance,
        controls.isSegmented,
      );
      startCameraAnimation(targetCameraPosition, languagePosition);
    },
    [
      languageNodes,
      controls.zoomDistance,
      controls.isSegmented,
      startCameraAnimation,
    ],
  );

  const setInitialCameraPosition = useCallback(() => {
    const initialCameraPosition = new Vector3(
      controls.cameraX,
      controls.cameraY,
      controls.cameraZ,
    );
    startCameraAnimation(initialCameraPosition, new Vector3(0, 0, 0));
  }, [
    controls.cameraX,
    controls.cameraY,
    controls.cameraZ,
    startCameraAnimation,
  ]);

  const fitToNodes = useCallback(() => {
    const positions = Object.values(languageNodes);
    if (positions.length === 0) return;

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

    const fovRad = (controls.fov * Math.PI) / 180;
    const halfFovV = fovRad / 2;
    const halfFovH = Math.atan(Math.tan(halfFovV) * camera.aspect);

    const distForWidth = halfW / Math.tan(halfFovH);
    const distForHeight = halfH / Math.tan(halfFovV);
    const distance =
      Math.max(distForWidth, distForHeight) * sceneConfig.clustersMargin;

    const targetCameraPosition = new Vector3(
      center.x,
      center.y,
      center.z + (maxZ - minZ) / 2 + distance,
    );
    startCameraAnimation(targetCameraPosition, center);
  }, [languageNodes, controls.fov, camera, startCameraAnimation]);

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
    if (!cameraFocusRequest || !languageNodes) return;

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
    if (!selectedLanguage || !languageNodes) return;
    if (lastFocusedRef.current === selectedLanguage) return;
    lastFocusedRef.current = selectedLanguage;
    focusOnLanguage(selectedLanguage);
  }, [selectedLanguage, languageNodes, focusOnLanguage]);

  return { setInitialCameraPosition, fitToNodes };
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
