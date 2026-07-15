import {Client, ClientInput} from '../features/clients/client.types';

export interface ClientRepository {
    list(): Promise<Client[]>;
    create(input: ClientInput): Promise<Client>;
    update(id: string, input: ClientInput): Promise<Client>;
    delete(id: string): Promise<void>;
}
