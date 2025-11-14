export class UserProfile {

    private _name: string;
    private _surname: string;

    constructor(name: string, surname: string) {
        this._name = name;
        this._surname = surname;
    }

    getName() {
        return this._name;
    }
    
    getSurname() {
        return this._surname;
    }
}