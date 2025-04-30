import EnemyFlying from '../gameObjects/EnemyFlying.js';
import EnemyBullet from '../gameObjects/EnemyBullet.js';

export class Game extends Phaser.Scene {
    constructor() {
        super('Game');
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        this.background = this.add.tileSprite(0, 0, width, height, 'space')
            .setOrigin(0)
            .setScrollFactor(0);
        this.scrollSpeed = 1;

        this.player = this.physics.add.sprite(width / 2, height - 80, 'ships', 0)
            .setCollideWorldBounds(true)
            .setScale(1.5);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.started = false;
        this.playerAlive = true;
        this.score = 0;
        this.scoreText = this.add.text(16, 16, 'Score: 0', {
            fontSize: '20px',
            color: '#ffffff'
        });

        this.add.text(width / 2, height / 2 + 40, 'Press SPACE to start', {
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.bullets = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Sprite,
            maxSize: 50,
            runChildUpdate: true
        });

        this.enemyBulletGroup = this.physics.add.group({
            runChildUpdate: true
        });

        this.enemies = this.add.group({
            runChildUpdate: true
        });

        this.input.keyboard.once('keydown-SPACE', () => {
            this.started = true;

            this.spawnEnemyWave();

            this.waveTimer = this.time.addEvent({
                delay: 5000,
                loop: true,
                callback: () => {
                    if (this.playerAlive) this.spawnEnemyWave();
                }
            });

            this.add.text(width / 2, 60, 'ENGAGE!', {
                fontSize: '24px',
                color: '#00ff00'
            }).setOrigin(0.5);
        });

        this.physics.add.overlap(this.player, this.enemyBulletGroup, this.hitPlayer, null, this);
        this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);

        this.lastFired = 0;
    }

    update(time) {
        if (!this.started || !this.playerAlive) return;

        if (this.background) {
            this.background.tilePositionY -= this.scrollSpeed;
        }

        const speed = 300;
        this.player.setVelocity(0);

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-speed);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(speed);
        }

        if (Phaser.Input.Keyboard.JustDown(this.spacebar) && time > this.lastFired) {
            const power = 1;
            const frame = 11 + power;

            const bullet = this.bullets.get(this.player.x, this.player.y - 20, 'tiles', frame);

            if (bullet) {
                bullet.setActive(true);
                bullet.setVisible(true);
                bullet.body.enable = true;
                bullet.setVelocityY(-500);
                bullet.body.setAllowGravity(false);
                bullet.setScale(0.5);

                bullet.getPower = () => power; // Support for enemy hit()

                this.lastFired = time + 200;
            }
        }

        this.enemyBulletGroup.children.each(bullet => {
            bullet.y += 2;
        });
    }

    fireEnemyBullet(x, y, power) {
        const bullet = new EnemyBullet(this, x, y, power);
        this.enemyBulletGroup.add(bullet);
    }

    hitPlayer(player, bullet) {
        bullet.destroy();

        if (this.playerAlive) {
            this.playerAlive = false;
            player.setTint(0xff0000);
            player.setVelocity(0, 0);

            if (this.waveTimer) {
                this.waveTimer.remove();
            }

            this.add.text(this.scale.width / 2, this.scale.height / 2, 'YOU DIED\nPress R to Restart', {
                fontSize: '28px',
                color: '#ff4444',
                align: 'center'
            }).setOrigin(0.5);

            this.input.keyboard.once('keydown-R', () => {
                this.scene.restart();
            });
        }
    }

    hitEnemy(bullet, enemy) {
        bullet.destroy();
        if (enemy && typeof enemy.hit === 'function') {
            enemy.hit(bullet.getPower());
        } else {
            enemy.destroy();
        }
    }

    updateScore(points) {
        this.score += points;
        this.scoreText.setText(`Score: ${this.score}`);
    }


    removeEnemyBullet(bullet) {
        bullet.destroy();
    }

    removeEnemy(enemy) {
        if (this.enemies.contains(enemy)) {
            this.enemies.remove(enemy, true, false);
            enemy.destroy();
        } else {
            enemy.destroy();
        }
    }

    spawnEnemyWave() {
        const count = Phaser.Math.Between(2, 5);
        const offsetSet = [];

        while (offsetSet.length < count) {
            const randomOffset = Phaser.Math.Between(-250, 250);
            if (!offsetSet.some(o => Math.abs(o - randomOffset) < 50)) {
                offsetSet.push(randomOffset);
            }
        }

        for (let i = 0; i < count; i++) {
            const offsetX = offsetSet[i];
            const shipId = Phaser.Math.Between(0, 2);
            const pathId = Phaser.Math.Between(0, 2);
            const speed = 0.002;
            const power = Phaser.Math.Between(1, 3);

            const enemy = new EnemyFlying(this, shipId, pathId, speed, power, offsetX);
            this.enemies.add(enemy);
        }
    }
}
