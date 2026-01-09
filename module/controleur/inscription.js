// inscription.ts
import { serve } from "https://deno.land/std/http/server.ts";
import { Connexion } from "./Connexion.ts";
console.log("Serveur inscription démarré sur http://localhost:8001");
serve(async (req) => {
    const url = new URL(req.url);
    if (url.pathname === "/inscription" && req.method === "POST") {
        try {
            const data = await req.json();
            const { username, email, password } = data;
            const client = await Connexion.getConnection();
            // Vérifier si l'utilisateur existe déjà
            const existing = await client.query("SELECT * FROM user WHERE username = ? OR email = ?", [username, email]);
            if (existing.length > 0) {
                return new Response(JSON.stringify({ success: false, message: "Utilisateur déjà existant" }), { headers: { "content-type": "application/json" } });
            }
            // Insérer le nouvel utilisateur
            await client.execute("INSERT INTO user (username, email, password) VALUES (?, ?, ?)", [username, email, password]);
            return new Response(JSON.stringify({ success: true, message: "Inscription réussie" }), { headers: { "content-type": "application/json" } });
        }
        catch (err) {
            console.error(err);
            return new Response(JSON.stringify({ success: false, message: "Erreur serveur" }), { headers: { "content-type": "application/json" } });
        }
    }
    return new Response("Not Found", { status: 404 });
}, { port: 8001 });
