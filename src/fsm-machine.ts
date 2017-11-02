
export interface State<S,E> 
{
    ID: S;
    enter(): void;
    exit(): Promise<void>;
    update(t: number): void;
}      

export interface Control<S,E> 
{
    getState(id: S): State<S,E>;
    update(t: number): void;
    updatePerception(t:number): void;
}   

export class Transition<S, E> 
{
    constructor(
        public fromState: S,
        public event: E,
        public callback: (...args: any[]) => Promise<void>,
        public toState: S
    ) { }

    toString(): string {
        return this.fromState.toString() + "|" + this.event.toString() + "|" + this.callback.name + "|" + this.toState.toString();
    }
}

export class StateMachine<S, E> 
{
    protected initState: S;
    protected current: State<S,E>;
    protected transitions: Array<Transition<S, E>>;
    protected ctrl: Control<S,E>;

    public constructor(ctrl: Control<S,E>, initState: S, transitions: Array<Transition<S, E>>)
    {
       this.ctrl = ctrl;
       this.initState = initState;
       this.transitions = transitions;
       this.current = this.ctrl.getState(initState);
    }

    public getState(): State<S,E> 
    {
        return this.current;
    }

    public is(state: S): boolean
    {
        return this.getState().ID == state;
    }

    public can(event: E): boolean {
        for (const trans of this.transitions)
        {
            if (trans.fromState === this.current.ID && trans.event === event)
            {
                return true;
            }
        }
        return false;
    }

    public isFinal(): boolean 
    {
        for (const trans of this.transitions) 
        {
            if (trans.fromState === this.current.ID) 
            {
                return false;
            }
        }
        return true;
    }

    public go(event: E, ...args: any[]): boolean 
    {
        for (const tran of this.transitions)
        {
            if (tran.fromState === this.current.ID && tran.event === event)
            {
                this.current.exit().then(()=>
                {
                    return tran.callback(args);

                }).then(() => 
                {
                    this.current = this.ctrl.getState(tran.toState);
                    this.current.enter();

                }).catch((reason) =>
                {
                    console.error("FSM failure go next state, event: " + event + " reason: " + reason);
                });
                
                return true; 
            }
        }

        console.error("FSM could not found state, event: " + event + " current state: " + this.current.ID);
        return false;  
    }

    public update(t: number)
    {
        if (this.transitions.length == 0)
            return;

        if (!this.current)
            return;

        this.current.update(t);
    }

    public reset()
    {
        this.current = this.ctrl.getState(this.initState);
    }
}
