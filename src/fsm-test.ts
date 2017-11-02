import * as fsm from "./fsm-machine";

enum EState {idle, qianyao, att_01, att_02, att_03, att_04, att_05, att_06, att_07, att_08};
enum EEvent {idle, qianyao, att_01, att_02, att_03, att_04, att_05, att_06, att_07, att_08};

class Tran extends fsm.Transition<EState, EEvent> {
    toString(): string {
        return EState[this.fromState as EState] + "|" + EEvent[this.event as EEvent] 
                + "|" + this.callback.name + "|" + EState[this.toState as EState];
    }
};

class IdleState implements fsm.State<EState,EEvent>{
    public ID: EState = EState.idle;
    public ctrl: SkillControl;

    public constructor(ctrl: SkillControl)
    {
        this.ctrl = ctrl;
    }

    public enter()
    {
        console.log("// on enter");
    }

    public exit(): Promise<void>
    {
        console.log("// on exit");
        return Promise.resolve()
    }

    public update(t: number)
    {
        console.log("// idle state update " + Date.now());
    }
}
class QianYaoState implements fsm.State<EState,EEvent>{
    public ID: EState = EState.qianyao;
    public ctrl: SkillControl;
    
    public constructor(ctrl: SkillControl)
    {
        this.ctrl = ctrl;
    }
    
    public enter()
    {
        console.log("// on enter QianYaoState");
    }

    public exit(): Promise<void>
    {
        console.log("// on exit QianYaoState");
        return Promise.resolve()
    }

    public update(t: number)
    {
        console.log("// QianYaoState update " + Date.now());
    }
}
class AttackState implements fsm.State<EState,EEvent>{
    public ID: EState;
    public ctrl: SkillControl;
    
    public constructor(ctrl: SkillControl, id: EState)
    {
        this.ID = id;
        this.ctrl = ctrl;
    }

    public enter()
    {
        console.log("// on enter AttackState " + EState[this.ID]);
    }

    public exit(): Promise<void>
    {
        console.log("// on exit AttackState" + EState[this.ID]);
        return Promise.resolve()
    }

    public update(t: number)
    {
        console.log("// AttackState update " + Date.now());
    }
}

class SkillControl implements fsm.Control<EState,EEvent>{
    public fsm: fsm.StateMachine<EState,EEvent>;
    public states: Array<fsm.State<EState,EEvent>>;

    public constructor()
    {
        this.states = new Array();
    }

    public createFSM()
    {
        // 技能涉及的所有状态
        this.states.push(new IdleState(this));
        this.states.push(new QianYaoState(this));
        this.states.push(new AttackState(this,EState.att_01));
        this.states.push(new AttackState(this,EState.att_02));
        this.states.push(new AttackState(this,EState.att_03));

        // 构造当前技能涉及的状态转换列表
        // 技能1//  前摇 -> 攻击
        // idle -> qianyao -> att01 -> idle     // 上一个状态结束，自动触发下一个。链式执行
        // idle -> qianyao -> idle              // 状态有前置条件，自动分支到结束状态，否则链式执行
        // idle -> 追击 -> 攻击 -> 逃跑           // 固定AI行为状态（角色手动，角色自动，NPC)
        // 行走 <==> 快速移动 <==> 防守状态 + 反击  // 角色手动行为

        let trans: Tran[] =
        [
            new Tran(EState.idle, EEvent.qianyao, this.oNext, EState.qianyao),
            new Tran(EState.qianyao, EEvent.att_01, this.oNext, EState.att_01),
            new Tran(EState.att_01, EEvent.att_02, this.oNext, EState.att_02),
            new Tran(EState.att_02, EEvent.idle, this.oNext, EState.idle),
            new Tran(EState.qianyao, EEvent.idle, this.oNext, EState.idle),
        ];
        
        this.fsm = new fsm.StateMachine(this, EState.idle, trans);
    }

    // 默认转换
    oNext(): Promise<void>
    {
        console.log("on next");
        return Promise.resolve();
        // let p : Promise<void> = new Promise<void>((resolve, reject)=>{
        //     setTimeout(function() {
        //         console.log("set resolve");
        //         resolve();    
        //     }, 1000*1);
        // })
        // return p;
    }

    public getState(id: EState): fsm.State<EState,EEvent>
    {
        for(const state of this.states)
        {
            if (state.ID == id)
            {
                return state;
            }
        }
        throw new Error("the state could not found by id " + EState[id]);
    }
    public updatePerception(t: number)
    {
        // 感知环境对自身的影响、同时响应事件
    }

    public update(t: number)
    {
        // 心跳
        this.updatePerception(t);
        this.fsm.update(t);
    }
}


console.log("main enter ...");

let ctrl: SkillControl = new SkillControl();
ctrl.createFSM();

setInterval(function() {
    ctrl.update(0);
}, 1000 * 1);

// 模拟响应感知事件
setTimeout(function() {
    ctrl.fsm.go(EEvent.qianyao, 100);
}, 1000 * 2);

setTimeout(function() {
    ctrl.fsm.go(EEvent.att_01, 100);
}, 1000 * 5);