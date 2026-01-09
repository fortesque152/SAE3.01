export interface IDAO<T> {
    getAll(): Promise<T[]>;
    getById(id: number): Promise<T | null>;
    create(objet: T): Promise<boolean>;
    update(objet: T): Promise<boolean>;
    delete(objet: T): Promise<boolean>;
}