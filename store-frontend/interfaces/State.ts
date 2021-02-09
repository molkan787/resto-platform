import { state as _state, getters } from '@/store';

export type State = ReturnType<typeof _state>;

type PropsReturnType<T extends Object> = {
    [K in keyof T]: T[K] extends (...args: any[]) => any ? ReturnType<T[K]> : T[K];
};

export type StoreGetters = PropsReturnType<typeof getters>;