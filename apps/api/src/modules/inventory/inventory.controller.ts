import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService, CreateInventoryItemDto } from './inventory.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuditLog } from '../../common/decorators/audit-log.decorator';
import { UserRole } from '@calyvia/shared';

@ApiTags('14. Inventory & Supplies')
@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('items')
  @Roles(UserRole.SUPER_ADMIN, UserRole.INVENTORY_STORE, UserRole.FACILITY_ADMIN)
  @AuditLog({ action: 'CREATE_INVENTORY_ITEM', resource: 'INVENTORY' })
  @ApiOperation({ summary: 'Register consumable item in inventory master catalog' })
  async createItem(@Body() dto: CreateInventoryItemDto) {
    return this.inventoryService.createItem(dto);
  }

  @Get('items')
  @Roles(UserRole.SUPER_ADMIN, UserRole.INVENTORY_STORE, UserRole.FACILITY_ADMIN, UserRole.MANAGEMENT_EXECUTIVE)
  @ApiOperation({ summary: 'List inventory stock levels with reorder thresholds' })
  async getInventory(@Query('category') category?: string) {
    return this.inventoryService.getInventory(category);
  }
}
