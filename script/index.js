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
    }
    render() {
    }
}
window.addEventListener('load', (event) => {
    var game = new WhichFloor();
});
//# sourceMappingURL=index.js.map