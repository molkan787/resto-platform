import { Plugin } from '@nuxt/types';
import { Strapi } from '~/interfaces/libraries/Strapi';
import { AppService } from '~/services/app-service';
import { AuthService } from '~/services/auth-service';
import { CartService } from '~/services/cart-service';
import { DataService } from '~/services/data-service';
import { OrderService } from '~/services/order-service';

declare module '@nuxt/types'{
    interface Context{
        $cartService: CartService;
        $dataService: DataService;
        $orderService: OrderService;
        $authService: AuthService;
        $appService: AppService;
        $strapi: Strapi;
    }
}

declare module 'vue/types/vue'{
    interface Vue{
        $cartService: CartService;
        $dataService: DataService;
        $orderService: OrderService;
        $authService: AuthService;
        $appService: AppService;
    }
}

const ServicesPlugin: Plugin = (context, inject) => {
    context.$cartService = new CartService(context);
    context.$dataService = new DataService(context);
    context.$orderService = new OrderService(context);
    context.$authService = new AuthService(context);
    context.$appService = new AppService(context);
    inject('cartService', context.$cartService);
    inject('dataService', context.$dataService);
    inject('orderService', context.$orderService);
    inject('authService', context.$authService);
    inject('appService', context.$appService);
}

export default ServicesPlugin;