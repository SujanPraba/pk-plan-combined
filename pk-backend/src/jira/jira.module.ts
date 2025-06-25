import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JiraController } from './jira.controller';
import { JiraService } from './jira.service';

@Module({
  imports: [ConfigModule],
  controllers: [JiraController],
  providers: [JiraService],
  exports: [JiraService],
})
export class JiraModule {} 