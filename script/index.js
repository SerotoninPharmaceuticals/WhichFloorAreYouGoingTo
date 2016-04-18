// Which floor are you going to
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
    ElevatorPassengerType[ElevatorPassengerType["Normal"] = 0] = "Normal";
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
    constructor(game, type) {
        super(game, 0, 0, ElevatorPassenger.spriteIdForType(type));
    }
    static spriteIdForType(type) {
        return 'unimplemented';
    }
}
/**
 * ElevatorHumanResourceDept
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
        console.log('called');
        if (Math.random() * Phaser.Timer.SECOND < this.duration / 5) {
            console.log('generate passengers');
        }
    }
}
/**
 * ElevatorController
 */
class ElevatorController {
    constructor(indicator, panel, human) {
        this.currentFloor = 0;
        this.destFloor = 0;
        this.directionUp = true;
        this.panelState = [
            false, false, false, false, false,
            false, false, false, false, false,
            false, false, false, false, false
        ];
        this.indicator = indicator;
        this.panel = panel;
        this.human = human;
        this.panel.controlSingal.add(this.panelPressed, this);
        this.indicator.arriveSignal.add(() => {
            this.updateIndicator();
        }, this);
    }
    panelPressed(buttonNumber) {
        this.human.performPressAction(() => {
            this.indicator.go(ElevatorDirection.Up);
            this.panel.pressByButtonNumber(buttonNumber);
        }, this);
    }
    updateIndicator() {
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
                    this.tweenAndNotify(this.currentFloor + 1, 700, Phaser.Easing.Circular.In);
                }
                else {
                    this.tweenAndNotify(this.currentFloor + 1, 700, Phaser.Easing.Linear.None);
                }
                break;
            case ElevatorDirection.Down:
                if (this.direction == ElevatorDirection.Stop) {
                    this.tweenAndNotify(this.currentFloor - 1, 700, Phaser.Easing.Circular.In);
                }
                else {
                    this.tweenAndNotify(this.currentFloor - 1, 700, Phaser.Easing.Linear.None);
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
        this.elevatorPanel = this.add(new ElevatorPanel(game, this));
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
            let button = this.add(new ElevatorPanelButton(this.game, i < 7 ? 40 : 88, i < 7 ? 80 + i * 48 : 80 - 7 * 48 + i * 48, i));
            this.controlButtons.push(button);
            button.onInputDown.add(() => {
                self.controlSingal.dispatch(button.buttonNumber);
            });
        }
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
        this.game.load.spritesheet('panel-button-seat', WhichFloor.assetsPath('images/panel-button-seat.png'), 40, 40);
        this.game.load.spritesheet('panel-numbers', WhichFloor.assetsPath('images/panel-numbers.png'), 32, 32, 15);
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
        this.controller_elevator = new ElevatorController(this.scene_elevatorIndicator, this.scene_elevatorPanel.elevatorPanel, this.scene_elevatorHuman);
    }
    render() {
    }
}
window.addEventListener('load', (event) => {
    var game = new WhichFloor();
});
//# sourceMappingURL=index.js.map