import {useForm} from 'react-hook-form';
import {Button} from '../components/ui/Button';
import {Input} from '../components/ui/Input';
import {useAppStore} from '../store/appStore';
import {settingsRepo} from '../app/providers';
import {AppSettings} from '../repositories/SettingsRepository';

export function SettingsPage({reload}: { reload: () => Promise<void> }) {
    const {settings} = useAppStore();
    const {register, handleSubmit} = useForm<AppSettings>({values: settings!});
    return <form className="max-w-xl space-y-4 p-6" onSubmit={handleSubmit(async v => {
        await settingsRepo.save(v);
        await reload()
    })}><h1 className="text-2xl font-semibold">Настройки</h1><Input {...register('restaurantName')}/><Input
        type="time" step={1800} {...register('dayStart')}/><Input type="time" step={1800} {...register('dayEnd')}/><p
        className="text-sm text-neutral-500">Шкала расписания: 30 минут, выбор времени: 15 минут.</p><Button className="bg-neutral-900 text-white">Сохранить</Button></form>
}
