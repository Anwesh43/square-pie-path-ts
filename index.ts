const w : number = window.innerWidth 
const h : number = window.innerHeight
const lines : number = 4 
const parts : number = 2 + lines  
const scGap : number = 0.02 / parts 
const strokeFactor : number = 90 
const sizeFactor : number = 3.9 
const delay : number = 20 
const backColor : string = "#bdbdbd"
const colors : Array<string> = [
    "#f44336",
    "#9C27B0",
    "#2196F3",
    "#E65100",
    "#00C853"
]

class ScaleUtil {

    static maxScale(scale : number, i : number, n : number) : number {
        return Math.max(0, scale - i / n)
    }

    static divideScale(scale : number, i : number, n :number) : number {
        return Math.min(1 / n, ScaleUtil.divideScale(scale, i, n)) * n 
    }

    static sinify(scale : number) : number {
        return Math.sin(scale * Math.PI)
    }
}

class DrawingUtil {

    static drawLine(context : CanvasRenderingContext2D, x1 : number, y1 : number, x2 : number, y2 : number) {
        context.beginPath()
        context.moveTo(x1, y1)
        context.lineTo(x2, y2)
        context.stroke()
    }

    static drawPiePath(context : CanvasRenderingContext2D, size : number, scale : number) {
        const sf4 : number = ScaleUtil.divideScale(scale, lines, parts)
        const sf5 : number = ScaleUtil.divideScale(scale, lines + 1, parts)
        DrawingUtil.drawLine(context, 0, 0, size * sf4, size * sf4)
        DrawingUtil.drawLine(context, 0, 0, size * sf5, size * sf5)
        context.save()
        context.beginPath()
        context.moveTo(0, 0)
        context.lineTo(size, -size)
        context.lineTo(size, size)
        context.lineTo(0, 0)
        context.clip()
        context.fillRect(0, -size, size * scale, 2 * size)
        context.restore()
    }

    static drawSquare(context : CanvasRenderingContext2D, size : number, scale : number) {
        for (var j = 0; j < 4; j++) {
            const sf : number = ScaleUtil.divideScale(scale, j, parts)
            context.save()
            context.rotate(j * sf * Math.PI / 2)
            DrawingUtil.drawLine(context, size, -size, size, -size + 2 * size * sf)
            context.restore()
        }
    }

    static drawSquarePiePath(context : CanvasRenderingContext2D, scale : number) {
        const sf : number = ScaleUtil.sinify(scale)
        const size : number = Math.min(w, h) / sizeFactor 
        context.save()
        context.translate(w / 2, h / 2)
        DrawingUtil.drawSquare(context, size, sf)
        DrawingUtil.drawPiePath(context, size, sf)
        context.restore()
    }

    static drawSPPNode(context : CanvasRenderingContext2D, i : number, scale : number) {
        context.lineCap = 'round'
        context.lineWidth = Math.min(w, h) / strokeFactor 
        context.strokeStyle = colors[i]
        context.fillStyle = colors[i]
        DrawingUtil.drawSquarePiePath(context, scale)
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
        this.scale += scGap * this.dir 
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir 
            this.dir = 0 
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

class SPPNode {

    state : State = new State()
    prev : SPPNode 
    next : SPPNode 

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < colors.length - 1) {
            this.next = new SPPNode(this.i + 1)
            this.next.prev = this 
        }
    }

    draw(context : CanvasRenderingContext2D) {
        DrawingUtil.drawSPPNode(context, this.i, this.state.scale)
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : SPPNode {
        var curr : SPPNode = this.prev 
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

class SquarePiePath {

    curr : SPPNode = new SPPNode(0)
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

    spp : SquarePiePath = new SquarePiePath()
    animator : Animator = new Animator()

    render(context : CanvasRenderingContext2D) {
        this.spp.draw(context)
    }

    handleTap(cb : Function) {
        this.spp.startUpdating(() => {
            this.animator.start(() => {
                cb()
                this.spp.update(() => {
                    this.animator.stop()
                })
            })
        })
    }
}