export class UserProfile {
    constructor(profile) {
        this._currentVehicle = null;
        this._profileId = profile.profile_id;
        this._name = profile.profile_name;
        this._isPMR = profile.is_pmr;
        this._vehicles = profile.vehicles || [];
        this._preferences = profile.preferences || [];
        if (this._vehicles.length > 0)
            this._currentVehicle = this._vehicles[0];
    }
    getProfileId() { return this._profileId; }
    getName() { return this._name; }
    isPMR() { return this._isPMR; }
    getVehicles() { return this._vehicles; }
    getCurrentVehicle() { return this._currentVehicle; }
    getPreferences() { return this._preferences; }
    setCurrentVehicle(vehicleName) {
        const v = this._vehicles.find(v => v.name === vehicleName);
        if (v)
            this._currentVehicle = v;
    }
    addVehicle(vehicule) {
        this._vehicles.push(vehicule);
        this._currentVehicle = vehicule;
    }
    async fetchVehicles() {
        try {
            const res = await fetch("../app/api/vehicles.php?t=" + Date.now(), { credentials: "include" });
            const data = await res.json();
            if (!data.success)
                return [];
            const tab = [];
            for (const v of data.vehicles) {
                tab.push({
                    vehicle_name: v.name,
                    name: v.type,
                    id: v.vehicle_type_id
                });
            }
            return tab;
        }
        catch (err) {
            console.error("Erreur récupération véhicules :", err);
            return [];
        }
    }
    async reloadVehicles() {
        this._vehicles = await this.fetchVehicles();
        this._currentVehicle = this._vehicles.length > 0 ? this._vehicles[0] : null;
    }
    canPark(properties) {
        const restriction = String(properties.restriction_type || "").toLowerCase();
        const validPermits = String(properties.valid_parking_permits || "").toLowerCase();
        const spaces = parseInt(String(properties.parking_spaces)) || 0;
        if (spaces < 1)
            return false;
        if (!this._currentVehicle)
            return false;
        if (!restriction.includes(this._currentVehicle.name))
            return false;
        if (restriction.includes("pmr") && !this._isPMR)
            return false;
        if (validPermits && validPermits !== "n/a")
            return false;
        return true;
    }
}
