import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RequestOtpDto, VerifyOtpDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('otp/request')
    requestOtp(@Body() dto: RequestOtpDto) {
        return this.authService.requestOtp(dto);
    }

    @Post('otp/verify')
    verifyOtp(@Body() dto: VerifyOtpDto) {
        return this.authService.verifyOtp(dto);
    }
}