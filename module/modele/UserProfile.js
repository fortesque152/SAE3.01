export class UserProfile {
    constructor(profile) {
        this._profileId = profile.profile_id;
        this._name = profile.profile_name;
        this._isPMR = profile.is_pmr;
        this._vehicles = profile.vehicles || null;
        this._preferences = profile.preferences;
    }
    getProfileId() { return this._profileId; }
    getName() { return this._name; }
    isPMR() { return this._isPMR; }
    getVehicles() { return this._vehicles; }
    getPreferences() { return this._preferences; }
    canPark(properties) {
        const restriction = (properties.restriction_type || "").toLowerCase();
        const validPermits = (properties.valid_parking_permits || "").toLowerCase();
        const spaces = parseInt(properties.parking_spaces) || 0;
        if (spaces < 1)
            return false;
        const allowedVehicle = this._vehicles.some(v => restriction.includes(v.name));
        if (!allowedVehicle)
            return false;
        if (restriction.includes("pmr") && !this._isPMR)
            return false;
        if (validPermits && validPermits !== "n/a")
            return false;
        return true;
    }
}
