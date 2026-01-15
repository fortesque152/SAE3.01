/**
 * Représente une instruction de navigation
 */
export class NavigationInstruction {
    constructor(type, modifier, streetName, distance, location) {
        this.type = type;
        this.modifier = modifier;
        this.streetName = streetName;
        this.distance = distance;
        this.location = location;
    }
    getType() {
        return this.type;
    }
    getModifier() {
        return this.modifier;
    }
    getStreetName() {
        return this.streetName;
    }
    getDistance() {
        return this.distance;
    }
    getLocation() {
        return this.location;
    }
    /**
     * Retourne une instruction en français
     */
    getInstruction() {
        const dist = this.formatDistance(this.distance);
        switch (this.type) {
            case "depart":
                return `Partez vers ${this.streetName || "la destination"}`;
            case "arrive":
                return `Vous êtes arrivé à destination`;
            case "turn":
                return this.getTurnInstruction(dist);
            case "new name":
                return `Continuez sur ${this.streetName || "la route"} (${dist})`;
            case "merge":
                return `Insérez-vous ${this.getModifierText()} (${dist})`;
            case "on ramp":
                return `Prenez la bretelle ${this.getModifierText()} (${dist})`;
            case "off ramp":
                return `Prenez la sortie ${this.getModifierText()} (${dist})`;
            case "fork":
                return `Au embranchement, restez ${this.getModifierText()} (${dist})`;
            case "roundabout":
                return `Au rond-point, prenez ${this.getModifierText()} (${dist})`;
            case "continue":
                return `Continuez tout droit sur ${this.streetName || "la route"} (${dist})`;
            default:
                return `Continuez sur ${this.streetName || "la route"} (${dist})`;
        }
    }
    /**
     * Retourne l'icône correspondant à l'instruction
     */
    getIcon() {
        if (this.type === "arrive")
            return "🏁";
        if (this.type === "depart")
            return "🚗";
        if (this.type === "turn" || this.type === "fork" || this.type === "on ramp" || this.type === "off ramp") {
            if (this.modifier.includes("left"))
                return "↰";
            if (this.modifier.includes("right"))
                return "↱";
            if (this.modifier === "straight")
                return "↑";
            if (this.modifier === "uturn")
                return "⤾";
        }
        if (this.type === "roundabout")
            return "⭮";
        return "→";
    }
    getTurnInstruction(dist) {
        const direction = this.getModifierText();
        const street = this.streetName ? ` sur ${this.streetName}` : "";
        if (this.modifier === "uturn") {
            return `Faites demi-tour${street} (${dist})`;
        }
        return `Tournez ${direction}${street} (${dist})`;
    }
    getModifierText() {
        switch (this.modifier) {
            case "left": return "à gauche";
            case "right": return "à droite";
            case "sharp left": return "fortement à gauche";
            case "sharp right": return "fortement à droite";
            case "slight left": return "légèrement à gauche";
            case "slight right": return "légèrement à droite";
            case "straight": return "tout droit";
            case "uturn": return "demi-tour";
            default: return this.modifier || "tout droit";
        }
    }
    formatDistance(meters) {
        if (meters < 100) {
            return `${Math.round(meters)} m`;
        }
        else if (meters < 1000) {
            return `${Math.round(meters / 10) * 10} m`;
        }
        else {
            return `${(meters / 1000).toFixed(1)} km`;
        }
    }
}
