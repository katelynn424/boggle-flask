class BoggleGame {

  constructor(boardId, secs = 60) {
    this.secs = secs;
    this.showTimer();

    this.score = 0;
    this.words = new Set();
    this.board = $("#" + boardId);

    //timer
    this.timer = setInterval(this.tick.bind(this), 1000);

    $(".add-word", this.board).on("submit", this.handleSubmit.bind(this));
  }

  /* show word in list */

  showWord(word) {
    $(".words", this.board).append($("<li>", { text: word }));
  }

  /* show score in html */

  showScore() {
    $(".score", this.board).text(this.score);
  }

  /* show a status message */

  showMessage(msg, cls) {
    $(".msg", this.board)
      .text(msg)
      .removeClass()
      .addClass(`msg ${cls}`);
  }

  /* handle submission of word: if unique and valid, score & show */

  async handleSubmit(evt) {
    evt.preventDefault();
    const $word = $(".word", this.board);

    let word = $word.val();
    if (!word) return;

    if (this.words.has(word)) {
      this.showMessage(`${word} already found`, "err");
      return;
    }

    // check server for validity
    try{
    const resp = await axios.get("/check-word", { params: { word: word }});
    if (resp.data.result === "not-word") {
      this.showMessage(`${word} is not a word`, "err");
    } else if (resp.data.result === "not-on-board") {
      this.showMessage(`${word} is not on this board`, "err");
    } else {
      this.showWord(word);
      this.score += word.length;
      this.showScore();
      this.words.add(word);
      this.showMessage(`Added: ${word}`, "ok");
    }
  } catch(error){
    this.showMessage("error occured, please try again later", "err");
  }

    $word.val("").focus();
  }

  /* Update timer in DOM */

  showTimer() {
    $(".timer", this.board).text(this.secs);
  }

  /* Tick: handle a second passing in game */

  async tick() {
    this.secs -= 1;
    this.showTimer();

    if (this.secs === 0) {
      clearInterval(this.timer);
      await this.scoreGame();
    }
  }

  /* end of game: score and update message. */

  async scoreGame() {
    $(".add-word", this.board).hide();
    try{
    const resp = await axios.post("/post-score", { score: this.score });
    if (resp.data.brokeRecord) {
      this.showMessage(`New high score: ${this.score}`, "ok");
    } else {
      this.showMessage(`Score: ${this.score}`, "ok");
    }
  } catch(error) {
    this.showMessage("Error occured while scoring")
  }
  }
}
