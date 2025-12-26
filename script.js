const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreBoard = document.getElementById("scoreBoard");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let gameSpeed = 5;
let isGameOver = false;

// كائن لوفي (الشخصية)
const luffy = {
    x: 70,
    y: canvas.height - 150, // فوق الأرضية بقليل
    width: 50,
    height: 60,
    dy: 0,
    jumpForce: -16,
    gravity: 0.8,
    grounded: true,
    draw: function() {
        // رسم جسم لوفي (بكسل آرت مبسط)
        ctx.fillStyle = '#3498db'; // لون سروال لوفي
        ctx.fillRect(this.x + 10, this.y + 30, 30, 30); // السروال

        ctx.fillStyle = '#f1c40f'; // لون البشرة
        ctx.fillRect(this.x + 15, this.y, 20, 20); // الرأس
        ctx.fillRect(this.x, this.y + 20, 10, 20); // ذراع يسار
        ctx.fillRect(this.x + 40, this.y + 20, 10, 20); // ذراع يمين

        ctx.fillStyle = '#e74c3c'; // لون القبعة
        ctx.fillRect(this.x + 5, this.y - 10, 40, 10); // حافة القبعة
        ctx.fillRect(this.x + 15, this.y - 20, 20, 10); // تاج القبعة
    }
};

// العقبات (صخور أو براميل)
let obstacles = [];

// الغيوم (للتفاصيل البصرية)
let clouds = [];

// سفينة القراصنة (كعنصر خلفية)
let ship = {
    x: canvas.width + 200,
    y: canvas.height / 2 - 50,
    width: 80,
    height: 60,
    speed: 1,
    draw: function() {
        ctx.fillStyle = '#8B4513'; // لون الخشب
        ctx.fillRect(this.x, this.y + 30, this.width, 30); // جسم السفينة
        ctx.beginPath();
        ctx.moveTo(this.x + 20, this.y + 30);
        ctx.lineTo(this.x + this.width - 20, this.y + 30);
        ctx.lineTo(this.x + this.width / 2, this.y);
        ctx.fill(); // الشراع
    }
};

function createObstacle() {
    let type = Math.random() < 0.5 ? 'rock' : 'barrel';
    let width = type === 'rock' ? 30 : 25;
    let height = type === 'rock' ? 30 : 35;
    let color = type === 'rock' ? '#7f8c8d' : '#964B00'; // رمادي للصخور، بني للبراميل
    
    obstacles.push({
        x: canvas.width + 50,
        y: canvas.height - 50 - height,
        width: width,
        height: height,
        color: color,
        type: type
    });
}

function createCloud() {
    clouds.push({
        x: canvas.width + 100,
        y: Math.random() * (canvas.height / 3),
        width: 80,
        height: 30,
        speed: 0.5 + Math.random() * 0.5,
        color: 'rgba(255,255,255,0.8)'
    });
}

function drawGameElements() {
    // رسم الأرضية
    ctx.fillStyle = '#A0522D'; // لون ترابي
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
    ctx.strokeStyle = '#8B4513'; // خط بني داكن
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 50);
    ctx.lineTo(canvas.width, canvas.height - 50);
    ctx.stroke();

    // رسم السحب
    clouds.forEach((cloud, index) => {
        cloud.x -= cloud.speed;
        ctx.fillStyle = cloud.color;
        // رسم سحابة بسيطة
        ctx.fillRect(cloud.x, cloud.y, cloud.width, cloud.height);
        ctx.fillRect(cloud.x + 20, cloud.y - 10, cloud.width / 2, cloud.height / 2);
        ctx.fillRect(cloud.x + cloud.width - 20, cloud.y - 10, cloud.width / 2, cloud.height / 2);
        
        if (cloud.x + cloud.width < 0) clouds.splice(index, 1);
    });

    // رسم السفينة
    ship.x -= ship.speed;
    if (ship.x + ship.width < -200) { // عندما تخرج السفينة بالكامل
        ship.x = canvas.width + Math.random() * 500 + 200; // تظهر من جديد
        ship.y = canvas.height / 2 - 50 + Math.random() * 50 - 25; // ارتفاع عشوائي
    }
    ship.draw();

    // رسم العقبات
    obstacles.forEach((obs, index) => {
        obs.x -= gameSpeed;
        ctx.fillStyle = obs.color;
        // رسم الصخرة أو البرميل
        if (obs.type === 'rock') {
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
            ctx.fillStyle = '#6c7a7b'; // ظل
            ctx.fillRect(obs.x + 5, obs.y + 5, obs.width - 10, obs.height - 10);
        } else { // barrel
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
            ctx.strokeStyle = '#5c3513'; // حزام
            ctx.lineWidth = 2;
            ctx.strokeRect(obs.x, obs.y + obs.height / 3, obs.width, obs.height / 3);
        }

        // كشف التصادم
        if (
            luffy.x < obs.x + obs.width &&
            luffy.x + luffy.width > obs.x &&
            luffy.y < obs.y + obs.height &&
            luffy.y + luffy.height > obs.y
        ) {
            gameOver();
        }

        if (obs.x + obs.width < 0) {
            obstacles.splice(index, 1);
            score++;
            gameSpeed += 0.05; // زيادة السرعة تدريجياً
            scoreBoard.innerText = "النقاط: " + score;
        }
    });

    luffy.draw(); // رسم لوفي دائماً في النهاية ليكون فوق كل شيء
}

function update() {
    if (isGameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // تحديث فيزياء لوفي
    luffy.dy += luffy.gravity;
    luffy.y += luffy.dy;

    if (luffy.y + luffy.height > canvas.height - 50) {
        luffy.y = canvas.height - 50 - luffy.height;
        luffy.dy = 0;
        luffy.grounded = true;
    }

    // توليد السحب والعقبات بشكل عشوائي
    if (Math.random() < 0.005) createCloud();
    if (Math.random() < 0.015) {
        if (obstacles.length === 0 || obstacles[obstacles.length-1].x < canvas.width - 250) {
            createObstacle();
        }
    }

    drawGameElements();
    requestAnimationFrame(update);
}

function gameOver() {
    isGameOver = true;
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "white";
    ctx.font = "bold 40px 'Pixelify Sans'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("انتهت مغامرة لوفي!", canvas.width / 2, canvas.height / 2 - 30);
    
    ctx.font = "bold 24px 'Pixelify Sans'";
    ctx.fillText("النقاط: " + score, canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText("إلمس الشاشة لإعادة اللعب", canvas.width / 2, canvas.height / 2 + 70);
}

// التحكم باللمس والماوس
window.addEventListener("touchstart", function() {
    if (isGameOver) {
        location.reload();
    } else if (luffy.grounded) {
        luffy.dy = luffy.jumpForce;
        luffy.grounded = false;
    }
});

window.addEventListener("mousedown", function() {
    if (isGameOver) {
        location.reload();
    } else if (luffy.grounded) {
        luffy.dy = luffy.jumpForce;
        luffy.grounded = false;
    }
});

scoreBoard.innerText = "النقاط: " + score; // تحديث النتيجة الأولية
update();
```http://googleusercontent.com/generated_image_content/0

### كيف تعمل هذه النسخة؟

1.  **لوفي كشخصية بكسل آرت:** تم رسم لوفي بشكل مبسط باستخدام `ctx.fillRect` لتكوين شكل البيكسل آرت.
2.  **عالم ون بيس:** أضفنا سفينة قراصنة (تشبه Thousand Sunny أو Going Merry) تتحرك في الخلفية. والعقبات عبارة عن صخور وبراميل.
3.  **الغيوم والأرضية:** تحرك الغيوم والسفينة ببطء في الخلفية، والأرضية الرملية ثابتة.
4.  **التحكم باللمس:** يمكنك القفز بلمس أي مكان على الشاشة.

**ملاحظة:** لتحصل على أفضل شكل لـ "البيكسل آرت" في الخطوط، يمكنك إضافة هذا الخط إلى بداية ملف `index.html` ضمن وسم `<head>`:

```html
<link href="https://fonts.googleapis.com/css2?family=Pixelify+Sans&display=swap" rel="stylesheet">
