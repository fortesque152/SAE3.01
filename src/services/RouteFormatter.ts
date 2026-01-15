/**
 * Single Responsibility Principle (SRP):
 * Separate route information formatting into its own service
 */
export class RouteFormatter {
    /**
     * Format distance in kilometers
     */
    formatDistance(distanceMeters: number): string {
        return (distanceMeters / 1000).toFixed(1);
    }

    /**
     * Format duration in human-readable format
     */
    formatDuration(durationSeconds: number): string {
        if (durationSeconds < 3600) {
            return `${Math.round(durationSeconds / 60)} min`;
        }
        const hours = Math.floor(durationSeconds / 3600);
        const minutes = Math.round((durationSeconds % 3600) / 60);
        return `${hours} h ${minutes} min`;
    }

    /**
     * Format route summary
     */
    formatRouteSummary(summary: { distance: number; duration: number }): {
        distanceKm: number;
        duration: string;
    } {
        return {
            distanceKm: Number(this.formatDistance(summary.distance)),
            duration: this.formatDuration(summary.duration),
        };
    }
}
