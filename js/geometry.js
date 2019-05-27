class Vertex {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

class Edge {
    vertices = [];
    iteration = 0;
    brightness = 0;
    normal;

    constructor(a, b, c) {
        this.vertices = [a, b, c];
    }

    show(light){

        this.projection = this.project();

        if(this.projection != 0) {
            const MIN_BRIGHTNESS = 150;
            const MAX_BRIGHTNESS = 255;

            this.brightness = Edge.dot(light, this.normal);

            stroke(map(this.brightness, 0, 1, MIN_BRIGHTNESS, MAX_BRIGHTNESS));

            fill(map(this.brightness, 0, 1, MIN_BRIGHTNESS, MAX_BRIGHTNESS));

            triangle(this.projection[0].x, this.projection[0].y,
                this.projection[1].x, this.projection[1].y,
                this.projection[2].x, this.projection[2].y,
                );
        }

        //this.show_debug();
    }

    show_debug(){
        stroke('black');
        strokeWeight(1);

        if(this.projection != 0) {
            line(this.projection[0].x, this.projection[0].y, this.projection[1].x, this.projection[1].y);
            line(this.projection[1].x, this.projection[1].y, this.projection[2].x, this.projection[2].y);
            line(this.projection[2].x, this.projection[2].y, this.projection[0].x, this.projection[0].y);
        }
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
            rotatedZ[i] = Edge.applyMatrix(vertex, RotationZ);
            rotatedX[i] = Edge.applyMatrix(rotatedZ[i], RotationX);
            rotatedX[i].z += offset;
        }

        this.normal = Edge.computeNormal(rotatedX);

        if(Edge.dot(this.normal, Edge.subVectors(rotatedX[0], viewCamera)) < 0) {
            for(let i = 0; i < this.vertices.length; i++) {
                transformed[i] = Edge.applyMatrix(rotatedX[i], projectionMatrix);
                transformed[i].x += 1;
                transformed[i].y += 1;
    
                transformed[i].x *= width;
                transformed[i].y *= height;
                transformed[i].x /= 2;
                transformed[i].y /= 2;
            }
            return transformed;
        } else {
            return 0;
        }

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

class Mesh {
    edges = [];
    light;

    constructor(light) {
        this.light = light;
    }

    add(edge) {
        this.edges.push(edge);
    }

    show(light) {
        for (let edge of this.edges) {
            edge.show(this.light);
        }
    }

    show_debug() {
        for(let edge of this.edges) {
            edge.show_debug();
        }
    }
}