import { Boot } from './scenes/Boot.js';
import { Preloader } from './scenes/Preloader.js';
import { Start } from './scenes/Start.js';
import { Game } from './scenes/Game.js';
import { GameOver } from './scenes/GameOver.js';

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    backgroundColor: '#000000',
    scene: [Boot, Preloader, Start, Game, GameOver],
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    }
};

new Phaser.Game(config);
