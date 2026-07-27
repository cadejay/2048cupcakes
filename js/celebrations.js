var CelebrationManager = (function () {
  "use strict";

  var sessionBestKcal = 0;
  var seenTiers = {};

  var TIER_MSG = {
    4:   { title: "Level Up!", sub: "Bubblegum Pink unlocked", emoji: "🧁" },
    8:   { title: "Yummy!", sub: "Sunshine Vanilla is here", emoji: "☀️" },
    16:  { title: "Sweet!", sub: "Valrhona Ganache achieved", emoji: "✨" },
    32:  { title: "Tasty!", sub: "PB Cheesecake unlocked", emoji: "🎂" },
    64:  { title: "Delicious!", sub: "Mint Fudge milestone", emoji: "🍫" },
    128: { title: "Amazing!", sub: "Spider Web cupcake!", emoji: "🕸️" },
    256: { title: "Incredible!", sub: "Toasted Marshmallow!", emoji: "🔥" },
    512: { title: "Halfway Hero!", sub: "Cookies & Creme unlocked", emoji: "🍪" },
    1024:{ title: "So Close!", sub: "Chocolate Sundae — almost there!", emoji: "🍨" },
    2048:{ title: "CONGRATULATIONS!", sub: "You baked White Choc. Peppermint — YOU WIN!", emoji: "🎉", epic: true },
    4096:{ title: "BEYOND WINNER!", sub: "Confetti Vanilla — legendary baker!", emoji: "👑", epic: true },
    8192:{ title: "RAINBOW LEGEND!", sub: "Ultimate cupcake master!", emoji: "🌈", epic: true }
  };

  var COMBO_MSG = ["Sweet!", "Double Yum!", "Combo Baker!", "ON FIRE!", "UNSTOPPABLE!"];

  function flavorName(value) {
    if (typeof Localize === "function") return Localize("p" + value);
    return String(value);
  }

  function ensureLayer() {
    if (!document.getElementById("celebration-layer")) {
      var layer = document.createElement("div");
      layer.id = "celebration-layer";
      layer.className = "celebration-layer";
      var board = document.querySelector(".game-container");
      if (board) board.appendChild(layer);
    }
    if (!document.getElementById("celebration-banner")) {
      var banner = document.createElement("div");
      banner.id = "celebration-banner";
      banner.className = "celebration-banner";
      banner.hidden = true;
      document.body.appendChild(banner);
    }
  }

  function floatText(text, cssClass) {
    ensureLayer();
    var layer = document.getElementById("celebration-layer");
    var el = document.createElement("div");
    el.className = "celebration-float " + (cssClass || "");
    el.textContent = text;
    layer.appendChild(el);
    setTimeout(function () {
      el.classList.add("celebration-float--out");
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 600);
    }, 1200);
  }

  function emojiBurst(count, epic) {
    ensureLayer();
    var layer = document.getElementById("celebration-layer");
    var emojis = epic
      ? ["🎉", "🧁", "✨", "🎊", "💖", "🌟", "🍰", "🎈"]
      : ["🧁", "✨", "💖", "⭐", "🍬"];
    var total = count || (epic ? 14 : 8);

    for (var i = 0; i < total; i++) {
      var span = document.createElement("span");
      span.className = "celebration-emoji";
      span.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      span.style.left = (20 + Math.random() * 60) + "%";
      span.style.top = (20 + Math.random() * 50) + "%";
      span.style.setProperty("--rise", (-80 - Math.random() * 120) + "px");
      span.style.setProperty("--drift", (Math.random() * 80 - 40) + "px");
      span.style.animationDelay = (Math.random() * 0.2) + "s";
      layer.appendChild(span);
      setTimeout(function (node) {
        if (node.parentNode) node.parentNode.removeChild(node);
      }.bind(null, span), 1400);
    }
  }

  function showBanner(title, subtitle, emoji, epic) {
    ensureLayer();
    var banner = document.getElementById("celebration-banner");
    banner.hidden = false;
    banner.className = "celebration-banner" + (epic ? " celebration-banner--epic" : "");
    banner.innerHTML =
      '<span class="celebration-banner__emoji">' + emoji + "</span>" +
      '<strong class="celebration-banner__title">' + title + "</strong>" +
      '<span class="celebration-banner__sub">' + subtitle + "</span>";

    banner.classList.remove("celebration-banner--show");
    void banner.offsetWidth;
    banner.classList.add("celebration-banner--show");

    clearTimeout(showBanner._timer);
    showBanner._timer = setTimeout(function () {
      banner.classList.remove("celebration-banner--show");
      setTimeout(function () { banner.hidden = true; }, 400);
    }, epic ? 3200 : 2200);
  }

  function boardPulse(epic) {
    var board = document.querySelector(".game-container");
    if (!board) return;
    board.classList.remove("board-pulse", "board-pulse--epic");
    void board.offsetWidth;
    board.classList.add(epic ? "board-pulse--epic" : "board-pulse");
    setTimeout(function () {
      board.classList.remove("board-pulse", "board-pulse--epic");
    }, epic ? 600 : 400);
  }

  function onMerge(opts) {
    var mergedValue = opts.mergedValue;
    var kcalGained = opts.kcalGained;
    var combo = opts.combo;
    var isNewTier = opts.isNewTier;
    var isFirstMerge = opts.isFirstMerge;

    floatText("+" + kcalGained + " Kcal", "celebration-float--kcal");

    if (isFirstMerge) {
      showBanner("First Merge!", "You're officially baking!", "🧁", false);
      SoundManager.firstMerge && SoundManager.firstMerge();
    }

    if (combo >= 2) {
      var msg = COMBO_MSG[Math.min(combo - 1, COMBO_MSG.length - 1)];
      floatText(msg + " x" + combo, "celebration-float--combo");
      SoundManager.combo && SoundManager.combo(combo);
    }

    if (isNewTier && TIER_MSG[mergedValue] && !seenTiers[mergedValue]) {
      seenTiers[mergedValue] = true;
      var tier = TIER_MSG[mergedValue];
      showBanner(tier.title, tier.sub, tier.emoji, !!tier.epic);
      emojiBurst(tier.epic ? 18 : 10, !!tier.epic);
      boardPulse(!!tier.epic);
      if (tier.epic) {
        EffectsManager.confetti(tier.epic ? 3500 : 1200);
        SoundManager.party && SoundManager.party();
      } else {
        EffectsManager.confetti(600);
        SoundManager.tierUp && SoundManager.tierUp(mergedValue);
      }
    } else if (mergedValue >= 128) {
      emojiBurst(6, mergedValue >= 512);
      boardPulse(mergedValue >= 512);
    } else if (mergedValue >= 32) {
      emojiBurst(4, false);
    }

    SoundManager.mergeByTier(mergedValue, combo);
    EffectsManager.shakeBoard(mergedValue);
    EffectsManager.spawnParticlesAtCell(opts.cell);
    EffectsManager.flashScore(document.querySelector(".score-points"));
  }

  function onNewBestKcal(points) {
    if (points > sessionBestKcal) {
      sessionBestKcal = points;
      floatText("New Kcal Record! 🔥", "celebration-float--record");
      SoundManager.record && SoundManager.record();
    }
  }

  function onWin(metadata) {
    var flavor = flavorName(metadata.score);
    showBanner(
      "🎊 CONGRATULATIONS! 🎊",
      "You reached " + flavor + " with " + metadata.points + " Kcal!",
      "🏆",
      true
    );
    emojiBurst(24, true);
    boardPulse(true);
    EffectsManager.confetti(5000);
    SoundManager.win();
  }

  function onGameOver(metadata) {
    showBanner(
      "Nice Baking!",
      metadata.points + " Kcal earned — try again to beat it!",
      "💪",
      false
    );
    SoundManager.lose();
  }

  function resetSession() {
    seenTiers = {};
    sessionBestKcal = 0;
  }

  return {
    onMerge: onMerge,
    onNewBestKcal: onNewBestKcal,
    onWin: onWin,
    onGameOver: onGameOver,
    resetSession: resetSession
  };
})();
