import {ClientInput} from '../features/clients/client.types';
import {ClientRepository} from '../repositories/ClientRepository';

export class ClientService {
    constructor(private repo: ClientRepository) {}
    list() { return this.repo.list() }
    create(input: ClientInput) { return this.repo.create(input) }
    update(id: string, input: ClientInput) { return this.repo.update(id, input) }
    delete(id: string) { return this.repo.delete(id) }
}
