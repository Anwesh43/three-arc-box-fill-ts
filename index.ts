const w : number = window.innerWidth 
const h : number = window.innerHeight 
const parts : number = 3 
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
        for (var j = 0; j < 2; j++) {
            if (j == 0) {
                context.beginPath()
            }
            context.arc(0, -r + 2 * r * j, r, 0, 2 * Math.PI)
        }
        context.clip()
        context.fillRect(-r, 4 * r - 6 * r * sf1, 2 * r, 6 * r)
        context.restore()
        context.restore()
    }

    static drawTABFNode(context : CanvasRenderingContext2D, i : number, scale : number) {
        context.fillStyle = colors[i]
        DrawingUtil.drawThreeArcBoxFill(context, scale)
    }
}