import { Client } from "https://deno.land/x/mysql@v2.12.1/mod.ts";
export class Connexion {
    public static async getConnection(): Promise<Client> {
        const c = await new Client().connect({
            hostname: "devbdd.iutmetz.univ-lorraine.fr"
            ,
            username: "e27844u_appli"
            ,
            password: "32406845"
            ,
            db: "e27844u_laroche5_r304"
            ,
        });
        return c;
    }
}
