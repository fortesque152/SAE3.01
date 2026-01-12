export interface VehicleType {
  vehicle_type_id: number;
  name: "car" | "electric" | "motorcycle" | "bike";
}

export interface Preference {
  key: string;
  value: string;
}

export interface ProfileData {
  profile_id: number;
  profile_name: string;
  is_pmr: boolean;
  vehicles: VehicleType[] ;
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
    this._currentVehicle = this._vehicles.length > 0 ? this._vehicles[0] : null;
  }

  getProfileId() { return this._profileId; }
  getName() { return this._name; }
  isPMR() { return this._isPMR; }
  getVehicles() { return this._vehicles; }
  getPreferences() { return this._preferences; }

  getVehicleType(): VehicleType["name"] | null {
    return this._currentVehicle?.name || null;
  }

  setVehicleType(name: VehicleType["name"]) {
    const v = this._vehicles.find(v => v.name === name) || null;
    this._currentVehicle = v;
  }

  /** Ajouter un véhicule si le type est valide */
  addVehicle(name: VehicleType["name"]) {
    const exists = this._vehicles.some(v => v.name === name);
    if (!exists) {
      const newVehicle: VehicleType = {
        vehicle_type_id: Date.now(), // simple id unique temporaire
        name,
      };
      this._vehicles.push(newVehicle);
      this._currentVehicle = newVehicle;
    }
  }

  canPark(properties: any): boolean {
    const restriction = (properties.restriction_type || "").toLowerCase();
    const validPermits = (properties.valid_parking_permits || "").toLowerCase();
    const spaces = parseInt(properties.parking_spaces) || 0;

    if (spaces < 1) return false;
    const allowedVehicle = this._vehicles.some(v => restriction.includes(v.name));
    if (!allowedVehicle) return false;
    if (restriction.includes("pmr") && !this._isPMR) return false;
    if (validPermits && validPermits !== "n/a") return false;

    return true;
  }
}
