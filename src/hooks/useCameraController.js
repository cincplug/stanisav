import { useEffect, useRef, useMemo, useCallback } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

const GROUP_DISTANCE_MULTIPLIER = 1.2;
const DEFAULT_FOCUS_DISTANCE = 50;

const animateCamera = (cameraSystem, targetPosition, lookAtTarget, config) => {
  const { camera, controls, animationRef } = cameraSystem;
  if (animationRef.current) {
    cancelAnimationFrame(animationRef.current);
  }
  const startPosition = camera.position.clone();
  const startTarget = controls?.target?.clone() || new THREE.Vector3();
  const duration = config.animationDuration;
  const startTime = Date.now();

  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeInOut =
      progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(config.easingPower * progress + 2, 3) / 2;
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

  animate();
};

const calculateCameraPosition = (nodePosition, focusDistance) => {
  const directionFromCenter = nodePosition.clone().normalize();
  return nodePosition
    .clone()
    .add(directionFromCenter.multiplyScalar(focusDistance));
};

export const useCameraController = ({
  cameraFocusRequest,
  languageNodes,
  data,
  cameraControls,
  sceneControls,
  selectedLanguage
}) => {
  const { camera, controls } = useThree();
  const animationRef = useRef(null);
  const lastFocusedRef = useRef(null);
  const initializedViewRef = useRef(false);

  const config = useMemo(
    () => ({
      ...cameraControls,
      ...sceneControls
    }),
    [cameraControls, sceneControls]
  );

  const cameraSystem = useMemo(
    () => ({
      camera,
      controls,
      animationRef
    }),
    [camera, controls]
  );

  const focusOnLanguage = useCallback(
    (languageCode) => {
      const node = languageNodes[languageCode];
      if (!node) {
        return;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      const languagePosition = new THREE.Vector3(node.x, node.y, node.z);
      const focusDistance = config.focusDistance || DEFAULT_FOCUS_DISTANCE;
      const targetCameraPosition = calculateCameraPosition(
        languagePosition,
        focusDistance
      );
      animateCamera(
        cameraSystem,
        targetCameraPosition,
        languagePosition,
        config
      );
    },
    [cameraSystem, languageNodes, config]
  );

  const focusOnGroup = useCallback(
    (groupId) => {
      if (!data?.languageGroups) {
        return;
      }
      const groupLanguages = data.languageCodes.filter(
        (code) => data.languageGroups[code] === groupId
      );
      if (groupLanguages.length === 0) {
        return;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      const box = new THREE.Box3();
      let validLanguages = 0;
      groupLanguages.forEach((code) => {
        const node = languageNodes[code];
        if (node) {
          box.expandByPoint(new THREE.Vector3(node.x, node.y, node.z));
          validLanguages++;
        }
      });
      if (validLanguages === 0) {
        return;
      }
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const distance = maxDim * GROUP_DISTANCE_MULTIPLIER;
      const targetCameraPosition = new THREE.Vector3(0, 0, distance);
      animateCamera(cameraSystem, targetCameraPosition, center, config);
    },
    [cameraSystem, data, languageNodes, config]
  );

  const viewAllLanguages = useCallback(() => {
    const initialCameraPosition = new THREE.Vector3(
      config.positionX,
      config.positionY,
      config.positionZ
    );
    const initialTarget = new THREE.Vector3(0, 0, 0);
    animateCamera(cameraSystem, initialCameraPosition, initialTarget, config);
  }, [cameraSystem, config]);

  useEffect(() => {
    if (
      !initializedViewRef.current &&
      languageNodes &&
      Object.keys(languageNodes).length > 0
    ) {
      initializedViewRef.current = true;
      viewAllLanguages();
    }
  }, [languageNodes, viewAllLanguages]);

  useEffect(() => {
    if (!cameraFocusRequest || !languageNodes) {
      return;
    }
    const { type, target } = cameraFocusRequest;
    switch (type) {
      case "language":
        focusOnLanguage(target);
        break;
      case "group":
        focusOnGroup(target);
        break;
      case "viewAll":
        viewAllLanguages();
        break;
    }
  }, [
    cameraFocusRequest,
    languageNodes,
    data,
    focusOnLanguage,
    focusOnGroup,
    viewAllLanguages,
    selectedLanguage
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
    []
  );
};
