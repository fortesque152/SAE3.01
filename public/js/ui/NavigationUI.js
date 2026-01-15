/**
 * Gère l'affichage des instructions de navigation
 */
export class NavigationUI {
    constructor() {
        this.navigationPanel = document.getElementById("navigationPanel");
        this.instructionIcon = document.getElementById("instructionIcon");
        this.instructionText = document.getElementById("instructionText");
        this.instructionDistance = document.getElementById("instructionDistance");
        this.nextInstructionText = document.getElementById("nextInstructionText");
        this.instructionsList = document.getElementById("instructionsList");
        this.routeInfo = document.getElementById("routeInfo");
        this.navigationService = null;
    }
    /**
     * Démarre l'affichage de la navigation
     */
    startNavigation(navigationService) {
        this.navigationService = navigationService;
        this.navigationPanel.style.display = "block";
        this.updateDisplay();
        this.renderInstructionsList();
    }
    /**
     * Affiche les informations de résumé de l'itinéraire
     */
    showRouteSummary(distance, duration) {
        const distanceText = distance >= 1000 ?
            `${(distance / 1000).toFixed(1)} km` :
            `${Math.round(distance)} m`;
        const durationText = duration >= 3600 ?
            `${Math.floor(duration / 3600)}h ${Math.floor((duration % 3600) / 60)}min` :
            `${Math.floor(duration / 60)}min`;
        this.routeInfo.innerHTML = `📍 ${distanceText} • ⏱️ ${durationText}`;
        this.routeInfo.style.display = "block";
    }
    /**
     * Arrête l'affichage de la navigation
     */
    stopNavigation() {
        this.navigationPanel.style.display = "none";
        this.routeInfo.style.display = "none";
        this.navigationService = null;
    }
    /**
     * Met à jour l'affichage avec la position actuelle
     */
    updateDisplay(distanceToNextManeuver) {
        if (!this.navigationService)
            return;
        const currentInstruction = this.navigationService.getCurrentInstruction();
        const nextInstruction = this.navigationService.getNextInstruction();
        if (currentInstruction) {
            this.instructionIcon.textContent = currentInstruction.getIcon();
            this.instructionText.textContent = currentInstruction.getInstruction();
            if (distanceToNextManeuver !== undefined) {
                this.instructionDistance.textContent = this.formatDistance(distanceToNextManeuver);
            }
        }
        if (nextInstruction) {
            this.nextInstructionText.textContent = nextInstruction.getInstruction();
        }
        else {
            this.nextInstructionText.textContent = "Arrivée";
        }
    }
    /**
     * Affiche seulement la prochaine instruction
     */
    renderInstructionsList() {
        if (!this.navigationService)
            return;
        const instructions = this.navigationService.getAllInstructions();
        const currentIndex = this.navigationService.getCurrentIndex();
        this.instructionsList.innerHTML = "";
        // Afficher seulement la prochaine instruction
        const nextIndex = currentIndex + 1;
        if (nextIndex < instructions.length) {
            const instruction = instructions[nextIndex];
            const item = document.createElement("div");
            item.className = "instruction-item next";
            item.innerHTML = `
                <span class="instruction-icon">${instruction.getIcon()}</span>
                <span class="instruction-desc">${instruction.getInstruction()}</span>
            `;
            this.instructionsList.appendChild(item);
        }
    }
    /**
     * Met à jour la liste pour mettre en surbrillance l'instruction actuelle
     */
    highlightCurrentInstruction() {
        // Réafficher la liste avec les nouvelles instructions
        this.renderInstructionsList();
    }
    /**
     * Formate une distance en mètres
     */
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
