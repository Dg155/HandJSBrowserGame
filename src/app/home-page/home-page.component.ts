import { Component, OnInit } from '@angular/core';
import { PredictionEvent } from '../prediction-event';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {

  gesture: String = "";
  buffer: boolean = false;

  // Strings that describe the story
  listofMessages = ["As an advanced spartan wizard warrior, life has been pretty easy for you. There have not been many times where you have been challenged. One day while you are in a bar, trying to drink your sorrows away, you overhear a nearby conversation.", 
  "Two missionaries are discussing a legendary treasure, 'The Golden Cucumber'. It is said that this item can grant its owner any wish. Becoming highly desirable, many warriors ventured out to claim this treasure, but not one has returned alive.", 
  "This peaks your interest, finally a worthy challenge. Coincidentally enough, the men's discussion provides you with the exact path and journey you must take to reach this plated vegetable. Through the mossy swamps, Up the devils mountain, and finally within the jewel castle resting in the clouds. Are you ready to begin your journey?",
  "You begin within the swamps. Every turn is filled with mud, moisture, and dirt. Not to mention the smell. Suddenly, a man approaches you. 'Give me all your belongings right now!'. A bandit, and an armed one too. You engage.",
  "After beating the bandit you finish traversing the swamps. That is when you arrive to the Devil's mountain. As you begin ascension, lost souls, taking the form of skeletons, rise up to impede your path to the peak. You engage.",
  "As you finally reach the peak of Devil's mountain, you ascend to the clouds where you reach Jewel Castle. You see the Golden Cucumber, the only thing in your way is its guardian. There is only one thing left to do, you engage.",
  "You have reached The Golden Cucumber! Congratulations, you now have a vegetable for some reason! Thank you so much for playing, hope you enjoyed :)"];
  displayText: String;
  messageCount = 0;
  finishedMessages: boolean = false;

  // Booleans to manage game flow
  gameStarted: boolean = false;
  gameOver: boolean = false;
  gameWon: boolean = false;
  inCombat: boolean = false;

  // Booleans that signify when to play combat animations
  slashed: boolean = false;
  slashedE: boolean = false;
  sparkled: boolean = false;
  guarded: boolean = false;
  healed: boolean = false;

  // Game manager variables
  audio = new Audio();
  playerHealth = 100;
  enemyHealth = 100;
  background = "url(../../assets/images/tavern.gif)";
  enemySprite = "";
  healthDisplay = "hidden";
  soundInfo = "Mute";


  constructor() { }

  ngOnInit(): void {
    // Load up tavern scene
    this.audio.src = "../../assets/audio/Tavern.mp3";
    this.audio.load();
    this.audio.play();
    this.updateText();
  }

  prediction(event: PredictionEvent){
    this.gesture = event.getPrediction();
    if (this.gesture == "Open Hand"){
      if ((!this.finishedMessages) && (!this.buffer) && (!this.inCombat)) {this.updateText();}
    }
    if ((this.gesture == "Closed Hand") && (!this.buffer) && (this.inCombat)) {
      this.meleeAttack();
    }
    if ((this.gesture == "Hand Pointing") && (!this.buffer) && (this.inCombat)) {
      this.healSelf();
    }
    if ((this.gesture == "Two Open Hands") && (!this.buffer) && (this.inCombat)) {
      this.magicAttack();
    }
    if ((this.gesture == "Two Closed Hands") && (!this.buffer) && (this.inCombat)) {
      this.guard();
    }
    if ((this.gesture == "One Open One Closed") && (!this.buffer)){
      this.muteAudio();
    }
    if ((this.gesture == "One Point One Closed")){
      this.restart();
    }
  }

  updateText(){
    if (this.listofMessages.length != 0) {
      this.messageCount += 1;
      if (this.messageCount == 5) { // If it 5th iteration of text, start Bandit Combat
        this.gameStarted = true;
        this.inCombat = true;
        this.background = "url(../../assets/images/pixelswamp.gif)";
        this.enemySprite = "../../assets/images/Bandit.png";
        this.healthDisplay = "visible";
        this.displayText = '';
        this.audio.src = "../../assets/audio/Swamp.mp3";
        this.audio.load();
        this.audio.play();
      }
      else if (this.messageCount == 7) { // If it 7th iteration of text, start Skeleton Combat
        this.inCombat = true;
        this.background = "url(../../assets/images/pixelMountain.gif)";
        this.enemySprite = "../../assets/images/skele.png";
        this.enemyHealth = 100;
        this.displayText = '';
        this.audio.src = "../../assets/audio/Mountain.mp3";
        this.audio.load();
        this.audio.play();
      } 
      else if (this.messageCount == 9) { // If it 9th iteration of text, start Angel Combat
        this.inCombat = true;
        this.background = "url(../../assets/images/pixelheaven.gif)";
        this.enemySprite = "../../assets/images/Angel.png";
        this.enemyHealth = 100;
        this.displayText = '';
        this.audio.src = "../../assets/audio/Heaven.mp3";
        this.audio.load();
        this.audio.play();
      }
      else { // If we do not start combat, just update the display text
        this.displayText = String(this.listofMessages.shift() + " (Open Hand to Continue)");
        this.playSoundEffect("../../assets/audio/Violin_Collision.wav");
        this.buffer = true;
        setTimeout(() => {this.buffer = false;}, 1000)
      }
    }
    else {this.finishedMessages = true; this.displayText = ''; this.gameStarted = false; this.gameWon = true;}
  }

  // Players melee attack
  meleeAttack(){
    this.enemyHealth -= Math.floor(Math.random() * (25 - 8) + 8);
    this.playSoundEffect("../../assets/audio/Crunch.mp3");
    // Play combat animation
    this.slashed = true;
    setTimeout(() => {this.slashed = false;}, 450)

    if (this.enemyHealth <= 0) {this.nextCycle();}
    else {setTimeout(() => {this.enemyAttack();}, 1000)}
    // Buffer next move
    this.buffer = true;
    setTimeout(() => {this.buffer = false;}, 1000)
  }

  // Players self heal
  healSelf(){
    this.playerHealth += Math.floor(Math.random() * (50 - 10) + 10);
    if (this.playerHealth >100) {this.playerHealth = 100;}
    this.playSoundEffect("../../assets/audio/Soul.wav");
    // Play combat animation
    this.healed = true;
    setTimeout(() => {this.healed = false;}, 450)
    setTimeout(() => {this.enemyAttack();}, 1000)
    // Buffer next move
    this.buffer = true;
    setTimeout(() => {this.buffer = false;}, 1000)
  }

  // Player's magic attack
  magicAttack(){
    this.enemyHealth -= Math.floor(Math.random() * (50 - 2) + 2);
    this.playSoundEffect("../../assets/audio/Violin_Death.wav");
    // Play combat animation
    this.sparkled = true;
    setTimeout(() => {this.sparkled = false;}, 450)
    if (this.enemyHealth <= 0) {this.nextCycle();}
    else {setTimeout(() => {this.enemyAttack();}, 1000)}
    // Buffer next move
    this.buffer = true;
    setTimeout(() => {this.buffer = false;}, 1000)
  }

  // Players guard
  guard(){
    this.playSoundEffect("../../assets/audio/Error.wav");
    // Play combat animation
    this.guarded = true;
    setTimeout(() => {this.guarded = false;}, 450)
    // Buffer next move
    this.buffer = true;
    setTimeout(() => {this.buffer = false;}, 1000)
  }

  // Attack that enemy does after each player move
  enemyAttack(){
    this.playerHealth -= Math.floor(Math.random() * (25 - 8) + 8);
    this.playSoundEffect("../../assets/audio/Player_Hit.wav");
    // Play combat animation
    this.slashedE = true;
    setTimeout(() => {this.slashedE = false;}, 450)
    if (this.playerHealth <= 0) {this.gameOver = true;}
    
  }

  // Queues up the next combat cycle
  nextCycle(){
    this.inCombat = false;
    this.updateText();
  }

  // If audio volume is set to 1, set it to 0, if it is 0 set it to 1
  muteAudio(){
    if (this.audio.volume !== 0) {
      this.soundInfo = "Unmute";
      this.audio.volume = 0;
    } else {
      this.soundInfo = "Mute";
      this.audio.volume = 1;
    }

    // Buffer next move
    this.buffer = true;
    setTimeout(() => {this.buffer = false;}, 1000)
  }

  // Restart the website
  restart(){
    location.reload();
  }

  // Helper function to play a sound effect
  playSoundEffect(source: string){
    var audio = new Audio();
    audio.src = source;
    audio.load();
    audio.play();
  }

}
