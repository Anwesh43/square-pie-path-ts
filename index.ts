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
