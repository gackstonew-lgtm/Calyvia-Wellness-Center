import { Module } from '@nestjs/common';
import { AiExtensionController } from './ai-extension.controller';
import { AiExtensionService } from './ai-extension.service';

@Module({
  controllers: [AiExtensionController],
  providers: [AiExtensionService],
  exports: [AiExtensionService],
})
export class AiExtensionModule {}
