module.exports = async (page, shot) => {
  const r = await page.evaluate(() => {
    const g = game, h = g.current, out = {};
    T.wait(1);
    out.voices0 = T.voices.slice();
    out.tut0 = h.tut;
    // walk with trigger: aim at mat on the floor and hold "move"
    g.input.debug.aim = T.pos(h.$.mat); g.input.debug.move = true;
    for (let i = 0; i < 200 && h.tut === 0; i++) T.step(1);
    g.input.debug.move = false; out.tutAfterWalk = h.tut; out.head = g.player.head.toArray();
    T.move(h.$.book, h.$.tray); T.wait(0.5); out.tutAfterPlace = h.tut;
    T.click(h.$.button); out.tutEnd = h.tut; out.saved = g.save.data.tutorial;
    out.voices = T.voices.slice();
    return out;
  });
  console.log(JSON.stringify(r));
  await page.evaluate(() => T.shot(0, 3.4, 0, -0.05));
  await shot('hub');
  await page.evaluate(() => { T.click(game.current.$.job_office); T.wait(2); });
  console.log(await page.evaluate(() => JSON.stringify([game.current.id, T.state()])));
  await page.evaluate(() => T.shot(0, 2.6, 0, -0.1)); await shot('office1');
  await page.evaluate(() => T.shot(0, 0, -Math.PI/2, -0.2)); await shot('office2');
  await page.evaluate(() => T.shot(0, 0, Math.PI/2, -0.2)); await shot('office3');
};
