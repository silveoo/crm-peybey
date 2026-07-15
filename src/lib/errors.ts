export class DomainError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DomainError'
    }
}

export const toUserMessage = (e: unknown) => e instanceof Error ? e.message : 'Неизвестная ошибка';
