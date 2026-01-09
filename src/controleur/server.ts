import { serve } from "https://deno.land/std@0.217.0/http/server.ts";
import { Connexion } from "./Connexion.js";

console.log("Serveur lancé sur http://localhost:8000");

serve(async (req) => {
    const url = new URL(req.url);

    if (req.method === "POST") {
        const data = await req.json(); // On récupère les données JSON

        const client = await Connexion.getConnection();

        // --- INSCRIPTION ---
        if (url.pathname === "/register") {
            const { username, email, password } = data;

            // Vérifie si l'utilisateur existe déjà
            const exist = await client.execute(
                "SELECT id FROM users WHERE username = ? OR email = ?",
                [username, email]
            );

            if (exist.rows && exist.rows.length > 0) {
                return new Response(JSON.stringify({ success: false, message: "Utilisateur déjà existant" }), {
                    headers: { "Content-Type": "application/json" },
                });
            }

            // Ajoute l'utilisateur
            await client.execute(
                "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
                [username, email, password] // Ici tu peux hasher le mdp pour plus de sécurité
            );

            return new Response(JSON.stringify({ success: true, message: "Inscription réussie" }), {
                headers: { "Content-Type": "application/json" },
            });
        }

        // --- CONNEXION ---
        if (url.pathname === "/login") {
            const { username, password } = data;

            const result = await client.execute(
                "SELECT id FROM users WHERE username = ? AND password = ?",
                [username, password]
            );

            if (result.rows && result.rows.length > 0) {
                return new Response(JSON.stringify({ success: true, message: "Connexion réussie" }), {
                    headers: { "Content-Type": "application/json" },
                });
            } else {
                return new Response(JSON.stringify({ success: false, message: "Utilisateur ou mot de passe incorrect" }), {
                    headers: { "Content-Type": "application/json" },
                });
            }
        }
    }

    return new Response("Page non trouvée", { status: 404 });
});
