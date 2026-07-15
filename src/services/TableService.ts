import {TableRepository} from '../repositories/TableRepository';
import {TableInput} from '../features/tables/table.types';

export class TableService {
    constructor(private repo: TableRepository) {
    }

    list() {
        return this.repo.list()
    }

    create(i: TableInput) {
        return this.repo.create(i)
    }

    update(id: string, i: TableInput) {
        return this.repo.update(id, i)
    }

    delete(id: string) {
        return this.repo.delete(id)
    }
}
