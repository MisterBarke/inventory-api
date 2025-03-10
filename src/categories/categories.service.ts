import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { isEmpty } from 'class-validator';
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

          await this.prisma.history.create({
            data: {
                categoryId: newCategory.id,
                userId: userId,
                action: "Added new",
                newValue: JSON.stringify({ title: newCategory.title }),
                oldValue: {}
            }
        });

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
            include: { items: true } 
        });
    }

    async deleteCategory (id: string, userId: string){
        const connectedUser = await this.prisma.users.findUnique({where:{id: userId}});
        const category = await this.prisma.categories.findUnique({
            where: { id },
            include: { items: true } // Inclure les items associés
          });
        
          if (!category) {
            throw new NotFoundException("Catégorie introuvable");
          }
        
          if (category.items.length > 0) {
            throw new BadRequestException("Impossible de supprimer : La catégorie contient des produits.");
          }
        
          // Suppression de la catégorie si elle est vide
          const deletedCat = await this.prisma.categories.delete({
            where: { id,
                createdBy: {
                    id: connectedUser?.id
                }
             }
          });

          const deletedFields = {
           title: deletedCat.title,
            user:{
              userName: connectedUser?.name,
              userId: connectedUser?.id
            },
        };

        await this.prisma.history.create({
            data: {
                userId: userId,
                action: "Deleted",
                newValue: {},
                oldValue: deletedFields
            }
        });

        return deletedCat;
    }

    async updateCategory(id:string, dto: CreateCategoryDto, userId: string){
        const connectedUser = await this.prisma.users.findUnique({where:{id: userId}});

        const category = await this.prisma.categories.findUnique({
            where: { id },
          });

        const updatedCat = await this.prisma.categories.update({where:{id, createdBy: {id: connectedUser?.id}}, data:{title: dto.title }});

        await this.prisma.history.create({
            data: {
                categoryId: updatedCat.id,
                userId: userId,
                action: "Updated",
                newValue: JSON.stringify({ title: updatedCat.title }),
                oldValue: JSON.stringify({title: category!.title})
            }
        });

        return updatedCat;
    }
}
