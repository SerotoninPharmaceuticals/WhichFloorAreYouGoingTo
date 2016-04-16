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
 * ElevatorHumanNotMachine
 */
class ElevatorHumanNotMachine extends Phaser.Sprite {
    constructor(game, x, y) {
        super(game, x, y, ElevatorHumanNotMachine.asset_key);
    }
}
ElevatorHumanNotMachine.asset_key = 'elevator-human';
/**
 * ElevatorHumanNotMachine
 */
class ElevatorWorkshop extends Phaser.Group {
    constructor(game) {
        super(game, game.world, 'ElevatorWorkshop');
        this.add(new ElevatorHumanNotMachine(game, 10, 10));
    }
}
/**
 * ElevatorController
 */
class ElevatorController {
    constructor() {
    }
}
/**
 * ComicWindow
 */
class ComicWindow extends Phaser.Group {
    constructor(game) {
        super(game, game.world, 'ComicWindow');
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
 * ElevatorIndicator
 */
class ElevatorIndicator extends ComicWindow {
    constructor(game) {
        super(game);
        this.backgroundColor = 0x7c858a;
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
        this.cw_elevator_main = this.game.world.add(new ComicWindow(this.game));
        this.cw_elevator_main.origin = new Origin(40, 25, 400, 213);
        this.cw_elevator_indicator = this.game.world.add(new ElevatorIndicator(this.game));
        this.cw_elevator_indicator.origin = new Origin(40, 250, 30, 230);
        this.cw_elevator_phone = this.game.world.add(new ComicWindow(this.game));
        this.cw_elevator_phone.origin = new Origin(80, 250, 234, 230);
        this.cw_mouth = this.game.world.add(new ComicWindow(this.game));
        this.cw_mouth.origin = new Origin(323, 250, 117, 76);
        this.cw_elevator_panel = this.game.world.add(new ComicWindow(this.game));
        this.cw_elevator_panel.origin = new Origin(450, 25, 313, 457);
    }
    render() {
    }
}
window.addEventListener('load', (event) => {
    var game = new WhichFloor();
});
//# sourceMappingURL=index.js.map