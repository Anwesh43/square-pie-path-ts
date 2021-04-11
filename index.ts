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

    initCanvas() {
        this.canvas.width = w 
        this.canvas.height = h 
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor 
        this.context.fillRect(0, 0, w, h)
    }

    handleTap() {
        this.canvas.onmousedown = () => {

        }
    }

    static init() {
        const stage : Stage = new Stage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}