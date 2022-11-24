const RAIN_COLOURRANGE = {
    "red": [0, 120],
    "green": [0, 120],
    "blue": [120, 255]
}
const GRASS_COLOURRANGE = {
    "red": [0, 120],
    "green": [100, 220],
    "blue": [0, 120]
}

const FLOWER_COLOURRANGE = {
    "red": [120, 255],
    "green": [0, 150],
    "blue": [0, 120]
}

let system;
let grass;
let mountains;

function setup() {
    createCanvas(windowWidth, windowHeight);
    system = new ParticleSystem(createVector(width / 2, 50));
    grass = new Grass();
    mountains = new MountainRange()
    

}

function draw() {
    background(51);

    // draw sky
    noStroke()
    fill(0,200,240)
    rect(0, 0, width, height/2)
    stroke("black")
    strokeWeight(1)
    fill("blue")
    ellipse(width*5/6, height*0.6, 300, 60)


    
    for(let i = 0; i < 2; i++){
        system.addParticle();
    }
    mountains.display()
    system.run();
    grass.run();
}

// A simple Particle class
class Particle {
    constructor(position) {
        this.acceleration = createVector(0, 0.05)
        this.velocity = createVector(random(-1, 1), random(-1, 0));
        this.position = position.copy();
        this.lifespan = 2550;
        this.r = random(RAIN_COLOURRANGE.red[0], RAIN_COLOURRANGE.red[1])
        this.g = random(RAIN_COLOURRANGE.green[0], RAIN_COLOURRANGE.green[1])
        this.b = random(RAIN_COLOURRANGE.blue[0], RAIN_COLOURRANGE.blue[1])
    }

    run() {
        this.update();
        this.display();
    }

    update() {
        this.velocity.add(this.acceleration);
        this.position.add(this.velocity);
        this.lifespan -= 2;

    }

    // Method to display
    display() {
        //stroke(200, this.lifespan);
        strokeWeight(0);
        fill(this.r, this.g, this.b, this.lifespan/10);
        ellipse(this.position.x, this.position.y, 5, 5);
    }

    // Is the particle still useful?
    isDead() {
        return this.lifespan < 0;
    }

    hitGround() {
        return this.position.y >= height;
    }

}

class ParticleSystem {
    constructor(position) {
        this.origin = position.copy();
        this.particles = [];
    }

    addParticle() {
        this.particles.push(new Particle(this.origin));
    }

    run() {
        for (let i = this.particles.length - 1; i >= 0; i--) {

            let p = this.particles[i];

            p.run();
            if (p.isDead()) {
                this.particles.splice(i, 1);
            }

            this.origin = createVector(mouseX, mouseY)
            if (p.hitGround()) {
                //let section = grass.zones[Math.floor(p.position.y / 20)];
                //let zone_number = Math.round(map(p.position.x, 0, width, 0, width/100))
                let zone_number = getZoneNumber(p.position.x, width, grass.zones.length - 1)

                if (grass.zones[zone_number].used == false) {
                    grass.addBlade(p.position)
                    grass.zones[zone_number].used = true
                } else {
                    grass.zones[zone_number].stroke_weight += 0.1;
                }


                this.particles.splice(i, 1);
            }
        }
    }
}


class GrassBlade {
    constructor(position) {
        this.origin = position.copy()
        this.maxHeigth = 150
        //this.currentPosition = position.copy()
        this.velocity = createVector(random(-1, 1), random(-0.4, -0.1))
        this.r = random(GRASS_COLOURRANGE.red[0], GRASS_COLOURRANGE.red[1])
        this.g = random(GRASS_COLOURRANGE.green[0], GRASS_COLOURRANGE.green[1])
        this.b = random(GRASS_COLOURRANGE.blue[0], GRASS_COLOURRANGE.blue[1])
        //this.segments = []
        this.nodes = [this.origin]
        this.currentNode = 1
        this.flower = boolean(Math.round(random(0, 1)))
        if(this.flower){
            this.flowerR = random(FLOWER_COLOURRANGE.red[0], FLOWER_COLOURRANGE.red[1])
            this.flowerG = random(FLOWER_COLOURRANGE.green[0], FLOWER_COLOURRANGE.green[1])
            this.flowerB = random(FLOWER_COLOURRANGE.blue[0], FLOWER_COLOURRANGE.blue[1])
        }
        this.curve = {
            "origin": this.origin.copy().add(createVector(random(-200, 200), this.maxHeigth)),
            "p1": this.origin.copy(),
            "p2": this.origin.copy(),
            "destination": this.origin.copy().add(createVector(random(-100, 100), random(-height/3, -height*0.8)))
        }
        

        this.velocityP1 = createVector((this.curve.destination.x - this.curve.origin.x) / 2, (this.curve.destination.y - this.curve.origin.y) * 0.65).div(this.maxHeigth)
        this.velocityP2 = createVector(this.curve.destination.x - this.curve.p1.x, -150).div(random(300, 700))

        this.alive = true

    }

    run() {
        this.update();
        this.display();
    }

    update() {

        if (this.curve.p2.y > this.curve.destination.y) {
            //console.log(this.curve)
            this.curve.p2.add(this.velocityP2)
        } else {
            this.alive = false
        }


        //this.currentPosition = this.currentPosition + this.velocity
        //this.nextPosition = this.currentPosition + this.velocity;
        /*         let lastNode = this.nodes[this.nodes.length - 1]
                if (lastNode.y > height * 0.5 && 0 < lastNode.x < width) {

                    this.nodes.push(lastNode.copy().add(this.velocity))
                    // smooth out lines every 50 nodes
                    if (this.nodes.length == 50 + this.currentNode) {

                        this.nodes.splice(this.currentNode, 48);

                        this.currentNode += 2;
                        //console.log(this.nodes)
                    }

                    if (frameCount % 10 == 0) {
                        this.velocity = createVector(random(-1, 1), this.velocity.y)
                    }

                } else {
                    this.alive = false
                } */

        //this.segments.unshift([{"x":this.currentPosition.x, "y":this.currentPosition.y},{"x":this.nextPosition.x, "y":this.nextPosition.y}]);
        //this.currentPosition = this.nextPosition;
    }

    display() {
        noFill()
        let brightness = map(log(this.curve.p2.y), log(this.curve.destination.y), log(height), 0, 255)
        stroke(this.r, this.g, this.b, brightness);
        let zone_number = getZoneNumber(this.origin.x, width, grass.zones.length - 1)
        strokeWeight(grass.zones[zone_number].stroke_weight)
        curve(this.curve.origin.x, this.curve.origin.y,
            this.curve.p1.x, this.curve.p1.y,
            this.curve.p2.x, this.curve.p2.y,
            this.curve.destination.x, this.curve.destination.y
        );

        // draw flower at top (p2) of curve
        if(this.flower){
            noStroke()
            fill(this.flowerR, this.flowerG, this.flowerB, brightness)
            ellipse(this.curve.p2.x, this.curve.p2.y, grass.zones[zone_number].stroke_weight * 7, grass.zones[zone_number].stroke_weight * 7)
        }
        

        /* if (this.nodes.length > 4) {
            //console.log(this.nodes)
            let brightness = map(this.nodes[this.nodes.length - 1].y, height * 0.5, height, 0, 255)
            for (let i = 2; i < this.nodes.length - 1; i++) {
                //let node = this.nodes[i]
                //ellipse(node[0].x, node[0].y, 10, 10)
                //console.log(this.nodes[i])

                noFill();
                stroke(this.r, this.g, this.b, brightness);
                //stroke(255)
                let zone_number = getZoneNumber(this.origin.x, width, grass.zones.length - 1)
                strokeWeight(grass.zones[zone_number].stroke_weight)
                //line(this.nodes[i - 1].x, this.nodes[i - 1].y, this.nodes[i].x, this.nodes[i].y)
                curve(this.nodes[i - 2].x, this.nodes[i - 2].y, this.nodes[i - 1].x, this.nodes[i - 1].y, this.nodes[i].x, this.nodes[i].y, this.nodes[i + 1].x, this.nodes[i + 1].y)

            } 
             stroke(this.r, this.g, this.b, brightness)
            curve(this.nodes[0].x, this.nodes[0].y, this.nodes[1].x, this.nodes[1].y, this.nodes[this.nodes.length - 2].x, this.nodes[this.nodes.length - 2].y, this.nodes[this.nodes.length - 1].x, this.nodes[this.nodes.length - 1].y)
            
             stroke(this.r, this.g, this.b, 255)
                            //stroke(255)
                            strokeWeight(1)
                            line(this.nodes[this.nodes.length - 2].x, this.nodes[this.nodes.length - 2].y, this.nodes[this.nodes.length - 1].x, this.nodes[this.nodes.length - 1].y)
                         
        }*/
    }



}


class Grass {
    constructor() {
        this.grassBlades = []
        this.zones = []
        for (let i = 0; i <= width; i += width / 250) {
            this.zones.push({
                "start": i,
                "end": i + (width / 100) - 1,
                "used": false,
                "stroke_weight": 1
            })
        }
    }

    addBlade(position) {
        this.grassBlades.push(new GrassBlade(position))
    }

    run() {
        for (let i = this.grassBlades.length - 1; i >= 0; i--) {
            let blade = this.grassBlades[i]
            if (blade.alive) {
                blade.run()
            } else {
                this.grassBlades.splice(i, 1)
                let zone_number = getZoneNumber(blade.origin.x, width, this.zones.length - 1)
                this.zones[zone_number].used = false
                this.zones[zone_number].stroke_weight = 1
            }

        }
    }
}

function getZoneNumber(x, width, n_zones) {
    let zone_number = Math.round(x / (width / n_zones)) - 1;
    if (zone_number > n_zones) {
        zone_number = n_zones;
    } else if (zone_number < 0) {
        zone_number = 0;
    }

    return zone_number;
}

class MountainRange {
    constructor(){
        this.origin = createVector(0, random(height*1/3, height*1/2));
        this.nodes = [this.origin];
        this.direction = createVector(random(0, 1), random(-1, 1));

        // calculate nodes
        while(this.nodes[this.nodes.length - 1].x <= width){
            this.nodes.push(this.nodes[this.nodes.length - 1].copy().add(this.direction));
            this.direction = createVector(random(1, 5), random([random(-5, -1), random(1, 5)]));
        }
    }


    display(){
        if (this.nodes.length > 4) {
            //console.log(this.nodes)
            //let brightness = map(this.nodes[this.nodes.length - 1].y, height * 0.5, height, 0, 255)
            for (let i = 1; i < this.nodes.length - 1; i++) {
                //let node = this.nodes[i]
                //ellipse(node[0].x, node[0].y, 10, 10)
                //console.log(this.nodes[i])
                if(/* i % 2 == 0 &&  */this.nodes[i].y < height/2){
                    stroke(165, 196, 200);
                    strokeWeight(0);
                    fill(165, 196, 200)
                    rect(this.nodes[i].x, this.nodes[i].y, this.nodes[i + 1].x - this.nodes[i].x + 1, height/2 - this.nodes[i].y)
                }

                //noFill();
                //fill(255)
                stroke(51);
                //stroke(255)
                
                strokeWeight(5);
                line(this.nodes[i - 1].x, this.nodes[i - 1].y, this.nodes[i].x, this.nodes[i].y);

                

                //curve(this.nodes[i - 2].x, this.nodes[i - 2].y, this.nodes[i - 1].x, this.nodes[i - 1].y, this.nodes[i].x, this.nodes[i].y, this.nodes[i + 1].x, this.nodes[i + 1].y)

            }       
        }
    }
}