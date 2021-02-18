export const MOBILE_MAX_WIDTH = 768;

export default class isMobile{

    public state: boolean;
    private resizeHandler: (event: UIEvent) => void;

    constructor(private readonly callback?: (state: boolean) => void ){
        this.state = window.outerWidth <= MOBILE_MAX_WIDTH;
        this.callback && this.callback(this.state);
        this.resizeHandler = (event: UIEvent) => this.onWindowResized(event);
        window.addEventListener('resize', this.resizeHandler);
    }

    private onWindowResized(event: UIEvent){
        const prev = this.state;
        this.state = window.outerWidth <= MOBILE_MAX_WIDTH;
        if(this.callback && prev != this.state){
            this.callback(this.state);
        }
    }

    public destroy(){
        window.removeEventListener('resize', this.resizeHandler);
    }

}