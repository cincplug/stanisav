import { useThree } from "@react-three/fiber";
import { useCallback, useEffect, useRef } from "react";
import { Vector3 } from "three";
import { useConfigContext } from "../contexts/ConfigContext";
import { useEntranceContext } from "../contexts/EntranceContext";
import { useLanguageSelectionContext } from "../contexts/LanguageSelectionContext";
import { useThrottledFrame } from "./useThrottledFrame";

export const useCameraController = ({ languagePositions }) => {
  const { cameraFocusRequest, selectedLanguage } =
    useLanguageSelectionContext();
  const { isStanisavSequenceDone } = useEntranceContext();
  // `size` is react-three-fiber's reactive canvas size (updated whenever its
  // internal ResizeObserver fires). Unlike camera.aspect, it's guaranteed to
  // be current at the moment this hook re-renders, so it's what
  // fitToLanguagePositions should use to compute aspect - see comment on
  // fitToLanguagePositions below.
  const { camera, controls: threeControls, size } = useThree();
  const { config } = useConfigContext();
  const {
    isBlackboard,
    zoomDistance,
    switchDuration,
    fov,
    near,
    far,
    boardMargin,
    sortBy,
    sphereRadius,
    boardTitleGap,
    labelSize,
  } = config;

  useEffect(() => {
    if (!camera) return;

    camera.fov = fov;
    camera.near = near;
    camera.updateProjectionMatrix();
  }, [camera, fov, near]);

  const animationStateRef = useRef(null);

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

    camera.far =
      state.startFar + (state.targetFar - state.startFar) * easeInOut;
    camera.updateProjectionMatrix();

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
      camera.far = state.targetFar;
      camera.updateProjectionMatrix();

      if (threeControls?.target) {
        threeControls.target.copy(state.lookAt);
        threeControls.update();
      }

      animationStateRef.current = null;
    }
  });

  const startCameraAnimation = useCallback(
    (
      targetPosition,
      lookAtTarget,
      duration = switchDuration,
      targetFar = camera.far,
    ) => {
      animationStateRef.current = {
        startPos: camera.position.clone(),
        startTarget: threeControls?.target?.clone() || new Vector3(),
        targetPos: targetPosition,
        lookAt: lookAtTarget,

        startFar: camera.far,
        targetFar,

        startTime: null,
        duration,
      };
    },
    [camera, threeControls, switchDuration],
  );

  const focusOnLanguage = useCallback(
    (languageCode) => {
      const languagePosition = languagePositions[languageCode];
      if (!languagePosition) return;

      const languagePositionVector = new Vector3(
        languagePosition.x,
        languagePosition.y,
        languagePosition.z,
      );
      const targetCameraPosition = calculateCameraPosition(
        languagePositionVector,
        zoomDistance,
        isBlackboard,
      );

      const targetFar = isBlackboard ? far : sphereRadius * 2;

      startCameraAnimation(
        targetCameraPosition,
        languagePositionVector,
        switchDuration,
        targetFar,
      );
    },
    [languagePositions, zoomDistance, isBlackboard, startCameraAnimation],
  );

  const fitToLanguagePositions = useCallback(() => {
    const languagePositionValues = Object.values(languagePositions);
    if (languagePositionValues.length === 0) return;

    let minX = Infinity,
      maxX = -Infinity;
    let minY = Infinity,
      maxY = -Infinity;
    let minZ = Infinity,
      maxZ = -Infinity;

    languagePositionValues.forEach((languagePosition) => {
      if (languagePosition.x < minX) minX = languagePosition.x;
      if (languagePosition.x > maxX) maxX = languagePosition.x;
      if (languagePosition.y < minY) minY = languagePosition.y;
      if (languagePosition.y > maxY) maxY = languagePosition.y;
      if (languagePosition.z < minZ) minZ = languagePosition.z;
      if (languagePosition.z > maxZ) maxZ = languagePosition.z;
    });

    // In board mode the scene title renders above the topmost label (see
    // Labels.jsx: boardTitleGap + labelSize * 2 above it, then the glyphs
    // themselves grow upward another ~labelSize * 2 since the title is
    // bottom-anchored). Without this margin the fit only frames the labels,
    // so an uneven top cluster column can push the title off the top edge
    // while the bottom of the frame sits empty.
    if (isBlackboard) {
      maxY += boardTitleGap + labelSize * 4;
    }

    const center = new Vector3(
      (minX + maxX) / 2,
      (minY + maxY) / 2,
      (minZ + maxZ) / 2,
    );

    const halfW = (maxX - minX) / 2;
    const halfH = (maxY - minY) / 2;

    // Aspect is derived from the live canvas size rather than camera.aspect.
    // camera.aspect is only refreshed by react-three-fiber once its resize
    // observer reports a change, which lags behind CSS-driven size changes
    // (e.g. the side menu sliding open/closed). Reading `size` instead keeps
    // this in sync with the dependency array below, so the fit recomputes
    // again once the canvas has actually settled at its final size.
    const aspect = size.width / size.height;

    const fovRad = (fov * Math.PI) / 180;
    const halfFovV = fovRad / 2;
    const halfFovH = Math.atan(Math.tan(halfFovV) * aspect);

    const distForWidth = halfW / Math.tan(halfFovH);
    const distForHeight = halfH / Math.tan(halfFovV);
    const distance =
      Math.max(distForWidth, distForHeight) * (isBlackboard ? boardMargin : 1);

    const targetCameraPosition = new Vector3(
      center.x,
      center.y,
      center.z + (maxZ - minZ) / 2 + distance,
    );
    startCameraAnimation(targetCameraPosition, center, switchDuration, far);
  }, [
    languagePositions,
    fov,
    size,
    isBlackboard,
    boardMargin,
    boardTitleGap,
    labelSize,
    startCameraAnimation,
  ]);

  // When Stanisav's reveal sequence finishes, fly the camera in to his home
  // position at the same speed his spring animation takes to get there
  useEffect(() => {
    if (!isStanisavSequenceDone) return;
    if (selectedLanguage) return;
    fitToLanguagePositions();
  }, [isStanisavSequenceDone]);

  // Skip this refit while a language is selected/zoomed - otherwise a resize
  // (e.g. the side menu opening or closing) recreates fitToLanguagePositions
  // and pulls the camera back out to the wide "fit everything" shot instead
  // of staying on the selected language.
  useEffect(() => {
    if (selectedLanguage) return;
    fitToLanguagePositions();
  }, [isBlackboard, sortBy, fitToLanguagePositions]);

  // cameraFocusRequest handles fitAll, triggered by stop button and view-all
  useEffect(() => {
    if (!cameraFocusRequest || !languagePositions) return;
    if (cameraFocusRequest.type === "fitAll") {
      fitToLanguagePositions();
    }
  }, [cameraFocusRequest, languagePositions, fitToLanguagePositions]);

  useEffect(() => {
    if (!selectedLanguage || !languagePositions) return;
    focusOnLanguage(selectedLanguage);
  }, [selectedLanguage, languagePositions, focusOnLanguage]);
};

const calculateCameraPosition = (
  languagePosition,
  zoomDistance,
  isBlackboard,
) => {
  if (isBlackboard) {
    return new Vector3(
      languagePosition.x,
      languagePosition.y,
      languagePosition.z + zoomDistance,
    );
  }

  const directionFromCenter = languagePosition.clone().normalize();
  return languagePosition
    .clone()
    .add(directionFromCenter.multiplyScalar(zoomDistance));
};
