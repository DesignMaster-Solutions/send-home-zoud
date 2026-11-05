# Playtests and what changed

Round 1, 04/11/2026, on the published build. Two first-time playthroughs by AI agents driving a real browser (Chrome on a Windows desktop): two full years each (one careful, one risky), two paydays in Arabic, one payday with Calm and Large text. These are automated playthroughs, not observed human players; a human playtest with people who send money home is in the budget.

| Finding | Evidence | Change | Check |
|---|---|---|---|
| Large text changed nothing | the page stayed at 16 px with the setting on | the setting now scales the whole page | e2e reads 21 px with Large text on |
| A new player lost the first payday while still reading the street | the clock closed every counter before the first quote | the first Friday has no clock | `noClock()` in game.js |
| Money left at home shrank with no explanation | the family's balance fell 15% more than the month | the news says how much went on everyday things | `closePayday().spent`, tests/econ.test.mjs |
| After payday 5 the app was the best deal almost every Friday | measured: best on 91% of Fridays for AED 1,000 | counter rates retuned; three counters now share the best deal | no counter above 55%, tests/econ.test.mjs |
| One player never found the slider and sent the default every payday: 0 of 4 needs paid | year summary "A hard year", AED 9,250 left unused | Enough and All buttons next to the slider; every need from home shows its amount in AED | e2e clicks Enough and reads the slider |
| Needs arrive in rupees, the slider is in dirhams | the player did the division by hand | "≈ AED" next to each need | payday screen |
| The phone contact that vanished with the money came back | same name after the loss | after a loss the offer is a new number | game.js `cname()` |
| The year summary said "not everything arrived" with 4 of 4 needs paid | the short months were not shown | the summary shows the months the family went short | e2e reads the line |
| Counters closed by their queue with no warning | "Closed: queue too long" right after choosing | a counter shows "closing soon" when its queue nearly runs out the clock | street screen |
| Arabic receipt letters fell apart in the monospace font | letters without joins | the Arabic receipt uses the game's Arabic font | screenshot |

Kept on purpose: the fixed note on every receipt with the UN goal and the real corridor average (it is the yardstick the receipt is read against), and the 1 in 5 risk of the phone offer (a game rule, stated as such in the README).
