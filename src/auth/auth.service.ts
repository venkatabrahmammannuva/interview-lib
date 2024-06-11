import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { AuthDto, signUpDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private config: ConfigService,
        private jwt: JwtService
    ){}

    async signUp(userReq: signUpDto) {
        try {
            const userExists = await this.prisma.users.findUnique({
              where: {
                email: userReq.email,
              },
            });
            if (userExists) throw new ForbiddenException("User already registered.");

            return await this.createUser(userReq)
        } catch (error) {
          if(error.response.error != 'Forbidden')
            throw new ForbiddenException("Invalid email.");
          else throw error;
        }
    }

    async createUser(userReq:signUpDto){
        try{
          let hash = null
          if(userReq.password){
            const salt = bcrypt.genSaltSync(10);
            hash = bcrypt.hashSync(userReq.password, salt);
          }
          
          const user = await this.prisma.users.create({
            data: {
                name: userReq.name,
                email: userReq.email,
                password_hash: hash,
                status: "ACTIVE"
            },
          });
          const data = await this.signInToken(user);
          return {
            statusCode: 200,
            message: "Sign up successfully.",
            data: data
          }
        }catch(error){
          throw new BadRequestException("Something went wrong.")
        }
      }

      async signInToken(user:any) {
        const payload = {
          id: user.id,
          email: user.email
        }
        try{
          const access_token = await this.jwt.signAsync(payload, {
            expiresIn: '24h',
            secret: this.config.get('JWT_SECRET')
          });
          const refresh_token = await this.jwt.signAsync(payload,{
            expiresIn: '30d',
            secret: this.config.get('JWT_REFRESH_SECRET')
          })

          const data = {
              id: user.id,
              name:user.name,
              email: user.email, 
              accessToken: access_token,
              refreshToken:refresh_token
          }
          
          return data
        }catch(error){
          if (error.response.error != 'Forbidden')
            throw new BadRequestException("Something went wrong.");
          else throw error;
        }
    }

    async signIn(authReq: AuthDto) {
        try {
          // Find the user by email
          const user = await this.prisma.users.findUnique({
            where: {
              email: authReq.email,
            },
          });
    
          if (!user) throw new ForbiddenException("Invalid email.");
    
          let pwdMatch = null;
          //Compare password
          if (user.password_hash)
            pwdMatch = bcrypt.compareSync(authReq.password, user.password_hash);
            // pwdMatch = await argon.verify(user.password_hash, authReq.password);

          if (!pwdMatch)
            throw new ForbiddenException("Invalid password.");

          const data = await this.signInToken(user);
          return {
            statusCode: 200,
            message: "Login successfully.",
            data: data
          }
        } catch (error) {
          if (error.response.error != 'Forbidden')
            throw new BadRequestException("Something went wrong.");
          else throw error;
        }
    }
}
