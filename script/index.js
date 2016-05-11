// Which floor are you going to
/**
 * KeyConfig
 */
class KeyConfig {
}
// Human:
KeyConfig.humanAnimationInterval = 150;
// Loading:
KeyConfig.loadingAnimationDuration = 8000;
function PickOneRandomly(array) {
    return array[Math.floor(Math.random() * array.length)];
}
/**
 * Size
 */
class Size {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
}
/**
 * Origin
 */
class Origin {
    constructor(x, y, width, height) {
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
    }
}
/**
 * ComicWindow
 */
class ComicWindow extends Phaser.Group {
    constructor(game, name = 'ComicWindow') {
        super(game, game.world, name);
        this.enablebackground = false;
        this._backgroundColor = 0xffffff;
        this.maskGraphics = game.add.graphics(0, 0);
        this.backgroundGraphics = this.add(new Phaser.Graphics(game, 0, 0));
    }
    set origin(origin) {
        this._display_origin = origin;
        this.maskGraphics.clear();
        this.x = this.maskGraphics.x = origin.x;
        this.y = this.maskGraphics.y = origin.y;
        this.maskGraphics.beginFill(0x000000);
        this.maskGraphics.x = origin.x;
        this.maskGraphics.y = origin.y;
        this.maskGraphics.drawRect(0, 0, origin.width, origin.height);
        this.maskGraphics.endFill();
        this.mask = this.maskGraphics;
        this.updateBackground();
    }
    get origin() {
        return this._display_origin;
    }
    fadeIn(duration, delay, color = 0x000000) {
        let top = this.add(new Phaser.Graphics(this.game, 0, 0));
        top.beginFill(color);
        top.drawRect(0, 0, this._display_origin.width, this._display_origin.height);
        top.endFill();
        this.game.add.tween(top).to({ alpha: 0 }, duration, null, true, delay);
    }
    set backgroundColor(color) {
        this._backgroundColor = color;
        this.updateBackground();
    }
    updateBackground() {
        this.backgroundGraphics.clear();
        if (this.enablebackground && this._display_origin) {
            this.backgroundGraphics.beginFill(this._backgroundColor);
            this.backgroundGraphics.drawRect(0, 0, this._display_origin.width, this._display_origin.height);
            this.backgroundGraphics.endFill();
        }
    }
}
/**
 * ElevatorHumanNotMachine
 */
class ElevatorHumanNotMachine extends Phaser.Group {
    constructor(game, x, y) {
        super(game, game.world, 'ElevatorHumanNotMachine');
        this.busy = false;
        this.x = x;
        this.y = y;
        this.human = this.add(new Phaser.Sprite(this.game, 0, 0, 'animate-human'));
        this.hangup = this.add(new Phaser.Sprite(this.game, 0, 0, 'animate-hangup'));
        this.hangup.animations.add('hangup');
        this.hangup.alpha = 0;
        this.press = this.add(new Phaser.Sprite(this.game, 0, 0, 'animate-human-press'));
        this.press.animations.add('press').delay = 150;
        this.press.alpha = 0;
        var loopTimer = this.game.time.create(false);
        loopTimer.loop(KeyConfig.humanAnimationInterval, () => {
            let newFrame = 0;
            do {
                newFrame = Math.floor(Math.random() * 7);
            } while (newFrame == this.human.frame);
            this.human.frame = newFrame;
        }, this);
        loopTimer.start();
        this.desk = new Phaser.Sprite(this.game, 0, -56, 'desk');
        this.leavingAnimation = new AcrossFadingAnimation(this.game, null, 0, -56, 'animate-human-stand', 8, 300);
    }
    performPressAction(finished, context) {
        this.busy = true;
        this.game.time.events.add(500, () => {
            this.human.alpha = 0;
            this.press.alpha = 1;
            var instanceOfAnimation = this.press.play('press');
            instanceOfAnimation.onComplete.add(() => {
                this.busy = false;
                this.human.alpha = 1;
                this.press.alpha = 0;
            }, this);
            this.game.time.events.add(810, finished, context);
        }, this);
    }
    performHangupAction(finished, context) {
        this.busy = true;
        this.human.alpha = 0;
        this.hangup.alpha = 1;
        var instanceOfAnimation = this.hangup.play('hangup', 8, false);
        instanceOfAnimation.onComplete.addOnce(() => {
            this.busy = false;
            this.human.alpha = 1;
            this.hangup.alpha = 0;
        }, this);
        if (finished) {
            instanceOfAnimation.onComplete.addOnce(finished, context);
        }
    }
    leave() {
        this.add(this.desk);
        this.add(this.leavingAnimation);
        this.leavingAnimation.play(true);
        this.game.time.events.add(this.leavingAnimation.acrossTime, () => {
            this.remove(this.human);
        }, this);
    }
}
/**
 * ElevatorHumanScene
 */
class ElevatorHumanScene extends ComicWindow {
    constructor(game) {
        super(game, 'ElevatorHumanScene');
        this.add(new Phaser.Sprite(this.game, 0, 0, 'elevator-background'));
        this.human = this.add(new ElevatorHumanNotMachine(game, 0, 84));
        this.elevatorPassengerContainer = this.add(new ElevatorHumanResourceDept(this.game, this.game.world, false));
        this.elevatorPassengerContainer.x = 0;
        this.elevatorPassengerContainer.y = 213;
        this.overlayTelephone = new Phaser.Sprite(this.game, 0, 0, 'telephone-left');
    }
}
/**
 * TelephoneScene
 */
class TelephoneScene extends ComicWindow {
    constructor(game) {
        super(game, 'TelephoneScene');
        this.add(new Phaser.Sprite(this.game, -2, 0, 'telephone'));
        this.light = this.add(new Phaser.Sprite(this.game, -2, 0, 'telephone-light'));
        this.light.alpha = 0;
        this.add(new Phaser.Sprite(this.game, -2, 0, 'telephone', 1));
        this.earpiece = this.add(new Phaser.Sprite(this.game, -2, 0, 'telephone-earpiece'));
        this.ring = new Phaser.Sound(this.game, 'audio-telephone-ring', 1, true);
        this.hand = this.add(new Phaser.Sprite(this.game, 80, 240, 'hand'));
    }
    ringByEventType(type) {
        this.ring.play();
        this.light.frame = type;
        this.light.alpha = 1;
    }
    takePhone() {
        this.earpiece.alpha = 0;
        this.ring.stop();
    }
    hangup() {
        this.earpiece.alpha = 1;
        this.performHangupAction();
        this.game.time.events.add(800, () => {
            this.light.alpha = 0;
        }, this);
    }
    performHangupAction() {
        this.earpiece.x = 95;
        this.earpiece.y = 230;
        this.game.add.tween(this.earpiece).to({ x: -2, y: 0 }, 800, Phaser.Easing.Cubic.Out).start();
        this.hand.x = 95 - 10;
        this.hand.y = 230 + 40;
        this.game.add.tween(this.hand).to({ x: -2 - 10, y: 0 + 40 }, 800, Phaser.Easing.Cubic.Out, true, 0, 0, true);
    }
}
/**
 * ActionButton
 */
class ActionButton extends Phaser.Button {
    constructor(game, x, y, width, action, delay) {
        super(game, x, y - 8);
        this.alpha = 0;
        this.game.add.tween(this).to({ y: y, alpha: 1 }, 300, Phaser.Easing.Circular.Out, true, delay);
        this.actionWidth = width;
        this.action = action;
        this.background = this.addChild(new Phaser.Graphics(this.game, 0, 0));
        let text = this.textObject = this.addChild(new Phaser.Text(this.game, ActionButton.padding, ActionButton.padding, action.text, ActionButton.style));
        text.wordWrapWidth = width - ActionButton.padding * 2;
        text.lineSpacing = -6;
        this.onInputOver.add(() => {
            this.redrawBackground(0xffffff);
        }, this);
        this.onInputOut.add(() => {
            this.redrawBackground(0xcccccc);
        }, this);
        this.onInputOut.dispatch();
    }
    redrawBackground(color) {
        this.background.clear();
        if (this.action.enabled) {
            this.background.beginFill(color);
        }
        else {
            this.background.beginFill(0x777777);
            this.inputEnabled = false;
        }
        this.background.lineStyle(1, 0x000000, 0.7);
        this.background.drawRoundedRect(0, 0, this.actionWidth, this.textObject.getLocalBounds().height + ActionButton.padding * 2 - 2, 2);
        this.background.endFill();
    }
}
ActionButton.style = { font: 'normal 8pt Marker Felt', fill: 0x333333, align: 'left', wordWrap: true };
ActionButton.padding = 6;
/**
 * ActionScene
 */
class ActionScene extends ComicWindow {
    constructor(game) {
        super(game, 'ActionScene');
        this.isOpen = false;
        this.enablebackground = false;
    }
    open(actionList, callback, context) {
        if (this.isOpen) {
            this.close();
        }
        this.isOpen = true;
        // this.mask = null
        // Circles
        var littleCircle = this.game.add.graphics(this.x + this.origin.width - 17, this.y - 22 - 8);
        littleCircle.beginFill(0xeeeeee);
        littleCircle.lineStyle(1, 0x444444);
        littleCircle.drawCircle(5, 5, 7);
        littleCircle.endFill();
        this.game.add.tween(littleCircle).to({ y: this.y - 22 }, 300, Phaser.Easing.Circular.Out, true);
        var bigCircle = this.game.add.graphics(this.x + this.origin.width - 16, this.y - 17 - 8);
        this.game.time.events.add(100, () => {
            bigCircle.beginFill(0xeeeeee);
            bigCircle.lineStyle(1, 0x444444);
            bigCircle.drawCircle(7, 7, 11);
            bigCircle.endFill();
            this.game.add.tween(bigCircle).to({ y: this.y - 17 }, 300, Phaser.Easing.Circular.Out, true);
        }, this);
        var hugeCircle = this.game.add.graphics(this.x + this.origin.width - 22, this.y - 10 - 8);
        this.game.time.events.add(200, () => {
            hugeCircle.beginFill(0xeeeeee);
            hugeCircle.lineStyle(1, 0x444444);
            hugeCircle.drawCircle(7, 7, 14);
            hugeCircle.endFill();
            this.game.add.tween(hugeCircle).to({ y: this.y - 10 }, 300, Phaser.Easing.Circular.Out, true);
        }, this);
        // Actions
        let actionButtons = [];
        let lastHeight = 0;
        var close = this.close = () => {
            this.isOpen = false;
            littleCircle.destroy();
            bigCircle.destroy();
            hugeCircle.destroy();
            for (var index = actionButtons.length - 1; index >= 0; index--) {
                actionButtons[index].destroy();
            }
        };
        actionList.forEach((action, index) => {
            let button = this.add(new ActionButton(this.game, 0, lastHeight, this.origin.width, action, 300 + index * 100));
            actionButtons.push(button);
            lastHeight = lastHeight + 4 + button.background.height;
            if (action.enabled) {
                button.onInputDown.addOnce(() => {
                    actionButtons.forEach((buttonForFade, index) => {
                        buttonForFade.inputEnabled = false;
                        if (buttonForFade != button) {
                            this.game.add.tween(buttonForFade).to({ alpha: 0.2 }, 300, Phaser.Easing.Circular.Out, true, index * 50);
                        }
                    });
                    [littleCircle, bigCircle, hugeCircle].concat(actionButtons).forEach((object, index, processingArray) => {
                        this.game.time.events.add(400 + index * 50, () => {
                            this.game.add.tween(object).to({ alpha: 0 }, 300, Phaser.Easing.Circular.Out, true);
                        }, this);
                        if (processingArray.length == index + 1) {
                            this.game.time.events.add(400 + index * 50 + 300, () => {
                                this.close();
                            }, this);
                        }
                    });
                    this.game.time.events.add(400, callback, context, action);
                }, this);
            }
        });
    }
}
var ElevatorPassengerType;
(function (ElevatorPassengerType) {
    // Expellable
    ElevatorPassengerType[ElevatorPassengerType["Normal"] = 0] = "Normal";
    ElevatorPassengerType[ElevatorPassengerType["Squid"] = 1] = "Squid";
    // Unexpellable
    ElevatorPassengerType[ElevatorPassengerType["Manager"] = 2] = "Manager";
    ElevatorPassengerType[ElevatorPassengerType["Gift"] = 3] = "Gift";
    ElevatorPassengerType[ElevatorPassengerType["Chair"] = 4] = "Chair";
    ElevatorPassengerType[ElevatorPassengerType["BedMan"] = 5] = "BedMan";
    ElevatorPassengerType[ElevatorPassengerType["Coffee"] = 6] = "Coffee";
})(ElevatorPassengerType || (ElevatorPassengerType = {}));
var ElevatorPassengerState;
(function (ElevatorPassengerState) {
    ElevatorPassengerState[ElevatorPassengerState["OnHold"] = 0] = "OnHold";
    ElevatorPassengerState[ElevatorPassengerState["OnBoard"] = 1] = "OnBoard";
})(ElevatorPassengerState || (ElevatorPassengerState = {}));
/**
 * ElevatorPassenger
 */
class ElevatorPassenger extends Phaser.Sprite {
    constructor(game, type, key) {
        super(game, 0, 0, key);
        this.passengerAutoSpeaked = false;
        this.speakPermission = {
            whichFloor: true,
            howsTheWork: true,
            whatsTheWeather: true,
            howAreYou: true,
        };
        this._grayTint = 0x0000ff;
        this.anchor.set(0.5, 1.0);
        this.type = type;
    }
    get lines() {
        return {
            whichFloor: (() => {
                switch (this.destFloor) {
                    case 0:
                        return 'Ground floor';
                    case 1:
                        return 'First floor';
                    case 2:
                        return 'Second floor';
                    case 3:
                        return 'Third floor';
                    default:
                        return this.destFloor + 'th' + (Math.random() > 0.5 ? '' : ' floor');
                }
            })() + PickOneRandomly([', please', '']),
            howsTheWork: PickOneRandomly([
                'It\'s going fine',
                'thanks, As usual',
                'It\'s going well',
                'Not Bad',
            ]),
            whatsTheWeather: PickOneRandomly([
                'I hope it\'s a clear day',
                'Guess it\'s sunny',
                'Haven\'t checked it yet',
                'I don\'t know',
            ]),
            howAreYou: PickOneRandomly([
                'Fine, thank you',
                'Upright and still breathing',
                'Same old, same old',
                'Good',
            ]),
        };
    }
    get grayTint() {
        return this._grayTint;
    }
    set grayTint(tint) {
        this.tint = 0x010101 * Math.ceil(tint);
        this._grayTint = tint;
    }
    performIntroAnimation(delay = 0) {
        this.grayTint = 0x000001;
        this.alpha = 0;
        this.game.add.tween(this).to({ alpha: 1, grayTint: 0x0000ff }, ElevatorPassenger.animationDuration, Phaser.Easing.Cubic.In, true, delay);
    }
    performFeawellAnimation() {
        this.grayTint = 0x0000ff;
        this.alpha = 1;
        this.game.add.tween(this).to({ alpha: 0, grayTint: 0x000001 }, ElevatorPassenger.animationDuration, Phaser.Easing.Cubic.Out, true);
    }
}
ElevatorPassenger.animationDuration = 1400;
/**
 * ElevatorPassengerSquid
 */
class ElevatorPassengerSquid extends ElevatorPassenger {
    constructor(game, frame) {
        super(game, ElevatorPassengerType.Squid, 'passengers-squid');
        this.speakPermission = {
            whichFloor: true,
            howsTheWork: true,
            whatsTheWeather: true,
            howAreYou: true,
        };
        this.frame = frame;
        this.destFloor = 0;
        switch (this.frame) {
            case 0:
            case 1:
                this.waitingFloor = 2;
                break;
            case 2:
            case 3:
                this.waitingFloor = 9;
                break;
            case 4:
                this.waitingFloor = 12;
                break;
        }
    }
    get lines() {
        return {
            whichFloor: super.lines.whichFloor,
            howsTheWork: '...',
            whatsTheWeather: '...',
            howAreYou: '...'
        };
    }
}
/**
 * ElevatorPassengerNormal
 */
class ElevatorPassengerNormal extends ElevatorPassenger {
    constructor(game) {
        super(game, ElevatorPassengerType.Normal, 'passengers-normal');
        this.frame = Math.floor(Math.random() * 8);
        if (Math.random() > 0.7) {
            if (Math.random() > 0.5) {
                this.waitingFloor = 0;
                this.destFloor = Math.floor(1 + Math.random() * 13);
            }
            else {
                this.destFloor = 0;
                this.waitingFloor = Math.floor(1 + Math.random() * 13);
            }
        }
        else {
            this.waitingFloor = Math.floor(0 + Math.random() * 14);
            do {
                this.destFloor = Math.floor(0 + Math.random() * 14);
            } while (this.waitingFloor == this.destFloor);
        }
    }
}
/**
 * ElevatorPassengerManager
 */
class ElevatorPassengerManager extends ElevatorPassenger {
    constructor(game) {
        super(game, ElevatorPassengerType.Manager, 'passenger-managers');
        this.destFloor = 13;
        this.waitingFloor = 3;
    }
    get lines() {
        return {
            whichFloor: '13th, haven\'t the telephone guy told you already?',
            howsTheWork: 'As long as you keep the elevator running, it will be fine',
            whatsTheWeather: 'It has nothing to do with neither of our work',
            howAreYou: 'I am',
        };
    }
}
/**
 * ElevatorPassengerGift
 */
class ElevatorPassengerGift extends ElevatorPassenger {
    constructor(game, frame) {
        super(game, ElevatorPassengerType.Gift, 'passengers-gift');
        this.frame = frame;
        switch (this.frame) {
            case 0:
                this.destFloor = 2;
                break;
            case 1:
                this.destFloor = 9;
                break;
            case 2:
                this.destFloor = 12;
                break;
        }
        // console.log(this.frame + ' frame | destFloor ' + this.destFloor)
        this.waitingFloor = -1;
    }
    get lines() {
        return {
            whichFloor: '2nd floor, 9th floor, and then 12th floor',
            howsTheWork: 'Couldn\'t be better, see? Delivering the company\'s gratitude to our employees',
            whatsTheWeather: 'Bad, the basement is almost flooded, ruined half of our prepared gift',
            howAreYou: 'Good as a good gift manager',
        };
    }
}
/**
 * ElevatorPassengerChair
 */
class ElevatorPassengerChair extends ElevatorPassenger {
    constructor(game) {
        super(game, ElevatorPassengerType.Chair, 'passenger-chairs');
        this.waitingFloor = 11;
        this.destFloor = 4;
    }
    get lines() {
        return {
            whichFloor: 'Is it 4th floor, isn\'t it?',
            howsTheWork: 'Best as I could',
            whatsTheWeather: 'Who knows? Who cares?',
            howAreYou: 'How am I what?',
        };
    }
}
/**
 * ElevatorPassengerBedMan
 */
class ElevatorPassengerBedMan extends ElevatorPassenger {
    constructor(game) {
        super(game, ElevatorPassengerType.BedMan, 'passenger-bedman');
        this.waitingFloor = 3;
        this.destFloor = 10;
    }
    get lines() {
        return {
            whichFloor: 'I thought it has already been notified, it\'s 10th then',
            howsTheWork: 'Improving. Slightly, no, noticeably better than yesterday',
            whatsTheWeather: 'Changing. Mostly cloudy, showers around, getting colder',
            howAreYou: '3.5 out of 5, I could complain, but I\'m not going to',
        };
    }
}
/**
 * ElevatorPassengerCoffee
 */
class ElevatorPassengerCoffee extends ElevatorPassenger {
    constructor(game) {
        super(game, ElevatorPassengerType.Coffee, 'passengers-coffee');
        this.speakPermission = {
            whichFloor: false,
            howsTheWork: false,
            whatsTheWeather: false,
            howAreYou: false,
        };
        this.frame = Math.floor(Math.random() * 6);
        this.waitingFloor = -1;
        this.anchor = new Phaser.Point(1, 1);
    }
    performIntroAnimation() {
        super.performIntroAnimation(Math.floor(Math.random() * 1000));
    }
}
/**
 * ElevatorHumanResourceDept
 * Stores all waiting passengers and generate normal passengers
 * An invisable sprite manager
 */
class ElevatorHumanResourceDept extends Phaser.Group {
    constructor(game, world, autoGen) {
        super(game, world, 'ElevatorHumanResourceDept');
        this.duration = 0.2 * Phaser.Timer.SECOND;
        this.duringAnimation = false;
        this.passengerGenerateSignal = new Phaser.Signal();
        this.generateSquidInFeatureCount = 0;
        if (autoGen) {
            this.loopTimer = this.game.time.create(false);
            this.loopTimer.loop(this.duration, this.generatePassengersInLoop, this);
            this.loopTimer.start();
        }
        this.elevatorDong = new Phaser.Sound(this.game, 'audio-elevator-dong');
    }
    static passengerPermittedFilter(permissionId) {
        return (passenger) => {
            if (passenger.speakPermission[permissionId]) {
                return true;
            }
            else {
                return false;
            }
        };
    }
    resume() {
        this.loopTimer.resume();
    }
    pause() {
        this.loopTimer.pause();
    }
    generatePassengersInLoop() {
        if ((Math.random() * Phaser.Timer.SECOND < this.duration / 10) && this.children.length < 5) {
            this.passengerGenerateSignal.dispatch(this.generatepassengersByType(ElevatorPassengerType.Normal));
        }
        if (this.generateSquidInFeatureCount > 0 && (Math.random() * Phaser.Timer.SECOND < this.duration / 5)) {
            let passenger = this.add(new ElevatorPassengerSquid(this.game, this.generateSquidInFeatureCount - 1));
            this.passengerGenerateSignal.dispatch([passenger]);
            this.generateSquidInFeatureCount -= 1;
        }
    }
    expelAllNormalPassengers(withAnimation = false) {
        if (withAnimation) {
            this.duringAnimation = true;
            this.game.time.events.add(ElevatorPassenger.animationDuration, () => {
                this.duringAnimation = false;
            }, this);
        }
        for (var index = this.children.length - 1; index >= 0; index--) {
            let passenger = this.children[index];
            switch (passenger.type) {
                case ElevatorPassengerType.Normal:
                case ElevatorPassengerType.Squid:
                    if (withAnimation) {
                        if (passenger.destFloor < 20) {
                            passenger.destFloor = 65536;
                            passenger.performFeawellAnimation();
                            this.game.time.events.add(ElevatorPassenger.animationDuration, () => {
                                this.remove(passenger, true);
                            }, this);
                        }
                    }
                    else {
                        this.remove(passenger, true);
                    }
                    break;
            }
        }
    }
    findAllPassengersAt(floor, destFloor = false) {
        let passengers = [];
        for (var index = 0; index < this.children.length; index++) {
            var passenger = this.children[index];
            if ((destFloor && passenger.destFloor == floor) || (!destFloor && passenger.waitingFloor == floor)) {
                passengers.push(passenger);
            }
        }
        return passengers;
    }
    grabAllPassengersAt(floor) {
        let passengers = this.findAllPassengersAt(floor);
        passengers.forEach((passenger) => {
            this.remove(passenger, false);
        });
        return passengers;
    }
    generatepassengersByType(type) {
        var passengers = [];
        switch (type) {
            case ElevatorPassengerType.Coffee:
                for (let floor = 13; floor >= 1; floor--) {
                    let passenger = this.add(new ElevatorPassengerCoffee(this.game));
                    passenger.destFloor = floor;
                    passengers.push(passenger);
                }
                break;
            case ElevatorPassengerType.Gift:
                for (let index = 2; index >= 0; index--) {
                    passengers.push(this.add(new ElevatorPassengerGift(this.game, index)));
                }
                break;
            case ElevatorPassengerType.Chair:
                passengers.push(this.add(new ElevatorPassengerChair(this.game)));
                break;
            case ElevatorPassengerType.BedMan:
                passengers.push(this.add(new ElevatorPassengerBedMan(this.game)));
                break;
            case ElevatorPassengerType.Manager:
                passengers.push(this.add(new ElevatorPassengerManager(this.game)));
                break;
            case ElevatorPassengerType.Normal:
                let passenger = new ElevatorPassengerNormal(this.game);
                if (this.findAllPassengersAt(passenger.waitingFloor).length < 3) {
                    passengers.push(this.add(passenger));
                }
                break;
            case ElevatorPassengerType.Squid:
                for (let index = 0; index < 5; index++) {
                    let passenger = this.add(new ElevatorPassengerSquid(this.game, index));
                    passengers.push(passenger);
                }
                break;
        }
        if (passengers.filter((passenger) => { if (passenger.type == ElevatorPassengerType.Normal || passenger.type == ElevatorPassengerType.Squid) {
            return true;
        }
        else {
            return false;
        } }).length > 0) {
            this.elevatorDong.play();
        }
        return passengers;
    }
    /// Returns accecpted passengers
    transformPassengersAtFloor(exHR, floor) {
        let accecptedPassengers = exHR.findAllPassengersAt(floor);
        if (accecptedPassengers.filter((passenger) => { if (passenger.type == ElevatorPassengerType.Coffee) {
            return true;
        }
        else {
            return false;
        } }).length == 0) {
            accecptedPassengers = accecptedPassengers.slice(0, 7 - this.children.length);
        }
        let positionsForFlilter = ElevatorHumanResourceDept.positionsOfPassengers.slice();
        let framesForFilter = ElevatorHumanResourceDept.passengerFrames.slice();
        this.children.forEach((passenger) => {
            switch (passenger.type) {
                case ElevatorPassengerType.Normal:
                case ElevatorPassengerType.Squid:
                    positionsForFlilter.splice(positionsForFlilter.indexOf(passenger.x), 1);
                    framesForFilter.splice(framesForFilter.indexOf(passenger.frame), 1);
            }
        });
        accecptedPassengers.forEach((passenger) => {
            passenger.parent.removeChild(passenger);
            this.add(passenger);
            if (passenger.type == ElevatorPassengerType.Normal || passenger.type == ElevatorPassengerType.Squid || passenger.type == ElevatorPassengerType.Coffee) {
                passenger.x = PickOneRandomly(positionsForFlilter);
                positionsForFlilter.splice(positionsForFlilter.indexOf(passenger.x), 1);
                if (passenger.type == ElevatorPassengerType.Normal) {
                    passenger.frame = PickOneRandomly(framesForFilter);
                    framesForFilter.splice(framesForFilter.indexOf(passenger.frame), 1);
                }
            }
            else {
                passenger.x = 260;
            }
            passenger.performIntroAnimation();
        });
        return accecptedPassengers;
    }
    passengersArrivalAt(floor, callback, context) {
        let passengers = this.findAllPassengersAt(floor, true);
        if (passengers.length > 0) {
            this.duringAnimation = true;
            passengers.forEach((passenger, index, array) => {
                passenger.destFloor = 65536; // To heaven, to prevent this func be called again on this passenger
                this.children.filter((passenger) => { if (passenger.destFloor == 65536 || passenger.type != ElevatorPassengerType.Gift) {
                    return false;
                }
                else {
                    return true;
                } }).forEach((passenger, index, array) => {
                    passenger.frame = array.length - 1 - index;
                    passenger.moveUp();
                });
                if (passenger.type == ElevatorPassengerType.Gift) {
                    passenger.frame = this.children.length - 1 - index;
                }
                passenger.performFeawellAnimation();
                passenger.speakPermission = {
                    whichFloor: false,
                    howsTheWork: false,
                    whatsTheWeather: false,
                    howAreYou: false,
                };
            });
            this.game.time.events.add(ElevatorPassenger.animationDuration, () => {
                this.duringAnimation = false;
                for (var index = passengers.length - 1; index >= 0; index--) {
                    this.remove(passengers[index], true);
                }
                if (callback) {
                    callback.apply(context, [passengers]);
                }
            }, this);
        }
    }
    get passengersSpeakPermissionSummary() {
        var summary = {
            whichFloor: false,
            howsTheWork: false,
            whatsTheWeather: false,
            howAreYou: false,
        };
        if (this.children.length != 0) {
            this.children.forEach((passenger) => {
                if (passenger.speakPermission.howAreYou) {
                    summary.howAreYou = true;
                }
                if (passenger.speakPermission.whichFloor) {
                    summary.whichFloor = true;
                }
                if (passenger.speakPermission.howsTheWork) {
                    summary.howsTheWork = true;
                }
                if (passenger.speakPermission.whatsTheWeather) {
                    summary.whatsTheWeather = true;
                }
            });
        }
        return summary;
    }
    closePermissionFor(permissionId) {
        this.children.forEach((passenger) => {
            passenger.speakPermission[permissionId] = false;
        });
    }
}
ElevatorHumanResourceDept.positionsOfPassengers = [140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340, 360, 370];
ElevatorHumanResourceDept.passengerFrames = [0, 1, 2, 3, 4, 5, 6, 7];
var ScheduleEventType;
(function (ScheduleEventType) {
    ScheduleEventType[ScheduleEventType["NormalPassengersLeave"] = 0] = "NormalPassengersLeave";
    ScheduleEventType[ScheduleEventType["KeyPassengersLeave"] = 1] = "KeyPassengersLeave";
})(ScheduleEventType || (ScheduleEventType = {}));
var ScheduleState;
(function (ScheduleState) {
    ScheduleState[ScheduleState["managers"] = 0] = "managers";
    ScheduleState[ScheduleState["gift"] = 1] = "gift";
    ScheduleState[ScheduleState["chairs"] = 2] = "chairs";
    ScheduleState[ScheduleState["bedman"] = 3] = "bedman";
    ScheduleState[ScheduleState["coffee"] = 4] = "coffee";
    ScheduleState[ScheduleState["credits"] = 5] = "credits";
})(ScheduleState || (ScheduleState = {}));
/**
 * ElevatorSchedule
 */
class ElevatorSchedule {
    constructor() {
        this.commandSignal = new Phaser.Signal();
        this.current = 0;
        this.schedule = [
            ScheduleState.managers,
            ScheduleState.gift,
            ScheduleState.chairs,
            ScheduleState.bedman,
            ScheduleState.coffee,
            ScheduleState.credits,
        ];
        this.scheduleForeShadowing = [
            4 + Math.floor(Math.random() * 2),
            4 + Math.floor(Math.random() * 2),
            4 + Math.floor(Math.random() * 2),
            4 + Math.floor(Math.random() * 2),
            4 + Math.floor(Math.random() * 2),
            4 + Math.floor(Math.random() * 2),
        ];
        if (location.search == '?test') {
            this.scheduleForeShadowing = [
                2,
                2,
                2,
                2,
                2,
                2,
            ];
        }
    }
    get currentSchedule() {
        return this.schedule[this.current];
    }
    receiveEvent(type) {
        switch (type) {
            case ScheduleEventType.NormalPassengersLeave:
                this.scheduleForeShadowing[this.current] -= 1;
                if (this.scheduleForeShadowing[this.current] == 0) {
                    this.commandSignal.dispatch(this.schedule[this.current]);
                }
                break;
            case ScheduleEventType.KeyPassengersLeave:
                this.current += 1;
                console.log('Schedule step into: ' + this.schedule[this.current]);
                break;
        }
    }
}
/**
 * ElevatorController
 */
class ElevatorController {
    constructor(game, indicator, panel, human, panelScene, hrDept, mouth, dialog, telephone, action) {
        this.currentFloor = 0;
        this.destFloor = 0;
        this.directionUp = true;
        this.panelState = [
            false, false, false, false, false,
            false, false, false, false, false,
            false, false, false, false, false
        ];
        this.questions = {
            whichFloor: 'Which floor are you going to?',
            howsTheWork: 'How is the work going today?',
            whatsTheWeather: 'What\'s the weather like today?',
            howAreYou: 'How are you?'
        };
        this._enableAutomaticControl = false;
        this._leaved = false;
        this.expelWhenOpenDoor = false;
        this.emergenciesPassengerType = ElevatorPassengerType.Normal;
        this.leaveAtZero = false;
        this.duringTelephone = false;
        this.duringOpendoorDelay = false;
        this.game = game;
        this.indicator = indicator;
        this.panel = panel;
        this.human = human;
        this.panelScene = panelScene;
        this.panelScene.openCloseSignal.add(this.openCloseDoorButtonPressed, this);
        this.panel.controlSingal.add(this.panelPressed, this);
        this.indicator.arriveSignal.add(this.floorReached, this);
        this.hrDept = hrDept;
        this.dialog = dialog;
        this.telephone = telephone;
        this.mouth = mouth;
        this.action = action;
        this.elevatorTheme = this.game.add.sound('audio-elevator-theme', 1, true);
        this.elevatorTheme.play();
        this.elevatorTheme.volume = 0;
        this.indicator.directionChangeSignal.add((state) => {
            if (state == ElevatorDirection.Stop) {
                this.elevatorTheme.fadeOut(400);
            }
            else {
                this.elevatorTheme.fadeIn(400, true);
            }
        }, this);
        this.elevatorDing = this.game.add.sound('audio-elevator-ding', 0.3);
        this.telephoneHangup = this.game.add.sound('audio-telephone-hangup', 0.3);
        this.telephonePickup = this.game.add.sound('audio-telephone-pickup', 0.5);
        this.dayOff = this.game.add.sound('audio-day-off');
        this.hrDept.passengerGenerateSignal.add((passengers) => {
            this.indicator.updateWaitingPassengers(this.hrDept.children);
            for (var index = 0; index < passengers.length; index++) {
                var passenger = passengers[index];
            }
            if (this._enableAutomaticControl) {
                this.automaticPressPanelTargets();
            }
        }, this);
        this.schedule = new ElevatorSchedule();
        this.schedule.commandSignal.add(this.specialEvent, this);
        this.mouth.mouth.onInputDown.add(this.openActionBox, this);
    }
    refreshActionBox() {
        if (this.action.isOpen) {
            this.openActionBox();
        }
    }
    openActionBox() {
        if (this.duringTelephone) {
            return;
        }
        var actions = [];
        var summary = this.human.elevatorPassengerContainer.passengersSpeakPermissionSummary;
        if (this.isNormalPassengerOnElevator && this.emergenciesPassengerType != ElevatorPassengerType.Normal) {
            actions = [
                { name: 'expel', text: 'All passengers please disembark at this floor, the elevator has been requisitioned for special-use.', enabled: !this.expelWhenOpenDoor }
            ];
        }
        else {
            actions = [
                { name: 'whichFloor', text: 'Which floor are you going to?', enabled: summary.whichFloor },
                { name: 'howsTheWork', text: 'How is the work going today?', enabled: summary.howsTheWork },
                { name: 'whatsTheWeather', text: 'What\'s the weather like today?', enabled: summary.whatsTheWeather },
                { name: 'howAreYou', text: 'How are you?', enabled: summary.howAreYou },
            ];
        }
        this.action.open(actions, (action) => {
            this.mouth.speak();
            this.actionBoxInteraction(action);
        }, this);
    }
    automaticPressPanelTargets() {
        this.human.elevatorPassengerContainer.children.forEach((passenger) => {
            this.aimTarget(passenger.destFloor);
        });
        this.hrDept.children.forEach((passenger) => {
            this.aimTarget(passenger.waitingFloor);
        });
    }
    enableAutomaticControl() {
        this._enableAutomaticControl = true;
        this.automaticPressPanelTargets();
    }
    resignFirstresponder() {
        this.mouth.mouth.onInputDown.remove(this.openActionBox, this);
        this.panelScene.openCloseSignal.remove(this.openCloseDoorButtonPressed, this);
        this.panel.controlSingal.remove(this.panelPressed, this);
        this.panel.disableAll();
    }
    leave() {
        if (this._leaved) {
            return;
        }
        this._leaved = true;
        this.mouth.leave();
        this.human.human.leave();
        if (this.action.close) {
            this.action.close();
        }
        this.game.time.events.add(15000, () => {
            this.enableAutomaticControl();
            let credits = this.action.add(new Phaser.Sprite(this.game, 2, -8, 'credits'));
            credits.alpha = 0;
            this.game.add.tween(credits).to({ alpha: 1 }, 1400, null, true);
        }, this);
    }
    actionBoxInteraction(action) {
        if (this.human.elevatorPassengerContainer.children.length == 0) {
            return;
        }
        if (action.name != 'expel') {
            if (!this._enableAutomaticControl) {
                this.dialog.clearElevatorDialogs();
                if (action.name == 'whichFloor' && this.emergenciesPassengerType != ElevatorPassengerType.Gift) {
                    let whichFloorPassengers = this.human.elevatorPassengerContainer.children.filter(ElevatorHumanResourceDept.passengerPermittedFilter('whichFloor'));
                    while (whichFloorPassengers.length > 5) {
                        for (let index = 0; index < whichFloorPassengers.length; index++) {
                            let passenger = whichFloorPassengers[index];
                            if (passenger.passengerAutoSpeaked) {
                                whichFloorPassengers.splice(index, 1);
                                break;
                            }
                        }
                    }
                    whichFloorPassengers.forEach((passenger) => {
                        if (passenger.destFloor != this.indicator.currentFloor) {
                            this.dialog.displayElevatorDialog(passenger.lines.whichFloor, passenger.x + 40);
                        }
                    });
                }
                else {
                    let passenger = PickOneRandomly(this.human.elevatorPassengerContainer.children.filter(ElevatorHumanResourceDept.passengerPermittedFilter(action.name)));
                    this.dialog.displayElevatorDialog(passenger.lines[action.name], passenger.x + 40);
                }
                this.dialog.humanNotMachineDialog(this.questions[action.name]);
            }
            this.human.elevatorPassengerContainer.closePermissionFor(action.name);
        }
        else {
            this.expelWhenOpenDoor = true;
            if (this.panelScene.doorIsOpened) {
                this.human.elevatorPassengerContainer.expelAllNormalPassengers(true);
            }
            else if (!this.panelScene.doorIsClosed) {
                this.openCloseDoorButtonPressed('open');
            }
            this.dialog.humanNotMachineDialog('All passengers please disembark at this floor, the elevator has been requisitioned for special-use.');
        }
    }
    specialEvent(type) {
        console.log('Schedule received: ' + ScheduleState[type]);
        if (type == ScheduleState.credits) {
            this.leaveAtZero = true;
            this.dayOff.play();
            this.resignFirstresponder();
            this.game.time.events.add(2000, () => {
                if (!this.panel.controlButtons[0 + 1].lighted && !this._leaved) {
                    this.panelPressed(0);
                }
            });
            return;
        }
        this.hrDept.pause();
        this.hrDept.expelAllNormalPassengers();
        switch (type) {
            case ScheduleState.managers:
                this.hrDept.generatepassengersByType(ElevatorPassengerType.Manager);
                this.emergenciesPassengerType = ElevatorPassengerType.Manager;
                break;
            case ScheduleState.gift:
                this.hrDept.generatepassengersByType(ElevatorPassengerType.Gift);
                this.emergenciesPassengerType = ElevatorPassengerType.Gift;
                break;
            case ScheduleState.chairs:
                this.hrDept.generatepassengersByType(ElevatorPassengerType.Chair);
                this.emergenciesPassengerType = ElevatorPassengerType.Chair;
                break;
            case ScheduleState.bedman:
                this.hrDept.generatepassengersByType(ElevatorPassengerType.BedMan);
                this.emergenciesPassengerType = ElevatorPassengerType.BedMan;
                break;
            case ScheduleState.coffee:
                this.hrDept.generatepassengersByType(ElevatorPassengerType.Coffee);
                this.emergenciesPassengerType = ElevatorPassengerType.Coffee;
                break;
        }
        this.indicator.updateWaitingPassengers(this.hrDept.children);
        this.telephoneEvent(type);
        if (this.action.close) {
            this.action.close();
        }
    }
    telephoneEvent(type) {
        this.duringTelephone = true;
        // Set set
        this.dialog.clearElevatorDialogs();
        this.telephone.ringByEventType(type);
        this.panelScene.add(this.panelScene.overlayTelephone);
        this.panelScene.overlayTelephone.x = 0;
        if (type == 1) {
            this.panelScene.overlayTelephone.frame = 2;
        }
        else if (type == 2) {
            this.panelScene.overlayTelephone.frame = 1;
        }
        else {
            this.panelScene.overlayTelephone.frame = 0;
        }
        this.mouth.add(this.mouth.overlayTelephone);
        // this.mouth.remove(this.mouth.mouth)
        // this.mouth.mouth.inputEnabled = false
        this.human.add(this.human.overlayTelephone);
        this.panelScene.earpiece.alpha = 0;
        var overlay = this.game.add.button(0, 0, null);
        overlay.width = this.game.width;
        overlay.height = this.game.height;
        overlay.onInputDown.add(() => {
            overlay.destroy();
            // Set set
            this.telephone.takePhone();
            this.telephonePickup.play();
            var text = 'Error';
            switch (type) {
                case ScheduleState.managers:
                    text = 'Some board members need to go to the boardroom on 13th floor, go pick them up at the 3rd floor now.\nMake sure the elevator is empty when getting there, you know the rules.';
                    break;
                case ScheduleState.gift:
                    text = 'A large number of corporate gifts are waiting for distribution at the basement.\nThere are more than many, and possibly blocked the gate. So have the elevator emptied before arriving.';
                    break;
                case ScheduleState.chairs:
                    text = 'Several office chairs need to be relocated from 11th to 4th floor.\nExact number unknown, so get an empty elevator prepared.';
                    break;
                case ScheduleState.bedman:
                    text = 'An employee from the 3rd floor needs to go to floor 10. He used to be an employee of the month or something,\nand his current situation is a little bit of, special, so get the elevator empty for him. ';
                    break;
                case ScheduleState.coffee:
                    text = 'Daily rations are ready at the basement, get them dispatched at each floor, except the ground floor. Enjoy.';
                    break;
            }
            this.dialog.telephoneDialog(text, () => {
                this.telephoneHangup.play().onStop.addOnce(() => {
                    this.duringTelephone = false;
                    this.telephone.hangup();
                    this.human.human.performHangupAction();
                    this.panelScene.overlayTelephone.x = 1000;
                    this.panelScene.remove(this.panelScene.overlayTelephone);
                    this.panelScene.performHangupAction();
                    this.mouth.remove(this.mouth.overlayTelephone);
                    this.game.time.events.add(800, () => {
                        this.telephonePickup.play();
                    });
                    // this.mouth.add(this.mouth.mouth)
                    // this.mouth.mouth.inputEnabled = true
                    this.human.remove(this.human.overlayTelephone);
                }, this);
            }, this);
        }, this);
    }
    floorReached() {
        // If stopped
        if (this.updateIndicator()) {
            this.game.time.events.add(300, () => {
                this.elevatorDing.play();
            }, this);
            if (this.human.elevatorPassengerContainer.passengersSpeakPermissionSummary.whichFloor && this.emergenciesPassengerType == ElevatorPassengerType.Normal && !this._enableAutomaticControl) {
                this.human.elevatorPassengerContainer.children.forEach(this.speakWhichFloor, this);
                this.human.elevatorPassengerContainer.children.forEach((passenger) => {
                    passenger.passengerAutoSpeaked = true;
                });
            }
            this.duringOpendoorDelay = true;
            this.game.time.events.add(800, () => {
                this.duringOpendoorDelay = false;
                this.openCloseDoor('open');
            }, this);
        }
        if (this.indicator.currentFloor == -1) {
            this.panelScene.paradises.frame = 6;
        }
        else if (this.indicator.currentFloor == 13) {
            this.panelScene.paradises.frame = 5;
        }
        else {
            this.panelScene.paradises.frame = this.indicator.currentFloor % 5;
        }
    }
    waitAndCloseDoor(delay = Phaser.Timer.SECOND * 4) {
        if (this.closeDoorTimer) {
            this.closeDoorTimer.destroy();
        }
        this.closeDoorTimer = this.game.time.create(true);
        this.closeDoorTimer.add(delay, () => {
            this.openCloseDoor('close');
        }, this);
        this.closeDoorTimer.start();
    }
    openCloseDoorButtonPressed(action) {
        if (this.duringOpendoorDelay || this.duringTelephone) {
            return;
        }
        if (this._enableAutomaticControl) {
            this.openCloseDoor(action);
        }
        else {
            if (this.human.human.busy) {
                return;
            }
            this.human.human.performPressAction(() => {
                this.openCloseDoor(action);
            }, this);
            this.panelScene.performPressAction(action == 'open' ? 1024 : 2048);
        }
    }
    get isNormalPassengerOnElevator() {
        return this.human.elevatorPassengerContainer.children.filter((passenger) => { if (passenger.type == ElevatorPassengerType.Normal || passenger.type == ElevatorPassengerType.Squid) {
            return true;
        }
        else {
            return false;
        } }).length != 0;
    }
    speakWhichFloor(passenger) {
        if ((passenger.type == ElevatorPassengerType.Normal) && passenger.destFloor != this.indicator.currentFloor && passenger.speakPermission.whichFloor && !passenger.passengerAutoSpeaked) {
            // passenger.speakPermission.whichFloor = fals
            if (!this._enableAutomaticControl) {
                this.game.time.events.add(1400, () => {
                    this.dialog.displayElevatorDialog(passenger.lines.whichFloor, passenger.x + 40);
                }, this);
            }
        }
    }
    openCloseDoor(action) {
        if (this.duringOpendoorDelay) {
            return;
        }
        if (this.indicator.direction != ElevatorDirection.Stop && action == 'open') {
            return;
        }
        if (action == 'open') {
            this.panelScene.openDoor(() => {
                if (this.indicator.currentFloor == 0 && this.leaveAtZero) {
                    this.leave();
                    this.waitAndCloseDoor(Phaser.Timer.SECOND * 10);
                }
                else {
                    this.waitAndCloseDoor();
                }
                if (this.expelWhenOpenDoor && this.hrDept.children.filter((passenger) => { if (passenger.waitingFloor == this.indicator.currentFloor) {
                    return true;
                }
                else {
                    return false;
                } }).length == 0) {
                    this.human.elevatorPassengerContainer.expelAllNormalPassengers(true);
                    this.expelWhenOpenDoor = false;
                }
                // Transform passenger
                if (this.emergenciesPassengerType == ElevatorPassengerType.Normal || (this.emergenciesPassengerType != ElevatorPassengerType.Normal && !this.isNormalPassengerOnElevator)) {
                    let transformed = this.human.elevatorPassengerContainer.transformPassengersAtFloor(this.hrDept, this.indicator.currentFloor);
                    if (transformed.length > 0) {
                        // Sometimes passengers told elevator guy directly
                        transformed.forEach((passenger) => {
                            if (Math.random() < 0.6) {
                                this.speakWhichFloor(passenger);
                            }
                        }, this);
                        this.refreshActionBox();
                        if (this._enableAutomaticControl) {
                            this.automaticPressPanelTargets();
                        }
                    }
                }
                else {
                    switch (this.indicator.currentFloor) {
                        case 3:
                            if (this.emergenciesPassengerType == ElevatorPassengerType.Manager) {
                                this.dialog.paradiseDialog('It\'s not empty yet, so what if we are going to have some confidential conversation?\nDischarge your cargo at any other floor then come back again empty');
                                return;
                            }
                            if (this.emergenciesPassengerType == ElevatorPassengerType.BedMan) {
                                this.dialog.paradiseDialog('An awkward situation, I see. Go ahead, I\'ll wait here.');
                                return;
                            }
                            break;
                        case -1:
                            if (this.emergenciesPassengerType == ElevatorPassengerType.Coffee) {
                                this.dialog.paradiseDialog('Sorry, no exit here.');
                                return;
                            }
                            if (this.emergenciesPassengerType == ElevatorPassengerType.Gift) {
                                this.dialog.paradiseDialog('Hmm...So many gifts here, so little space in there. Sorry for blocking the way,\nbut it seems that you\'ll have to empty your cargo somewhere else first.');
                                return;
                            }
                            break;
                        case 11:
                            if (this.emergenciesPassengerType == ElevatorPassengerType.Chair) {
                                this.dialog.paradiseDialog('We can wait.');
                                return;
                            }
                    }
                }
                // Remove arravial
                this.human.elevatorPassengerContainer.passengersArrivalAt(this.indicator.currentFloor, (passengers) => {
                    // If special passenger gone
                    if (passengers.filter((passenger) => { if (passenger.type != ElevatorPassengerType.Normal && passenger.type != ElevatorPassengerType.Squid) {
                        return true;
                    }
                    else {
                        return false;
                    } }).length > 0 &&
                        this.human.elevatorPassengerContainer.children.length == 0) {
                        this.schedule.receiveEvent(ScheduleEventType.KeyPassengersLeave);
                        if (this.emergenciesPassengerType == ElevatorPassengerType.Gift) {
                            this.game.time.events.add(8000, () => {
                                this.hrDept.generateSquidInFeatureCount = 5;
                            }, this);
                        }
                        this.emergenciesPassengerType = ElevatorPassengerType.Normal;
                        this.hrDept.resume();
                    }
                    // If normal passenger gone
                    if (passengers.filter((passenger) => { if (passenger.type == ElevatorPassengerType.Normal || passenger.type == ElevatorPassengerType.Squid) {
                        return true;
                    }
                    else {
                        return false;
                    } }).length > 0) {
                        this.schedule.receiveEvent(ScheduleEventType.NormalPassengersLeave);
                    }
                    // If all passengers is gone
                    if (this.human.elevatorPassengerContainer.children.length == 0) {
                        if (this.action.close) {
                            this.action.close();
                        }
                    }
                    // If somebody is waiting and elevator not full
                    if (this.hrDept.findAllPassengersAt(this.indicator.currentFloor).length > 0 && this.human.elevatorPassengerContainer.children.length < 13) {
                        this.openCloseDoorButtonPressed('open');
                    }
                }, this);
                this.indicator.updateWaitingPassengers(this.hrDept.children);
            }, this);
        }
        else {
            if (this.closeDoorTimer) {
                this.closeDoorTimer.destroy();
            }
            if (!this.human.elevatorPassengerContainer.duringAnimation && this.panelScene.doorIsOpened) {
                this.panelScene.closeDoor(() => {
                    this.updateIndicator(true);
                }, this);
            }
        }
    }
    panelPressed(buttonNumber) {
        if (this.human.human.busy || this.duringTelephone) {
            return;
        }
        this.human.human.performPressAction(() => {
            if (this.indicator.currentFloor == buttonNumber && this.indicator.direction == ElevatorDirection.Stop) {
                this.panel.pressByButtonNumber(buttonNumber);
                this.game.time.events.add(100, () => {
                    this.panel.dismissByButtonNumber(buttonNumber);
                }, this);
                this.openCloseDoor('open');
                return;
            }
            this.aimTarget(buttonNumber);
        }, this);
        this.panelScene.performPressAction(buttonNumber);
    }
    aimTarget(floor) {
        this.panel.pressByButtonNumber(floor);
        if (this.indicator.direction == ElevatorDirection.Stop) {
            this.updateIndicator();
        }
    }
    updateIndicator(forceLeave = false) {
        if (!this.panelScene.doorIsClosed) {
            return;
        }
        if (this.duringOpendoorDelay) {
            return;
        }
        if (!this.panel.hasLightButton) {
            this.indicator.go(ElevatorDirection.Stop);
            return;
        }
        if (this.directionUp) {
            var floor = this.panel.closestLightButton(forceLeave ? this.indicator.currentFloor + 1 : this.indicator.currentFloor, ElevatorDirection.Up);
            if (this.indicator.direction == ElevatorDirection.Stop && floor > 20) {
                this.directionUp = !this.directionUp;
                this.updateIndicator();
            }
            else if (floor == this.indicator.currentFloor) {
                this.indicator.go(ElevatorDirection.Stop);
                this.panel.dismissByButtonNumber(floor);
                return true;
            }
            else if (floor < 20) {
                this.indicator.go(ElevatorDirection.Up);
            }
        }
        else {
            var floor = this.panel.closestLightButton(forceLeave ? this.indicator.currentFloor - 1 : this.indicator.currentFloor, ElevatorDirection.Down);
            if (this.indicator.direction == ElevatorDirection.Stop && floor > 20) {
                this.directionUp = !this.directionUp;
                this.updateIndicator();
            }
            else if (floor == this.indicator.currentFloor) {
                this.indicator.go(ElevatorDirection.Stop);
                this.panel.dismissByButtonNumber(floor);
                return true;
            }
            else if (floor < 20) {
                this.indicator.go(ElevatorDirection.Down);
            }
        }
        return false;
    }
}
var ElevatorDirection;
(function (ElevatorDirection) {
    ElevatorDirection[ElevatorDirection["Up"] = 0] = "Up";
    ElevatorDirection[ElevatorDirection["Down"] = 1] = "Down";
    ElevatorDirection[ElevatorDirection["Stop"] = 2] = "Stop";
})(ElevatorDirection || (ElevatorDirection = {}));
/**
 * AcrossFadingAnimation
 */
class AcrossFadingAnimation extends Phaser.Group {
    constructor(game, parent, x, y, key, frameCount, delay, acrossTime = 500) {
        super(game, parent, 'AcrossFadingAnimation');
        this.x = x;
        this.y = y;
        this.A = this.addChild(new Phaser.Sprite(this.game, 0, 0, key));
        this.B = this.addChild(new Phaser.Sprite(this.game, 0, 0, key));
        this.B.alpha = 0;
        this.frameCount = frameCount;
        this.delay = delay;
        this.acrossTime = acrossTime;
    }
    play(fadeIn = false) {
        this.A.alpha = 1;
        this.B.alpha = 0;
        if (fadeIn) {
            this.A.alpha = 0;
            this.game.add.tween(this.A).to({ alpha: 1 }, this.acrossTime, null, true);
        }
        this.A.frame = 0;
        for (var index = 1; index < this.frameCount; index++) {
            let currentIndex = index;
            this.game.time.events.add(this.delay * index + this.acrossTime * (index - 1)
                + (fadeIn ? this.acrossTime : 0), () => {
                if (currentIndex % 2 == 1) {
                    this.B.frame = currentIndex;
                }
                else {
                    this.A.frame = currentIndex;
                }
                // console.log(currentIndex)
                // console.log('fadein:' + (currentIndex % 2 == 0 ? 'this.A' : 'this.B'))
                // console.log('fadeout:' + (currentIndex % 2 == 1 ? 'this.A' : 'this.B'))
                // console.log('A frame:' + this.A.frame)
                // console.log('B frame: ' + this.B.frame)
                // console.log(this.delay * currentIndex + this.acrossTime * (currentIndex - 1)
                //   + (fadeIn ? this.acrossTime : 0) + '\n')
                this.game.add.tween(currentIndex % 2 == 0 ? this.A : this.B).to({ alpha: 1 }, this.acrossTime, null, true);
                this.game.add.tween(currentIndex % 2 == 1 ? this.A : this.B).to({ alpha: 0 }, this.acrossTime, null, true);
            }, this);
        }
    }
}
/**
 * ElevatorMouthScene
 */
class ElevatorMouthScene extends ComicWindow {
    constructor(game) {
        super(game, 'ElevatorMouthScene');
        this.mouth = this.add(new Phaser.Button(this.game, 0, 0, 'animate-mouth'));
        this.mouth.scale = new Phaser.Point(1.12, 1.12);
        this.mouth.anchor = new Phaser.Point(0.5, 0.5);
        this.game.time.events.add(150, () => {
            let oldFrame = this.mouth.frame;
            do {
                this.mouth.frame = Math.floor(Math.random() * 9);
            } while (this.mouth.frame == oldFrame);
        }, this).loop = true;
        this.speakingMouth = new Phaser.Sprite(this.game, 0, 0, 'animate-mouth-speaking');
        this.speakingMouth.anchor = new Phaser.Point(0.5, 0.5);
        // this.speakingMouth.scale = new Phaser.Point(1.05, 1.05)
        this.speakingMouth.animations.add('speak').delay = 140;
        this.overlayTelephone = new Phaser.Sprite(this.game, 0, 0, 'telephone-middle');
        this.leavingAnimation = new AcrossFadingAnimation(this.game, null, 0, 0, 'animate-human-stand-middle', 4, 400);
    }
    set origin(origin) {
        super.origin = origin;
        this.mouth.x = origin.width / 2;
        this.speakingMouth.x = origin.width / 2;
        this.mouth.y = origin.height / 2;
        this.speakingMouth.y = origin.height / 2;
    }
    leave() {
        this.game.time.events.add(600, () => {
            this.add(this.leavingAnimation);
            this.leavingAnimation.play(true);
            this.game.time.events.add(this.leavingAnimation.acrossTime, () => {
                this.remove(this.mouth);
            }, this);
        }, this);
    }
    speak() {
        // this.remove(this.mouth)
        this.add(this.speakingMouth);
        this.speakingMouth.x = this._display_origin.width / 2;
        this.speakingMouth.play('speak').onComplete.addOnce(() => {
            this.speakingMouth.x = 1000;
            this.remove(this.speakingMouth);
            // this.add(this.mouth)
        }, this);
    }
}
/**
 * ElevatorIndicatorScene
 */
class ElevatorIndicatorScene extends ComicWindow {
    constructor(game) {
        super(game, 'ElevatorIndicatorScene');
        this.currentFloor = 0;
        this.direction = ElevatorDirection.Stop;
        this.arriveSignal = new Phaser.Signal();
        this.directionChangeSignal = new Phaser.Signal();
        this.enablebackground = true;
        this.backgroundColor = 0x8c959a;
        this.add(new Phaser.Sprite(this.game, 0, 0, 'elevator-indicator-graduation'));
        // Elevator box
        this.elevatorBox = this.add(new Phaser.Graphics(game, 0, 0));
        this.elevatorBox.beginFill(0xfff4aa, 0.5);
        this.elevatorBox.lineStyle(1, 0xfff4aa, 0.9);
        this.elevatorBox.drawRect(ElevatorIndicatorScene.containerPadding, 0, ElevatorIndicatorScene.containerWidth - ElevatorIndicatorScene.containerPadding * 2, ElevatorIndicatorScene.elevatorHeight);
        this.elevatorBox.endFill();
        this.updateToFloor(this.currentFloor);
        // Waiting passengers sign
        this.waitingPassengersSign = this.add(new Phaser.Graphics(game, 0, 0));
        this.add(new Phaser.Sprite(this.game, 0, 0, 'elevator-indicator-numbers'));
    }
    tweenAndNotify(floor, duration, easingFunc) {
        this.game.add.tween(this.elevatorBox).to({ y: this.targetHeightForFloor(floor) }, duration, easingFunc, true);
        this.game.time.events.add(duration, () => {
            this.currentFloor = floor;
            this.arriveSignal.dispatch(floor);
        }, this);
    }
    go(direction) {
        switch (direction) {
            case ElevatorDirection.Up:
                if (this.direction == ElevatorDirection.Stop) {
                    this.tweenAndNotify(this.currentFloor + 1, 1800, Phaser.Easing.Cubic.In);
                }
                else {
                    this.tweenAndNotify(this.currentFloor + 1, 1200, Phaser.Easing.Linear.None);
                }
                break;
            case ElevatorDirection.Down:
                if (this.direction == ElevatorDirection.Stop) {
                    this.tweenAndNotify(this.currentFloor - 1, 1800, Phaser.Easing.Cubic.In);
                }
                else {
                    this.tweenAndNotify(this.currentFloor - 1, 1200, Phaser.Easing.Linear.None);
                }
                break;
        }
        if (this.direction != direction) {
            this.directionChangeSignal.dispatch(direction);
        }
        this.direction = direction;
    }
    targetHeightForFloor(floor) {
        return (2 + ElevatorIndicatorScene.elevatorHeight * 13) - floor * ElevatorIndicatorScene.elevatorHeight;
    }
    updateToFloor(floor) {
        this.elevatorBox.y = this.targetHeightForFloor(floor);
    }
    updateWaitingPassengers(passengers) {
        var context = this.waitingPassengersSign;
        context.clear();
        context.beginFill(0xfff4aa, 0.6);
        for (var index = 0; index < passengers.length; index++) {
            var waitingFloor = passengers[index].waitingFloor;
            context.drawRect(0, this.targetHeightForFloor(waitingFloor) + 1, ElevatorIndicatorScene.containerPadding - 1, ElevatorIndicatorScene.elevatorHeight - 1);
        }
        if (passengers.filter((passenger) => { if (passenger.type != ElevatorPassengerType.Normal && passenger.type != ElevatorPassengerType.Squid) {
            return true;
        }
        else {
            return false;
        } }).length > 0) {
            if (!this.signBlinkTimer) {
                this.signBlinkTimer = this.game.time.create(true);
                this.signBlinkTimer.loop(200, () => {
                    context.alpha = 0;
                    this.game.time.events.add(100, () => {
                        context.alpha = 1;
                    });
                }, this);
                this.signBlinkTimer.start();
            }
        }
        else if (this.signBlinkTimer) {
            this.signBlinkTimer.stop();
            this.signBlinkTimer = null;
            context.alpha = 1;
        }
        context.endFill();
    }
    intro(duration, fadeInDuration, callback, context) {
        this.elevatorBox.y = this.targetHeightForFloor(13);
        this.alpha = 0;
        this.game.add.tween(this.elevatorBox).to({ y: this.targetHeightForFloor(0) }, duration, null, true).onComplete.add(callback, context);
        this.game.add.tween(this).to({ alpha: 1 }, fadeInDuration, Phaser.Easing.Circular.Out, true);
    }
}
ElevatorIndicatorScene.elevatorHeight = 15;
ElevatorIndicatorScene.containerWidth = 29;
ElevatorIndicatorScene.containerPadding = 3;
/**
 * ElevatorPanelScene
 */
class ElevatorPanelScene extends ComicWindow {
    constructor(game) {
        super(game, 'ElevatorPanelScene');
        this.paradises = this.add(new Phaser.Sprite(this.game, 0, 0, 'paradises'));
        this.door = this.add(new Phaser.Sprite(this.game, ElevatorPanelScene.doorCloseOffset, 0, 'door'));
        this.add(new Phaser.Sprite(this.game, 30, 0, 'panel-background'));
        this.elevatorPanel = this.add(new ElevatorPanel(game, this));
        this.elevatorPanel.x = 140;
        this.elevatorPanel.y = 28;
        this.openCloseSignal = new Phaser.Signal();
        this.openButton = this.add(new Phaser.Button(this.game, 160, 285, 'open-close-buttons'));
        this.openButton.onInputDown.add(() => {
            this.openCloseSignal.dispatch('open');
        }, this);
        this.closeButton = this.add(new Phaser.Button(this.game, 212, 285, 'open-close-buttons'));
        this.closeButton.frame = 1;
        this.closeButton.onInputDown.add(() => {
            this.openCloseSignal.dispatch('close');
        }, this);
        this.earpiece = this.add(new Phaser.Sprite(this.game, 63, 417, 'panel-earpiece'));
        this.spoon = this.add(new Phaser.Sprite(this.game, 1000, 1000, 'spoon'));
        this.overlayTelephone = new Phaser.Sprite(this.game, 0, 0, 'telephone-right');
        this.openAudio = new Phaser.Sound(this.game, 'audio-door-open', 1);
        this.closeAudio = new Phaser.Sound(this.game, 'audio-door-close', 1);
    }
    openDoor(finishedClosure, context) {
        if (this.openTween) {
            return;
        }
        if (this.closeTween) {
            if (this.closeTween.onChildComplete.getNumListeners() < 3) {
                this.closeTween.onComplete.add(() => {
                    this.openDoor(finishedClosure, context);
                }, this);
            }
            return;
        }
        if (this.doorIsClosed) {
            this.openAudio.play();
        }
        this.openTween = this.game.add.tween(this.door).to({ x: ElevatorPanelScene.doorOpenOffset }, 2200, Phaser.Easing.Cubic.InOut).start();
        this.openTween
            .onComplete.add(finishedClosure, context);
        this.openTween
            .onComplete.add(() => {
            this.openTween = null;
        }, this);
    }
    closeDoor(finishedClosure, context) {
        if (this.openTween || this.closeTween) {
            return;
        }
        this.closeAudio.play();
        this.closeTween = this.game.add.tween(this.door).to({ x: ElevatorPanelScene.doorCloseOffset }, 2200, Phaser.Easing.Cubic.InOut).start();
        this.closeTween
            .onComplete.add(finishedClosure, context);
        this.closeTween
            .onComplete.add(() => {
            this.closeTween = null;
        }, this);
    }
    get doorIsClosed() {
        return this.door.x == ElevatorPanelScene.doorCloseOffset;
    }
    get doorIsOpened() {
        return this.door.x == ElevatorPanelScene.doorOpenOffset;
    }
    performPressAction(floor) {
        this.spoon.x = this.origin.width - 40;
        this.spoon.y = this.origin.height;
        this.spoon.angle = 0;
        var x, y;
        if (floor > 13) {
            if (floor == 1024) {
                x = this.openButton.x;
                y = this.openButton.y;
            }
            else {
                x = this.closeButton.x;
                y = this.closeButton.y;
            }
        }
        else {
            x = this.elevatorPanel.x + this.elevatorPanel.controlButtons[floor + 1].x;
            y = this.elevatorPanel.y + this.elevatorPanel.controlButtons[floor + 1].y;
        }
        var tween = this.game.add.tween(this.spoon).to({ x: x, y: y, angle: -10 }, 600, Phaser.Easing.Cubic.Out, true, 500);
        tween.yoyo(true);
    }
    performHangupAction() {
        this.earpiece.alpha = 1;
        this.earpiece.x = 63 + 20;
        this.earpiece.y = 417 + 74;
        this.game.add.tween(this.earpiece).to({ x: 63, y: 417 }, 800, Phaser.Easing.Cubic.Out).start();
    }
}
ElevatorPanelScene.doorCloseOffset = -170;
ElevatorPanelScene.doorOpenOffset = 60;
/**
 * ElevatorPanelButton
 */
class ElevatorPanelButton extends Phaser.Button {
    constructor(game, x, y, buttonNumber) {
        super(game, x, y, 'panel-button-seat');
        this.buttonNumber = buttonNumber;
        this.buttonObject = new Phaser.Sprite(game, 9, 9, 'panel-numbers');
        this.addChild(this.buttonObject);
        this.buttonObject.frame = buttonNumber + 1;
        this.hitArea = new Phaser.Circle(18, 18, 47);
        this.anchor = new Phaser.Point(0.2, 0.2);
    }
    get lighted() {
        if (this.frame == 0) {
            return false;
        }
        else {
            return true;
        }
    }
    pressByButtonNumber(buttonNumber) {
        if (buttonNumber == this.buttonNumber) {
            this.frame = 1;
        }
    }
    dismissByButtonNumber(buttonNumber) {
        if (buttonNumber == this.buttonNumber) {
            this.frame = 0;
        }
    }
}
/**
 * ElevatorPanel
 */
class ElevatorPanel extends Phaser.Group {
    constructor(game, parent) {
        super(game, parent, 'ElevatorPanel');
        this.controlSingal = new Phaser.Signal();
        var self = this;
        this.controlButtons = [];
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 5; j++) {
                let button = this.add(new ElevatorPanelButton(this.game, i * 52, 4 * 52 - j * 52, i * 5 + j - 1));
                this.controlButtons.push(button);
                button.onInputDown.add(() => {
                    self.controlSingal.dispatch(button.buttonNumber);
                });
            }
        }
    }
    closestLightButton(floor, direction) {
        switch (direction) {
            case ElevatorDirection.Up:
                for (var index = floor + 1; index < this.controlButtons.length; index++) {
                    if (this.controlButtons[index].lighted) {
                        return this.controlButtons[index].buttonNumber;
                    }
                }
                break;
            case ElevatorDirection.Down:
                for (var index = floor + 1; index >= 0; index--) {
                    if (this.controlButtons[index].lighted) {
                        return this.controlButtons[index].buttonNumber;
                    }
                }
        }
        return 65536;
    }
    get hasLightButton() {
        for (var index = 0; index < this.controlButtons.length; index++) {
            if (this.controlButtons[index].lighted) {
                return true;
            }
        }
        return false;
    }
    dismissByButtonNumber(buttonNumber) {
        this.callAll('dismissByButtonNumber', null, buttonNumber);
    }
    pressByButtonNumber(buttonNumber) {
        this.callAll('pressByButtonNumber', null, buttonNumber);
    }
    disableAll() {
        this.controlButtons.forEach((button) => {
            button.inputEnabled = false;
            button.input.useHandCursor = false;
        });
    }
}
/**
 * Dialog
 */
class Dialog extends Phaser.Group {
    constructor(game, parent, name = 'Dialog') {
        super(game, parent, name);
        this.left = false;
        this.background = this.add(new Phaser.Graphics(game, 0, 0));
        this.arrow = this.add(new Phaser.Graphics(game, 0, 0));
        this.textObject = this.add(new Phaser.Text(game, Dialog.padding.x, Dialog.padding.y, '', Dialog.style));
        this.textObject.lineSpacing = -5;
    }
    set text(text) {
        this.textObject.text = text;
        this.updateDialog();
    }
    drawAt(arrowPoint, arrowHeight, backgroundWidth) {
        this.arrowPoint = arrowPoint;
        this.arrowHeight = arrowHeight;
        this.backgroundWidth = backgroundWidth;
        this.updateDialog();
    }
    updateDialog() {
        let arrow = this.arrow.clear();
        let background = this.background.clear();
        let textObject = this.textObject;
        if (!this.arrowPoint) {
            textObject.alpha = 0;
            return;
        }
        else {
            textObject.alpha = 1;
        }
        textObject.wordWrapWidth = this.backgroundWidth - Dialog.padding.x * 2;
        let textBounds = textObject.getLocalBounds();
        let dialogPosition = new Phaser.Point(this.left ? this.arrowPoint.x + 10 - (textBounds.width + Dialog.padding.x * 2) : this.arrowPoint.x - 10 - Dialog.arrowWidth / 2, this.arrowPoint.y - this.arrowHeight - textBounds.height - Dialog.padding.y * 2);
        textObject.x = dialogPosition.x + Dialog.padding.x;
        textObject.y = dialogPosition.y + Dialog.padding.y + 2;
        // Draw arrow
        arrow.beginFill(0xffffff);
        arrow.drawPolygon([
            new Phaser.Point(this.arrowPoint.x - Dialog.arrowWidth / 2, this.arrowPoint.y - this.arrowHeight),
            this.arrowPoint,
            new Phaser.Point(this.arrowPoint.x + Dialog.arrowWidth / 2, this.arrowPoint.y - this.arrowHeight),
        ]);
        arrow.endFill();
        arrow.lineStyle(Dialog.borderWidth, 0x000000)
            .moveTo(this.arrowPoint.x - Dialog.arrowWidth / 2, this.arrowPoint.y - this.arrowHeight)
            .lineTo(this.arrowPoint.x, this.arrowPoint.y)
            .lineTo(this.arrowPoint.x + 1, this.arrowPoint.y)
            .lineTo(this.arrowPoint.x + Dialog.arrowWidth / 2, this.arrowPoint.y - this.arrowHeight);
        // Draw background
        this.dialogHeight = textBounds.height + Dialog.padding.y * 2;
        background.beginFill(0xffffff);
        background.lineStyle(Dialog.borderWidth, 0x000000);
        background.drawRoundedRect(dialogPosition.x, dialogPosition.y + Dialog.borderWidth - 1, textBounds.width + Dialog.padding.x * 2, this.dialogHeight, 6);
        background.endFill();
    }
}
Dialog.padding = new Phaser.Point(6, 5);
Dialog.borderWidth = 2;
Dialog.arrowWidth = 6;
Dialog.style = { font: 'normal 10pt Marker Felt', fill: 0x333333, align: 'center', wordWrap: true, wordWrapWidth: 100 };
/**
 * DialogAreaSubDialog
 */
class DialogAreaSubDialog extends Dialog {
    constructor(game, parent, name = 'DialogAreaSubDialog') {
        super(game, parent, name);
    }
}
/**
 * DialogArea
 */
class DialogArea extends Phaser.Group {
    constructor(game, parent, name = 'DialogArea') {
        super(game, parent, name);
        this.baseLine = 200;
        this.dialogs = new Array();
    }
    displayDialog(text, x) {
        let newDialog = this.add(new DialogAreaSubDialog(this.game, this, 'DialogAreaSubDialog'));
        newDialog.text = text;
        newDialog.xPosition = x;
        this.dialogs.push(newDialog);
        this.updateDialogs();
        return newDialog;
    }
    updateDialogs() {
        var currentHeight = 8;
        var self = this;
        this.dialogs
            .sort((a, b) => {
            return b.xPosition - a.xPosition;
        })
            .forEach((dialog) => {
            dialog.drawAt(new Phaser.Point(dialog.xPosition, self.baseLine), currentHeight, 800);
            currentHeight += dialog.dialogHeight + 4;
        });
    }
    removeDialog(dialog) {
        this.dialogs.splice(this.dialogs.indexOf(dialog), 1);
        this.removeChild(dialog);
        this.updateDialogs();
    }
}
/**
 * DialogHost
 */
class DialogHost {
    constructor(game) {
        this.game = game;
        this.elevatorDialogArea = new DialogArea(game, game.world);
        this.elevatorDialogArea.baseLine = 60 + WhichFloor.yOffset;
    }
    displayDialog(text, arrowPoint, width = 1000, arrowHeight = 14) {
        let dialog = new Dialog(this.game, this.game.world, 'DialogByDialogHost');
        dialog.text = text;
        dialog.drawAt(arrowPoint, arrowHeight, width);
        return dialog;
    }
    autoDissmissDialog(dialog, delay) {
        this.game.time.events.add(delay, () => {
            if (!dialog.parent || !dialog) {
                return;
            }
            if (dialog.parent.constructor.name == 'DialogArea') {
                dialog.parent.removeDialog(dialog);
            }
            else {
                dialog.parent.removeChild(dialog);
            }
        });
        return dialog;
    }
    clearElevatorDialogs() {
        for (var index = this.elevatorDialogArea.dialogs.length - 1; index >= 0; index--) {
            var dialog = this.elevatorDialogArea.dialogs[index];
            this.elevatorDialogArea.removeDialog(dialog);
            this.elevatorDialogArea.updateDialogs();
        }
    }
    displayElevatorDialog(text, x) {
        var dialog = this.autoDissmissDialog(this.elevatorDialogArea.displayDialog(text, x), 3800 + text.length * 50);
        dialog.alpha = 0;
        this.game.time.events.add(800, () => {
            if (dialog) {
                dialog.alpha = 1;
            }
        });
        this.elevatorDialogArea.updateDialogs();
    }
    humanNotMachineDialog(text) {
        if (this._humanDialogInstance && this._humanDialogInstance.parent) {
            this._humanDialogInstance.parent.removeChild(this._humanDialogInstance);
            this._humanDialogInstance = null;
        }
        let dialog = this.autoDissmissDialog(this.displayDialog(text, new Phaser.Point(126, 100 + WhichFloor.yOffset), 110, 40), 1000 + text.length * 40);
        this._humanDialogInstance = dialog;
        dialog.left = true;
        dialog.updateDialog();
    }
    paradiseDialog(text) {
        this.autoDissmissDialog(this.displayDialog(text, new Phaser.Point(455, 222 + WhichFloor.yOffset), 225, 40), 2000 + text.length * 40);
    }
    telephoneDialog(text, callback, context) {
        this.autoDissmissDialog(this.displayDialog(text, new Phaser.Point(150, 300 + WhichFloor.yOffset), 230, 40), 3000 + text.length * 50);
        this.game.time.events.add(3000 + text.length * 50, callback, context);
    }
}
/**
 * WhichFloor
 */
class WhichFloor {
    constructor() {
        this.game = new Phaser.Game(800, 505 + WhichFloor.yOffset, Phaser.AUTO, 'content', { preload: this.preload, create: this.create }, true, true);
    }
    static assetsPath(subPath) {
        return 'assets/' + subPath;
    }
    preload() {
        // Images
        this.game.load.image('sp-logo', WhichFloor.assetsPath('images/sp-logo.png'));
        this.game.load.image('door', WhichFloor.assetsPath('images/door.png'));
        this.game.load.image('hand', WhichFloor.assetsPath('images/hand.png'));
        this.game.load.image('credits', WhichFloor.assetsPath('images/credits.png'));
        // Panelscene
        this.game.load.image('elevator-background', WhichFloor.assetsPath('images/elevator-background.png'));
        this.game.load.image('panel-background', WhichFloor.assetsPath('images/panel-background.png'));
        this.game.load.image('panel-earpiece', WhichFloor.assetsPath('images/panel-earpiece.png'));
        this.game.load.image('spoon', WhichFloor.assetsPath('images/spoon.png'));
        this.game.load.spritesheet('panel-button-seat', WhichFloor.assetsPath('images/panel-button-seat.png'), 60, 60);
        this.game.load.spritesheet('panel-numbers', WhichFloor.assetsPath('images/panel-numbers.png'), 20, 20, 15);
        this.game.load.spritesheet('open-close-buttons', WhichFloor.assetsPath('images/open-close-buttons.png'), 47, 47, 2);
        this.game.load.spritesheet('paradises', WhichFloor.assetsPath('images/paradises.png'), 66, 455, 7);
        // Indicator
        this.game.load.image('elevator-indicator-numbers', WhichFloor.assetsPath('images/elevator-indicator-numbers.png'));
        this.game.load.image('elevator-indicator-graduation', WhichFloor.assetsPath('images/elevator-indicator-graduation.png'));
        // Pssengers
        this.game.load.spritesheet('passengers-normal', WhichFloor.assetsPath('images/passengers-normal.png'), 60, 196, 8);
        this.game.load.image('passenger-managers', WhichFloor.assetsPath('images/passenger-managers.png'));
        this.game.load.image('passenger-bedman', WhichFloor.assetsPath('images/passenger-bedman.png'));
        this.game.load.image('passenger-chairs', WhichFloor.assetsPath('images/passenger-chairs.png'));
        this.game.load.spritesheet('passengers-gift', WhichFloor.assetsPath('images/passengers-gift.png'), 276, 186, 3);
        this.game.load.spritesheet('passengers-squid', WhichFloor.assetsPath('images/passengers-squid.png'), 118, 180);
        this.game.load.spritesheet('passengers-coffee', WhichFloor.assetsPath('images/passengers-coffee.png'), 87, 123, 6);
        // Telephone
        this.game.load.spritesheet('telephone-light', WhichFloor.assetsPath('images/telephone-light.png'), 243, 231, 5);
        this.game.load.spritesheet('telephone', WhichFloor.assetsPath('images/telephone.png'), 243, 231, 2);
        this.game.load.image('telephone-earpiece', WhichFloor.assetsPath('images/telephone-earpiece.png'));
        this.game.load.image('telephone-middle', WhichFloor.assetsPath('images/telephone-middle.png'));
        this.game.load.image('telephone-left', WhichFloor.assetsPath('images/telephone-left.png'));
        this.game.load.spritesheet('telephone-right', WhichFloor.assetsPath('images/telephone-right.png'), 313, 456, 3);
        // Animation
        this.game.load.spritesheet('animate-hangup', WhichFloor.assetsPath('images/animate-hangup.png'), 108, 131, 8);
        this.game.load.spritesheet('animate-human', WhichFloor.assetsPath('images/animate-human.png'), 108, 131, 7);
        this.game.load.spritesheet('animate-human-press', WhichFloor.assetsPath('images/animate-human-press.png'), 108, 131, 7);
        this.game.load.image('desk', WhichFloor.assetsPath('images/desk.png'));
        this.game.load.spritesheet('animate-human-stand', WhichFloor.assetsPath('images/animate-human-stand.png'), 125, 185, 8);
        this.game.load.spritesheet('animate-human-stand-middle', WhichFloor.assetsPath('images/animate-human-stand-middle.png'), 119, 78, 4);
        // Mouth
        this.game.load.spritesheet('animate-mouth', WhichFloor.assetsPath('images/animate-mouth.png'), 103, 67, 9);
        this.game.load.spritesheet('animate-mouth-speaking', WhichFloor.assetsPath('images/animate-mouth-speaking.png'), 119, 78, 9);
        // Audios
        this.game.load.audio('audio-door-close', WhichFloor.assetsPath('audio/door-close.ogg'));
        this.game.load.audio('audio-door-open', WhichFloor.assetsPath('audio/door-open.ogg'));
        this.game.load.audio('audio-elevator-ding', WhichFloor.assetsPath('audio/elevator-ding.ogg'));
        this.game.load.audio('audio-elevator-dong', WhichFloor.assetsPath('audio/elevator-dong.ogg'));
        this.game.load.audio('audio-elevator-theme', WhichFloor.assetsPath('audio/elevator-theme.ogg'));
        this.game.load.audio('audio-telephone-ring', WhichFloor.assetsPath('audio/telephone-ring.ogg'));
        this.game.load.audio('audio-telephone-pickup', WhichFloor.assetsPath('audio/telephone-pickup.ogg'));
        this.game.load.audio('audio-telephone-hangup', WhichFloor.assetsPath('audio/telephone-hangup.ogg'));
        this.game.load.audio('audio-day-off', WhichFloor.assetsPath('audio/day-off.wav'));
    }
    create() {
        this.scene_elevatorHuman = this.game.world.add(new ElevatorHumanScene(this.game));
        this.scene_elevatorHuman.origin = new Origin(40, 25 + WhichFloor.yOffset, 400, 212);
        this.scene_elevatorIndicator = this.game.world.add(new ElevatorIndicatorScene(this.game));
        this.scene_elevatorIndicator.origin = new Origin(40, 250 + WhichFloor.yOffset, 30, 230);
        this.scene_elevatorTelephone = this.game.world.add(new TelephoneScene(this.game));
        this.scene_elevatorTelephone.origin = new Origin(80, 250 + WhichFloor.yOffset, 237, 230);
        this.scene_mouth = this.game.world.add(new ElevatorMouthScene(this.game));
        this.scene_mouth.origin = new Origin(326, 250 + WhichFloor.yOffset, 114, 74);
        this.scene_elevatorPanel = this.game.world.add(new ElevatorPanelScene(this.game));
        this.scene_elevatorPanel.origin = new Origin(450, 25 + WhichFloor.yOffset, 313, 455);
        this.scene_action = this.game.world.add(new ActionScene(this.game));
        this.scene_action.origin = new Origin(326, 336 + WhichFloor.yOffset, 114, 144);
        this.controller_dialogHost = new DialogHost(this.game);
        function EnterTheWorld() {
            this.group_elevatorHumanResourceDept = new ElevatorHumanResourceDept(this.game, null, true);
            this.controller_elevator = new ElevatorController(this.game, this.scene_elevatorIndicator, this.scene_elevatorPanel.elevatorPanel, this.scene_elevatorHuman, this.scene_elevatorPanel, this.group_elevatorHumanResourceDept, this.scene_mouth, this.controller_dialogHost, this.scene_elevatorTelephone, this.scene_action);
            this.controller_elevator.elevatorDing.play();
        }
        if (location.search == '?test') {
            EnterTheWorld.call(this);
        }
        else {
            this.scene_elevatorIndicator.intro(KeyConfig.loadingAnimationDuration, 800, EnterTheWorld, this);
            let sectionTime = KeyConfig.loadingAnimationDuration / 5;
            // Intro aniamtions set:
            // this.scene_elevatorHuman.alpha = 0
            // this.scene_elevatorTelephone.alpha = 0
            // this.scene_mouth.alpha = 0
            // this.scene_elevatorPanel.alpha = 0
            // this.game.add.tween(this.scene_elevatorHuman).to({alpha: 1}, sectionTime * 2.2, null, true, sectionTime * 0)
            // this.game.add.tween(this.scene_elevatorTelephone).to({alpha: 1}, sectionTime * 2.2, null, true, sectionTime * 1.4)
            // this.game.add.tween(this.scene_mouth).to({alpha: 1}, sectionTime * 2.2, null, true, sectionTime * 3)
            // this.game.add.tween(this.scene_elevatorPanel).to({alpha: 1}, sectionTime * 2.2, null, true, sectionTime * 2.8)
            this.scene_elevatorHuman.fadeIn(sectionTime * 2, sectionTime * 0);
            this.scene_elevatorTelephone.fadeIn(sectionTime * 2, sectionTime * 1);
            this.scene_mouth.fadeIn(sectionTime * 2, sectionTime * 2.4);
            this.scene_elevatorPanel.fadeIn(sectionTime * 2, sectionTime * 3.4);
        }
    }
}
WhichFloor.yOffset = 100;
window.addEventListener('load', (event) => {
    var game = new WhichFloor();
});
//# sourceMappingURL=index.js.map