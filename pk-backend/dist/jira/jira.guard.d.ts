import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class JiraAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
    private extractTokenFromHeader;
}
