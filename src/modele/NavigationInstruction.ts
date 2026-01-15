/**
 * Représente une instruction de navigation
 */
export class NavigationInstruction {
    private type: string;
    private modifier: string;
    private streetName: string;
    private distance: number;
    private location: [number, number];

    constructor(
        type: string,
        modifier: string,
        streetName: string,
        distance: number,
        location: [number, number]
    ) {
        this.type = type;
        this.modifier = modifier;
        this.streetName = streetName;
        this.distance = distance;
        this.location = location;
    }

    getType(): string {
        return this.type;
    }

    getModifier(): string {
        return this.modifier;
    }

    getStreetName(): string {
        return this.streetName;
    }

    getDistance(): number {
        return this.distance;
    }

    getLocation(): [number, number] {
        return this.location;
    }

    /**
     * Retourne une instruction en français
     */
    getInstruction(): string {
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
    getIcon(): string {
        if (this.type === "arrive") return "🏁";
        if (this.type === "depart") return "🚗";

        if (this.type === "turn" || this.type === "fork" || this.type === "on ramp" || this.type === "off ramp") {
            if (this.modifier.includes("left")) return "↰";
            if (this.modifier.includes("right")) return "↱";
            if (this.modifier === "straight") return "↑";
            if (this.modifier === "uturn") return "⤾";
        }

        if (this.type === "roundabout") return "⭮";

        return "→";
    }

    private getTurnInstruction(dist: string): string {
        const direction = this.getModifierText();
        const street = this.streetName ? ` sur ${this.streetName}` : "";

        if (this.modifier === "uturn") {
            return `Faites demi-tour${street} (${dist})`;
        }

        return `Tournez ${direction}${street} (${dist})`;
    }

    private getModifierText(): string {
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

    private formatDistance(meters: number): string {
        if (meters < 100) {
            return `${Math.round(meters)} m`;
        } else if (meters < 1000) {
            return `${Math.round(meters / 10) * 10} m`;
        } else {
            return `${(meters / 1000).toFixed(1)} km`;
        }
    }
}
