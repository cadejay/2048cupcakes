window.requestAnimationFrame(function () {
  try {
    window.game = new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager);
  } catch (err) {
    console.error("Game boot failed:", err);
    return;
  }
  try {
    if (window.GameEnhancements) GameEnhancements.init(window.game);
  } catch (err) { console.warn(err); }
  try {
    if (window.PlayModes) PlayModes.init(window.game);
  } catch (err) { console.warn(err); }
  // Defer fun layer so board always paints even if fun features error
  setTimeout(function () {
    try {
      if (window.FunLayer) FunLayer.init(window.game);
    } catch (err) { console.warn(err); }
  }, 0);
});
