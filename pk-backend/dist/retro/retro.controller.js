"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetroController = void 0;
const common_1 = require("@nestjs/common");
const retro_service_1 = require("./retro.service");
let RetroController = class RetroController {
    constructor(retroService) {
        this.retroService = retroService;
    }
    async exportSession(sessionId, res) {
        try {
            const csvContent = await this.retroService.exportToCSV(sessionId);
            const filename = `retro-${sessionId}-${new Date().toISOString().split('T')[0]}.csv`;
            const buffer = Buffer.from(csvContent, 'utf-8');
            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Length', buffer.length);
            res.send(buffer);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Error generating export');
        }
    }
};
exports.RetroController = RetroController;
__decorate([
    (0, common_1.Get)('export/:sessionId'),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RetroController.prototype, "exportSession", null);
exports.RetroController = RetroController = __decorate([
    (0, common_1.Controller)('api/retro'),
    __metadata("design:paramtypes", [retro_service_1.RetroService])
], RetroController);
//# sourceMappingURL=retro.controller.js.map