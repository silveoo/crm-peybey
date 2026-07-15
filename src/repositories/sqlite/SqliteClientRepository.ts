import {ClientInput} from '../../features/clients/client.types';
import {getDb} from '../../lib/database';
import {nowIso} from '../../lib/dates';
import {DomainError} from '../../lib/errors';
import {ClientRepository} from '../ClientRepository';
import {ClientRow, mapClient} from './map';

const id = () => crypto.randomUUID();

export class SqliteClientRepository implements ClientRepository {
    async list() {
        const db = await getDb();
        return (await db.select<ClientRow[]>('select * from clients order by name collate nocase')).map(mapClient)
    }
    async create(input: ClientInput) {
        const db = await getDb(), now = nowIso(), clientId = id();
        try {
            await db.execute('insert into clients(id,name,phone,note,created_at,updated_at) values($1,$2,$3,$4,$5,$6)', [clientId, input.name, input.phone, input.note, now, now])
        } catch {
            throw new DomainError('Клиент с таким номером уже существует')
        }
        return {id: clientId, ...input, createdAt: now, updatedAt: now}
    }
    async update(clientId: string, input: ClientInput) {
        const db = await getDb(), now = nowIso();
        try {
            await db.execute('update clients set name=$1,phone=$2,note=$3,updated_at=$4 where id=$5', [input.name, input.phone, input.note, now, clientId])
        } catch {
            throw new DomainError('Клиент с таким номером уже существует')
        }
        const rows = await db.select<ClientRow[]>('select * from clients where id=$1', [clientId]);
        return mapClient(rows[0])
    }
    async delete(clientId: string) {
        const db = await getDb();
        await db.execute('delete from clients where id=$1', [clientId])
    }
}
