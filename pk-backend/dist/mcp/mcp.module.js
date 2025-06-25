"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var JiraMCPModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JiraMCPModule = void 0;
const common_1 = require("@nestjs/common");
const mcp_nest_1 = require("@rekog/mcp-nest");
const jira_mcp_service_1 = require("./jira-mcp.service");
const jira_module_1 = require("../modules/jira.module");
let JiraMCPModule = JiraMCPModule_1 = class JiraMCPModule {
    static forRoot() {
        return {
            module: JiraMCPModule_1,
            imports: [
                mcp_nest_1.McpModule.forRoot({
                    name: 'PokerPlanningJiraSync',
                    version: '1.0.0',
                    sseEndpoint: '/mcp/sse',
                    capabilities: {
                        jiraSync: {
                            version: '1.0.0',
                            features: ['projects', 'sprints', 'stories', 'auth']
                        }
                    }
                }),
                jira_module_1.JiraModule,
            ],
            providers: [jira_mcp_service_1.JiraMCPService],
            exports: [jira_mcp_service_1.JiraMCPService],
        };
    }
};
exports.JiraMCPModule = JiraMCPModule;
exports.JiraMCPModule = JiraMCPModule = JiraMCPModule_1 = __decorate([
    (0, common_1.Module)({})
], JiraMCPModule);
//# sourceMappingURL=mcp.module.js.map