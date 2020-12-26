import { Plugin } from "@nuxt/types";

const CookieExpireTime: Plugin = (context) => {
    const { $cookies } = context.app;
    const _set = $cookies.set;
    $cookies.set = (name: string, value: string, options: any) => {
        const date = new Date();
        date.setFullYear(date.getFullYear() + 1);
        _set(name, value, {
            ...options,
            expires: date,
            maxAge: 60 * 60 * 24 * 365
        });
    }
}

export default CookieExpireTime;