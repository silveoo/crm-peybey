import {InputHTMLAttributes, KeyboardEvent} from 'react';
import {formatPhone} from '../../lib/phone';
import {Input} from './Input';

export function PhoneInput({value, onValueChange, ...props}: {
    value: string;
    onValueChange: (value: string) => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
    const removeDigitByPosition = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== 'Backspace' && event.key !== 'Delete') return;
        const input = event.currentTarget;
        const start = input.selectionStart ?? value.length;
        const end = input.selectionEnd ?? start;
        if (start !== end) return;
        const step = event.key === 'Backspace' ? -1 : 1;
        let position = event.key === 'Backspace' ? start - 1 : start;
        if (/\d/.test(value[position] ?? '')) return;
        while (position >= 2 && position < value.length && !/\d/.test(value[position])) position += step;
        if (position < 2 || position >= value.length) return;
        event.preventDefault();
        const next = formatPhone(value.slice(0, position) + value.slice(position + 1));
        onValueChange(next);
        requestAnimationFrame(() => input.setSelectionRange(Math.min(position, next.length), Math.min(position, next.length)))
    };
    return <Input {...props} value={value} inputMode="tel" onKeyDown={removeDigitByPosition}
                  onChange={event => onValueChange(formatPhone(event.target.value))}/>
}
