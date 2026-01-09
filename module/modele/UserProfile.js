export class UserProfile {
    constructor(name, surname, vehicleType) {
        this._name = name;
        this._surname = surname;
        this._vehicleType = vehicleType;
    }
    getName() {
        return this._name;
    }
    getSurname() {
        return this._surname;
    }
    getVehicleType() {
        return this._vehicleType;
    }
    /**
     * Vérifie si l'utilisateur peut se garer sur un parking donné
     * properties : objet properties du GeoJSON du parking
     */
    canPark(properties) {
        const restriction = (properties.restriction_type || "").toLowerCase();
        const validPermits = (properties.valid_parking_permits || "").toLowerCase();
        const spaces = parseInt(properties.parking_spaces) || 0;
        if (spaces < 1)
            return false; // pas de place
        // Filtrer selon le type de véhicule
        switch (this._vehicleType) {
            case "car":
                // exclure vélo, moto, privé
                if (restriction.includes("bike") || restriction.includes("motorcycle") || restriction.includes("private"))
                    return false;
                break;
            case "electric":
                // autoriser uniquement les parkings "electric" ou "paid-for"
                if (!restriction.includes("electric") && !restriction.includes("paid-for"))
                    return false;
                break;
            case "motorcycle":
                if (!restriction.includes("motorcycle"))
                    return false;
                break;
            case "bike":
                if (!restriction.includes("bike"))
                    return false;
                break;
        }
        // Si des places sont réservées uniquement à certains permis, vérifier
        if (validPermits && validPermits !== "n/a")
            return false;
        return true;
    }
}
