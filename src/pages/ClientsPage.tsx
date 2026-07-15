import {useState} from 'react';
import {clientService} from '../app/providers';
import {Button} from '../components/ui/Button';
import {Input} from '../components/ui/Input';
import {clientSchema} from '../features/clients/client.schema';
import {Client} from '../features/clients/client.types';
import {toUserMessage} from '../lib/errors';
import {useAppStore} from '../store/appStore';
import {PhoneInput} from '../components/ui/PhoneInput';

function ClientRow({client, reload}: {client: Client; reload: () => Promise<void>}) {
    const set = useAppStore(state => state.set);
    const [name, setName] = useState(client.name);
    const [phone, setPhone] = useState(client.phone);
    const [note, setNote] = useState(client.note);
    const save = async () => {
        const parsed = clientSchema.safeParse({name, phone, note});
        if (!parsed.success) {
            set({toast: parsed.error.issues[0]?.message ?? 'Проверьте данные клиента'});
            return
        }
        try {
            await clientService.update(client.id, parsed.data);
            set({toast: 'Клиент сохранён'});
            await reload()
        } catch (error) {
            set({toast: toUserMessage(error)})
        }
    };
    return <div className="grid gap-2 rounded-xl border bg-white p-3 lg:grid-cols-[1fr_220px_2fr_auto_auto]">
        <Input value={name} onChange={event => setName(event.target.value)} placeholder="Имя"/>
        <PhoneInput value={phone} onFocus={() => !phone && setPhone('+7')} onValueChange={setPhone}
                    placeholder="+7 (___) ___-__-__"/>
        <Input value={note} onChange={event => setNote(event.target.value)} placeholder="Дополнительный комментарий"/>
        <Button onClick={save}>Сохранить</Button>
        <Button className="text-red-600" onClick={async () => {
            await clientService.delete(client.id);
            await reload()
        }}>Удалить</Button>
    </div>
}

export function ClientsPage({reload}: {reload: () => Promise<void>}) {
    const {clients, set} = useAppStore();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('+7');
    const [note, setNote] = useState('');
    const create = async () => {
        const parsed = clientSchema.safeParse({name, phone, note});
        if (!parsed.success) {
            set({toast: parsed.error.issues[0]?.message ?? 'Проверьте данные клиента'});
            return
        }
        try {
            await clientService.create(parsed.data);
            setName('');
            setPhone('+7');
            setNote('');
            set({toast: 'Клиент создан'});
            await reload()
        } catch (error) {
            set({toast: toUserMessage(error)})
        }
    };
    return <div className="h-full overflow-auto p-6">
        <h1 className="mb-4 text-2xl font-semibold">Клиенты</h1>
        <div className="mb-5 grid gap-2 rounded-xl border bg-neutral-50 p-3 lg:grid-cols-[1fr_220px_2fr_auto]">
            <Input value={name} onChange={event => setName(event.target.value)} placeholder="Имя клиента"/>
            <PhoneInput value={phone} onValueChange={setPhone} placeholder="+7 (___) ___-__-__"/>
            <Input value={note} onChange={event => setNote(event.target.value)} placeholder="Дополнительный комментарий"/>
            <Button className="bg-neutral-900 text-white" onClick={create}>Добавить</Button>
        </div>
        <div className="space-y-2">
            {clients.map(client => <ClientRow key={client.id} client={client} reload={reload}/>)}
            {!clients.length && <p className="text-sm text-neutral-500">Клиентов пока нет.</p>}
        </div>
    </div>
}
