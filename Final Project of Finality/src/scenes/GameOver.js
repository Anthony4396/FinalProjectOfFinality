export class GameOver extends Phaser.Scene {
    constructor() {
        super('GameOver');
    }

    create() {
        this.scene.start('Preloader');
    }
}
