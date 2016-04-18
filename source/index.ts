// Which floor are you going to

function PickOneRandomly<T>(array: T[]): T {
  return array[
    Math.floor(Math.random() * array.length)
  ]
}

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
  performPressAction(finished: Function, context?: any) {
    finished.apply(context? context : this)
  }
}

enum ElevatorPassengerType {
  // Expellable
  Normal,
  Squid,
  
  // Unexpellable
  Manager,
  Gift,
  Chair,
  BedMan,
  Coffee
}

enum ElevatorPassengerState {
  OnHold,
  OnBoard,
}

interface ElevatorPassengerLines {
  whichFloor: string,
  howsTheWork: string,
  whatsTheWeather: string,
  howAreYou: string,
}

interface ElevatorPassengerSpeakPermission {
  whichFloor: boolean,
  howsTheWork: boolean,
  whatsTheWeather: boolean,
  howAreYou: boolean,
}

/**
 * ElevatorPassenger
 */
class ElevatorPassenger extends Phaser.Sprite {

  type: ElevatorPassengerType
  state: ElevatorPassengerState
  waitingFloor: number
  destFloor: number
  
  public get lines(): ElevatorPassengerLines {
    return {
      whichFloor: ((): string => {
          switch (this.destFloor) {
          case 0:
            return 'Ground'
          case 1:
            return 'First'
          case 2:
            return 'Second'
          case 3:
            return 'Third'
          default:
            return this.destFloor + 'th'
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
    }
  }
  
  speakPermission: ElevatorPassengerSpeakPermission = {
    whichFloor: true,
    howsTheWork: true,
    whatsTheWeather: true,
    howAreYou: true,
  }

  constructor(game: Phaser.Game, type: ElevatorPassengerType, key: string) {
    super(game, 0, 0, key)
    this.anchor.set(0.5, 1.0)
  }
}

/**
 * ElevatorPassengerSquid
 */
class ElevatorPassengerSquid extends ElevatorPassenger {
  
  speakPermission: ElevatorPassengerSpeakPermission = {
    whichFloor: true,
    howsTheWork: false,
    whatsTheWeather: false,
    howAreYou: false,
  }
  
  constructor(game: Phaser.Game, frame: number) {
    super(game, ElevatorPassengerType.Squid, 'passangers-squid')
    this.frame = frame
    this.destFloor = 0
    switch(this.frame) {
    case 0:
      this.waitingFloor = 2
    case 1:
      this.waitingFloor = 9
    case 2:
      this.waitingFloor = 12
    }
  }
}

/**
 * ElevatorPassengerNormal
 */
class ElevatorPassengerNormal extends ElevatorPassenger {
  
  constructor(game: Phaser.Game) {
    super(game, ElevatorPassengerType.Normal, 'passangers-normal')
    this.frame = Math.floor(Math.random() * 8)
    this.waitingFloor = Math.floor(-1 + Math.random() * 15)
    do {
      this.destFloor = Math.floor(-1 + Math.random() * 15) 
    } while (this.waitingFloor == this.destFloor)
  }
}

/**
 * ElevatorPassengerManager
 */
class ElevatorPassengerManager extends ElevatorPassenger {
  
  public get lines() : ElevatorPassengerLines {
    return {
      whichFloor: '15th, haven\'t the telephone guy told you already?',
      howsTheWork: 'As long as you keep the elevator running, it will be fine',
      whatsTheWeather: 'It has nothing to do with neither of our work',
      howAreYou: 'I am',
    }
  }
  
  constructor(game: Phaser.Game) {
    super(game, ElevatorPassengerType.Manager, 'passanger-managers')
    this.destFloor = 13
    this.waitingFloor = 3
  }
}

/**
 * ElevatorPassengerGift
 */
class ElevatorPassengerGift extends ElevatorPassenger {
  
  public get lines() : ElevatorPassengerLines {
    return {
      whichFloor: '2nd floor, 9th floor, and then 12th floor',
      howsTheWork: 'Couldn\'t be better, see? Delivering the company\'s gratitude to our employees',
      whatsTheWeather: 'Bad, the basement is almost flooded, ruined half of our prepared gift',
      howAreYou: 'Good as a good gift manager',
    }
  }

  constructor(game: Phaser.Game, frame: number) {
    super(game, ElevatorPassengerType.Gift, 'passangers-gift')
    this.frame = frame
    switch(this.frame) {
    case 0:
      this.destFloor = 2
    case 1:
      this.destFloor = 9
    case 2:
      this.destFloor = 12
    }
    this.waitingFloor = -1
  }
}

/**
 * ElevatorPassengerChair
 */
class ElevatorPassengerChair extends ElevatorPassenger {
  
  public get lines() : ElevatorPassengerLines {
    return {
      whichFloor: 'Is it 4th floor, isn\'t it?',
      howsTheWork: 'Best as I could',
      whatsTheWeather: 'Who knows? Who cares?',
      howAreYou: 'How am I what?',
    }
  }

  constructor(game: Phaser.Game) {
    super(game, ElevatorPassengerType.Chair, 'passanger-chairs')
    this.waitingFloor = 11
    this.destFloor = 4
  }
}

/**
 * ElevatorPassengerBedMan
 */
class ElevatorPassengerBedMan extends ElevatorPassenger {
  
  public get lines() : ElevatorPassengerLines {
    return {
      whichFloor: 'I thought it has already been notified, it\'s 10th then',
      howsTheWork: 'Improving. Slightly, no, noticeably better than yesterday',
      whatsTheWeather: 'Changing. Mostly cloudy, showers around, getting colder',
      howAreYou: '3.5 out of 5, I could complain, but I\'m not going to',
    }
  }

  constructor(game: Phaser.Game) {
    super(game, ElevatorPassengerType.BedMan, 'passanger-bedman')
    this.waitingFloor = 3
    this.destFloor = 10
  }
}

/**
 * ElevatorPassengerCoffee
 */
class ElevatorPassengerCoffee extends ElevatorPassenger {
  
  speakPermission: ElevatorPassengerSpeakPermission = {
    whichFloor: false,
    howsTheWork: false,
    whatsTheWeather: false,
    howAreYou: false,
  }

  constructor(game: Phaser.Game) {
    super(game, ElevatorPassengerType.Gift, 'passangers-coffee')
    this.waitingFloor = -1
  }
}

/**
 * ElevatorHumanResourceDept
 * Stores all waiting passangers and generate normal passangers
 * An invisable sprite manager
 */
class ElevatorHumanResourceDept extends Phaser.Group {
  passengers: ElevatorPassenger[] = []
  
  duration: number = 0.2 * Phaser.Timer.SECOND
  loopTimer: Phaser.Timer

  constructor(game: Phaser.Game) {
    super(game, null, 'ElevatorHumanResourceDept')
    this.loopTimer = this.game.time.create(false)
    this.loopTimer.loop(this.duration, this.generatePassengersInLoop, this)
    this.loopTimer.start()
  }
  
  resume() {
    this.loopTimer.resume()
  }
  
  pause() {
    this.loopTimer.pause()
  }
  
  passengerGenerateSignal = new Phaser.Signal()

  generatePassengersInLoop() {
    if (Math.random() * Phaser.Timer.SECOND < this.duration / 5) {
      console.log('generate passengers')
    }
  }
  
  expelAllPassangers() {
    this.children.forEach((passanger: ElevatorPassenger) => {
      switch (passanger.type) {
      case ElevatorPassengerType.Normal:
      case ElevatorPassengerType.Squid:
        this.removeChild(passanger)
        break
      }
    })
  }
  
  generatePassangersByType(type: ElevatorPassengerType): ElevatorPassenger[] {
    var passengers: ElevatorPassenger[] = []
    switch (type) {
      case ElevatorPassengerType.Coffee:
        for (var floor = 1; floor <= 13; floor++) {
          var passenger: ElevatorPassengerCoffee = this.add(new ElevatorPassengerCoffee(this.game))
          passenger.destFloor = floor
          passengers.push(passenger)
        }
        break
      case ElevatorPassengerType.Gift:
        for (var index = 0; index < 3; index++) {
          passengers.push(this.add(new ElevatorPassengerGift(this.game, index)))
        }
        break
      case ElevatorPassengerType.Chair:
        passengers.push(this.add(new ElevatorPassengerChair(this.game)))
        break
      case ElevatorPassengerType.BedMan:
        passengers.push(this.add(new ElevatorPassengerBedMan(this.game)))
        break
      case ElevatorPassengerType.Manager:
        passengers.push(this.add(new ElevatorPassengerManager(this.game)))
        break
      case ElevatorPassengerType.Normal:
        
    }
    return passengers
  }
}

/**
 * ElevatorController
 */
class ElevatorController {
  indicator: ElevatorIndicatorScene
  panel: ElevatorPanel
  human: ElevatorHumanScene

  currentFloor: number = 0
  destFloor: number = 0
  directionUp: boolean = true
  panelState: boolean[] = [
    false, false, false, false, false,
    false, false, false, false, false,
    false, false, false, false, false
    ]

  constructor(indicator: ElevatorIndicatorScene, panel: ElevatorPanel, human: ElevatorHumanScene) {
    this.indicator = indicator
    this.panel = panel
    this.human = human
    this.panel.controlSingal.add(this.panelPressed, this)
    this.indicator.arriveSignal.add(() => {
      this.updateIndicator()
    }, this)
  }
  
  panelPressed(buttonNumber: number) {
    this.human.performPressAction(() => {
      this.indicator.go(ElevatorDirection.Up)
      this.panel.pressByButtonNumber(buttonNumber)
    }, this)
  }
  
  updateIndicator() {
    
  }
}

enum ElevatorDirection {
  Up,
  Down,
  Stop
}

/**
 * ElevatorIndicatorScene
 */
class ElevatorIndicatorScene extends ComicWindow {

  elevatorBox: Phaser.Graphics

  currentFloor: number = 0
  direction: ElevatorDirection = ElevatorDirection.Stop
  
  arriveSignal: Phaser.Signal = new Phaser.Signal()

  constructor(game: Phaser.Game) {
    super(game, 'ElevatorIndicatorScene')
    this.backgroundColor = 0x7c858a
    this.elevatorBox = this.add(new Phaser.Graphics(game, 0, 0))
    this.elevatorBox.beginFill(0xffffff, 0.5)
    this.elevatorBox.drawRect(8, 0, 14, 15)
    this.elevatorBox.endFill()
    this.updateToFloor(this.currentFloor)
  }
  
  tweenAndNotify(floor: number, duration: number, easingFunc: Function) {
    this.game.add.tween(this.elevatorBox).to({y: this.targetHeightForFloor(floor)}, duration, easingFunc, true)
    this.game.time.events.add(duration, () => {
      this.currentFloor = floor
      this.arriveSignal.dispatch(floor)
    }, this)
  }
  
  go(direction: ElevatorDirection) {
    switch (direction) {
    case ElevatorDirection.Up:
      if (this.direction == ElevatorDirection.Stop) {
        this.tweenAndNotify(this.currentFloor + 1, 700, Phaser.Easing.Circular.In)
      } else {
        this.tweenAndNotify(this.currentFloor + 1, 700, Phaser.Easing.Linear.None)
      }
      break
    case ElevatorDirection.Down:
      if (this.direction == ElevatorDirection.Stop) {
        this.tweenAndNotify(this.currentFloor - 1, 700, Phaser.Easing.Circular.In)
      } else {
        this.tweenAndNotify(this.currentFloor - 1, 700, Phaser.Easing.Linear.None)
      }
      break
    }
    this.direction = direction
  }
  
  targetHeightForFloor(floor: number) {
    return (2 + 15 * 13) - floor * 15
  }
  
  updateToFloor(floor: number) {
    this.elevatorBox.y = this.targetHeightForFloor(floor)
  }
}

/**
 * ElevatorPanelScene
 */
class ElevatorPanelScene extends ComicWindow  {
  elevatorPanel: ElevatorPanel
  constructor(game: Phaser.Game) {
    super(game, 'ElevatorPanelScene')
    this.elevatorPanel = this.add(new ElevatorPanel(game, this))
  }
}

/**
 * ElevatorPanelButton
 */
class ElevatorPanelButton extends Phaser.Button {
  buttonNumber: number
  buttonObject: Phaser.Sprite
  constructor(game: Phaser.Game, x: number, y: number, buttonNumber: number) {
    super(game, x, y, 'panel-button-seat')
    this.buttonNumber = buttonNumber
    this.buttonObject = new Phaser.Sprite(game, 4, 4, 'panel-numbers')
    this.addChild(this.buttonObject)
    this.buttonObject.frame = buttonNumber + 1
  }
  
  public get lighted() : boolean {
    if (this.frame == 0) {
      return false
    } else {
      return true
    }
  }
  
  pressByButtonNumber(buttonNumber: number) {
    if (buttonNumber == this.buttonNumber) {
      this.frame = 1
    }
  }

  dismissByButtonNumber(buttonNumber: number) {
    if (buttonNumber == this.buttonNumber) {
      this.frame = 0
    }
  }
}

/**
 * ElevatorPanel
 */
class ElevatorPanel extends Phaser.Group {

  controlSingal: Phaser.Signal = new Phaser.Signal()
  controlButtons: ElevatorPanelButton[]

  constructor(game: Phaser.Game, parent?: PIXI.DisplayObjectContainer) {
    super(game, parent, 'ElevatorPanel')
    var self = this
    this.controlButtons = []
    for (var i = -1; i <= 13; i++) {
      let button: ElevatorPanelButton = this.add(new ElevatorPanelButton(this.game, i < 7 ? 40 : 88, i < 7 ? 80 + i * 48 : 80 - 7 * 48 + i * 48, i))
      this.controlButtons.push(button)
      button.onInputDown.add(() => {
        self.controlSingal.dispatch(button.buttonNumber)
      })
    }
  }

  dismissByButtonNumber(buttonNumber: number) {
    this.callAll('dismissByButtonNumber', null, buttonNumber)
  }

  pressByButtonNumber(buttonNumber: number) {
    this.callAll('pressByButtonNumber', null, buttonNumber)
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
  elevatorDialogArea: DialogArea

  constructor(game: Phaser.Game) {
    this.game = game
    this.elevatorDialogArea = new DialogArea(game, game.world)
    this.elevatorDialogArea.baseLine = 100
  }

  displayDialog(text: string, arrowPoint: Phaser.Point, width: number = 1000, arrowHeight: number = 14): Dialog {
    let dialog = new Dialog(this.game, this.game.world, 'DialogByDialogHost')
    dialog.text = text
    dialog.drawAt(arrowPoint, arrowHeight, width)
    return dialog
  }

  autoDissmissDialog(dialog: Dialog, delay: number) {
    this.game.time.events.add(delay, () => {
      dialog.parent.removeChild(dialog)
    })
  }
  
  displayElevatorDialog(text: string, x: number, delay: number = Phaser.Timer.SECOND * 3) {
    this.autoDissmissDialog(this.elevatorDialogArea.displayDialog(text, x), delay)
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
    this.game.load.spritesheet('panel-button-seat', WhichFloor.assetsPath('images/panel-button-seat.png'), 40, 40)
    this.game.load.spritesheet('panel-numbers', WhichFloor.assetsPath('images/panel-numbers.png'), 32, 32, 15)
  }
  
  scene_elevatorHuman: ElevatorHumanScene
  scene_elevatorIndicator: ElevatorIndicatorScene
  scene_elevatorPhone: ComicWindow
  scene_mouth: ComicWindow
  scene_elevatorPanel: ElevatorPanelScene
  
  controller_dialogHost: DialogHost
  controller_elevator: ElevatorController
  
  group_elevatorHumanResourceDept: ElevatorHumanResourceDept

  create() {
    this.scene_elevatorHuman = this.game.world.add(new ElevatorHumanScene(this.game))
    this.scene_elevatorHuman.origin = new Origin(40, 25, 400, 213)
    
    this.scene_elevatorIndicator = this.game.world.add(new ElevatorIndicatorScene(this.game))
    this.scene_elevatorIndicator.origin = new Origin(40, 250, 30, 230)
    
    this.scene_elevatorPhone = this.game.world.add(new ComicWindow(this.game))
    this.scene_elevatorPhone.origin = new Origin(80, 250, 234, 230)
    
    this.scene_mouth = this.game.world.add(new ComicWindow(this.game))
    this.scene_mouth.origin = new Origin(323, 250, 117, 76)
    
    this.scene_elevatorPanel = this.game.world.add(new ElevatorPanelScene(this.game))
    this.scene_elevatorPanel.origin = new Origin(450, 25, 313, 457)

    this.controller_dialogHost = new DialogHost(this.game)
    this.controller_dialogHost.displayElevatorDialog("Elevator! I am comming", 100)
    this.controller_dialogHost.displayElevatorDialog("Elevator! I am comming", 180)
    this.controller_dialogHost.displayElevatorDialog("Elevator! I am comming", 130)
    
    this.group_elevatorHumanResourceDept = new ElevatorHumanResourceDept(this.game)
    
    this.controller_elevator = new ElevatorController(this.scene_elevatorIndicator, this.scene_elevatorPanel.elevatorPanel, this.scene_elevatorHuman)
    
  }
  
  render() {
  }
}


window.addEventListener('load', (event) => {
  var game = new WhichFloor()
})