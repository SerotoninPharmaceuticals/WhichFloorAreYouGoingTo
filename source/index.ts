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
  
  
  constructor(game: Phaser.Game, name :string = 'ComicWindow') {
    super(game, game.world, name)
    
    this.maskGraphics = game.add.graphics(0, 0)
    this.backgroundGraphics = this.add(new Phaser.Graphics(game, 0, 0))
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
 * ElevatorHumanScene
 */
class ElevatorHumanScene extends ComicWindow {
  constructor(game: Phaser.Game) {
    super(game, 'ElevatorHumanScene')
    this.add(new ElevatorHumanNotMachine(game, 10, 10))
  }
}

/**
 * ElevatorController
 */
class ElevatorController {
  indicator: ElevatorIndicatorScene
  panel: ElevatorPanel
  constructor(indicator: ElevatorIndicatorScene, panel: ElevatorPanel) {
    this.indicator = indicator
    this.panel = panel
  }
}

/**
 * ElevatorIndicatorScene
 */
class ElevatorIndicatorScene extends ComicWindow {
  constructor(game: Phaser.Game) {
    super(game, 'ElevatorIndicatorScene')
    this.backgroundColor = 0x7c858a
  }
}

/**
 * ElevatorPanelScene
 */
class ElevatorPanelScene extends ComicWindow  {
  elevatorPanel: ElevatorPanel
  constructor(game: Phaser.Game) {
    super(game, 'ElevatorPanelScene')
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
 * Dialog
 */
class Dialog extends Phaser.Group {
  
  static padding = new Phaser.Point(6, 5)
  static borderWidth = 2
  static arrowWidth = 6
  static style: Phaser.PhaserTextStyle = {font: 'normal 10pt Marker Felt', fill: 0x333333, align: 'center', wordWrap: true, wordWrapWidth: 100}
  
  constructor(game: Phaser.Game, parent: PIXI.DisplayObjectContainer, name: string = 'Dialog') {
    super(game, parent, name)
    this.background = this.add(new Phaser.Graphics(game, 0, 0))
    this.arrow = this.add(new Phaser.Graphics(game, 0, 0))
    this.textObject = this.add(new Phaser.Text(game, Dialog.padding.x, Dialog.padding.y, '', Dialog.style))
    this.textObject.lineSpacing = -5
  }
  
  public set text(text : string) {
    this.textObject.text = text
    this.updateDialog()
  }
  
  textObject: Phaser.Text
  background: Phaser.Graphics
  arrow: Phaser.Graphics 
  
  arrowPoint: Phaser.Point
  arrowHeight: number
  backgroundWidth: number
  
  dialogHeight: number

  drawAt(arrowPoint: Phaser.Point, arrowHeight: number, backgroundWidth: number) {
    this.arrowPoint = arrowPoint
    this.arrowHeight = arrowHeight
    this.backgroundWidth = backgroundWidth
    this.updateDialog()
  }
  
  updateDialog() {
    let arrow = this.arrow.clear()
    let background = this.background.clear()
    let textObject = this.textObject
    if (!this.arrowPoint) {
      textObject.alpha = 0
      return
    } else {
      textObject.alpha = 1
    }
    textObject.wordWrapWidth = this.backgroundWidth - Dialog.padding.x * 2
    let textBounds = textObject.getLocalBounds()
    let dialogPosition = new Phaser.Point(this.arrowPoint.x - 10 - Dialog.arrowWidth / 2, this.arrowPoint.y - this.arrowHeight - textBounds.height - Dialog.padding.y * 2)
    textObject.x = dialogPosition.x + Dialog.padding.x
    textObject.y = dialogPosition.y + Dialog.padding.y + 2
    // Draw arrow
    arrow.beginFill(0xffffff)
    arrow.drawPolygon([
      new Phaser.Point(this.arrowPoint.x - Dialog.arrowWidth / 2, this.arrowPoint.y - this.arrowHeight),
      this.arrowPoint,
      new Phaser.Point(this.arrowPoint.x + Dialog.arrowWidth / 2, this.arrowPoint.y - this.arrowHeight),
    ])
    arrow.endFill()
    arrow.lineStyle(Dialog.borderWidth, 0x000000)
      .moveTo(this.arrowPoint.x - Dialog.arrowWidth / 2, this.arrowPoint.y - this.arrowHeight)
      .lineTo(this.arrowPoint.x, this.arrowPoint.y)
      .lineTo(this.arrowPoint.x + 1, this.arrowPoint.y)
      .lineTo(this.arrowPoint.x + Dialog.arrowWidth / 2, this.arrowPoint.y - this.arrowHeight)
    // Draw background
    this.dialogHeight = textBounds.height + Dialog.padding.y * 2
    background.beginFill(0xffffff)
    background.lineStyle(Dialog.borderWidth, 0x000000)
    background.drawRoundedRect(
      dialogPosition.x,
      dialogPosition.y + Dialog.borderWidth - 1,
      textBounds.width + Dialog.padding.x * 2, 
      this.dialogHeight,
      6)
    background.endFill()
  }
}

/**
 * DialogAreaSubDialog
 */
class DialogAreaSubDialog extends Dialog {
  xPosition: number
  constructor(game: Phaser.Game, parent: PIXI.DisplayObjectContainer, name: string = 'DialogAreaSubDialog') {
    super(game, parent, name)
  }
}

/**
 * DialogArea
 */
class DialogArea extends Phaser.Group {
  baseLine: number = 200
  dialogs: DialogAreaSubDialog[] = new Array()
  constructor(game: Phaser.Game, parent: PIXI.DisplayObjectContainer, name: string = 'DialogArea') {
    super(game, parent, name)
  }

  displayDialog(text: string, x: number): DialogAreaSubDialog {
    let newDialog: DialogAreaSubDialog = this.add(new DialogAreaSubDialog(this.game, this, 'DialogAreaSubDialog'))
    newDialog.text = text
    newDialog.xPosition = x
    this.dialogs.push(newDialog)
    this.updateDialogs()
    return newDialog
  }
  
  updateDialogs() {
    var currentHeight = 14
    var self = this
    this.dialogs
      .sort((a, b): number => {
        return b.xPosition - a.xPosition
      })
      .forEach((dialog) => {
        dialog.drawAt(
          new Phaser.Point(dialog.xPosition, self.baseLine),
          currentHeight,
          800
          )
        currentHeight += dialog.dialogHeight + 4
      })
  }
  
  removeDialog(dialog: DialogAreaSubDialog) {
    delete this.dialogs[
      this.dialogs.indexOf(dialog)
    ]
    this.removeChild(dialog)
    this.updateDialogs()
  }
}

/**
 * DialogHost
 */
class DialogHost {
  game: Phaser.Game
  constructor(game: Phaser.Game) {
    this.game = game
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
  
  scene_elevatorMain: ComicWindow
  scene_elevatorIndicator: ElevatorIndicatorScene
  scene_elevatorPhone: ComicWindow
  scene_mouth: ComicWindow
  scene_elevatorPanel: ElevatorPanelScene

  create() {
    this.scene_elevatorMain = this.game.world.add(new ComicWindow(this.game))
    this.scene_elevatorMain.origin = new Origin(40, 25, 400, 213)
    
    this.scene_elevatorIndicator = this.game.world.add(new ElevatorIndicatorScene(this.game))
    this.scene_elevatorIndicator.origin = new Origin(40, 250, 30, 230)
    
    this.scene_elevatorPhone = this.game.world.add(new ComicWindow(this.game))
    this.scene_elevatorPhone.origin = new Origin(80, 250, 234, 230)
    
    this.scene_mouth = this.game.world.add(new ComicWindow(this.game))
    this.scene_mouth.origin = new Origin(323, 250, 117, 76)
    
    this.scene_elevatorPanel = this.game.world.add(new ElevatorPanelScene(this.game))
    this.scene_elevatorPanel.origin = new Origin(450, 25, 313, 457)
    
    var d: DialogArea = this.game.world.add(new DialogArea(this.game, this.game.world))
    var c = d.displayDialog('10th floor is just fine.', 100)
    d.displayDialog('Let me see... Maybe 8?', 120)
    d.displayDialog('Ground.', 140)
    d.removeDialog(c);
  }
  
  render() {
  }
}


window.addEventListener('load', (event) => {
  var game = new WhichFloor()
})