import { IsBoolean } from 'class-validator';

export class ApproveBudgetDto {
  @IsBoolean()
  approved: boolean;
}
