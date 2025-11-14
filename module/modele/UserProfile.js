export class UserProfile {
    constructor(name, surname) {
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
