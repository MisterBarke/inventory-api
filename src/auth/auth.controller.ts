import { Body, Controller, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/create-user.dto';
import { Public } from './decorators/public.decorator';
import { Roles } from './decorators/role.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @Post('login')
    signin(@Body() loginDto: LoginDto){
        return this.authService.login(loginDto);
    }

    @Roles('SUDO')
    @Post('register')
    register(@Body() registerDto: RegisterDto){
      return  this.authService.register(registerDto)
    }

    @Post('password/update')
    @ApiBearerAuth()
    updatePassword(@Body('password') password: string, @Req() request: any) {
      return this.authService.updatePassword(request.user.id, password);
    }
}
