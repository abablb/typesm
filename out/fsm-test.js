"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fsm = require("./fsm-machine");
var EState;
(function (EState) {
    EState[EState["idle"] = 0] = "idle";
    EState[EState["qianyao"] = 1] = "qianyao";
    EState[EState["att_01"] = 2] = "att_01";
    EState[EState["att_02"] = 3] = "att_02";
    EState[EState["att_03"] = 4] = "att_03";
    EState[EState["att_04"] = 5] = "att_04";
    EState[EState["att_05"] = 6] = "att_05";
    EState[EState["att_06"] = 7] = "att_06";
    EState[EState["att_07"] = 8] = "att_07";
    EState[EState["att_08"] = 9] = "att_08";
})(EState || (EState = {}));
;
var EEvent;
(function (EEvent) {
    EEvent[EEvent["idle"] = 0] = "idle";
    EEvent[EEvent["qianyao"] = 1] = "qianyao";
    EEvent[EEvent["att_01"] = 2] = "att_01";
    EEvent[EEvent["att_02"] = 3] = "att_02";
    EEvent[EEvent["att_03"] = 4] = "att_03";
    EEvent[EEvent["att_04"] = 5] = "att_04";
    EEvent[EEvent["att_05"] = 6] = "att_05";
    EEvent[EEvent["att_06"] = 7] = "att_06";
    EEvent[EEvent["att_07"] = 8] = "att_07";
    EEvent[EEvent["att_08"] = 9] = "att_08";
})(EEvent || (EEvent = {}));
;
class Tran extends fsm.Transition {
    toString() {
        return EState[this.fromState] + "|" + EEvent[this.event]
            + "|" + this.callback.name + "|" + EState[this.toState];
    }
}
;
class IdleState {
    constructor(ctrl) {
        this.ID = EState.idle;
        this.ctrl = ctrl;
    }
    enter() {
        console.log("// on enter");
    }
    exit() {
        console.log("// on exit");
        return Promise.resolve();
    }
    update(t) {
        console.log("// idle state update " + Date.now());
    }
}
class QianYaoState {
    constructor(ctrl) {
        this.ID = EState.qianyao;
        this.ctrl = ctrl;
    }
    enter() {
        console.log("// on enter QianYaoState");
    }
    exit() {
        console.log("// on exit QianYaoState");
        return Promise.resolve();
    }
    update(t) {
        console.log("// QianYaoState update " + Date.now());
    }
}
class AttackState {
    constructor(ctrl, id) {
        this.ID = id;
        this.ctrl = ctrl;
    }
    enter() {
        console.log("// on enter AttackState " + EState[this.ID]);
    }
    exit() {
        console.log("// on exit AttackState" + EState[this.ID]);
        return Promise.resolve();
    }
    update(t) {
        console.log("// AttackState update " + Date.now());
    }
}
class SkillControl {
    constructor() {
        this.states = new Array();
    }
    createFSM() {
        // 技能涉及的所有状态
        this.states.push(new IdleState(this));
        this.states.push(new QianYaoState(this));
        this.states.push(new AttackState(this, EState.att_01));
        this.states.push(new AttackState(this, EState.att_02));
        this.states.push(new AttackState(this, EState.att_03));
        // 构造当前技能涉及的状态转换列表
        // 技能1//  前摇 -> 攻击
        // idle -> qianyao -> att01 -> idle     // 上一个状态结束，自动触发下一个。链式执行
        // idle -> qianyao -> idle              // 状态有前置条件，自动分支到结束状态，否则链式执行
        // idle -> 追击 -> 攻击 -> 逃跑           // 固定AI行为状态（角色手动，角色自动，NPC)
        // 行走 <==> 快速移动 <==> 防守状态 + 反击  // 角色手动行为
        let trans = [
            new Tran(EState.idle, EEvent.qianyao, this.oNext, EState.qianyao),
            new Tran(EState.qianyao, EEvent.att_01, this.oNext, EState.att_01),
            new Tran(EState.att_01, EEvent.att_02, this.oNext, EState.att_02),
            new Tran(EState.att_02, EEvent.idle, this.oNext, EState.idle),
            new Tran(EState.qianyao, EEvent.idle, this.oNext, EState.idle),
        ];
        this.fsm = new fsm.StateMachine(this, EState.idle, trans);
    }
    // 默认转换实现
    oNext() {
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
    getState(id) {
        for (const state of this.states) {
            if (state.ID == id) {
                return state;
            }
        }
        throw new Error("the state could not found by id " + EState[id]);
    }
    updatePerception(t) {
        // 感知环境对自身的影响、同时响应事件
    }
    update(t) {
        // 心跳
        this.updatePerception(t);
        this.fsm.update(t);
    }
}
console.log("main enter ...");
let ctrl = new SkillControl();
ctrl.createFSM();
setInterval(function () {
    ctrl.update(0);
}, 1000 * 1);
// 模拟响应感知事件
setTimeout(function () {
    ctrl.fsm.go(EEvent.qianyao, 100);
}, 1000 * 2);
setTimeout(function () {
    ctrl.fsm.go(EEvent.att_01, 100);
}, 1000 * 5);
//# sourceMappingURL=fsm-test.js.map