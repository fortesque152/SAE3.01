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
    if(this._vehicles.length > 0) this._currentVehicle = this._vehicles[0];
  }

  getProfileId() { return this._profileId; }
  getName() { return this._name; }
  isPMR() { return this._isPMR; }
  getVehicles() { return this._vehicles; }
  getCurrentVehicle() { return this._currentVehicle; }
  getPreferences() { return this._preferences; }

  setCurrentVehicle(vehicleName: VehicleType["name"]) {
    const v = this._vehicles.find(v => v.name === vehicleName);
    if(v) this._currentVehicle = v;
  }

  async addVehicle(name: VehicleType["name"]) {
    const resp = await fetch("./vue/add_vehicle.php", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehicleType: name })
    });
    const result = await resp.json();
    if(result.success && result.vehicle) {
      const newVehicle: VehicleType = {
        vehicle_type_id: Number(result.vehicle.vehicle_id),
        name: result.vehicle.name
      };
      this._vehicles.push(newVehicle);
      this._currentVehicle = newVehicle;
    } else {
      alert("Impossible d'ajouter le véhicule");
    }
  }

  canPark(properties: any): boolean {
    const restriction = (properties.restriction_type || "").toLowerCase();
    const validPermits = (properties.valid_parking_permits || "").toLowerCase();
    const spaces = parseInt(properties.parking_spaces) || 0;
    if(spaces < 1) return false;
    if(!this._currentVehicle) return false;

    if(!restriction.includes(this._currentVehicle.name)) return false;
    if(restriction.includes("pmr") && !this._isPMR) return false;
    if(validPermits && validPermits !== "n/a") return false;

    return true;
  }
}
