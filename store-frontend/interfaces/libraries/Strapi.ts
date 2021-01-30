export interface Strapi{
    $http: any;
    find: (entity: string, params?: any) => Promise<any[]>;
    count: (entity: string, params?: any) => Promise<number>;
    findOne: (entity: string, id: number) => Promise<any>;
    create: (entity: string, data: any) => Promise<any>;
    update: (entity: string, id: number, data: any) => Promise<any>;
    delete: (entity: string, id: number) => Promise<any>;
    register: (form: StrapiRegisterForm) => Promise<any>;
    login: (form: StrapiLoginForm) => Promise<any>;
    forgotPassword: (form: StrapiForgotPasswordForm) => Promise<any>;
    sendEmailConfirmation: (form: StrapiSendEmailConfirmationForm) => Promise<any>;
    logout: () => Promise<any>;
    setToken: (token: string) => any;
    fetchUser: () => Promise<any>;
}

export interface StrapiRegisterForm{
    username: string;
    fullname: string;
    email: string;
    password: string;
    phone: string;
}

export interface StrapiLoginForm{
    identifier: string;
    password: string;
}

export interface StrapiForgotPasswordForm{
    email: string;
}

export interface StrapiSendEmailConfirmationForm{
    email: string;
}