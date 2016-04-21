// Which floor are you going to
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
        this.enablebackground = true;
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
class ElevatorHumanNotMachine extends Phaser.Sprite {
    constructor(game, x, y) {
        super(game, x, y, ElevatorHumanNotMachine.asset_key);
    }
}
ElevatorHumanNotMachine.asset_key = 'elevator-human';
/**
 * ElevatorHumanScene
 */
class ElevatorHumanScene extends ComicWindow {
    constructor(game) {
        super(game, 'ElevatorHumanScene');
        this.add(new ElevatorHumanNotMachine(game, 10, 10));
    }
    performPressAction(finished, context) {
        finished.apply(context ? context : this);
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
        this.speakPermission = {
            whichFloor: true,
            howsTheWork: true,
            whatsTheWeather: true,
            howAreYou: true,
        };
        this.anchor.set(0.5, 1.0);
    }
    get lines() {
        return {
            whichFloor: (() => {
                switch (this.destFloor) {
                    case 0:
                        return 'Ground';
                    case 1:
                        return 'First';
                    case 2:
                        return 'Second';
                    case 3:
                        return 'Third';
                    default:
                        return this.destFloor + 'th';
                }
            }) + PickOneRandomly([' floor, please', ' floor']),
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
}
/**
 * ElevatorPassengerSquid
 */
class ElevatorPassengerSquid extends ElevatorPassenger {
    constructor(game, frame) {
        super(game, ElevatorPassengerType.Squid, 'passangers-squid');
        this.speakPermission = {
            whichFloor: true,
            howsTheWork: false,
            whatsTheWeather: false,
            howAreYou: false,
        };
        this.frame = frame;
        this.destFloor = 0;
        switch (this.frame) {
            case 0:
                this.waitingFloor = 2;
            case 1:
                this.waitingFloor = 9;
            case 2:
                this.waitingFloor = 12;
        }
    }
}
/**
 * ElevatorPassengerNormal
 */
class ElevatorPassengerNormal extends ElevatorPassenger {
    constructor(game) {
        super(game, ElevatorPassengerType.Normal, 'passangers-normal');
        this.frame = Math.floor(Math.random() * 8);
        this.waitingFloor = Math.floor(0 + Math.random() * 14);
        do {
            this.destFloor = Math.floor(0 + Math.random() * 14);
        } while (this.waitingFloor == this.destFloor);
    }
}
/**
 * ElevatorPassengerManager
 */
class ElevatorPassengerManager extends ElevatorPassenger {
    constructor(game) {
        super(game, ElevatorPassengerType.Manager, 'passanger-managers');
        this.destFloor = 13;
        this.waitingFloor = 3;
    }
    get lines() {
        return {
            whichFloor: '15th, haven\'t the telephone guy told you already?',
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
        super(game, ElevatorPassengerType.Gift, 'passangers-gift');
        this.frame = frame;
        switch (this.frame) {
            case 0:
                this.destFloor = 2;
            case 1:
                this.destFloor = 9;
            case 2:
                this.destFloor = 12;
        }
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
        super(game, ElevatorPassengerType.Chair, 'passanger-chairs');
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
        super(game, ElevatorPassengerType.BedMan, 'passanger-bedman');
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
        super(game, ElevatorPassengerType.Gift, 'passangers-coffee');
        this.speakPermission = {
            whichFloor: false,
            howsTheWork: false,
            whatsTheWeather: false,
            howAreYou: false,
        };
        this.waitingFloor = -1;
    }
}
/**
 * ElevatorHumanResourceDept
 * Stores all waiting passangers and generate normal passangers
 * An invisable sprite manager
 */
class ElevatorHumanResourceDept extends Phaser.Group {
    constructor(game) {
        super(game, null, 'ElevatorHumanResourceDept');
        this.passengers = [];
        this.duration = 0.2 * Phaser.Timer.SECOND;
        this.passengerGenerateSignal = new Phaser.Signal();
        this.loopTimer = this.game.time.create(false);
        this.loopTimer.loop(this.duration, this.generatePassengersInLoop, this);
        this.loopTimer.start();
    }
    resume() {
        this.loopTimer.resume();
    }
    pause() {
        this.loopTimer.pause();
    }
    generatePassengersInLoop() {
        if (Math.random() * Phaser.Timer.SECOND < this.duration / 5) {
            this.passengerGenerateSignal.dispatch(this.generatePassangersByType(ElevatorPassengerType.Normal));
        }
    }
    expelAllPassangers() {
        this.children.forEach((passanger) => {
            switch (passanger.type) {
                case ElevatorPassengerType.Normal:
                case ElevatorPassengerType.Squid:
                    this.removeChild(passanger);
                    break;
            }
        });
    }
    generatePassangersByType(type) {
        var passengers = [];
        switch (type) {
            case ElevatorPassengerType.Coffee:
                for (var floor = 1; floor <= 13; floor++) {
                    var passenger = this.add(new ElevatorPassengerCoffee(this.game));
                    passenger.destFloor = floor;
                    passengers.push(passenger);
                }
                break;
            case ElevatorPassengerType.Gift:
                for (var index = 0; index < 3; index++) {
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
        }
        return passengers;
    }
}
/**
 * ElevatorController
 */
class ElevatorController {
    constructor(game, indicator, panel, human, panelScene) {
        this.currentFloor = 0;
        this.destFloor = 0;
        this.directionUp = true;
        this.panelState = [
            false, false, false, false, false,
            false, false, false, false, false,
            false, false, false, false, false
        ];
        this.game = game;
        this.indicator = indicator;
        this.panel = panel;
        this.human = human;
        this.panelScene = panelScene;
        this.panelScene.openCloseSignal.add(this.openCloseDoor, this);
        this.panel.controlSingal.add(this.panelPressed, this);
        this.indicator.arriveSignal.add(this.floorReached, this);
    }
    floorReached() {
        if (this.updateIndicator()) {
            this.openCloseDoor('open');
        }
    }
    waitAndCloseDoor() {
        if (this.closeDoorTimer) {
            this.closeDoorTimer.destroy();
        }
        this.closeDoorTimer = this.game.time.create(true);
        this.closeDoorTimer.add(Phaser.Timer.SECOND * 3, () => {
            this.openCloseDoor('close');
        }, this);
        this.closeDoorTimer.start();
    }
    openCloseDoor(action) {
        if (this.indicator.direction != ElevatorDirection.Stop) {
            return;
        }
        if (action == 'open') {
            this.panelScene.openDoor(this.waitAndCloseDoor, this);
        }
        else {
            if (this.closeDoorTimer) {
                this.closeDoorTimer.destroy();
            }
            this.panelScene.closeDoor(() => {
                this.updateIndicator();
            }, this);
        }
    }
    panelPressed(buttonNumber) {
        this.human.performPressAction(() => {
            this.panel.pressByButtonNumber(buttonNumber);
            if (this.indicator.direction == ElevatorDirection.Stop) {
                this.updateIndicator();
            }
        }, this);
    }
    updateIndicator() {
        if (!this.panelScene.doorIsClosed) {
            return;
        }
        if (!this.panel.hasLightButton) {
            this.indicator.go(ElevatorDirection.Stop);
            return;
        }
        if (this.directionUp) {
            var floor = this.panel.closestLightButton(this.indicator.currentFloor, ElevatorDirection.Up);
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
            var floor = this.panel.closestLightButton(this.indicator.currentFloor, ElevatorDirection.Down);
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
 * ElevatorIndicatorScene
 */
class ElevatorIndicatorScene extends ComicWindow {
    constructor(game) {
        super(game, 'ElevatorIndicatorScene');
        this.currentFloor = 0;
        this.direction = ElevatorDirection.Stop;
        this.arriveSignal = new Phaser.Signal();
        this.backgroundColor = 0x7c858a;
        this.elevatorBox = this.add(new Phaser.Graphics(game, 0, 0));
        this.elevatorBox.beginFill(0xffffff, 0.5);
        this.elevatorBox.drawRect(8, 0, 14, 15);
        this.elevatorBox.endFill();
        this.updateToFloor(this.currentFloor);
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
                    this.tweenAndNotify(this.currentFloor + 1, 700, Phaser.Easing.Cubic.In);
                }
                else {
                    this.tweenAndNotify(this.currentFloor + 1, 500, Phaser.Easing.Linear.None);
                }
                break;
            case ElevatorDirection.Down:
                if (this.direction == ElevatorDirection.Stop) {
                    this.tweenAndNotify(this.currentFloor - 1, 700, Phaser.Easing.Cubic.In);
                }
                else {
                    this.tweenAndNotify(this.currentFloor - 1, 500, Phaser.Easing.Linear.None);
                }
                break;
        }
        this.direction = direction;
    }
    targetHeightForFloor(floor) {
        return (2 + 15 * 13) - floor * 15;
    }
    updateToFloor(floor) {
        this.elevatorBox.y = this.targetHeightForFloor(floor);
    }
}
/**
 * ElevatorPanelScene
 */
class ElevatorPanelScene extends ComicWindow {
    constructor(game) {
        super(game, 'ElevatorPanelScene');
        this.door = this.add(new Phaser.Sprite(this.game, 0, 40, 'door'));
        this.add(new Phaser.Sprite(this.game, 30, 0, 'panel-background'));
        this.elevatorPanel = this.add(new ElevatorPanel(game, this));
        this.elevatorPanel.x = 180;
        this.elevatorPanel.y = 20;
        this.openCloseSignal = new Phaser.Signal();
        this.openButton = this.add(new Phaser.Button(this.game, 20, 20, 'open-close-buttons'));
        this.openButton.frame = 1;
        this.openButton.onInputDown.add(() => {
            this.openCloseSignal.dispatch('open');
        }, this);
        this.closeButton = this.add(new Phaser.Button(this.game, 60, 20, 'open-close-buttons'));
        this.closeButton.onInputDown.add(() => {
            this.openCloseSignal.dispatch('close');
        }, this);
    }
    openDoor(finishedClosure, context) {
        if (this.openTween) {
            return;
        }
        if (this.closeTween) {
            this.closeTween.stop(false);
            this.closeTween = null;
        }
        this.openTween = this.game.add.tween(this.door).to({ x: 20 }, 700, Phaser.Easing.Circular.In).start();
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
        this.closeTween = this.game.add.tween(this.door).to({ x: 0 }, 700, Phaser.Easing.Circular.In).start();
        this.closeTween
            .onComplete.add(finishedClosure, context);
        this.closeTween
            .onComplete.add(() => {
            this.closeTween = null;
        }, this);
    }
    get doorIsClosed() {
        return this.door.x == 0;
    }
}
/**
 * ElevatorPanelButton
 */
class ElevatorPanelButton extends Phaser.Button {
    constructor(game, x, y, buttonNumber) {
        super(game, x, y, 'panel-button-seat');
        this.buttonNumber = buttonNumber;
        this.buttonObject = new Phaser.Sprite(game, 4, 4, 'panel-numbers');
        this.addChild(this.buttonObject);
        this.buttonObject.frame = buttonNumber + 1;
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
        for (var i = -1; i <= 13; i++) {
            let button = this.add(new ElevatorPanelButton(this.game, i < 7 ? 0 : 48, i < 7 ? 48 + i * 48 : 48 - 7 * 48 + i * 48, i));
            this.controlButtons.push(button);
            button.onInputDown.add(() => {
                self.controlSingal.dispatch(button.buttonNumber);
            });
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
}
/**
 * Dialog
 */
class Dialog extends Phaser.Group {
    constructor(game, parent, name = 'Dialog') {
        super(game, parent, name);
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
        let dialogPosition = new Phaser.Point(this.arrowPoint.x - 10 - Dialog.arrowWidth / 2, this.arrowPoint.y - this.arrowHeight - textBounds.height - Dialog.padding.y * 2);
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
        var currentHeight = 14;
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
        delete this.dialogs[this.dialogs.indexOf(dialog)];
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
        this.elevatorDialogArea.baseLine = 100;
    }
    displayDialog(text, arrowPoint, width = 1000, arrowHeight = 14) {
        let dialog = new Dialog(this.game, this.game.world, 'DialogByDialogHost');
        dialog.text = text;
        dialog.drawAt(arrowPoint, arrowHeight, width);
        return dialog;
    }
    autoDissmissDialog(dialog, delay) {
        this.game.time.events.add(delay, () => {
            dialog.parent.removeChild(dialog);
        });
    }
    displayElevatorDialog(text, x, delay = Phaser.Timer.SECOND * 3) {
        this.autoDissmissDialog(this.elevatorDialogArea.displayDialog(text, x), delay);
    }
}
/**
 * WhichFloor
 */
class WhichFloor {
    constructor() {
        this.game = new Phaser.Game(800, 505, Phaser.AUTO, 'content', { preload: this.preload, create: this.create, render: this.render }, true, true);
    }
    static assetsPath(subPath) {
        return '/assets/' + subPath;
    }
    preload() {
        this.game.load.image('sp-logo', WhichFloor.assetsPath('images/sp-logo.png'));
        this.game.load.image('door', WhichFloor.assetsPath('images/door.png'));
        this.game.load.image('panel-background', WhichFloor.assetsPath('images/panel-background.png'));
        this.game.load.spritesheet('panel-button-seat', WhichFloor.assetsPath('images/panel-button-seat.png'), 40, 40);
        this.game.load.spritesheet('panel-numbers', WhichFloor.assetsPath('images/panel-numbers.png'), 32, 32, 15);
        this.game.load.spritesheet('open-close-buttons', WhichFloor.assetsPath('images/open-close-buttons.png'), 40, 42, 2);
    }
    create() {
        this.scene_elevatorHuman = this.game.world.add(new ElevatorHumanScene(this.game));
        this.scene_elevatorHuman.origin = new Origin(40, 25, 400, 213);
        this.scene_elevatorIndicator = this.game.world.add(new ElevatorIndicatorScene(this.game));
        this.scene_elevatorIndicator.origin = new Origin(40, 250, 30, 230);
        this.scene_elevatorPhone = this.game.world.add(new ComicWindow(this.game));
        this.scene_elevatorPhone.origin = new Origin(80, 250, 234, 230);
        this.scene_mouth = this.game.world.add(new ComicWindow(this.game));
        this.scene_mouth.origin = new Origin(323, 250, 117, 76);
        this.scene_elevatorPanel = this.game.world.add(new ElevatorPanelScene(this.game));
        this.scene_elevatorPanel.origin = new Origin(450, 25, 313, 457);
        this.controller_dialogHost = new DialogHost(this.game);
        this.controller_dialogHost.displayElevatorDialog("Elevator! I am comming", 100);
        this.controller_dialogHost.displayElevatorDialog("Elevator! I am comming", 180);
        this.controller_dialogHost.displayElevatorDialog("Elevator! I am comming", 130);
        this.group_elevatorHumanResourceDept = new ElevatorHumanResourceDept(this.game);
        this.controller_elevator = new ElevatorController(this.game, this.scene_elevatorIndicator, this.scene_elevatorPanel.elevatorPanel, this.scene_elevatorHuman, this.scene_elevatorPanel);
    }
    render() {
    }
}
window.addEventListener('load', (event) => {
    var game = new WhichFloor();
});
//# sourceMappingURL=index.js.map