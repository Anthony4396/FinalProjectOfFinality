import ASSETS from '../assets.js';

export default class EnemyFlying extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, shipId, pathId, speed, power, offsetX = 0) {
        const startingId = 12;
        super(scene, 0, 0, ASSETS.spritesheet.ships.key, startingId + shipId);

        this._sceneRef = scene;
        this.power = power;
        this.health = power * 2;
        this.destroyed = false;

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setScale(1.5);
        this.setDepth(10);

        // Define movement path
        const basePath = [
            new Phaser.Math.Vector2(100, -50),
            new Phaser.Math.Vector2(200, 100),
            new Phaser.Math.Vector2(150, 200),
            new Phaser.Math.Vector2(300, 300),
            new Phaser.Math.Vector2(scene.scale.width - 100, scene.scale.height + 50)
        ];
        const offsetPath = basePath.map(p => new Phaser.Math.Vector2(p.x + offsetX, p.y));

        this.path = new Phaser.Curves.Path(offsetPath[0].x, offsetPath[0].y);
        this.path.splineTo(offsetPath.slice(1));
        this.follower = { t: 0, vec: new Phaser.Math.Vector2() };

        const enemyRef = this;
        scene.tweens.add({
            targets: enemyRef.follower,
            t: 1,
            ease: 'Linear',
            duration: 2500,
            onUpdate: () => {
                enemyRef.path.getPoint(enemyRef.follower.t, enemyRef.follower.vec);
                enemyRef.setPosition(enemyRef.follower.vec.x, enemyRef.follower.vec.y);
            },
            onComplete: () => {
                enemyRef.die(false); // Escaped
            }
        });

        this.fireTimer = scene.time.addEvent({
            delay: 800,
            loop: true,
            callback: () => {
                if (!this.active || this.destroyed) return; // ✅ prevent ghost bullets
                if (this.y > 0 && this.y < this._sceneRef.scale.height) {
                    this._sceneRef.fireEnemyBullet(this.x, this.y + 20, this.power);
                }
            }
        });
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
    }

    hit(damage = 1) {
        this.health -= damage;
        if (this.health <= 0) {
            this.die(true);
        }
    }

    die(wasShot = false) {
        if (this.destroyed) return;
        this.destroyed = true;

        if (this.fireTimer) {
            this.fireTimer.remove();
            this.fireTimer = null;
        }

        if (wasShot && typeof this._sceneRef?.updateScore === 'function') {
            console.log('[SCORE] Enemy was shot, +10 points');
            this._sceneRef.updateScore(10);
        }

        // ✅ Ensure enemy is disabled
        this.setActive(false);
        this.setVisible(false);
        this.body?.destroy();

        if (typeof this._sceneRef?.removeEnemy === 'function') {
            this._sceneRef.removeEnemy(this);
        } else {
            this.destroy();
        }
    }
}
