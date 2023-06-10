import { Map, List, fromJS } from "immutable";
import Keyboard from "../keyboard/Keyboard";
import WordDrill from "./WordDrill";
import TextDrill from "./TextDrill";
import KeyDrill from "./KeyDrill";

class Course {
  /**
   * Creates an instance of the Course class
   * @return {Course}
   */
  constructor() {
    this.currentChar = "a";
    this.totalCharacters = 0;
    this.drill = "key";
    this.level = "junior";
    this.data = List(fromJS(require("./data.json")));
    this.filterWords(this.currentChar);
    this.setDrills();
  }

  /**
   * Sets all the kinds of drills
   */
  setDrills() {
    this.keyDrill = new KeyDrill(this);
    this.wordDrill = new WordDrill(this);
    this.textDrill = new TextDrill(this);
  }

  /**
   * Gets the current selected drill
   * @return {BaseDrill}
   */
  get currentDrill() {
    return this[this.drill + "Drill"];
  }

  /**
   * Gets the initial state
   * @return {Immutable.Map}
   */
  get initialState() {
    return Map({
      currentWord: this.currentDrill.currentWord,
      drill: this.drill,
      sound: null,
      currentKey: this.currentDrill.currentKey,
      passCount: 0,
      failCount: 0,
      totalCharacters: this.totalCharacters,
      failed: null,
      totalWords: this.words.count(),
      currentChar: this.currentChar,
    });
  }

  /**
   * Filters the words based on a given nextCharacterWords
   * @param {String} char
   */
  filterWords(char) {
    // Reshuffle the words so they don't follow any specified order
    this.words = this.data.filter((word) => word[0] === char);
    this.setTotalCharacters();
  }

  /**
   * Sets the total number of characters in the list of selected words
   */
  setTotalCharacters() {
    this.totalCharacters = this.words.reduce((a, b) => a + b.length, 0);
  }

  /**
   * Sets the words of the next character from the currently selected one
   */
  nextCharacterWords() {
    // Get the next character (a=97 and z=122)
    let nextCharCode = this.currentChar.charCodeAt(0);
    nextCharCode === 122 ? (nextCharCode = 97) : ++nextCharCode;
    this.currentChar = String.fromCharCode(nextCharCode);
    this.filterWords(this.currentChar);
  }

  /**
   * React to a pressed key
   * @param  {Immutable.Map} state
   * @param  {String} key
   * @return {Immutable.Map}
   */
  keyPressed(state, key) {
    // Only handle printable keys
    if (!Keyboard.isPrintableKey(key)) {
      return state;
    }
    return this.currentDrill.updateState(state, key);
  }

  /**
   * Sets the character
   * @param {Immutable.Map} state
   * @param {String} char
   */
  setDefaultCharacter(state, char) {
    this.currentChar = char;
    this.filterWords(char);
    this.currentDrill.reset();
    return this.initialState;
  }
}

// Ensure we are exporting the same instance over every import
const courseInstance = new Course();
export default courseInstance;
