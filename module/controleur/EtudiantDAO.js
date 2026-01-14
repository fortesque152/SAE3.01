"use strict";
/*import { IDAO } from "./DAO.js";
import { Connexion } from "./Connexion.js";
import { UserProfile } from "../modele/UserProfile.js";


export class UserProfileDAO implements IDAO<UserProfile> {

    async getAll(): Promise<UserProfile[]> {
        const liste: UserProfile[] = [];
        const laConnexion = await Connexion.getConnection();
        const lignes = await laConnexion.query(
            "SELECT * FROM UserProfile ORDER BY id"
            ,
        );
        for (const ligne of lignes) {
            const p = new UserProfile(ligne.nom,ligne.prenom,ligne.id_promotion);
            liste.push(p);
        }
        laConnexion.close();
        return liste;
    }

    async getById(id: number): Promise<UserProfile | null> {
        let p: UserProfile | null = null;
        const laConnexion = await Connexion.getConnection();
        const lignes = await laConnexion.query(
            "SELECT * FROM UserProfile WHERE id = ?"
            ,
            [id],
        );
        if (lignes.length === 1) {
            const ligne = lignes[0];
            p = new UserProfile(ligne.nom,ligne.prenom,ligne.id_promotion);
            p.id = ligne.id;
        }
        laConnexion.close();
        return p;
    }

    async getByPromotion(id: number): Promise<UserProfile | null> {
        let p: UserProfile | null = null;
        const laConnexion = await Connexion.getConnection();
        const lignes = await laConnexion.query(
            "SELECT * FROM UserProfile WHERE id_promotion = ?"
            ,
            [id],
        );
        if (lignes.length === 1) {
            const ligne = lignes[0];
            p = new UserProfile(ligne.nom,ligne.prenom,ligne.id_promotion);
            p.id = ligne.id;
        }
        laConnexion.close();
        return p;
    }

    async getByNomPrenom(nom: string,prenom: string): Promise<UserProfile | null> {
        let p: UserProfile | null = null;
        const laConnexion = await Connexion.getConnection();
        const lignes = await laConnexion.query(
            "SELECT * FROM UserProfile WHERE nom LIKE ? AND prenom LIKE ? "
            ,
            [nom,prenom],
        );
        if (lignes.length === 1) {
            const ligne = lignes[0];
            p = new UserProfile(ligne.nom,ligne.prenom,ligne.id_promotion);
            p.id = ligne.id;
        }
        laConnexion.close();
        return p;
    }

    async create(objet: UserProfile): Promise<boolean> {
        let ok = true;
        const laConnexion = await Connexion.getConnection();
        const resultat = await laConnexion.query(
            "INSERT INTO UserProfile (nom,prenom,id_promotion) values (?,?,?)"
            ,
            [objet.nom,objet.prenom,objet.idPromotion],
        );
        if (resultat.affectedRows === 1) {
            objet.id = resultat.lastInsertId;
        } else {
            ok = false;
        }
        laConnexion.close();
        return ok;
    }

    async update(objet: UserProfile): Promise<boolean> {
        let ok = true;
        const laConnexion = await Connexion.getConnection();
        const resultat = await laConnexion.query(
            "UPDATE UserProfile SET nom = ?, prenom = ?, id_promotion = ? WHERE id = ?"
            ,
            [objet.nom,objet.prenom,objet.idPromotion,objet.id],
        );
        if (resultat.affectedRows === 1) {
            objet.id = resultat.lastInsertId;
        } else {
            ok = false;
        }
        laConnexion.close();
        return ok;
    }

    async delete(objet: UserProfile): Promise<boolean> {
        let ok = true;
        const laConnexion = await Connexion.getConnection();
        const resultat = await laConnexion.query(
            "DELETE FROM UserProfile WHERE id = ?"
            ,
            [objet.id],
        );
        if (resultat.affectedRows === 1) {
            objet.id = resultat.lastInsertId;
        } else {
            ok = false;
        }
        laConnexion.close();
        return ok;
    }
}
    */ 
