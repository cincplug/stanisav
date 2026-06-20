import { useThree } from "@react-three/fiber";
import { useCallback, useEffect, useRef } from "react";
import { Vector3 } from "three";
import { useControlsContext } from "../contexts/ControlsContext";
import { useLanguageSelectionContext } from "../contexts/LanguageSelectionContext";
import { config } from "../modules/configStore";
import { useThrottledFrame } from "./useThrottledFrame";

export const useCameraController = ({ languageNodes, selectedLanguage }) => {
  const { cameraFocusRequest } = useLanguageSelectionContext();
  const { camera, controls: threeControls } = useThree();
  const { controls } = useControlsContext();
  const { zoomDistance, switchDuration, isSegmented } = controls;
  const { fov, near, far } = config.camera;

  useEffect(() => {
    if (!camera) return;
    camera.fov = fov;
    camera.near = near;
    camera.far = far;
    camera.updateProjectionMatrix();
  }, [camera]);

  const animationStateRef = useRef(null);
  const initializedViewRef = useRef(false);

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

  const startCameraAnimation = useCallback(
    (targetPosition, lookAtTarget) => {
      animationStateRef.current = {
        startPos: camera.position.clone(),
        startTarget: threeControls?.target?.clone() || new Vector3(),
        targetPos: targetPosition,
        lookAt: lookAtTarget,
        startTime: null,
        duration: switchDuration,
      };
    },
    [camera, threeControls, switchDuration],
  );

  const focusOnLanguage = useCallback(
    (languageCode) => {
      const node = languageNodes[languageCode];
      if (!node) return;

      const languagePosition = new Vector3(node.x, node.y, node.z);
      const targetCameraPosition = calculateCameraPosition(
        languagePosition,
        zoomDistance,
        isSegmented,
      );
      startCameraAnimation(targetCameraPosition, languagePosition);
    },
    [languageNodes, zoomDistance, isSegmented, startCameraAnimation],
  );

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

    const fovRad = (fov * Math.PI) / 180;
    const halfFovV = fovRad / 2;
    const halfFovH = Math.atan(Math.tan(halfFovV) * camera.aspect);

    const distForWidth = halfW / Math.tan(halfFovH);
    const distForHeight = halfH / Math.tan(halfFovV);
    const distance = Math.max(distForWidth, distForHeight);

    const targetCameraPosition = new Vector3(
      center.x,
      center.y,
      center.z + (maxZ - minZ) / 2 + distance,
    );
    startCameraAnimation(targetCameraPosition, center);
  }, [languageNodes, fov, camera, startCameraAnimation]);

  // On first load and on layout changes, fit all nodes in view
  // unless a language is already selected (which drives its own zoom below)
  useEffect(() => {
    if (!languageNodes || Object.keys(languageNodes).length === 0) return;

    if (!initializedViewRef.current) {
      initializedViewRef.current = true;
    }

    if (!selectedLanguage) {
      fitToNodes();
    }
  }, [languageNodes, selectedLanguage, fitToNodes]);

  // cameraFocusRequest handles only the "fitAll" case —
  // language zoom is driven by selectedLanguage below
  useEffect(() => {
    if (!cameraFocusRequest || !languageNodes) return;
    if (cameraFocusRequest.type === "fitAll") {
      fitToNodes();
    }
  }, [cameraFocusRequest, languageNodes, fitToNodes]);

  useEffect(() => {
    if (!selectedLanguage || !languageNodes) return;
    focusOnLanguage(selectedLanguage);
  }, [selectedLanguage, languageNodes, focusOnLanguage]);
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
