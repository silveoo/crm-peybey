import {expect, it} from 'vitest';
import {clientSchema} from './client.schema';

it('validates and formats a client phone', () => {
    expect(clientSchema.parse({name: 'Анна', phone: '89991234567', note: 'У окна'})).toEqual({
        name: 'Анна', phone: '+7 (999) 123-45-67', note: 'У окна'
    });
    expect(clientSchema.safeParse({name: 'Анна', phone: '+7 (999)', note: ''}).success).toBe(false)
});
