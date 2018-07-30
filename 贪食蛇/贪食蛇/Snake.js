$(function () {
    // 主要实现功能
    //  1 地图
    //  2 食物
    //  3 小蛇
    //  4 游戏控制功能

    // 布局中已经把地图的样式完成，接下来是食物功能
    // 1 食物   设置长度 宽度  背景颜色  地图
    function Food(options) {
        this.width = options.width || 20;
        this.height = options.height || 20;
        this.bgColor = options.bgColor || 'green';
        this.map = options.map;

        this.element = null;
        this.x = 0;
        this.y = 0;

        this.init();
    }
    // 食物功能的初始化
    Food.prototype.init = function () {
        if (this.element) {
            this.map.removeChild(this.element);
        }
        // 根据要求绘制食物盒子，放入到map中
        var div = document.createElement('div');
        this.element = div;
        div.style.width = this.width + 'px';
        div.style.height = this.height + 'px';
        div.style.backgroundColor = this.bgColor;
        this.map.appendChild(div);

        this.randomPos();
    };
    // 食物随机出现在地图上的随机功能
    Food.prototype.randomPos = function () {
        this.x = parseInt(Math.random() * this.map.offsetWidth / this.width);
        this.y = parseInt(Math.random() * this.map.offsetHeight / this.height);

        this.element.style.left = this.x * this.width + 'px';
        this.element.style.top = this.y * this.height + 'px';
    };

    // 2 小蛇的功能
    function Snake(options) {
        this.width = options.width || 20;
        this.height = options.height || 20;
        this.body = [
            { x: 1, y: 1, bgColor: 'orange' },
            { x: 2, y: 1, bgColor: 'orange' },
            { x: 3, y: 1, bgColor: 'red' }
        ]
        this.map = options.map;
        this.elements = [];
        this.direction = 'right';
        this.init();
        this.move();
    }
    // 绘制小蛇样子,初始化
    Snake.prototype.init = function () {
        for (var i = 0; i < this.elements.length; i++) {
            this.map.removeChild(this.elements[i]);
        }
        // 结构移除后，再将数组清空
        this.elements = [];

        for (var i = 0; i < this.body.length; i++) {
            var div = document.createElement('div');
            this.elements.push(div);
            div.style.width = this.width + 'px';
            div.style.height = this.height + 'px';
            div.style.left = this.body[i].x * this.width + 'px';
            div.style.top = this.body[i].y * this.height + 'px';
            div.style.backgroundColor = this.body[i].bgColor;
            this.map.appendChild(div);
        }

    };
    // 制作小蛇运动move，move方法只会让小蛇移动一步，跑起来是游戏控制的功能
    Snake.prototype.move = function () {
        for (var i = 0; i < this.body.length - 1; i++) {
            this.body[i].x = this.body[i + 1].x;
            this.body[i].y = this.body[i + 1].y;
        }

        // 需要根据this.direction属性，设置蛇头的运动方式
        switch (this.direction) {
            case 'right':
                this.body[this.body.length - 1].x++;
                break;
            case 'down':
                this.body[this.body.length - 1].y++;
                break;
            case 'left':
                this.body[this.body.length - 1].x--;
                break;
            case 'top':
                this.body[this.body.length - 1].y--;
                break;

        }

        // move 后，需要进行新的小蛇的绘制操作
        // 通过后期修改，将init设置到game的snakeRun方法中
        // this.init();
    };

    // 3 游戏设置操作
    //  用于对游戏整体控制
    function Game(map, score) {
        //  属性：食物，小蛇，地图
        this.food = new Food({ map: map });
        this.snake = new Snake({ map: map });
        this.map = map;
        this.score = score;
    }
    // 设置游戏开始功能
    Game.prototype.start = function () {
        // 1 绘制食物（在Food实例化的同时以及进行了初始绘制）
        // 2 绘制小蛇（在Snake实例化的同时以及进行了初始控制）
        // 3 小蛇运动
        this.snakeRun();
        // 4 设置按键控制方式
        this.change();
        // 5 设置游戏规则：吃食物。游戏结束
    };

    // 设置小蛇的运动功能
    Game.prototype.snakeRun = function () {
        var snake = this.snake;
        var food = this.food;
        var map = this.map;
        var count = 0;
        var timer = null;
        timer = setInterval(function () {
            //  获取运动之前蛇尾的坐标
            var sheWeiX = snake.body[0].x;
            var sheWeiY = snake.body[0].y;
            var sheTou = snake.body[snake.body.length - 1];
            //  定时器的参数1是一个函数，使用this会出现问题
            snake.move();

            // 吃食物检测，如果运动过程中，设置头部坐标与食物坐标相同，说明吃到了
            if (sheTou.x === food.x && sheTou.y === food.y) {
                // 按照旧的蛇尾坐标，设置新的蛇尾坐标即可
                snake.body.unshift({ x: sheWeiX, y: sheWeiY, bgColor: 'orange' });
                // 重新进行食物绘制
                food.init();

                // 设置迟到的食物数量增加
                count++;
                score.innerText = '游戏分数为：' + count * 10;
            }

            // 游戏结束检测：蛇头超出地图范围，游戏结束
            if (sheTou.x < 0 || sheTou.y < 0 || sheTou.x > map.offsetWidth / snake.width - 1 || sheTou.y > map.offsetHeight / snake.height - 1) {
                alert('游戏结束，撞墙了');
                clearInterval(timer);
                // 设置return阻止超出后的绘制(看起来好看一点)
                return;
            }

            // 游戏结束检测：蛇头撞到自己的蛇身时，游戏结束
            // 通过观察，蛇头只能碰到前4节以外的蛇身部分
            for (var i = 0; i < snake.body.length - 4; i++) {
                if (sheTou.x === snake.body[i].x && sheTou.y === snake.body[i].y) {
                    alert('咬到自己了，游戏结束');
                    clearInterval(timer);
                }
            }
            // 小蛇的init操作原本书写在小蛇的move中，但是通过吃食物等操作，可以修改了小蛇的body属性
            // 可以将init书写到判断之后，等确定了所有信息再绘制
            snake.init();
        }, 100);
    };

    // 改变方向的操作
    Game.prototype.change = function () {
        // 用于设置按键操作，修改小蛇的运动方向
        //  给小蛇设置了一个direction属性，通过按键修改这个属性即可,设置keydown事件进行操作
        var snake = this.snake;
        var flag = true;
        document.onkeydown = function (e) {
            if (flag === false) {
                return;
            }
            flag = false;
            // 先在点击后设置标记flag为false，阻止下次事件触发，同时设置定时器，在100ms后允许再次触发
            setTimeout(function () {
                flag = true;
            }, 100);
            var code = e.keyCode;
            switch (true) {
                case code === 37 && snake.direction !== 'right':
                    snake.direction = 'left';
                    break;
                case code === 38 && snake.direction !== 'down':
                    snake.direction = 'top';
                    break;
                case code === 39 && snake.direction !== 'left':
                    snake.direction = 'right';
                    break;
                case code === 40 && snake.direction !== 'top':
                    snake.direction = 'down';
                    break;
            }
        };
    };

    var map = document.getElementById('map');
    var score = document.getElementById('score');
    console.log(score);
    // var f1 = new Snake({
    //     map: map
    // })
    // f1.move();
    var g1 = new Game(map,score);
    g1.start();
});