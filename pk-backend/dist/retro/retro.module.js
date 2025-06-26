"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetroModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const retro_session_entity_1 = require("./entities/retro-session.entity");
const retro_user_entity_1 = require("./entities/retro-user.entity");
const retro_item_entity_1 = require("./entities/retro-item.entity");
const retro_service_1 = require("./retro.service");
const retro_gateway_1 = require("./retro.gateway");
const retro_controller_1 = require("./retro.controller");
let RetroModule = class RetroModule {
};
exports.RetroModule = RetroModule;
exports.RetroModule = RetroModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([retro_session_entity_1.RetroSession, retro_user_entity_1.RetroUser, retro_item_entity_1.RetroItem]),
        ],
        providers: [retro_service_1.RetroService, retro_gateway_1.RetroGateway],
        controllers: [retro_controller_1.RetroController],
    })
], RetroModule);
//# sourceMappingURL=retro.module.js.map