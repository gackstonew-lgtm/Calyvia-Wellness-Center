import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface CreateInventoryItemDto {
  itemCode: string;
  name: string;
  category: string; // FOOD_KITCHEN, CLEANING, MEDICAL_SUPPLIES, LINEN
  quantity: number;
  unit: string;
  minAlertQty: number;
  unitCostKES: number;
  supplier?: string;
}

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async createItem(dto: CreateInventoryItemDto) {
    if (!dto.itemCode || !dto.name || !dto.category) {
      throw new BadRequestException('Item code, name, and category are required.');
    }

    try {
      if (this.prisma && this.prisma.inventoryItem) {
        return await this.prisma.inventoryItem.create({
          data: {
            itemCode: dto.itemCode.trim(),
            name: dto.name.trim(),
            category: dto.category.trim(),
            quantity: Number(dto.quantity) || 0,
            unit: dto.unit || 'PIECE',
            minAlertQty: Number(dto.minAlertQty) || 10,
            unitCostKES: Number(dto.unitCostKES) || 0,
            supplier: dto.supplier || null,
          },
        });
      }
      throw new Error('Database connection unavailable');
    } catch (err: any) {
      throw new BadRequestException(`Failed to create inventory item: ${err.message || 'Database error'}`);
    }
  }

  async getInventory(category?: string) {
    try {
      if (this.prisma && this.prisma.inventoryItem) {
        return await this.prisma.inventoryItem.findMany({
          where: category && category !== 'ALL' ? { category } : {},
          orderBy: { name: 'asc' },
        });
      }
    } catch (err) {
      console.warn('Inventory fetch error:', err);
    }
    return [];
  }
}
