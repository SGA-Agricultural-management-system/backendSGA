import { LotDTO } from './LotDTO';

export interface FarmDTO {
    id: string;
    name: string;
    location: string;
}

export interface FarmWithLotsDTO extends FarmDTO {
    lots: LotDTO[];
}