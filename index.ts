const w : number = window.innerWidth 
const h : number = window.innerHeight 
const parts : number = 3 
const scGap : number = 0.01 / parts 
const sizeFactor : number = 3.9 
const delay : number = 20 
const rot : number = Math.PI / 2 
const backColor : string = "#BDBDBD"
const colors : Array<string> = [
    "#F44336",
    "#3F51B5",
    "#4CAF50",
    "#FF9800",
    "#009688"
]

class ScaleUtil {

    static maxScale(scale : number, i : number, n : number) : number {
        return Math.max(0, scale - i / n)
    }

    static divideScale(scale : number, i : number, n : number) : number {
        return Math.min(1 / n, ScaleUtil.maxScale(scale, i, n)) * n 
    }

    static sinify(scale : number) : number {
        return Math.sin(scale * Math.PI)
    }
}

class DrawingUtil {

    static drawThreeArcBoxFill(context : CanvasRenderingContext2D, scale : number) {
        const sf : number = ScaleUtil.sinify(scale)
        const sf1 : number = ScaleUtil.divideScale(sf, 0, parts)
        const sf2 : number = ScaleUtil.divideScale(sf, 1, parts)
        const size : number = Math.min(w, h) / sizeFactor 
        const r : number = size / 2
        context.save()
        context.translate(w / 2, h / 2)
        context.rotate(rot * sf2)
        context.save()
        for (var j = 0; j < 3; j++) {
            if (j == 0) {
                context.beginPath()
            }
            context.arc(0, -2 * r + 2 * r * j, r, 0, 2 * Math.PI)
        }
        context.clip()
        context.fillRect(-r, 3 * r - 6 * r * sf1, 2 * r, 6 * r)
        context.restore()
        context.restore()
    }

    static drawTABFNode(context : CanvasRenderingContext2D, i : number, scale : number) {
        context.fillStyle = colors[i]
        DrawingUtil.drawThreeArcBoxFill(context, scale)
    }
}

class Stage {

    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D 
    renderer : Renderer = new Renderer()

    initCanvas() {
        this.canvas.width = w 
        this.canvas.height = h 
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }
    
    render() {
        this.context.fillStyle = backColor 
        this.context.fillRect(0, 0, w, h)
        this.renderer.render(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.renderer.handleTap(() => {
                this.render()
            })
        }
    }

    static init() {
        const stage : Stage = new Stage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}

class State {

    scale : number = 0 
    dir : number = 0 
    prevScale : number = 0 

    update(cb : Function) {
        this.scale += this.dir * scGap 
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir 
            this.dir = 1 
            this.prevScale = this.scale 
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale 
            cb()
        }
    }
}

class Animator {

    animated : boolean = false 
    interval : number 

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true 
            this.interval = setInterval(cb, delay)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false 
            clearInterval(this.interval)
        }
    }
}

class TABFNode {

    next : TABFNode 
    prev : TABFNode 
    state : State = new State()

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < colors.length - 1) {
            this.next = new TABFNode(this.i + 1)
            this.next.prev = this 
        }
    }

    draw(context : CanvasRenderingContext2D) {
        DrawingUtil.drawTABFNode(context, this.i, this.state.scale)
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : TABFNode {
        var curr : TABFNode = this.prev 
        if (dir == 1) {
            curr = this.next 
        }
        if (curr) {
            return curr 
        }
        cb()
        return this 
    }
}

class ThreeArcBoxFill {
    
    curr : TABFNode = new TABFNode(0)
    dir : number = 1 

    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)    
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}

class Renderer {

    tabf : ThreeArcBoxFill = new ThreeArcBoxFill()
    animator : Animator = new Animator() 

    render(context : CanvasRenderingContext2D) {
        this.tabf.draw(context)
    }

    handleTap(cb : Function) {
        this.tabf.startUpdating(() => {
            this.animator.start(() => {
                cb()
                this.tabf.update(() => {
                    this.animator.stop()
                    cb()
                })
            })
        })
    }
}