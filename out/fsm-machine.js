"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Transition {
    constructor(fromState, event, callback, toState) {
        this.fromState = fromState;
        this.event = event;
        this.callback = callback;
        this.toState = toState;
    }
    toString() {
        return this.fromState.toString() + "|" + this.event.toString() + "|" + this.callback.name + "|" + this.toState.toString();
    }
}
exports.Transition = Transition;
class StateMachine {
    constructor(ctrl, initState, transitions) {
        this.ctrl = ctrl;
        this.initState = initState;
        this.transitions = transitions;
        this.current = this.ctrl.getState(initState);
    }
    getState() {
        return this.current;
    }
    is(state) {
        return this.getState().ID == state;
    }
    can(event) {
        for (const trans of this.transitions) {
            if (trans.fromState === this.current.ID && trans.event === event) {
                return true;
            }
        }
        return false;
    }
    isFinal() {
        for (const trans of this.transitions) {
            if (trans.fromState === this.current.ID) {
                return false;
            }
        }
        return true;
    }
    go(event, ...args) {
        for (const tran of this.transitions) {
            if (tran.fromState === this.current.ID && tran.event === event) {
                this.current.exit().then(() => {
                    return tran.callback(args);
                }).then(() => {
                    this.current = this.ctrl.getState(tran.toState);
                    this.current.enter();
                }).catch((reason) => {
                    console.error("FSM failure go next state, event: " + event + " reason: " + reason);
                });
                return true;
            }
        }
        console.error("FSM could not found state, event: " + event + " current state: " + this.current.ID);
        return false;
    }
    update(t) {
        if (this.transitions.length == 0)
            return;
        if (!this.current)
            return;
        this.current.update(t);
    }
    reset() {
        this.current = this.ctrl.getState(this.initState);
    }
}
exports.StateMachine = StateMachine;
//# sourceMappingURL=fsm-machine.js.map