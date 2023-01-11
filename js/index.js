const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");
const sprite_index = document.getElementById("sprite_index");
const image_index = document.getElementById("over");
const fps = 1000 / 60;

(function () {
    const global = {
        render: true,
        opacity: 0,
    };
    const single_object = {
        oSystem: {},
    };
    const array_object = {
        oItems: [],
    };
    const random_range = (min, max) => {
        return Math.random() * (max - min) + min;
    };

    const mouse_inside = (x, y, w, h, mx, my) => {
        return mx > x && my > y && mx < x + w && my < y + h;
    };
    const instance_create_items = (n = 6) => {
        const { width, height } = canvas;
        for (let _i = 0; _i < n; _i++) {
            let _x = random_range(0, width),
                _size = random_range(60, 180),
                _hspd = random_range(0.1, 0.4),
                _vspd = random_range(1, 2),
                _opa = random_range(0.4, 1);
            const item = new Items(_x, height, _size, _hspd, _vspd, _opa);
            array_object.oItems.push(item);
        }
    };
    const instance_create_items_xy = (x, y, size, n = 3) => {
        const { width, height } = canvas;
        for (let _i = 0; _i < n; _i++) {
            let _hspd = random_range(-2, 2),
                _vspd = random_range(-2, 2);
            const item = new Items(x, y, size, _hspd, _vspd, 0.8, "is_mini");
            array_object.oItems.push(item);
        }
    };

    class Systems {
        constructor() {
            this.state = "idle";

            this.time_spawn = 100;
            this.time_spawn_max = 100;
            this.spawn_counter = 10;

            this.opacity = 0;
        }
        update() {
            this.step();
        }

        step() {
            this.time_spawn--;
            if (this.time_spawn < 0 && global.render) {
                instance_create_items();

                this.time_spawn = this.time_spawn_max;
            }

            console.log(this.time_spawn, global.opacity);
        }
    }

    class Items {
        constructor(x, y, size, hspd, vspd, opacity, is_mini = "") {
            this.state = "falling";

            this.x = x;
            this.y = y;
            this.size = size;
            this.hspd = hspd;
            this.range_x_min = x - opacity * 20 - hspd * 10 - vspd * 10;
            this.range_x_max = x + opacity * 20 + hspd * 10 + vspd * 10;
            this.vspd = vspd;
            this.opacity = opacity;
            this.is_mini = is_mini;

            this.is_destroy = false;
            this.is_click = false;
        }

        update() {
            this.step();
            this.draw();
        }

        step() {
            if (this.is_mini === "is_mini") {
                this.opacity -= 0.015;
                if (this.opacity < 0.05) {
                    this.is_destroy = true;
                }
            } else {
                if (this.is_click) {
                    let _x = this.x,
                        _y = this.y,
                        _size = this.size * 0.5;

                    this.opacity -= 0.05;
                    if (this.opacity < 0.1) {
                        instance_create_items_xy(_x, _y, _size, 5);
                        this.is_destroy = true;

                        if (global.opacity < 1) {
                            global.opacity += 0.05;
                        } else {
                            const { oItems } = array_object;
                            for (let _i = 0; _i < oItems.length; _i++) {
                                const _ = oItems[_i];
                                _.is_click = true;
                            }
                        }
                        image_index.style.opacity = global.opacity;
                    }
                }
                if (
                    this.x + this.hspd < this.range_x_min ||
                    this.x + this.hspd > this.range_x_max
                ) {
                    this.hspd *= -1;
                }

                if (this.y < -100) {
                    this.is_destroy = true;
                }
            }
            this.x += this.hspd;
            this.y -= this.vspd;
        }

        draw() {
            const { x, y, size, opacity } = this;
            ctx.globalAlpha = opacity;
            ctx.save();
            ctx.drawImage(sprite_index, 0, 0, 512, 512, x, y, size, size);
            ctx.restore();
            ctx.globalAlpha = 1;
        }
    }

    const GameInit = () => {
        //*! -> setting
        let _ww = window.innerWidth,
            _wh = window.innerHeight,
            _pad = 15;

        canvas.width = _ww - _pad;
        canvas.height = _wh - _pad;

        single_object.oSystem = new Systems();
        instance_create_items();

        canvas.onclick = function (e) {
            e.preventDefault();
            const mx = e.offsetX,
                my = e.offsetY;
            const { oItems } = array_object;

            for (let _i = oItems.length - 1; _i >= 0; _i--) {
                const _ = oItems[_i];
                let _check = mouse_inside(_.x, _.y, _.size, _.size, mx, my);
                if (_.is_mini === "" && _check && !_.is_click) {
                    _.is_click = true;
                    break;
                }
            }
        };
    };

    GameInit();
    const Update = () => {
        let _cw = canvas.width,
            _ch = canvas.height;

        ctx.clearRect(0, 0, _cw, _ch);

        // -----------------------------------------> UPDATE
        //*! -> draw background
        ctx.fillStyle = "#000913";
        ctx.fillRect(0, 0, _cw, _ch);

        const { oItems } = array_object;
        const { oSystem } = single_object;
        oSystem.update();
        if (oItems.length == 0) {
            global.render = false;
        }
        for (let _i = 0; _i < oItems.length; _i++) {
            const _ = oItems[_i];
            if (_.is_destroy) {
                oItems.splice(_i, 1);
            } else {
                _.update();
            }
        }
    };

    const animate = () => {
        Update();
        if (global.render) {
            requestAnimationFrame(animate);
        }
    };
    animate();

    window.onresize = function () {
        const ww = window.innerWidth;
        const wh = window.innerHeight;

        canvas.width = ww;
        canvas.height = wh;
    };
})();
