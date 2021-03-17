import { Service } from "./service";
import { loadStripe, Stripe } from '@stripe/stripe-js';

export class PaymentService extends Service{

    private stripeInstance: Stripe | null = null;

    public async getStripe(){
        if(this.stripeInstance == null){
            this.stripeInstance = await loadStripe(this.state.paymentSettings.stripePk);
        }
        if(this.stripeInstance == null){
            throw new Error('Could not load stripe.');
        }
        return this.stripeInstance;
    }

}