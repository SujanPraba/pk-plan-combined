import { Response } from 'express';
import { RetroService } from './retro.service';
export declare class RetroController {
    private readonly retroService;
    constructor(retroService: RetroService);
    exportSession(sessionId: string, res: Response): Promise<void>;
}
