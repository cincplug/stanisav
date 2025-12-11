import * as THREE from "three";
import { sortLanguages } from "../utils/sortLanguages";

class LayoutEngine {
  constructor() {
    this.algorithms = {
      "multilevel-layout": this.multilevelLayout.bind(this)
    };

    this.currentAlgorithm = "multilevel-layout";
  }

  /**
   * Main entry point for layout calculation
   */
  calculateLayout(data, controls = {}, algorithm = null) {
    const algo = algorithm || this.currentAlgorithm;
    if (!this.algorithms[algo]) {
      console.warn(
        `Unknown algorithm: ${algo}, falling back to multilevel-layout`
      );
      return this.algorithms["multilevel-layout"](data, controls);
    }

    return this.algorithms[algo](data, controls);
  }

  /**
   * Spherical Surface Layout Algorithm
   * Distributes all languages evenly on the surface of a sphere using Fibonacci sphere algorithm
   */
  /**
   * Spherical Surface Layout Algorithm
   * Distributes all languages evenly on the surface of a sphere using Fibonacci sphere algorithm
   * with spatially continuous ordering
   */
  multilevelLayout(data, controls = {}) {
    const { languageData, languageGroups, speakerData } = data;
    const allLanguages = Object.keys(languageData);

    // Get configuration from controls or use defaults
    const { sortLanguagesBy, sphereRadius, labelContent, isReverse } = controls;

    // Sort languages based on selected criteria
    const sortedLanguages = sortLanguages({
      allLanguages,
      languageData,
      languageGroups,
      speakerData,
      sortLanguagesBy,
      labelContent,
      isReverse
    });

    const numPoints = sortedLanguages.length;

    // Step 1: Generate Fibonacci sphere points
    const fibonacciPoints = this.generateFibonacciSphere(
      numPoints,
      sphereRadius
    );

    // Step 2: Reorder points to follow spatial continuity using greedy nearest-neighbor
    const orderedPoints = this.reorderBySpatialProximity(fibonacciPoints);

    // Step 3: Assign languages to ordered positions
    const positions = {};
    sortedLanguages.forEach((languageCode, i) => {
      positions[languageCode] = orderedPoints[i];
    });

    return positions;
  }

  /**
   * Generate evenly distributed points on a sphere using Fibonacci spiral
   */
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

      points.push(new THREE.Vector3(x, y, z));
    }

    return points;
  }

  /**
   * Reorder points to maintain spatial continuity using a greedy nearest-neighbor approach
   */
  reorderBySpatialProximity(points) {
    if (points.length === 0) return [];

    const ordered = [];
    const remaining = [...points];

    // Start from a point (could be optimized to start from a specific location)
    let current = remaining.splice(0, 1)[0];
    ordered.push(current);

    // Greedy nearest-neighbor traversal
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
