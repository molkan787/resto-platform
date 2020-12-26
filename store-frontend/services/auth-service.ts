import { StrapiLoginForm, StrapiRegisterForm } from "~/interfaces/libraries/Strapi";
import { Service } from "./service";

export class AuthService extends Service{

    public async registerUser(form: StrapiRegisterForm){
        const response = await this.context.$strapi.register(form);
        return response;
    }
    
    public async loginUser(form: StrapiLoginForm){
        const response =  await this.context.$strapi.login(form);
        return response;
    }

}