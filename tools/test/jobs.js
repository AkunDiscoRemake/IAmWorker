const plays = {
  office: () => { const j = T.job(), $ = j.$;
    T.move($.badge, $.clock); T.expectStep(1);
    T.click($.machine); if (j.mistakes !== 1) throw new Error('empty machine should fail');
    T.move($.mug, $.coffee); T.click($.machine); T.wait(2.6); T.move($.mug, $.boss); T.expectStep(2);
    T.move($.paper, $.feed);
    for (let k = 0; k < 2; k++) { T.click($.printer); T.wait(1.3); const r = j.w.items.filter(i => i.type === 'report' && !i.zone)[0]; T.move(r, $.pad); T.use($.stamp, $.stamping, 0.9); if (!r.data.stamped) throw new Error('not stamped'); T.move(r, $.outbox); }
    T.expectStep(3);
    $.balls.forEach(b => T.move(b, $.bin)); $.folders.forEach((f, i) => T.move(f, $.cubby[i])); T.expectStep(4);
    T.use($.can, $.water, 2.5); T.expectStep(5);
    T.click($.phone); T.expectStep('end'); },
  kitchen: () => { const j = T.job(), $ = j.$;
    T.click($.fridge); T.wait(0.8);
    $.veg.forEach(v => { T.move(v, $.board); T.use($.knife, $.chop, 1.3); if (!v.data.chopped) throw new Error('not chopped'); T.move(v, $.pot); });
    T.expectStep(1); T.click($.knobA); T.wait(4.6); T.use($.ladle, $.scoop, 0.9); if (!$.ladle.data.full) throw new Error('ladle empty');
    T.use($.ladle, $.serve, 0.9); if (!$.bowl.data.full) throw new Error('bowl empty'); T.move($.bowl, $.service); T.click($.bell); T.wait(1.3); T.expectStep(2);
    const p = $.patties[0]; T.move(p, $.pan); T.click($.knobB); T.wait(4.4); T.click($.knobB);
    [$.bunB, p, $.cheese, $.lettuce, $.bunT].forEach(i => T.move(i, $.stack)); T.move($.plate, $.service); T.click($.bell); T.wait(1.3); T.expectStep(3);
    T.move($.oranges[0], $.jar); T.move($.oranges[1], $.jar); T.move($.glass, $.spot); T.click($.blend); T.wait(2.3); T.move($.glass, $.service); T.click($.bell); T.wait(1.3); T.expectStep(4);
    for (let n = 0; n < 5 && $.sink.count() < 3; n++) { const d = $.dishes.filter(x => !x.zone)[0]; T.aim(d); game.input.debug.grab = true; T.step(4); T.drop($.sink); } if ($.sink.count() !== 3) throw new Error('dishes to sink'); T.click($.tap); $.dishes.forEach(d => { T.use($.sponge, d.scrub, 1.4); T.move(d, $.rack); }); T.expectStep('end'); },
  market: () => { const j = T.job(), $ = j.$, ty = ['milk', 'cereal', 'can'];
    $.stock.forEach(s => T.move(s, $.shelf[ty.indexOf(s.type)])); T.expectStep(1);
    $.tags.forEach(c => T.use($.tagger, c, 0.8)); T.expectStep(2); T.wait(2.5);
    $.groc.forEach(g => { T.grab(g); T.aim($.scan); T.wait(0.7); if (!g.data.scanned) throw new Error('not scanned'); T.drop($.bag); if (g.zone !== $.bag) throw new Error('not bagged'); });
    if (j.total !== 38) throw new Error('total ' + j.total);
    T.expectStep(3); T.click($.drawer); T.wait(0.6); T.move($.bill, $.till); T.move($.notes[0], $.change); T.move($.notes[3], $.change); T.expectStep(4); T.wait(2);
    T.use($.mop, $.puddles[0], 1.7); T.use($.mop, $.puddles[1], 1.7); T.move($.sign, $.mark); T.expectStep('end'); },
  garage: () => { const j = T.job(), $ = j.$;
    $.bolts.forEach(b => T.use($.wrench, b, 1.0)); T.move($.flat, $.discard); T.move($.tire, $.hub); $.bolts.forEach(b => T.use($.wrench, b, 1.0)); T.expectStep(1);
    T.click($.hood); T.wait(0.8); T.move($.pan, $.panZone); T.click($.plug); T.wait(2.3); T.use($.oil, $.fill, 2.6); T.expectStep(2);
    T.move($.batOld, $.recycle); T.move($.batNew, $.batZone); T.click($.key); T.wait(1.7); T.expectStep(3);
    $.scratches.forEach(c => T.use($.spray, c, 1.5)); T.expectStep(4);
    $.mud.forEach(c => T.use($.hose, c, 1.3)); T.click($.gate); T.wait(4); T.expectStep('end'); },
  space: () => { const j = T.job(), $ = j.$;
    T.click($.hatch); T.wait(0.8); T.grab($.dirty); T.drop($.recycler); T.wait(0.6); if (!j.recycled) throw new Error('not recycled'); T.move($.clean[0], $.slot); T.click($.hatch); T.wait(0.9); T.expectStep(1);
    for (let i = 0; i < 3; i++) { let n = 0; while (j.dial[i] !== j.target[i] && n++ < 5) T.click($.dials[i]); } T.expectStep(2);
    $.seeds.forEach((s, i) => { T.move(s, $.pots[i]); T.use($.water, $.waterings[i], 1.5); }); T.expectStep(3);
    $.patches.forEach((p, i) => { T.move(p, $.holes[i]); T.use($.torch, $.welds[i], 2.1); }); T.expectStep(4);
    $.junk.forEach(it => T.move(it, $.chamber)); T.click($.eject); T.wait(2.2); T.expectStep('end'); },
  hotel: () => { const j = T.job(), $ = j.$;
    T.grab($.keys[0]); T.drop($.keyTray); if (j.mistakes !== 1 || $.keyTray.count()) throw new Error('wrong key accepted');
    T.wait(1); T.move($.keys[2], $.keyTray); T.expectStep(1);
    $.bags.forEach(b => T.move(b, $.rack)); T.expectStep(2);
    T.move($.dirty, $.hamper); T.move($.clean, $.bed); $.pillows.forEach(p => T.move(p, $.pillowZone)); T.expectStep(3);
    $.dust.forEach(c => T.use($.duster, c, 1.3)); $.trash.forEach(t => T.move(t, $.bin)); T.expectStep(4);
    [$.dish, $.juice, $.flower].forEach(i => T.move(i, $.tray)); T.click($.bell); T.expectStep('end'); }
};
module.exports = async (page, shot) => {
  await page.evaluate(() => { game.save.data.tutorial = true; });
  const ids = process.argv[3] ? process.argv[3].split(',') : Object.keys(plays);
  for (const id of ids) {
    await page.evaluate((id) => T.goto(id), id);
    await page.evaluate(() => { const s = game.current.spawn; T.shot(s[0], s[1] + 0.9, s[2], -0.12); });
    await shot(id + '_a');
    const r = await page.evaluate((src) => { try { (0, eval)('(' + src + ')')(); return 'OK ' + JSON.stringify(T.state()) + ' save=' + JSON.stringify(game.save.job(game.current.id)); } catch (e) { return 'ERR ' + e.message + ' @step ' + game.current.stepIndex + ' ' + (e.stack || '').split('\n').slice(1, 3).join(' | '); } }, plays[id].toString());
    console.log(id, r);
    await page.evaluate(() => { const s = game.current.spawn; T.shot(s[0], s[1] + 0.9, s[2], -0.12); });
    await shot(id + '_z');
  }
  const back = await page.evaluate(() => { T.click(game.current.$.exit); T.wait(2); return game.current.constructor.name + ' coins=' + game.save.data.coins + ' done=' + game.save.doneCount(); });
  console.log('exit ->', back);
};
