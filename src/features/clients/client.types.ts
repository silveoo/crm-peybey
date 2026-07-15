export interface Client {
    id: string;
    name: string;
    phone: string;
    note: string;
    createdAt: string;
    updatedAt: string;
}

export type ClientInput = Pick<Client, 'name' | 'phone' | 'note'>;
