import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, signUpDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('signup')
    @HttpCode(201)
    signUp(@Body() body: signUpDto) {
      return this.authService.signUp(body);
    }

    @Post('signin')
    @HttpCode(200)
    signIn(@Body() body: AuthDto) {
      return this.authService.signIn(body);
    }
}
