import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateCompanyDto, LoginDto, RegisterDto } from './dto/create-user.dto';
import { Public } from './decorators/public.decorator';
import { Roles } from './decorators/role.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @Post('login')
    signin(@Body() loginDto: LoginDto){
        return this.authService.login(loginDto);
    }

    @Roles('SUDO')
    @Post(':companyId/register')
    register(@Body() registerDto: RegisterDto, @Param('companyId') companyId){
      return  this.authService.register(registerDto, Role.SELLER, companyId)
    }

    @Roles('SUDO')
    @Post('createCompany')
    createCompany(@Body() createCompanyDto: CreateCompanyDto){
      return  this.authService.createCompany(createCompanyDto)
    }

    @Roles('SUDO')
    @Get('companies')
    getCompanies(){
      return  this.authService.getCompanies()
    }


    @Post('password/update')
    @ApiBearerAuth()
    updatePassword(@Body('password') password: string, @Req() request: any) {
      return this.authService.updatePassword(request.user.id, password);
    }
}
