import ASSETS from '../assets.js';

export default class EnemyBullet extends Phaser.Physics.Arcade.Sprite {
    power = 1;
    moveVelocity = 200;

    constructor(scene, x, y, power) {
        const tileId = 11;
        super(scene, x, y, ASSETS.spritesheet.tiles.key, tileId + power);

        this.scene = scene;
        this.power = power;

        // Add to scene and enable physics
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setActive(true);
        this.setVisible(true);
        this.setFlipY(true);
        this.setDepth(10);
        this.setSize(16, 24);

        // ✅ Apply velocity safely after confirming body exists
        if (this.body) {
            this.body.setAllowGravity(false);
            this.body.setVelocityY(this.moveVelocity * this.power * 0.5 || 200);
            console.log('[EnemyBullet] velocityY:', this.body.velocity.y);
        } else {
            console.warn('[EnemyBullet] body not initialized');
        }
    }
    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        this.checkWorldBounds();
    }

    checkWorldBounds() {
        if (this.y > this.scene.scale.height) {
            this.die();
        }
    }

    die() {
        if (typeof this.scene.removeEnemyBullet === 'function') {
            this.scene.removeEnemyBullet(this);
        } else {
            this.destroy(); // fallback
        }
    }

    getPower() {
        return this.power;
    }
}
