// Which floor are you going to

/**
 * Size
 */
class Size {
  width: number
  height: number
  constructor(width: number, height: number) {
    this.width = width
    this.height = height
  }
}

/**
 * Origin
 */
class Origin {
  width: number
  height: number
  x: number
  y: number
  constructor(x: number, y: number, width: number, height: number) {
    this.width = width
    this.height = height
    this.x = x
    this.y = y
  }
}

/**
 * ElevatorHumanNotMachine 
 */
class ElevatorHumanNotMachine  extends Phaser.Sprite {
  static asset_key = 'elevator-human'
  constructor(game: Phaser.Game, x: number, y: number) {
    super(game, x, y, ElevatorHumanNotMachine.asset_key)
  }
}

/**
 * ElevatorHumanNotMachine
 */
class ElevatorWorkshop extends Phaser.Group {
  constructor(game: Phaser.Game) {
    super(game, game.world, 'ElevatorWorkshop')
    this.add(new ElevatorHumanNotMachine(game, 10, 10))
  }
}

/**
 * ElevatorController
 */
class ElevatorController {
  indicator: ElevatorIndicator
  panel: ElevatorPanel
  constructor(indicator: ElevatorIndicator, panel: ElevatorPanel) {
    this.indicator = indicator
    this.panel = panel
  }
}

/**
 * ComicWindow
 */
class ComicWindow extends Phaser.Group {
  
  _display_origin: Origin
  public set origin(origin : Origin) {
    this._display_origin = origin
    this.maskGraphics.clear()
    this.x = this.maskGraphics.x = origin.x
    this.y = this.maskGraphics.y = origin.y
    this.maskGraphics.beginFill(0x000000)
    this.maskGraphics.x = origin.x
    this.maskGraphics.y = origin.y
    this.maskGraphics.drawRect(0, 0, origin.width, origin.height)
    this.maskGraphics.endFill()
    this.mask = this.maskGraphics
    
    this.updateBackground()
  }
  
  maskGraphics: Phaser.Graphics
  enablebackground: boolean = true
  
  // Backgrounds
  backgroundGraphics: Phaser.Graphics
  _backgroundColor: number = 0xffffff
  
  public set backgroundColor(color : number) {
    this._backgroundColor = color
    this.updateBackground()
  }
  
  updateBackground() {
    this.backgroundGraphics.clear()
    if (this.enablebackground && this._display_origin) {
      this.backgroundGraphics.beginFill(this._backgroundColor)
      this.backgroundGraphics.drawRect(0, 0, this._display_origin.width, this._display_origin.height)
      this.backgroundGraphics.endFill()
    }
  }
  
  
  constructor(game: Phaser.Game) {
    super(game, game.world, 'ComicWindow')
    
    this.maskGraphics = game.add.graphics(0, 0)
    this.backgroundGraphics = this.add(new Phaser.Graphics(game, 0, 0))
  }
}

/**
 * ElevatorIndicator
 */
class ElevatorIndicator extends ComicWindow {
  constructor(game: Phaser.Game) {
    super(game)
    this.backgroundColor = 0x7c858a
  }
}

/**
 * ElevatorPanel
 */
class ElevatorPanel extends Phaser.Group {
  controlSingal: Phaser.Signal = new Phaser.Signal()
  constructor(game: Phaser.Game, parent?: PIXI.DisplayObjectContainer) {
    super(game, parent, 'ElevatorPanel')
  }
}

/**
 * WhichFloor
 */
class WhichFloor {
  
  static assetsPath(subPath: string): string {
    return '/assets/' + subPath
  }

  game: Phaser.Game
  
  constructor() {
    this.game = new Phaser.Game(800, 505, Phaser.AUTO, 'content', {preload: this.preload, create: this.create, render: this.render}, true, true)
  }
  
  preload() {
    this.game.load.image('sp-logo', WhichFloor.assetsPath('images/sp-logo.png'))
  }
  
  cw_elevator_main: ComicWindow
  cw_elevator_indicator: ElevatorIndicator
  cw_elevator_phone: ComicWindow
  cw_mouth: ComicWindow
  cw_elevator_panel: ComicWindow

  create() {
    this.cw_elevator_main = this.game.world.add(new ComicWindow(this.game))
    this.cw_elevator_main.origin = new Origin(40, 25, 400, 213)
    
    this.cw_elevator_indicator = this.game.world.add(new ElevatorIndicator(this.game))
    this.cw_elevator_indicator.origin = new Origin(40, 250, 30, 230)
    
    this.cw_elevator_phone = this.game.world.add(new ComicWindow(this.game))
    this.cw_elevator_phone.origin = new Origin(80, 250, 234, 230)
    
    this.cw_mouth = this.game.world.add(new ComicWindow(this.game))
    this.cw_mouth.origin = new Origin(323, 250, 117, 76)
    
    this.cw_elevator_panel = this.game.world.add(new ComicWindow(this.game))
    this.cw_elevator_panel.origin = new Origin(450, 25, 313, 457)
  }
  
  render() {
  }
}


window.addEventListener('load', (event) => {
  var game = new WhichFloor()
})