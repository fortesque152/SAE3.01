export interface VehicleType {
  vehicle_name: string;
  name: "car" | "electric" | "motorcycle";
}

export interface Preference {
  key: string;
  value: string;
}

export interface ProfileData {
  profile_id: number;
  profile_name: string;
  is_pmr: boolean;
  vehicles: VehicleType[];
  preferences: Preference[];
}

export class UserProfile {
  private _profileId: number;
  private _name: string;
  private _isPMR: boolean;
  private _vehicles: VehicleType[];
  private _preferences: Preference[];
  private _currentVehicle: VehicleType | null = null;

  constructor(profile: ProfileData) {
    this._profileId = profile.profile_id;
    this._name = profile.profile_name;
    this._isPMR = profile.is_pmr;
    this._vehicles = profile.vehicles || [];
    this._preferences = profile.preferences || [];
    if (this._vehicles.length > 0) this._currentVehicle = this._vehicles[0];
  }

  getProfileId() { return this._profileId; }
  getName() { return this._name; }
  isPMR() { return this._isPMR; }
  getVehicles() { return this._vehicles; }
  getCurrentVehicle() { return this._currentVehicle; }
  getPreferences() { return this._preferences; }

  setCurrentVehicle(vehicleName: VehicleType["name"]) {
    const v = this._vehicles.find(v => v.name === vehicleName);
    if (v) this._currentVehicle = v;
  }

  addVehicle(vehicule: VehicleType) {
    this._vehicles.push(vehicule);
    this._currentVehicle = vehicule;
  }

  async fetchVehicles(): Promise<VehicleType[]> {
    try {
      const res = await fetch("./vue/get_vehicule.php", { credentials: "include" });
      const data = await res.json();

      if (!data.success) return [];

      const tab: VehicleType[] = [];

      for (const v of data.vehicles) {
        tab.push({
          vehicle_name: v.name,
          name: v.type
        });
      }
      return tab;

    } catch (err) {
      console.error("Erreur récupération véhicules :", err);
      return [];
    }
  }


  async reloadVehicles(): Promise<void> {
    this._vehicles = await this.fetchVehicles();
    this._currentVehicle = this._vehicles.length > 0 ? this._vehicles[0] : null;
  }


  canPark(properties: any): boolean {
    const restriction = (properties.restriction_type || "").toLowerCase();
    const validPermits = (properties.valid_parking_permits || "").toLowerCase();
    const spaces = parseInt(properties.parking_spaces) || 0;
    if (spaces < 1) return false;
    if (!this._currentVehicle) return false;

    if (!restriction.includes(this._currentVehicle.name)) return false;
    if (restriction.includes("pmr") && !this._isPMR) return false;
    if (validPermits && validPermits !== "n/a") return false;

    return true;
  }
}
