import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from 'src/auth/dto/createCategory.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) {}

    async createCategory(dto: CreateCategoryDto, userId: string){
        const connectedUser = await this.prisma.users.findUnique({
            where: {
                id: userId
            }
        })  
        const existingCategory = await this.prisma.categories.findUnique({
            where:{ 
                title: dto.title
            }
        })
        if (existingCategory) {
            throw new BadRequestException('Une catégorie avec ce nom existe déjà');
          }

          const newCategory = await this.prisma.categories.create({
            data:{
                title: dto.title,
                createdBy:{
                    connect:{
                        id: connectedUser?.id
                    }
                }
            }
          })
          return newCategory;
    }

    async getCategories(userId: string){
        const connectedUser = await this.prisma.users.findUnique({where:{id: userId}});
        return await this.prisma.categories.findMany({where: {createdBy: {id: connectedUser?.id}}, include:{items: true}})
    }

    async getOneCategory(categoryId: string, userId: string) {
        const connectedUser = await this.prisma.users.findUnique({where:{id: userId}});
        return this.prisma.categories.findUnique({
            where: { id: categoryId, createdBy: {id: connectedUser?.id}  },
            include: { items: true } // Charge tous les items liés
        });
    }

    async deleteCategory (id: string){
        return await this.prisma.categories.delete({where: {id}})

    }

    async updateCategory(id:string, dto: CreateCategoryDto){
        return await this.prisma.categories.update({where:{id}, data:{title: dto.title }})
    }
}
