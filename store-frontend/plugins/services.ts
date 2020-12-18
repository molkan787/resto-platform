import { Plugin } from '@nuxt/types';
import { CartService } from '~/services/cart-service';
import { DataService } from '~/services/data-service';
import { OrderService } from '~/services/order-service';

declare module '@nuxt/types'{
    interface Context{
        $cartService: CartService;
        $dataService: DataService;
        $orderService: OrderService;
        $strapi: any;
    }
}

declare module 'vue/types/vue'{
    interface Vue{
        $cartService: CartService;
        $dataService: DataService;
        $orderService: OrderService;
    }
}

const MyPlugin: Plugin = (context, inject) => {
    context.$cartService = new CartService(context);
    context.$dataService = new DataService(context);
    context.$orderService = new OrderService(context);
    inject('cartService', context.$cartService);
    inject('dataService', context.$dataService);
    inject('orderService', context.$orderService);
}

export default MyPlugin;