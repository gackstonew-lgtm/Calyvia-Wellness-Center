import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AiChatMessageDto {
  @ApiProperty({ enum: ['user', 'assistant', 'system'] })
  role: 'user' | 'assistant' | 'system';

  @ApiProperty()
  content: string;

  @ApiPropertyOptional()
  timestamp?: string;
}

export class AiChatRequestDto {
  @ApiProperty({ description: 'The user question or request for the institutional copilot' })
  message: string;

  @ApiPropertyOptional({ type: [AiChatMessageDto], description: 'Recent conversation history for conversational context' })
  conversationHistory?: AiChatMessageDto[];

  @ApiPropertyOptional({ description: 'The active module context if initiated from a specific screen' })
  contextModule?: string;
}

export class AiChatResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  reply: string;

  @ApiProperty({ type: [String] })
  suggestedFollowUps: string[];

  @ApiProperty({ type: [String] })
  referencedModules: string[];

  @ApiProperty()
  timestamp: string;

  @ApiPropertyOptional()
  meta?: {
    modelUsed: string;
    toolsExecuted: string[];
    roleAuthorized: string;
  };
}
