import { Connexion } from "./Connexion.js";
export class EtudiantDAO {
    async getAll() {
        const liste = [];
        const laConnexion = await Connexion.getConnection();
        const lignes = await laConnexion.query("SELECT * FROM etudiant ORDER BY id");
        for (const ligne of lignes) {
            const p = new Etudiant(ligne.nom, ligne.prenom, ligne.id_promotion);
            liste.push(p);
        }
        laConnexion.close();
        return liste;
    }
    async getById(id) {
        let p = null;
        const laConnexion = await Connexion.getConnection();
        const lignes = await laConnexion.query("SELECT * FROM etudiant WHERE id = ?", [id]);
        if (lignes.length === 1) {
            const ligne = lignes[0];
            p = new Etudiant(ligne.nom, ligne.prenom, ligne.id_promotion);
            p.id = ligne.id;
        }
        laConnexion.close();
        return p;
    }
    async getByPromotion(id) {
        let p = null;
        const laConnexion = await Connexion.getConnection();
        const lignes = await laConnexion.query("SELECT * FROM etudiant WHERE id_promotion = ?", [id]);
        if (lignes.length === 1) {
            const ligne = lignes[0];
            p = new Etudiant(ligne.nom, ligne.prenom, ligne.id_promotion);
            p.id = ligne.id;
        }
        laConnexion.close();
        return p;
    }
    async getByNomPrenom(nom, prenom) {
        let p = null;
        const laConnexion = await Connexion.getConnection();
        const lignes = await laConnexion.query("SELECT * FROM etudiant WHERE nom LIKE ? AND prenom LIKE ? ", [nom, prenom]);
        if (lignes.length === 1) {
            const ligne = lignes[0];
            p = new Etudiant(ligne.nom, ligne.prenom, ligne.id_promotion);
            p.id = ligne.id;
        }
        laConnexion.close();
        return p;
    }
    async create(objet) {
        let ok = true;
        const laConnexion = await Connexion.getConnection();
        const resultat = await laConnexion.query("INSERT INTO etudiant (nom,prenom,id_promotion) values (?,?,?)", [objet.nom, objet.prenom, objet.idPromotion]);
        if (resultat.affectedRows === 1) {
            objet.id = resultat.lastInsertId;
        }
        else {
            ok = false;
        }
        laConnexion.close();
        return ok;
    }
    async update(objet) {
        let ok = true;
        const laConnexion = await Connexion.getConnection();
        const resultat = await laConnexion.query("UPDATE etudiant SET nom = ?, prenom = ?, id_promotion = ? WHERE id = ?", [objet.nom, objet.prenom, objet.idPromotion, objet.id]);
        if (resultat.affectedRows === 1) {
            objet.id = resultat.lastInsertId;
        }
        else {
            ok = false;
        }
        laConnexion.close();
        return ok;
    }
    async delete(objet) {
        let ok = true;
        const laConnexion = await Connexion.getConnection();
        const resultat = await laConnexion.query("DELETE FROM etudiant WHERE id = ?", [objet.id]);
        if (resultat.affectedRows === 1) {
            objet.id = resultat.lastInsertId;
        }
        else {
            ok = false;
        }
        laConnexion.close();
        return ok;
    }
}
