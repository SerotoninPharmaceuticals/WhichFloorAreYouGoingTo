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
}
/**
 * ElevatorController
 */
class ElevatorController {
    constructor(indicator, panel) {
        this.indicator = indicator;
        this.panel = panel;
    }
}
/**
 * ElevatorIndicatorScene
 */
class ElevatorIndicatorScene extends ComicWindow {
    constructor(game) {
        super(game, 'ElevatorIndicatorScene');
        this.backgroundColor = 0x7c858a;
    }
}
/**
 * ElevatorPanelScene
 */
class ElevatorPanelScene extends ComicWindow {
    constructor(game) {
        super(game, 'ElevatorPanelScene');
    }
}
/**
 * ElevatorPanel
 */
class ElevatorPanel extends Phaser.Group {
    constructor(game, parent) {
        super(game, parent, 'ElevatorPanel');
        this.controlSingal = new Phaser.Signal();
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
    }
    create() {
        this.scene_elevatorMain = this.game.world.add(new ComicWindow(this.game));
        this.scene_elevatorMain.origin = new Origin(40, 25, 400, 213);
        this.scene_elevatorIndicator = this.game.world.add(new ElevatorIndicatorScene(this.game));
        this.scene_elevatorIndicator.origin = new Origin(40, 250, 30, 230);
        this.scene_elevatorPhone = this.game.world.add(new ComicWindow(this.game));
        this.scene_elevatorPhone.origin = new Origin(80, 250, 234, 230);
        this.scene_mouth = this.game.world.add(new ComicWindow(this.game));
        this.scene_mouth.origin = new Origin(323, 250, 117, 76);
        this.scene_elevatorPanel = this.game.world.add(new ElevatorPanelScene(this.game));
        this.scene_elevatorPanel.origin = new Origin(450, 25, 313, 457);
        var d = this.game.world.add(new DialogArea(this.game, this.game.world));
        var c = d.displayDialog('10th floor is just fine.', 100);
        d.displayDialog('Let me see... Maybe 8?', 120);
        d.displayDialog('Ground.', 140);
        d.removeDialog(c);
    }
    render() {
    }
}
window.addEventListener('load', (event) => {
    var game = new WhichFloor();
});
//# sourceMappingURL=index.js.map