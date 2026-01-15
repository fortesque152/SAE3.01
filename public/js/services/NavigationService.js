import { GeoLocation } from "../modele/GeoLocation.js";
/**
 * Service de navigation en temps réel
 * Gère les instructions et détecte la progression de l'utilisateur
 */
export class NavigationService {
    constructor(instructions, distanceThreshold = 20) {
        this.instructions = instructions;
        this.currentInstructionIndex = 0;
        this.distanceThreshold = distanceThreshold;
    }
    /**
     * Retourne l'instruction actuelle
     */
    getCurrentInstruction() {
        if (this.currentInstructionIndex >= this.instructions.length) {
            return null;
        }
        return this.instructions[this.currentInstructionIndex];
    }
    /**
     * Retourne la prochaine instruction
     */
    getNextInstruction() {
        const nextIndex = this.currentInstructionIndex + 1;
        if (nextIndex >= this.instructions.length) {
            return null;
        }
        return this.instructions[nextIndex];
    }
    /**
     * Retourne toutes les instructions
     */
    getAllInstructions() {
        return this.instructions;
    }
    /**
     * Met à jour la position et calcule la distance jusqu'à la prochaine instruction
     */
    updatePosition(userPosition) {
        const currentInstruction = this.getCurrentInstruction();
        if (!currentInstruction) {
            return { distanceToNextManeuver: 0, shouldAdvance: false };
        }
        const [lon, lat] = currentInstruction.getLocation();
        const instructionLocation = new GeoLocation(lat, lon);
        const distance = this.calculateDistance(userPosition, instructionLocation);
        // Si on est proche de la manœuvre actuelle, passer à la suivante
        const shouldAdvance = distance < this.distanceThreshold;
        return {
            distanceToNextManeuver: distance,
            shouldAdvance
        };
    }
    /**
     * Avance à l'instruction suivante
     */
    advanceToNextInstruction() {
        if (this.currentInstructionIndex < this.instructions.length - 1) {
            this.currentInstructionIndex++;
        }
    }
    /**
     * Réinitialise la navigation
     */
    reset() {
        this.currentInstructionIndex = 0;
    }
    /**
     * Retourne l'index de l'instruction actuelle
     */
    getCurrentIndex() {
        return this.currentInstructionIndex;
    }
    /**
     * Vérifie si la navigation est terminée
     */
    isComplete() {
        return this.currentInstructionIndex >= this.instructions.length - 1;
    }
    /**
     * Calcule la distance entre deux points (Haversine)
     */
    calculateDistance(a, b) {
        const R = 6371e3; // Rayon de la Terre en mètres
        const φ1 = (a.latitude * Math.PI) / 180;
        const φ2 = (b.latitude * Math.PI) / 180;
        const Δφ = ((b.latitude - a.latitude) * Math.PI) / 180;
        const Δλ = ((b.longitude - a.longitude) * Math.PI) / 180;
        const sinΔφ = Math.sin(Δφ / 2);
        const sinΔλ = Math.sin(Δλ / 2);
        const x = sinΔφ ** 2 + Math.cos(φ1) * Math.cos(φ2) * sinΔλ ** 2;
        return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
    }
}
