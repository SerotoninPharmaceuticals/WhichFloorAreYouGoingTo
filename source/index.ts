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
  elevatorPassengerContainer: ElevatorHumanResourceDept

  constructor(game: Phaser.Game) {
    super(game, 'ElevatorHumanScene')
    this.add(new Phaser.Sprite(this.game, 0, 0, 'elevator-background'))
    this.add(new ElevatorHumanNotMachine(game, 10, 10))
    this.elevatorPassengerContainer = this.add(new ElevatorHumanResourceDept(this.game, this.game.world, false))
    this.elevatorPassengerContainer.x = 0
    this.elevatorPassengerContainer.y = 213
  }

  performPressAction(finished: Function, context?: any) {
    finished.apply(context? context : this)
  }
}

/**
 * ElevatorHumanScene
 */
class TelephoneScene extends ComicWindow {

  light: Phaser.Sprite
  earpiece: Phaser.Sprite
  constructor(game: Phaser.Game) {
    super(game, 'TelephoneScene')
    this.add(new Phaser.Sprite(this.game, -2, 0, 'telephone'))
    this.light = this.add(new Phaser.Sprite(this.game, -2, 0, 'telephone-light'))
    this.light.alpha = 0
    this.add(new Phaser.Sprite(this.game, -2, 0, 'telephone', 1))
    this.earpiece = this.add(new Phaser.Sprite(this.game, -2, 0, 'telephone-earpiece'))
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
  
  static animationDuration = 1400

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
  
  _grayTint = 0x0000ff
  
  public get grayTint() : number {
    return this._grayTint
  }
  
  
  public set grayTint(tint : number) {
    this.tint = 0x010101 * Math.ceil(tint)
    this._grayTint = tint
  }
  
  
  performIntroAnimation() {
    this.grayTint = 0x000001
    this.alpha = 0
    this.game.add.tween(this).to({alpha: 1, grayTint: 0x0000ff}, ElevatorPassenger.animationDuration, Phaser.Easing.Cubic.In, true)
  }
  
  performFeawellAnimation() {
    this.grayTint = 0x0000ff
    this.alpha = 1
    this.game.add.tween(this).to({alpha: 0, grayTint: 0x000001}, ElevatorPassenger.animationDuration, Phaser.Easing.Cubic.Out, true)
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
    super(game, ElevatorPassengerType.Squid, 'passengers-squid')
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
    super(game, ElevatorPassengerType.Normal, 'passengers-normal')
    this.frame = Math.floor(Math.random() * 8)
    this.waitingFloor = Math.floor(0 + Math.random() * 14)
    do {
      this.destFloor = Math.floor(0 + Math.random() * 14) 
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
    super(game, ElevatorPassengerType.Manager, 'passenger-managers')
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
    super(game, ElevatorPassengerType.Gift, 'passengers-gift')
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
    super(game, ElevatorPassengerType.Chair, 'passenger-chairs')
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
    super(game, ElevatorPassengerType.BedMan, 'passenger-bedman')
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
    super(game, ElevatorPassengerType.Gift, 'passengers-coffee')
    this.waitingFloor = -1
  }
}

/**
 * ElevatorHumanResourceDept
 * Stores all waiting passengers and generate normal passengers
 * An invisable sprite manager
 */
class ElevatorHumanResourceDept extends Phaser.Group {
  duration: number = 0.2 * Phaser.Timer.SECOND
  loopTimer: Phaser.Timer
  duringAnimation: boolean = false

  constructor(game: Phaser.Game, world: PIXI.DisplayObjectContainer, autoGen: boolean) {
    super(game, world, 'ElevatorHumanResourceDept')
    if (autoGen) {
      this.loopTimer = this.game.time.create(false)
      this.loopTimer.loop(this.duration, this.generatePassengersInLoop, this)
      this.loopTimer.start()
    }
  }
  
  resume() {
    this.loopTimer.resume()
  }
  
  pause() {
    this.loopTimer.pause()
  }
  
  passengerGenerateSignal = new Phaser.Signal()

  generatePassengersInLoop() {
    if ((Math.random() * Phaser.Timer.SECOND < this.duration / 5) && this.children.length < 8) {
      this.passengerGenerateSignal.dispatch(
        this.generatepassengersByType(ElevatorPassengerType.Normal)
      )
    }
  }

  expelAllNormalPassengers(withAnimation: boolean = false) {
    this.children.forEach((passenger: ElevatorPassenger) => {
      switch (passenger.type) {
      case ElevatorPassengerType.Normal:
      case ElevatorPassengerType.Squid:
        if (withAnimation) {
          this.duringAnimation = true
          passenger.performFeawellAnimation()
          this.game.time.events.add(ElevatorPassenger.animationDuration, () => {
            this.removeChild(passenger)
            this.duringAnimation = false
          }, this)
        } else {
          this.removeChild(passenger)
        }
        break
      }
    })
  }
  
  findAllPassengersAt(floor: number): ElevatorPassenger[] {
    let passengers:ElevatorPassenger[] = []
    for (var index = 0; index < this.children.length; index++) {
      var passenger = this.children[index] as ElevatorPassenger
      if (passenger.waitingFloor == floor) {
        passengers.push(passenger)
      }
    }
    return passengers
  }
  
  grabAllPassengersAt(floor: number): ElevatorPassenger[] {
    let passengers = this.findAllPassengersAt(floor)
    passengers.forEach((passenger) => {
      this.remove(passenger, false)
    })
    return passengers
  }
  
  generatepassengersByType(type: ElevatorPassengerType): ElevatorPassenger[] {
    var passengers: ElevatorPassenger[] = []
    switch (type) {
      case ElevatorPassengerType.Coffee:
        for (var floor = 1; floor <= 13; floor++) {
          let passenger: ElevatorPassengerCoffee = this.add(new ElevatorPassengerCoffee(this.game))
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
        let passenger = new ElevatorPassengerNormal(this.game)
        if (this.findAllPassengersAt(passenger.waitingFloor).length < 3) {
          passengers.push(this.add(passenger))
        }
        break
    }
    return passengers
  }
  
  static positionsOfPassengers = [140, 152, 160, 178, 190, 200, 210, 227, 234, 250, 260, 290, 300]
  
  /// Returns accecpted passengers
  transformPassengersAtFloor(exHR: ElevatorHumanResourceDept, floor: number) {
    let accecptedPassengers = exHR.findAllPassengersAt(floor).slice(0, 8 - this.children.length)
    accecptedPassengers.forEach((passenger) => {
      passenger.parent.removeChild(passenger)
      this.add(passenger)
      passenger.x = PickOneRandomly(ElevatorHumanResourceDept.positionsOfPassengers)
      passenger.performIntroAnimation()
    })
  }
  
  passengersArrivalAt(floor: number, callback?: Function, context?: any) {
    this.duringAnimation = true
    this.findAllPassengersAt(floor).forEach((passenger) => {
      passenger.performFeawellAnimation()
      passenger.destFloor = 65536 // To heaven
    })
    this.game.time.events.add(ElevatorPassenger.animationDuration, () => {
      this.duringAnimation = false
      if (callback) {
        callback.apply(context)
      }
    })
  }
}

/**
 * ElevatorController
 */
class ElevatorController {
  // Required injection
  game: Phaser.Game
  indicator: ElevatorIndicatorScene
  panel: ElevatorPanel
  panelScene: ElevatorPanelScene
  human: ElevatorHumanScene
  hrDept: ElevatorHumanResourceDept
  
  // Self generated
  elevatorTheme: Phaser.Sound

  currentFloor: number = 0
  destFloor: number = 0
  directionUp: boolean = true
  panelState: boolean[] = [
    false, false, false, false, false,
    false, false, false, false, false,
    false, false, false, false, false
    ]

  constructor(game: Phaser.Game, indicator: ElevatorIndicatorScene, panel: ElevatorPanel, human: ElevatorHumanScene, panelScene: ElevatorPanelScene, hrDept: ElevatorHumanResourceDept) {
    this.game = game
    this.indicator = indicator
    this.panel = panel
    this.human = human
    this.panelScene = panelScene
    this.panelScene.openCloseSignal.add(this.openCloseDoor, this)
    this.panel.controlSingal.add(this.panelPressed, this)
    this.indicator.arriveSignal.add(this.floorReached, this)
    this.hrDept = hrDept
    
    this.elevatorTheme = this.game.add.sound('audio-elevator-theme', 1, true)
    this.elevatorTheme.play()
    this.elevatorTheme.volume = 0
    
    this.hrDept.passengerGenerateSignal.add((passengers) => {
      this.indicator.updateWaitingPassengers(this.hrDept.children as ElevatorPassenger[])
      if (!this.panelScene.doorIsClosed) {
        for (var index = 0; index < passengers.length; index++) {
          var passenger: ElevatorPassenger = passengers[index];
          if (passenger.destFloor == this.indicator.currentFloor) {
            this.openCloseDoor('open')
            break
          }
        }
      }
    }, this)
  }
  
  floorReached() {
    if(this.updateIndicator()) {
      this.openCloseDoor('open')
    }
  }
  
  closeDoorTimer: Phaser.Timer
  private waitAndCloseDoor() {
    if (this.closeDoorTimer) {
      this.closeDoorTimer.destroy()
    }
    this.closeDoorTimer = this.game.time.create(true)
    this.closeDoorTimer.add(Phaser.Timer.SECOND * 3, () => {
      this.openCloseDoor('close')
    }, this)
    this.closeDoorTimer.start()
  }
  
  openCloseDoor(action) {
    if (this.indicator.direction != ElevatorDirection.Stop) {
      return
    }
    if (action == 'open') {
      this.panelScene.openDoor(() => {
        this.waitAndCloseDoor()
        this.human.elevatorPassengerContainer.transformPassengersAtFloor(this.hrDept, this.indicator.currentFloor)
        this.human.elevatorPassengerContainer.passengersArrivalAt(this.indicator.currentFloor, () => {
          this.openCloseDoor('open')
        }, this)
        this.indicator.updateWaitingPassengers(this.hrDept.children as ElevatorPassenger[])
      }, this)
    } else {
      if (this.closeDoorTimer) {
        this.closeDoorTimer.destroy()
      }
      if (!this.human.elevatorPassengerContainer.duringAnimation) {
        this.panelScene.closeDoor(() => {
          this.updateIndicator()
        }, this)
      }
    }
  }
  
  panelPressed(buttonNumber: number) {
    this.human.performPressAction(() => {
      if (this.indicator.currentFloor == buttonNumber && this.indicator.direction == ElevatorDirection.Stop) {
        return
      }
      this.panel.pressByButtonNumber(buttonNumber)
      if (this.indicator.direction == ElevatorDirection.Stop) {
        this.updateIndicator()
      }
    }, this)
  }
  
  updateIndicator(): boolean {
    if(!this.panelScene.doorIsClosed) {
      return
    }
    
    if (!this.panel.hasLightButton) {
      this.indicator.go(ElevatorDirection.Stop)
      return
    }
    
    if (this.directionUp) {
      var floor = this.panel.closestLightButton(this.indicator.currentFloor, ElevatorDirection.Up)
      
      if (this.indicator.direction == ElevatorDirection.Stop && floor > 20) {
        this.directionUp = !this.directionUp
        this.updateIndicator()
      } else if (floor == this.indicator.currentFloor) {
        this.indicator.go(ElevatorDirection.Stop)
        this.panel.dismissByButtonNumber(floor)
        return true
      } else if (floor < 20) {
        this.indicator.go(ElevatorDirection.Up)
      }
    } else {
      var floor = this.panel.closestLightButton(this.indicator.currentFloor, ElevatorDirection.Down)
      
      if (this.indicator.direction == ElevatorDirection.Stop && floor > 20) {
        this.directionUp = !this.directionUp
        this.updateIndicator()
      } else if (floor == this.indicator.currentFloor) {
        this.indicator.go(ElevatorDirection.Stop)
        this.panel.dismissByButtonNumber(floor)
        return true
      } else if (floor < 20) {
        this.indicator.go(ElevatorDirection.Down)
      }
    }
    return false
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
  
  static elevatorHeight = 15
  static containerWidth = 30
  static containerPadding = 8

  elevatorBox: Phaser.Graphics
  
  waitingPassengersSign: Phaser.Graphics

  currentFloor: number = 0
  direction: ElevatorDirection = ElevatorDirection.Stop
  
  arriveSignal: Phaser.Signal = new Phaser.Signal()

  constructor(game: Phaser.Game) {
    super(game, 'ElevatorIndicatorScene')
    this.backgroundColor = 0x7c858a
    // Elevator box
    this.elevatorBox = this.add(new Phaser.Graphics(game, 0, 0))
    this.elevatorBox.beginFill(0xffffff, 0.5)
    this.elevatorBox.drawRect(
      ElevatorIndicatorScene.containerPadding,
      0,
      ElevatorIndicatorScene.containerWidth - ElevatorIndicatorScene.containerPadding * 2,
      ElevatorIndicatorScene.elevatorHeight
      )
    this.elevatorBox.endFill()
    this.updateToFloor(this.currentFloor)
    // Waiting passengers sign
    this.waitingPassengersSign = this.add(new Phaser.Graphics(game, 0, 0))
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
        this.tweenAndNotify(this.currentFloor + 1, 700, Phaser.Easing.Cubic.In)
      } else {
        this.tweenAndNotify(this.currentFloor + 1, 500, Phaser.Easing.Linear.None)
      }
      break
    case ElevatorDirection.Down:
      if (this.direction == ElevatorDirection.Stop) {
        this.tweenAndNotify(this.currentFloor - 1, 700, Phaser.Easing.Cubic.In)
      } else {
        this.tweenAndNotify(this.currentFloor - 1, 500, Phaser.Easing.Linear.None)
      }
      break
    }
    this.direction = direction
  }
  
  targetHeightForFloor(floor: number) {
    return (2 + ElevatorIndicatorScene.elevatorHeight * 13) - floor * ElevatorIndicatorScene.elevatorHeight
  }
  
  updateToFloor(floor: number) {
    this.elevatorBox.y = this.targetHeightForFloor(floor)
  }
  
  updateWaitingPassengers(passengers: ElevatorPassenger[]) {
    var context = this.waitingPassengersSign
    context.clear()
    context.beginFill(0xffffff, 0.2)
    for (var index = 0; index < passengers.length; index++) {
      var waitingFloor = passengers[index].waitingFloor
      context.drawRect(0, this.targetHeightForFloor(waitingFloor), ElevatorIndicatorScene.containerPadding - 1, ElevatorIndicatorScene.elevatorHeight)
    }
    context.endFill()
  }
}

/**
 * ElevatorPanelScene
 */
class ElevatorPanelScene extends ComicWindow  {
  elevatorPanel: ElevatorPanel
  door: Phaser.Sprite
  
  private openButton: Phaser.Button
  private closeButton: Phaser.Button
  
  openCloseSignal: Phaser.Signal
  
  constructor(game: Phaser.Game) {
    super(game, 'ElevatorPanelScene')
    
    this.door = this.add(new Phaser.Sprite(this.game, 0, 40, 'door'))
    
    this.add(new Phaser.Sprite(this.game, 30, 0, 'panel-background'))
    this.elevatorPanel = this.add(new ElevatorPanel(game, this))
    this.elevatorPanel.x = 140
    this.elevatorPanel.y = 28
    
    this.openCloseSignal = new Phaser.Signal()
    this.openButton = this.add(new Phaser.Button(this.game, 160, 285, 'open-close-buttons'))
    this.openButton.onInputDown.add(() => {
      this.openCloseSignal.dispatch('open')
    }, this)
    this.closeButton = this.add(new Phaser.Button(this.game, 212, 285, 'open-close-buttons'))
    this.closeButton.frame = 1
    this.closeButton.onInputDown.add(() => {
      this.openCloseSignal.dispatch('close')
    }, this)
  }
  
  private openTween: Phaser.Tween
  
  openDoor(finishedClosure: Function, context?: any) {
    if (this.openTween) {
      return
    }
    if (this.closeTween) {
      this.closeTween.stop(false)
      this.closeTween = null
    }
    this.openTween = this.game.add.tween(this.door).to({x: 20}, 700, Phaser.Easing.Circular.In).start()
    this.openTween
      .onComplete.add(finishedClosure, context)
    this.openTween
      .onComplete.add(() => {
        this.openTween = null
      }, this)
  }
  
  private closeTween: Phaser.Tween

  closeDoor(finishedClosure: Function, context?: any) {
    if (this.openTween || this.closeTween) {
      return
    }
    
    this.closeTween = this.game.add.tween(this.door).to({x: 0}, 700, Phaser.Easing.Circular.In).start()
    this.closeTween
      .onComplete.add(finishedClosure, context)
    this.closeTween
      .onComplete.add(() => {
        this.closeTween = null
      }, this)
  }
  
  
  public get doorIsClosed() : boolean {
    return this.door.x == 0
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
    this.buttonObject = new Phaser.Sprite(game, 9, 9, 'panel-numbers')
    this.addChild(this.buttonObject)
    this.buttonObject.frame = buttonNumber + 1
    this.hitArea = new Phaser.Circle(18, 18, 47)
    this.anchor = new Phaser.Point(0.2, 0.2)
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
    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < 5; j++) {
        let button: ElevatorPanelButton = this.add(new ElevatorPanelButton(
          this.game,
          i * 52,
          4 * 52 - j * 52,
          i * 5 + j - 1
          ))
        this.controlButtons.push(button)
        button.onInputDown.add(() => {
          self.controlSingal.dispatch(button.buttonNumber)
        })
      }
    }
  }
  
  closestLightButton(floor: number, direction: ElevatorDirection): number {
    switch (direction) {
      case ElevatorDirection.Up:
        for (var index = floor + 1; index < this.controlButtons.length; index++) {
          if (this.controlButtons[index].lighted) {
            return this.controlButtons[index].buttonNumber
          }
        }
        break
      case ElevatorDirection.Down:
        for (var index = floor + 1; index >= 0; index--) {
          if (this.controlButtons[index].lighted) {
            return this.controlButtons[index].buttonNumber
          }
        }
    }
    return 65536
  }
  
  public get hasLightButton() : boolean {
    for (var index = 0; index < this.controlButtons.length; index++) {
      if (this.controlButtons[index].lighted) {
        return true
      }
    }
    return false
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
    // Images
    this.game.load.image('sp-logo', WhichFloor.assetsPath('images/sp-logo.png'))
    this.game.load.image('door', WhichFloor.assetsPath('images/door.png'))
    
      // Panelscene
    this.game.load.image('elevator-background', WhichFloor.assetsPath('images/elevator-background.png'))
    this.game.load.image('panel-background', WhichFloor.assetsPath('images/panel-background.png'))
    this.game.load.spritesheet('panel-button-seat', WhichFloor.assetsPath('images/panel-button-seat.png'), 60, 60)
    this.game.load.spritesheet('panel-numbers', WhichFloor.assetsPath('images/panel-numbers.png'), 20, 20, 15)
    this.game.load.spritesheet('open-close-buttons', WhichFloor.assetsPath('images/open-close-buttons.png'), 47, 47, 2)
    
      // Pssengers
    this.game.load.spritesheet('passengers-normal', WhichFloor.assetsPath('images/passengers-normal.png'), 60, 196, 8)
    
      // Telephone
    this.game.load.spritesheet('telephone-light', WhichFloor.assetsPath('images/telephone-light.png'), 243, 231, 5)
    this.game.load.spritesheet('telephone', WhichFloor.assetsPath('images/telephone.png'), 243, 231, 2)
    this.game.load.image('telephone-earpiece', WhichFloor.assetsPath('images/telephone-earpiece.png'))

    // Audios
    this.game.load.audio('audio-door-close', WhichFloor.assetsPath('audio/door-close.ogg'))
    this.game.load.audio('audio-door-open', WhichFloor.assetsPath('audio/door-open.ogg'))
    this.game.load.audio('audio-elevator-ding', WhichFloor.assetsPath('audio/elevator-ding.ogg'))
    this.game.load.audio('audio-elevator-theme', WhichFloor.assetsPath('audio/elevator-theme.ogg'))
    this.game.load.audio('audio-telephone-ring', WhichFloor.assetsPath('audio/telephone-ring.ogg'))
  }
  
  scene_elevatorHuman: ElevatorHumanScene
  scene_elevatorIndicator: ElevatorIndicatorScene
  scene_elevatorTelephone: TelephoneScene
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
    
    this.scene_elevatorTelephone = this.game.world.add(new TelephoneScene(this.game))
    this.scene_elevatorTelephone.origin = new Origin(80, 250, 237, 230)
    
    this.scene_mouth = this.game.world.add(new ComicWindow(this.game))
    this.scene_mouth.origin = new Origin(326, 250, 114, 76)
    
    this.scene_elevatorPanel = this.game.world.add(new ElevatorPanelScene(this.game))
    this.scene_elevatorPanel.origin = new Origin(450, 25, 313, 457)

    this.controller_dialogHost = new DialogHost(this.game)
    this.controller_dialogHost.displayElevatorDialog("Elevator! I am comming", 100)
    this.controller_dialogHost.displayElevatorDialog("Elevator! I am comming", 180)
    this.controller_dialogHost.displayElevatorDialog("Elevator! I am comming", 130)
    
    this.group_elevatorHumanResourceDept = new ElevatorHumanResourceDept(this.game, null, true)
    
    this.controller_elevator = new ElevatorController(
      this.game,
      this.scene_elevatorIndicator,
      this.scene_elevatorPanel.elevatorPanel,
      this.scene_elevatorHuman,
      this.scene_elevatorPanel,
      this.group_elevatorHumanResourceDept
      )
    
  }
  
  render() {
  }
}


window.addEventListener('load', (event) => {
  var game = new WhichFloor()
})