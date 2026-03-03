import { Vector3 } from "three";
import { sortLanguages } from "../utils/sortingUtils";

class LayoutEngine {
  constructor() {
    this.algorithms = {
      "multilevel-layout": this.multilevelLayout.bind(this),
    };
    this.currentAlgorithm = "multilevel-layout";
  }

  calculateLayout(data, controls = {}, algorithm = null) {
    const algo = algorithm || this.currentAlgorithm;
    if (!this.algorithms[algo]) {
      console.warn(
        `Unknown algorithm: ${algo}, falling back to multilevel-layout`,
      );
      return this.algorithms["multilevel-layout"](data, controls);
    }
    return this.algorithms[algo](data, controls);
  }

  multilevelLayout(data, controls = {}) {
    const { languageData, languageLineages, speakerData, typologicalFeatures } =
      data;
    const allLanguages = Object.keys(languageData);

    const { sortBy, sphereRadius, labelContent, isReverse } = controls;

    const sortedLanguages = sortLanguages({
      allLanguages,
      languageData,
      languageLineages,
      speakerData,
      typologicalFeatures,
      sortBy,
      labelContent,
      isReverse,
    });

    const numPoints = sortedLanguages.length;
    const fibonacciPoints = this.generateFibonacciSphere(
      numPoints,
      sphereRadius,
    );
    const orderedPoints = this.reorderBySpatialProximity(fibonacciPoints);

    const positions = {};
    sortedLanguages.forEach((languageCode, i) => {
      positions[languageCode] = orderedPoints[i];
    });

    // Return both positions and the sorted order
    return {
      positions,
      sortedLanguages,
    };
  }

  generateFibonacciSphere(numPoints, radius) {
    const points = [];
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    const angleIncrement = Math.PI * 2 * goldenRatio;

    for (let i = 0; i < numPoints; i++) {
      const t = i / numPoints;
      const inclination = Math.acos(1 - 2 * t);
      const azimuth = angleIncrement * i;

      const x = radius * Math.sin(inclination) * Math.cos(azimuth);
      const y = radius * Math.sin(inclination) * Math.sin(azimuth);
      const z = radius * Math.cos(inclination);

      points.push(new Vector3(x, y, z));
    }

    return points;
  }

  reorderBySpatialProximity(points) {
    if (points.length === 0) return [];
    const ordered = [];
    const remaining = [...points];
    let current = remaining.splice(0, 1)[0];
    ordered.push(current);
    while (remaining.length > 0) {
      let nearestIndex = 0;
      let nearestDistance = current.distanceTo(remaining[0]);
      for (let i = 1; i < remaining.length; i++) {
        const distance = current.distanceTo(remaining[i]);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = i;
        }
      }
      current = remaining.splice(nearestIndex, 1)[0];
      ordered.push(current);
    }
    return ordered;
  }
}

export { LayoutEngine };
