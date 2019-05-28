class Vertex {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    static computeNormal(vertices) {
        const a = createVector(vertices[1].x - vertices[0].x,
                            vertices[1].y - vertices[0].y,
                            vertices[1].z - vertices[0].z);

        const b = createVector(vertices[2].x - vertices[0].x,
                            vertices[2].y - vertices[0].y,
                            vertices[2].z - vertices[0].z);                            
        
        return (createVector(a.y*b.z - a.z*b.y, a.z*b.x - a.x*b.z, a.x*b.y - a.y*b.x)).normalize();
    }

    static dot(a, b) {
        return (a.x*b.x + a.y*b.y + a.z*b.z);
    }

    static addVectors(a, b) {
        return createVector(a.x + b.x, a.y + b.y, a.z + b.z);
    }

    static subVectors(a, b) {
        // ? Return vector a - vector b
        return createVector(a.x - b.x, a.y - b.y, a.z - b.z);
    }

    static applyMatrix(v, m) {
        let o = new Vertex(
            v.x * m[0][0] + v.y * m[1][0] + v.z * m[2][0] + m[3][0],
            v.x * m[0][1] + v.y * m[1][1] + v.z * m[2][1] + m[3][1],
            v.x * m[0][2] + v.y * m[1][2] + v.z * m[2][2] + m[3][2]);
    
        let w = v.x * m[0][3] + v.y * m[1][3] + v.z * m[2][3] + m[3][3];
        
        if (w != 0) {
            o.x /= w;
            o.y /= w;
            o.z /= w;
        }
        return o;
    }
}

class Edge {
    vertices = [];
    projection = [];
    iteration = 0;
    brightness = 0;
    normal;
    distance = Infinity;
    isVisible = false;

    constructor(a, b, c) {
        this.vertices = [a, b, c];
    }

    setDistance(vertices) {
        this.distance = Edge.distTo(vertices);
    }

    show(light){
        const MIN_BRIGHTNESS = 120;
        const MAX_BRIGHTNESS = 200;

        this.brightness = Vertex.dot(light, this.normal);

        stroke(map(this.brightness, 0, 1, MIN_BRIGHTNESS, MAX_BRIGHTNESS));

        fill(map(this.brightness, 0, 1, MIN_BRIGHTNESS, MAX_BRIGHTNESS));

        triangle(this.projection[0].x, this.projection[0].y,
                this.projection[1].x, this.projection[1].y,
                this.projection[2].x, this.projection[2].y);
    }

    project() {
        const FOV = 60;
        const offset = 15;
        const Z_FAR = 10;
        const Z_NEAR = 1;
        const rotation_step = PI/180;

        const A = height / width;
        const F = 1 / Math.tan(radians(FOV / 2));
        const ZCOEFF = Z_FAR / (Z_FAR - Z_NEAR);
        const ZOFFSET = (- Z_FAR * Z_NEAR) / (Z_FAR - Z_NEAR);

        let alpha = this.iteration * rotation_step;

        this.iteration++;
        if(this.iteration == 360) {
            this.iteration = 0;
        }

        const cos = Math.cos(alpha);
        const sin = Math.sin(alpha);

        const RotationZ = [
            [ cos, -sin, 0, 0],
            [ sin,  cos, 0, 0],
            [   0,    0, 1, 0],
            [   0,    0, 0, 1]
        ];

        const RotationX = [
            [ 1,   0,    0, 0],
            [ 0, cos, -sin, 0],
            [ 0, sin,  cos, 0],
            [ 0,   0,    0, 1]
        ];

        const projectionMatrix = [
            [A * F, 0,       0, 0],
            [    0, F,       0, 0],
            [    0, 0,  ZCOEFF, 1],
            [    0, 0, ZOFFSET, 0]
        ];

        const viewCamera = createVector(0, 0, 0);

        let transformed = [];
        let rotatedZ = [];
        let rotatedX = [];

        for(let i = 0; i < this.vertices.length; i++) {
            let vertex = this.vertices[i];
            rotatedZ[i] = Vertex.applyMatrix(vertex, RotationZ);
            rotatedX[i] = Vertex.applyMatrix(rotatedZ[i], RotationX);
            rotatedX[i].z += offset;
        }

        this.normal = Vertex.computeNormal(rotatedX);

        if(Vertex.dot(this.normal, Vertex.subVectors(rotatedX[0], viewCamera)) < 0) {
            this.isVisible = true;
            this.setDistance(rotatedX);

            for(let i = 0; i < this.vertices.length; i++) {
                transformed[i] = Vertex.applyMatrix(rotatedX[i], projectionMatrix);
                transformed[i].x += 1;
                transformed[i].y += 1;
    
                transformed[i].x *= width;
                transformed[i].y *= height;
                transformed[i].x /= 2;
                transformed[i].y /= 2;
            }
            this.projection = transformed;
        } else {
            this.isVisible = false;
        }
    }

    static distTo(vertices) {
        const dst = (vertices[0].z + vertices[1].z + vertices[2].z) / 3;
        return dst;
    };
}

class Mesh {
    edges = [];
    distance = Infinity;
    light = createVector(0, 0, 0);

    setLightning(light) {
        this.light = light;
    }

    setDist() {
        let sum = 0;
        let denum = 0;
        let newDist = Infinity;

        if(this.edges.length != 0) {
            for(let edge of this.edges) {
                sum += edge.distance;
                denum++;
            }
            newDist = sum / denum;
        }

        this.distance = newDist;
        return newDist;
    }

    add(edge) {
        this.edges.push(edge);
    }

    project() {
        for(let edge of this.edges) {
            edge.project();
        }
    }

    show() {
        let toBeDisplayed = [];
        let goOn = true;
        let i = 0;
        for(let edge of this.edges) {
            if(edge.isVisible) {
                i = 0;
                goOn = true;
                if(toBeDisplayed.length == 0) {
                    toBeDisplayed.push(edge);
                } else {
                    while(goOn) {
                        if(edge.distance < toBeDisplayed[i].distance) {
                            toBeDisplayed.splice(i, 0, edge);
                            goOn = false;
                        } else {
                            if(i == toBeDisplayed.length - 1) {
                                toBeDisplayed.push(edge);
                                goOn = false
                            }
                        }
                    i++;
                    }
                }
            }
        }

        for(let edge of toBeDisplayed.reverse()) {
            edge.show(this.light);
        }
    }

    static display(objects) {
        let toBeDisplayed = [];
        let goOn = true;
        let i = 0;
        let hasDrawn = false;

        for(let object of objects) {
            i = 0;
            goOn = true;
            object.project();
            if(toBeDisplayed.length == 0) {
                toBeDisplayed.push(object);
            } else {
                while(goOn) {
                    if(object.setDist() < toBeDisplayed[i].distance) {
                        toBeDisplayed.splice(i, 0, object);
                        goOn = false;
                    } else {
                        if(i == toBeDisplayed.length - 1) {
                            toBeDisplayed.push(object);
                            goOn = false
                        }
                    }
                i++;
                }
            } 
        }

        if(toBeDisplayed.length > 0) {
            hasDrawn = true;
        }

        for(let object of toBeDisplayed.reverse()) {
            object.show(object.light);
        }

        return hasDrawn;
    }
}