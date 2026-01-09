// Connexion.ts
import { Client } from "https://deno.land/x/mysql/mod.ts";
export class Connexion {
    static async getConnection() {
        if (!Connexion.client) {
            Connexion.client = await new Client().connect({
                hostname: "devbdd.iutmetz.univ-lorraine.fr",
                username: "e27844u_appli",
                password: "32406845",
                db: "e27844u_SAE_bd",
            });
            console.log("Connexion à la base MySQL établie !");
        }
        return Connexion.client;
    }
}
Connexion.client = null;
