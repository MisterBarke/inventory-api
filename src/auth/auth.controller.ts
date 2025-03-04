import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/create-user.dto';
import { Public } from './decorators/public.decorator';
import { Roles } from './decorators/role.decorator';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @Post('login')
    signin(@Body() loginDto: LoginDto){
        return this.authService.login(loginDto);
    }
    @Public()
    @Roles('SUDO')
    @Post('register')
    register(@Body() registerDto: RegisterDto){
      return  this.authService.register(registerDto)
    }
}
